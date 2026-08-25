import type { UploadFormData } from '@/components/dashboard/upload/types';
import type { ReleaseFormData } from '@/lib/api/releases';
import { isInstrumentalRelease, resolveLanguage } from '@/components/dashboard/upload/genre-language';
import { isTrackEligibleForCrbt } from '@/components/dashboard/upload/crbt-validation';
import { resolveAudioUploadTitle } from '@/lib/upload/audio-upload-title';
import { uploadFileInChunks } from '@/lib/upload/chunk-uploader';
import { getImageMetadata } from '@/lib/upload/media-metadata';
import {
  createSubmitProgressTracker,
  type SubmitProgressCallback,
} from '@/lib/upload/submit-progress';
import type {
  CreateReleaseDraftRequest,
  DraftArtist,
  DraftCoverArt,
  DraftMediaAsset,
  DraftTrack,
  ReleaseType,
} from './types';
import { buildProfilesFromFlatFields, toPlatformRef } from './platform-ref.util';
import { getDefaultLabelName } from '@/lib/validation/label-name';

type FormAudioFile = {
  id?: string;
  file?: File | null;
  fileName?: string;
  size?: number;
  path?: string;
  duration?: number;
  hash?: string;
  fingerprint?: string;
};

type BuildDraftPayloadInput = ReleaseFormData &
  Partial<UploadFormData> & {
    mandatoryChecks?: {
      rightsAuthorization?: boolean;
      ownershipConfirmation?: boolean;
    };
    rightsAccepted?: boolean;
  };

function capitalizeLanguage(lang: string): string {
  return lang.charAt(0).toUpperCase() + lang.slice(1).toLowerCase();
}

function resolveTrackLanguage(
  primaryGenre: string | undefined,
  language: string | undefined,
  instrumental: string | undefined,
): string | undefined {
  const lang = resolveLanguage(primaryGenre, language, instrumental);
  return lang ? capitalizeLanguage(lang) : undefined;
}

function yesNo(value?: string | boolean): boolean {
  if (typeof value === 'boolean') return value;
  return value === 'yes';
}

/** Durable S3 key from a form path that may still hold a signed URL (legacy). */
function toStorageKey(value?: string | null): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  if (!/^https?:\/\//i.test(trimmed)) return trimmed;
  try {
    const pathname = new URL(trimmed).pathname.replace(/^\/+/, '');
    return pathname ? decodeURIComponent(pathname) : undefined;
  } catch {
    return undefined;
  }
}

function needsCoverArtUpload(
  form: BuildDraftPayloadInput,
  coverArtData: BuildDraftPayloadInput['coverArt'],
): boolean {
  if (!coverArtData) return false;

  const coverMeta =
    typeof coverArtData === 'object' && !(coverArtData instanceof File)
      ? (coverArtData as Record<string, unknown>)
      : {};

  if (typeof coverMeta.path === 'string' && toStorageKey(coverMeta.path)) return false;
  if (typeof coverMeta.storageKey === 'string' && toStorageKey(coverMeta.storageKey)) {
    return false;
  }
  if (
    typeof coverMeta.url === 'string' &&
    toStorageKey(coverMeta.url)
  ) {
    return false;
  }

  return form.coverArt instanceof File || coverMeta.file instanceof File;
}

function countPendingUploads(
  form: BuildDraftPayloadInput,
  audioFiles: FormAudioFile[],
  isSingle: boolean,
  rootAudio?: FormAudioFile,
): number {
  let count = 0;

  for (const af of audioFiles) {
    if (af.file instanceof File && !af.path) count += 1;
  }

  if (isSingle && rootAudio?.file instanceof File && !rootAudio.path) {
    const alreadyCounted = audioFiles.some(
      (af) => af.file === rootAudio.file && !af.path,
    );
    if (!alreadyCounted) count += 1;
  }

  if (needsCoverArtUpload(form, form.coverArt)) {
    count += 1;
  }

  return count;
}

type FileUploadRunner = (
  label: string,
  upload: (onFileProgress: (percent: number) => void) => Promise<void>,
) => Promise<void>;

async function ensureAudioUploaded(
  audioFiles: FormAudioFile[],
  tracks: UploadFormData['tracks'],
  form: BuildDraftPayloadInput,
  token: string,
  runUpload: FileUploadRunner,
): Promise<Map<string, FormAudioFile>> {
  const map = new Map<string, FormAudioFile>();

  for (let i = 0; i < audioFiles.length; i++) {
    const af = audioFiles[i];
    if (af.file instanceof File && !af.path) {
      const uploadTitle = resolveAudioUploadTitle(af, tracks, i, form.title);
      await runUpload(`Uploading ${uploadTitle}…`, (onFileProgress) =>
        uploadFileInChunks(
          af.file!,
          token,
          onFileProgress,
          'audio',
          form.artistName,
          uploadTitle,
          form.audioConsent,
        ).then((result) => {
          af.path = result.path;
          af.duration = result.metaData?.duration;
          af.hash = result.metaData?.hash;
          af.fingerprint = result.metaData?.fingerprint;
        }),
      );
    }
    if (af.id) map.set(af.id, af);
  }

  return map;
}

function toDraftMediaAsset(af: FormAudioFile, fallbackName: string): DraftMediaAsset | null {
  const storageKey = toStorageKey(af.path);
  if (!storageKey) return null;
  return {
    storageKey,
    filename: af.fileName || fallbackName,
    size: af.size || 0,
    duration: af.duration || 0,
    format: 'wav',
    hash: af.hash,
    fingerprint: af.fingerprint,
  };
}

function buildArtists(form: BuildDraftPayloadInput): CreateReleaseDraftRequest['artists'] {
  const main: DraftArtist[] = [];

  if (form.artistName?.trim()) {
    main.push({
      name: form.artistName.trim(),
      ...(form.cosmosArtistId?.trim()
        ? { cosmosId: form.cosmosArtistId.trim() }
        : {}),
      profiles: buildProfilesFromFlatFields({
        spotifyProfile: form.spotifyProfile,
        appleMusicProfile: form.appleMusicProfile,
        youtubeMusicProfile: form.youtubeMusicProfile,
        instagramProfile: form.instagramProfile,
        instagramProfileUrl: form.instagramProfileUrl ?? undefined,
        facebookProfile: form.facebookProfile,
        facebookProfileUrl: form.facebookProfileUrl ?? undefined,
      }),
    });
  }

  for (const artist of form.artists || []) {
    if (!artist.name?.trim()) continue;
    main.push({
      name: artist.name.trim(),
      ...(artist.cosmosArtistId?.trim()
        ? { cosmosId: artist.cosmosArtistId.trim() }
        : {}),
      profiles: buildProfilesFromFlatFields({
        spotifyProfile: artist.spotifyProfile,
        appleMusicProfile: artist.appleMusicProfile,
        youtubeMusicProfile: artist.youtubeMusicProfile,
        instagramProfile: artist.instagramProfile,
        facebookProfile: artist.facebookProfile,
      }),
    });
  }

  const featured: string[] = [];
  if (form.featuringArtist?.trim()) featured.push(form.featuringArtist.trim());

  return { main, featured };
}

async function resolveCoverArt(
  form: BuildDraftPayloadInput,
  token: string,
  runUpload: FileUploadRunner,
): Promise<DraftCoverArt> {
  const coverArtData = form.coverArt as Record<string, unknown> | File | null | undefined;
  if (!coverArtData) {
    throw new Error('Cover art is missing or invalid. Please check the Cover Art step.');
  }

  let storageKey: string;
  let coverMeta: Record<string, unknown> =
    typeof coverArtData === 'object' && !(coverArtData instanceof File)
      ? coverArtData
      : {};

  if (typeof coverMeta.path === 'string' && toStorageKey(coverMeta.path)) {
    storageKey = toStorageKey(coverMeta.path)!;
  } else if (
    typeof coverMeta.storageKey === 'string' &&
    toStorageKey(coverMeta.storageKey)
  ) {
    storageKey = toStorageKey(coverMeta.storageKey)!;
  } else if (
    typeof coverMeta.url === 'string' &&
    toStorageKey(coverMeta.url)
  ) {
    storageKey = toStorageKey(coverMeta.url)!;
  } else if (form.coverArt instanceof File || coverMeta.file instanceof File) {
    const fileToUpload =
      form.coverArt instanceof File ? form.coverArt : (coverMeta.file as File);
    let uploadedKey = '';
    await runUpload('Uploading cover art…', (onFileProgress) =>
      uploadFileInChunks(
        fileToUpload,
        token,
        onFileProgress,
        'coverart',
        form.artistName,
        form.title,
        form.coverArtConsent,
      ).then((result) => {
        uploadedKey = result.path;
        if (result.metaData) {
          if (result.metaData.size) coverMeta.size = result.metaData.size;
          if (result.metaData.resolution) {
            coverMeta.dimensions = result.metaData.resolution;
            coverMeta.format = 'jpeg';
          }
        }
      }),
    );
    storageKey = uploadedKey;
  } else {
    throw new Error('Invalid cover art data. Please re-upload your cover art.');
  }

  let dimensions = coverMeta.dimensions as { width: number; height: number } | undefined;
  let format = typeof coverMeta.format === 'string' ? coverMeta.format : 'jpeg';

  if (!dimensions?.width) {
    const fileForMeta =
      form.coverArt instanceof File
        ? form.coverArt
        : coverMeta.file instanceof File
          ? (coverMeta.file as File)
          : new File([], 'temp');
    const imageMeta = await getImageMetadata(fileForMeta);
    dimensions = { width: imageMeta.width, height: imageMeta.height };
    format = imageMeta.format;
  }

  const filename =
    (typeof coverMeta.fileName === 'string' && coverMeta.fileName) ||
    (typeof coverMeta.name === 'string' && coverMeta.name) ||
    'cover.jpg';

  const size =
    typeof coverMeta.size === 'number'
      ? coverMeta.size
      : form.coverArt instanceof File
        ? form.coverArt.size
        : 0;

  return {
    storageKey,
    filename,
    size,
    dimensions: dimensions || { width: 0, height: 0 },
    format,
  };
}

/** Build canonical v2 draft request from upload form (uploads files when needed). */
export async function buildDraftPayload(
  form: BuildDraftPayloadInput,
  token: string,
  onProgress?: SubmitProgressCallback,
): Promise<CreateReleaseDraftRequest> {
  const releaseType = (form.format || form.releaseType || 'single') as ReleaseType;
  const isSingle = releaseType === 'single';
  const audioFiles = (form.audioFiles || []) as FormAudioFile[];
  const rootAudio = isSingle ? (form.audioFile as FormAudioFile | undefined) : undefined;
  const progress = createSubmitProgressTracker(
    countPendingUploads(form, audioFiles, isSingle, rootAudio),
    onProgress,
  );
  progress.start();
  const runUpload = progress.wrapFileUpload;

  const audioMap = await ensureAudioUploaded(audioFiles, form.tracks || [], form, token, runUpload);

  const releaseNoLyrics = isInstrumentalRelease(form.primaryGenre, form.instrumental);

  let trackRows = [...(form.tracks || [])];

  if (isSingle && trackRows.length === 0) {
    trackRows = [
      {
        id: 'single-track',
        title: form.title,
        audioFileId: '',
        artistName: form.artistName,
        language: form.language,
        primaryGenre: form.primaryGenre,
        secondaryGenre: form.secondaryGenre,
        mood: form.mood || '',
        isExplicit: form.isExplicit,
        isInstrumental: form.instrumental,
        isrc: form.isrc,
        writers: form.writers,
        composers: form.composers,
        featuringArtist: form.featuringArtist,
        previewClipStartTime: form.previewClipStartTime,
        previouslyReleased: form.previouslyReleased,
        originalReleaseDate: form.originalReleaseDate,
      },
    ];
  }

  const tracks: DraftTrack[] = [];

  for (let index = 0; index < trackRows.length; index++) {
    const track = trackRows[index];
    let linked = track.audioFileId ? audioMap.get(track.audioFileId) : undefined;

    if (isSingle && index === 0 && form.audioFile) {
      const rootAudioFile = form.audioFile as FormAudioFile;
      const rootStorageKey = toStorageKey(rootAudioFile.path);
      const linkedStorageKey = linked ? toStorageKey(linked.path) : undefined;
      const pendingRootUpload =
        rootAudioFile.file instanceof File && !rootStorageKey;
      const rootDiffersFromLinked =
        !!rootStorageKey && rootStorageKey !== linkedStorageKey;

      if (pendingRootUpload || rootDiffersFromLinked || !linked) {
        if (pendingRootUpload) {
          const uploadTitle = resolveAudioUploadTitle(
            rootAudioFile,
            trackRows,
            0,
            form.title,
          );
          await runUpload(`Uploading ${uploadTitle}…`, (onFileProgress) =>
            uploadFileInChunks(
              rootAudioFile.file!,
              token,
              onFileProgress,
              'audio',
              form.artistName,
              uploadTitle,
              form.audioConsent,
            ).then((result) => {
              rootAudioFile.path = result.path;
              rootAudioFile.duration = result.metaData?.duration;
              rootAudioFile.hash = result.metaData?.hash;
              rootAudioFile.fingerprint = result.metaData?.fingerprint;
            }),
          );
        }
        linked = rootAudioFile;
      }
    }

    const audio = linked ? toDraftMediaAsset(linked, track.title) : null;
    if (!audio) {
      throw new Error(`Track "${track.title}" is missing an uploaded audio file.`);
    }

    // Singles: Credits edits form-level genre; prefer that over hydrated track values.
    const primaryGenre =
      (isSingle && index === 0 && form.primaryGenre) ||
      track.primaryGenre ||
      (isSingle ? form.primaryGenre : '') ||
      '';
    const secondaryGenre =
      (isSingle && index === 0 && form.secondaryGenre) ||
      track.secondaryGenre ||
      (isSingle ? form.secondaryGenre : undefined);
    const trackNoLyrics = isInstrumentalRelease(primaryGenre, track.isInstrumental ?? form.instrumental);

    const writers =
      isSingle && index === 0 && form.writers?.length
        ? form.writers
        : trackNoLyrics
          ? []
          : track.writers || [];

    const composers =
      isSingle && index === 0 && form.composers?.length
        ? form.composers
        : track.composers || [];

    const mood =
      (isSingle && index === 0 && form.mood) || track.mood || form.mood || '';

    const previewStart =
      isSingle && index === 0
        ? form.previewClipStartTime || track.previewClipStartTime
        : track.previewClipStartTime;

    tracks.push({
      order: index + 1,
      title: track.title,
      version: track.version || null,
      artistName: track.artistName || form.artistName || null,
      language:
        resolveTrackLanguage(
          primaryGenre,
          track.language || form.language,
          track.isInstrumental ?? form.instrumental,
        ) || 'Hindi',
      genre: {
        primary: primaryGenre,
        secondary: secondaryGenre,
      },
      mood,
      isExplicit: trackNoLyrics ? false : track.isExplicit === true,
      isInstrumental: trackNoLyrics || yesNo(track.isInstrumental as string),
      isrc: track.isrc || form.isrc || null,
      dolbyIsrc: null,
      previouslyReleased: yesNo(track.previouslyReleased),
      originalReleaseDate: track.originalReleaseDate || form.originalReleaseDate || null,
      credits: {
        writers,
        composers,
        featuring: track.featuringArtist || form.featuringArtist || null,
      },
      audio,
      previewClip:
        isTrackEligibleForCrbt(audio.duration) && previewStart
          ? { startTime: previewStart }
          : undefined,
    });
  }

  const coverArt = await resolveCoverArt(form, token, runUpload);
  progress.uploadsFinished();

  const rightsAccepted =
    form.mandatoryChecks?.rightsAuthorization === true ||
    form.mandatoryChecks?.ownershipConfirmation === true ||
    form.rightsAccepted === true;

  const defaultLabel = getDefaultLabelName();
  const publisher =
    form.producers?.[0]?.trim() ||
    form.publisher?.trim() ||
    form.copyright?.trim() ||
    form.labelName?.trim() ||
    defaultLabel;

  return {
    release: {
      title: form.title,
      version: form.version || null,
      type: releaseType,
      labelName: form.labelName || defaultLabel,
      releaseDate: form.releaseDate || new Date().toISOString().slice(0, 10),
      originalReleaseDate: form.originalReleaseDate || null,
      previouslyReleased: yesNo(form.previouslyReleased),
      distributionTerritories: form.distributionTerritories || ['Worldwide'],
      upc: form.upc || null,
      copyright: form.copyright || null,
      publisher,
      recordingYear:
        typeof form.recordingYear === 'number'
          ? form.recordingYear
          : parseInt(String(form.recordingYear || new Date().getFullYear()), 10),
    },
    artists: buildArtists(form),
    coverArt,
    tracks,
    submission: {
      rightsAccepted,
      audioDuplicateConsent: form.audioConsent === true,
      coverArtValidationConsent: form.coverArtConsent === true,
      audioWarningMessage:
        form.audioConsent === true &&
        form.audioDuplicateDetected === true &&
        typeof form.audioWarningMessage === 'string' &&
        form.audioWarningMessage.trim()
          ? form.audioWarningMessage.trim()
          : undefined,
      coverArtWarnings:
        form.coverArtConsent === true &&
        Array.isArray(form.coverArtValidationIssues) &&
        form.coverArtValidationIssues.length > 0
          ? form.coverArtValidationIssues
              .filter(
                (issue): issue is { code?: string; message: string; severity?: string } =>
                  !!issue &&
                  typeof (issue as { message?: unknown }).message === 'string' &&
                  String((issue as { message: string }).message).trim().length > 0,
              )
              .map((issue) => ({
                code: typeof issue.code === 'string' ? issue.code : undefined,
                message: String(issue.message).trim(),
                severity: typeof issue.severity === 'string' ? issue.severity : undefined,
              }))
          : undefined,
    },
  };
}

/** Extract platform URL for flat upload form fields. */
function profileUrl(value: unknown): string | undefined {
  return toPlatformRef(value)?.url;
}

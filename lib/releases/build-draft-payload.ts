import type { UploadFormData } from '@/components/dashboard/upload/types';
import type { ReleaseFormData } from '@/lib/api/releases';
import { isInstrumentalRelease, resolveLanguage } from '@/components/dashboard/upload/genre-language';
import { isTrackEligibleForCrbt } from '@/components/dashboard/upload/crbt-validation';
import { resolveAudioUploadTitle } from '@/lib/upload/audio-upload-title';
import { uploadFileInChunks } from '@/lib/upload/chunk-uploader';
import { getImageMetadata } from '@/lib/upload/media-metadata';
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

async function ensureAudioUploaded(
  audioFiles: FormAudioFile[],
  tracks: UploadFormData['tracks'],
  form: BuildDraftPayloadInput,
  token: string,
): Promise<Map<string, FormAudioFile>> {
  const map = new Map<string, FormAudioFile>();

  for (let i = 0; i < audioFiles.length; i++) {
    const af = audioFiles[i];
    if (af.file instanceof File && !af.path) {
      const uploadTitle = resolveAudioUploadTitle(af, tracks, i, form.title);
      const result = await uploadFileInChunks(
        af.file,
        token,
        undefined,
        'audio',
        form.artistName,
        uploadTitle,
        form.audioConsent,
      );
      af.path = result.path;
      af.duration = result.metaData?.duration;
      af.hash = result.metaData?.hash;
      af.fingerprint = result.metaData?.fingerprint;
    }
    if (af.id) map.set(af.id, af);
  }

  return map;
}

function toDraftMediaAsset(af: FormAudioFile, fallbackName: string): DraftMediaAsset | null {
  if (!af.path) return null;
  return {
    storageKey: af.path,
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

async function resolveCoverArt(form: BuildDraftPayloadInput, token: string): Promise<DraftCoverArt> {
  const coverArtData = form.coverArt as Record<string, unknown> | File | null | undefined;
  if (!coverArtData) {
    throw new Error('Cover art is missing or invalid. Please check the Cover Art step.');
  }

  let storageKey: string;
  let coverMeta: Record<string, unknown> =
    typeof coverArtData === 'object' && !(coverArtData instanceof File)
      ? coverArtData
      : {};

  if (typeof coverMeta.path === 'string' && coverMeta.path.trim()) {
    storageKey = coverMeta.path.trim();
  } else if (
    typeof coverMeta.storageKey === 'string' &&
    coverMeta.storageKey.trim()
  ) {
    storageKey = coverMeta.storageKey.trim();
  } else if (
    typeof coverMeta.url === 'string' &&
    coverMeta.url.trim() &&
    !coverMeta.url.startsWith('http')
  ) {
    storageKey = coverMeta.url.trim();
  } else if (form.coverArt instanceof File || coverMeta.file instanceof File) {
    const fileToUpload =
      form.coverArt instanceof File ? form.coverArt : (coverMeta.file as File);
    const result = await uploadFileInChunks(
      fileToUpload,
      token,
      undefined,
      'coverart',
      form.artistName,
      form.title,
      form.coverArtConsent,
    );
    storageKey = result.path;
    if (result.metaData) {
      if (result.metaData.size) coverMeta.size = result.metaData.size;
      if (result.metaData.resolution) {
        coverMeta.dimensions = result.metaData.resolution;
        coverMeta.format = 'jpeg';
      }
    }
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
): Promise<CreateReleaseDraftRequest> {
  const releaseType = (form.format || form.releaseType || 'single') as ReleaseType;
  const isSingle = releaseType === 'single';
  const audioFiles = (form.audioFiles || []) as FormAudioFile[];
  const audioMap = await ensureAudioUploaded(audioFiles, form.tracks || [], form, token);

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

    if (!linked && isSingle && index === 0 && form.audioFile) {
      const rootAudio = form.audioFile as FormAudioFile;
      if (rootAudio.file instanceof File && !rootAudio.path) {
        const result = await uploadFileInChunks(
          rootAudio.file,
          token,
          undefined,
          'audio',
          form.artistName,
          form.title,
          form.audioConsent,
        );
        rootAudio.path = result.path;
        rootAudio.duration = result.metaData?.duration;
        rootAudio.hash = result.metaData?.hash;
        rootAudio.fingerprint = result.metaData?.fingerprint;
      }
      linked = rootAudio;
    }

    const audio = linked ? toDraftMediaAsset(linked, track.title) : null;
    if (!audio) {
      throw new Error(`Track "${track.title}" is missing an uploaded audio file.`);
    }

    const primaryGenre = track.primaryGenre || (isSingle ? form.primaryGenre : '') || '';
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
        secondary: track.secondaryGenre || (isSingle ? form.secondaryGenre : undefined),
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

  const coverArt = await resolveCoverArt(form, token);

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
    },
  };
}

/** Extract platform URL for flat upload form fields. */
function profileUrl(value: unknown): string | undefined {
  return toPlatformRef(value)?.url;
}

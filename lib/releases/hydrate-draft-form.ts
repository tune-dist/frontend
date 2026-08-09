import type { UploadFormData, AudioFile, Track } from '@/components/dashboard/upload/types';
import type { ReleaseDetailResponse } from './types';
import { toReleaseDetailResponse } from './release-document.mapper';
import { profilesToFormFields } from './platform-ref.util';

function toAudioFormFile(
  storageKey: string | undefined,
  playbackUrl: string | undefined,
  id: string,
  meta: {
    filename?: string;
    size?: number;
    duration?: number;
    hash?: string;
    fingerprint?: string;
  },
  fallbackName: string,
): AudioFile | null {
  if (!storageKey) return null;
  return {
    id,
    file: null,
    fileName: meta.filename || fallbackName,
    size: meta.size,
    path: storageKey,
    playbackUrl: playbackUrl || storageKey,
    duration: meta.duration,
    hash: meta.hash,
    fingerprint: meta.fingerprint,
  };
}

function formatDateInput(value?: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/** Map v2 (or Mongo flat) API response → react-hook-form upload state. */
export function hydrateDraftForm(input: unknown): Partial<UploadFormData> {
  const detail = toReleaseDetailResponse(input);
  return hydrateFromDetail(detail);
}

function hydrateFromDetail(detail: ReleaseDetailResponse): Partial<UploadFormData> {
  const format = detail.release.type as UploadFormData['format'];
  const isSingle = format === 'single';
  const mainArtist = detail.artists.main[0];
  const social = profilesToFormFields(mainArtist?.profiles);

  const audioFiles: AudioFile[] = [];
  const tracks: Track[] = [];

  detail.tracks.forEach((track, index) => {
    const audioId = track.id || `existing-audio-${index}`;
    const audio = toAudioFormFile(
      track.audio.storageKey,
      track.audio.playbackUrl,
      audioId,
      track.audio,
      track.title,
    );
    if (audio) audioFiles.push(audio);

    tracks.push({
      id: track.id || `existing-track-${index}`,
      title: track.title,
      audioFileId: audio?.id || '',
      artistName: track.artistName || mainArtist?.name,
      language: track.language,
      isrc: track.isrc || undefined,
      previouslyReleased: track.previouslyReleased ? 'yes' : 'no',
      originalReleaseDate: track.originalReleaseDate
        ? formatDateInput(track.originalReleaseDate)
        : undefined,
      primaryGenre: track.genre.primary,
      secondaryGenre: track.genre.secondary,
      writers: track.credits.writers,
      composers: track.credits.composers,
      isInstrumental: track.isInstrumental ? 'yes' : 'no',
      isExplicit: track.isExplicit,
      previewClipStartTime: track.previewClip?.startTime,
      featuringArtist: track.credits.featuring || undefined,
      mood: track.mood,
    });
  });

  const firstTrack = detail.tracks[0];
  const previewClipStartTime = firstTrack?.previewClip?.startTime;

  const secondaryArtists = detail.artists.main.slice(1).map((artist) => ({
    name: artist.name,
    cosmosArtistId: artist.cosmosId,
    spotifyProfile: artist.profiles?.spotify,
    appleMusicProfile: artist.profiles?.appleMusic,
    youtubeMusicProfile: artist.profiles?.youtubeMusic,
    instagramProfile: artist.profiles?.instagram?.url,
    facebookProfile: artist.profiles?.facebook?.url,
  }));

  return {
    numberOfSongs: String(detail.tracks.length || 1),
    title: detail.release.title,
    version: detail.release.version || undefined,
    artistName: mainArtist?.name || '',
    cosmosArtistId: mainArtist?.cosmosId || undefined,
    artists: secondaryArtists as UploadFormData['artists'],
    isrc: firstTrack?.isrc || undefined,
    primaryGenre: isSingle ? firstTrack?.genre.primary : undefined,
    secondaryGenre: isSingle ? firstTrack?.genre.secondary : undefined,
    language: isSingle ? firstTrack?.language : undefined,
    releaseType: format,
    format,
    isExplicit: firstTrack?.isExplicit ?? false,
    explicitLyrics: firstTrack?.isExplicit ? 'yes' : 'no',
    featuringArtist: detail.artists.featured[0] || firstTrack?.credits.featuring || undefined,
    upc: detail.release.upc || detail.distribution.upc || undefined,
    spotifyProfile: social.spotifyProfile as UploadFormData['spotifyProfile'],
    appleMusicProfile: social.appleMusicProfile as UploadFormData['appleMusicProfile'],
    youtubeMusicProfile: social.youtubeMusicProfile as UploadFormData['youtubeMusicProfile'],
    instagramProfile: social.instagramProfile,
    instagramProfileUrl: social.instagramProfileUrl,
    facebookProfile: social.facebookProfile,
    facebookProfileUrl: social.facebookProfileUrl,
    audioFile: isSingle ? audioFiles[0] ?? undefined : undefined,
    audioFiles,
    tracks,
    releaseDate: formatDateInput(detail.release.releaseDate),
    previouslyReleased: detail.release.previouslyReleased ? 'yes' : 'no',
    labelName: detail.release.labelName || '',
    distributionTerritories: detail.release.distributionTerritories || ['Worldwide'],
    previewClipStartTime: isSingle ? previewClipStartTime : undefined,
    copyright: detail.release.copyright || undefined,
    instrumental: firstTrack?.isInstrumental ? 'yes' : 'no',
    writers: isSingle ? firstTrack?.credits.writers || [] : [],
    composers: isSingle ? firstTrack?.credits.composers || [] : [],
    recordingYear: detail.release.recordingYear || new Date().getFullYear(),
    mood: isSingle ? firstTrack?.mood : undefined,
    producers: [process.env.NEXT_PUBLIC_DEFAULT_LABEL || 'KratoLib'],
    coverArt: detail.coverArt.storageKey
      ? {
          path: detail.coverArt.storageKey,
          fileName: detail.coverArt.filename,
          size: detail.coverArt.size,
          dimensions: detail.coverArt.dimensions,
          format: detail.coverArt.format,
        }
      : undefined,
    audioConsent: detail.audioConsent === true || detail.warning === true,
    coverArtConsent: detail.coverArtConsent === true || detail.warning === true,
    audioDuplicateDetected:
      typeof detail.audioWarningMessage === 'string' &&
      detail.audioWarningMessage.trim().length > 0,
    audioWarningMessage: detail.audioWarningMessage || undefined,
    coverArtValidationIssues: detail.coverArtWarnings ?? [],
    coverArtValidationStatus:
      (detail.coverArtWarnings?.length ?? 0) > 0 ? 'warned' : undefined,
    coverArtChanged: false,
  };
}

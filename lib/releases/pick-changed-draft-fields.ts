import type { CreateReleaseDraftRequest, DraftTrack, ReleaseType } from './types';

/** Mirrors backend RELEASE_WRITE_DIFF_KEYS — top-level Mongo keys PUT may change. */
export const RELEASE_WRITE_DIFF_KEYS = [
  'title',
  'artistName',
  'version',
  'releaseType',
  'labelName',
  'releaseDate',
  'originalReleaseDate',
  'distributionTerritories',
  'upc',
  'copyright',
  'publisher',
  'producers',
  'recordingYear',
  'featuredArtists',
  'primaryArtists',
  'tracks',
  'coverArt',
  'genres',
  'numberOfSongs',
  'rightsAccepted',
  'audioConsent',
  'coverArtConsent',
  'warning',
  'audioWarningMessage',
  'coverArtWarnings',
  'language',
  'primaryGenre',
  'secondaryGenre',
  'mood',
  'isExplicit',
  'isInstrumentalFlag',
  'isrc',
  'writers',
  'composers',
  'previewClipStartTime',
] as const;

export type ReleaseWriteSnapshot = Partial<Record<(typeof RELEASE_WRITE_DIFF_KEYS)[number], unknown>>;

function toComparableDate(value: unknown): string | null {
  if (value === null || value === undefined || value === '') return null;
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return value.toISOString().slice(0, 10);
  }
  const asString = String(value).trim();
  if (!asString) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(asString)) {
    return asString.slice(0, 10);
  }
  const parsed = new Date(asString);
  if (Number.isNaN(parsed.getTime())) return asString;
  return parsed.toISOString().slice(0, 10);
}

function stripStorageKey(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    if (/^https?:\/\//i.test(trimmed)) {
      const url = new URL(trimmed);
      return url.pathname.replace(/^\//, '') || trimmed;
    }
  } catch {
    // fall through
  }
  return trimmed.split('?')[0] || trimmed;
}

function normalizeComparable(value: unknown, keyHint?: string): unknown {
  if (value === undefined || value === null) return null;

  if (keyHint === 'releaseDate' || keyHint === 'originalReleaseDate') {
    return toComparableDate(value);
  }

  if (value instanceof Date) {
    return toComparableDate(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (keyHint === 'url' || keyHint === 'storageKey') {
      return stripStorageKey(trimmed) || trimmed;
    }
    return trimmed;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeComparable(item));
  }

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const skip = new Set(['_id', 'id', '__v', 'playbackUrl']);
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(record).sort()) {
      if (skip.has(key)) continue;
      out[key] = normalizeComparable(record[key], key);
    }
    return out;
  }

  return value;
}

function deepEqual(a: unknown, b: unknown, keyHint?: string): boolean {
  return (
    JSON.stringify(normalizeComparable(a, keyHint)) ===
    JSON.stringify(normalizeComparable(b, keyHint))
  );
}

function collectGenresFromTracks(
  tracks: Array<{
    primaryGenre?: string;
    secondaryGenre?: string;
    genre?: { primary?: string; secondary?: string };
  }>,
): string[] {
  const names = new Set<string>();
  for (const track of tracks) {
    const primary = track.primaryGenre?.trim() || track.genre?.primary?.trim();
    const secondary = track.secondaryGenre?.trim() || track.genre?.secondary?.trim();
    if (primary) names.add(primary);
    if (secondary) names.add(secondary);
  }
  return Array.from(names);
}

function mapDraftTrackToWrite(track: DraftTrack, index: number, fallbackArtist?: string) {
  return {
    trackOrder: track.order ?? index + 1,
    title: track.title,
    artistName: track.artistName || fallbackArtist,
    audioFile: {
      url: track.audio.storageKey,
      filename: track.audio.filename,
      size: track.audio.size,
      duration: track.audio.duration ?? 0,
      format: track.audio.format,
      hash: track.audio.hash,
      fingerprint: track.audio.fingerprint,
    },
    isExplicit: track.isExplicit,
    isInstrumental: track.isInstrumental,
    previewStartTime: track.previewClip?.startTime,
    previouslyReleased: track.previouslyReleased ? 'yes' : 'no',
    primaryGenre: track.genre.primary,
    secondaryGenre: track.genre.secondary,
    isrc: track.isrc || undefined,
    language: track.language,
    writers: track.credits.writers,
    composers: track.credits.composers,
    featuringArtist: track.credits.featuring || undefined,
    mood: track.mood,
    originalReleaseDate: track.originalReleaseDate || undefined,
  };
}

/** Map v2 draft request → flat write snapshot used for FE diff + sparse PUT. */
export function draftRequestToWriteSnapshot(draft: CreateReleaseDraftRequest): ReleaseWriteSnapshot {
  const mainArtist = draft.artists.main[0];
  const firstTrack = draft.tracks[0];
  const releaseType = draft.release.type;
  const isSingle = releaseType === 'single';

  const primaryArtists = draft.artists.main.map((artist) => ({
    name: artist.name,
    cosmosId: artist.cosmosId,
    spotifyProfile: artist.profiles?.spotify,
    appleMusicProfile: artist.profiles?.appleMusic,
    youtubeMusicProfile: artist.profiles?.youtubeMusic,
    instagramProfile: artist.profiles?.instagram?.url,
    facebookProfile: artist.profiles?.facebook?.url,
  }));

  const tracks = draft.tracks.map((track, index) =>
    mapDraftTrackToWrite(track, index, mainArtist?.name),
  );

  const publisher =
    draft.release.publisher?.trim() ||
    draft.release.copyright?.trim() ||
    draft.release.labelName;

  const snapshot: ReleaseWriteSnapshot = {
    title: draft.release.title,
    artistName: mainArtist?.name || '',
    version: draft.release.version || undefined,
    releaseType,
    labelName: draft.release.labelName,
    releaseDate: draft.release.releaseDate,
    originalReleaseDate: draft.release.originalReleaseDate || undefined,
    distributionTerritories: draft.release.distributionTerritories,
    upc: draft.release.upc || undefined,
    copyright: draft.release.copyright || undefined,
    publisher,
    producers: publisher ? [publisher] : undefined,
    recordingYear: draft.release.recordingYear,
    featuredArtists: draft.artists.featured,
    primaryArtists,
    tracks,
    coverArt: {
      url: draft.coverArt.storageKey,
      filename: draft.coverArt.filename,
      size: draft.coverArt.size,
      dimensions: draft.coverArt.dimensions,
      format: draft.coverArt.format,
    },
    genres: collectGenresFromTracks(draft.tracks),
    numberOfSongs: draft.tracks.length,
    rightsAccepted: draft.submission.rightsAccepted,
    audioConsent: draft.submission.audioDuplicateConsent,
    coverArtConsent: draft.submission.coverArtValidationConsent,
    warning:
      (draft.submission.audioDuplicateConsent === true &&
        !!draft.submission.audioWarningMessage?.trim()) ||
      (draft.submission.coverArtValidationConsent === true &&
        (draft.submission.coverArtWarnings?.length ?? 0) > 0),
    audioWarningMessage: draft.submission.audioWarningMessage?.trim() || null,
    coverArtWarnings: draft.submission.coverArtWarnings ?? [],
  };

  if (isSingle && firstTrack) {
    snapshot.language = firstTrack.language;
    snapshot.primaryGenre = firstTrack.genre.primary;
    snapshot.secondaryGenre = firstTrack.genre.secondary;
    snapshot.mood = firstTrack.mood;
    snapshot.isExplicit = firstTrack.isExplicit;
    snapshot.isInstrumentalFlag = Boolean(firstTrack.isInstrumental);
    snapshot.isrc = firstTrack.isrc || undefined;
    snapshot.writers = firstTrack.credits.writers;
    snapshot.composers = firstTrack.credits.composers;
    snapshot.previewClipStartTime = firstTrack.previewClip?.startTime;
  }

  return snapshot;
}

/** Build a write snapshot from a hydrated flat release (mapDetailToFlatRelease output). */
export function releaseToWriteSnapshot(release: Record<string, unknown>): ReleaseWriteSnapshot {
  const tracks = Array.isArray(release.tracks)
    ? (release.tracks as Array<Record<string, unknown>>)
    : [];
  const first = tracks[0];
  const releaseType = String(release.releaseType || 'single') as ReleaseType;
  const isSingle = releaseType === 'single';

  const snapshot: ReleaseWriteSnapshot = {};

  for (const key of RELEASE_WRITE_DIFF_KEYS) {
    if (Object.prototype.hasOwnProperty.call(release, key) && release[key] !== undefined) {
      snapshot[key] = release[key];
    }
  }

  snapshot.releaseType = releaseType;
  snapshot.numberOfSongs =
    typeof release.numberOfSongs === 'number' ? release.numberOfSongs : tracks.length;

  if (!Array.isArray(snapshot.genres) || snapshot.genres.length === 0) {
    snapshot.genres = collectGenresFromTracks(
      tracks.map((track) => ({
        primaryGenre: track.primaryGenre as string | undefined,
        secondaryGenre: track.secondaryGenre as string | undefined,
      })),
    );
  }

  if (isSingle && first) {
    snapshot.language =
      (snapshot.language as string | undefined) || (first.language as string | undefined);
    snapshot.primaryGenre =
      (snapshot.primaryGenre as string | undefined) || (first.primaryGenre as string | undefined);
    snapshot.secondaryGenre =
      (snapshot.secondaryGenre as string | undefined) ||
      (first.secondaryGenre as string | undefined) ||
      (release.subGenre as string | undefined);
    snapshot.mood = (snapshot.mood as string | undefined) || (first.mood as string | undefined);
    snapshot.isExplicit =
      snapshot.isExplicit !== undefined ? snapshot.isExplicit : Boolean(first.isExplicit);
    snapshot.isInstrumentalFlag =
      snapshot.isInstrumentalFlag !== undefined
        ? snapshot.isInstrumentalFlag
        : Boolean(first.isInstrumental);
    snapshot.isrc = (snapshot.isrc as string | undefined) || (first.isrc as string | undefined);
    snapshot.writers =
      (snapshot.writers as string[] | undefined) || (first.writers as string[] | undefined);
    snapshot.composers =
      (snapshot.composers as string[] | undefined) || (first.composers as string[] | undefined);
    snapshot.previewClipStartTime =
      (snapshot.previewClipStartTime as string | undefined) ||
      (first.previewStartTime as string | undefined);
  }

  return snapshot;
}

/** Return only top-level keys whose values changed vs baseline. */
export function pickChangedDraftFields(
  baseline: ReleaseWriteSnapshot,
  current: ReleaseWriteSnapshot,
): ReleaseWriteSnapshot {
  const patch: ReleaseWriteSnapshot = {};

  for (const key of RELEASE_WRITE_DIFF_KEYS) {
    if (!Object.prototype.hasOwnProperty.call(current, key)) continue;
    const nextValue = current[key];
    if (nextValue === undefined) continue;

    const prevValue = baseline[key];
    if (!deepEqual(prevValue, nextValue, key)) {
      patch[key] = nextValue;
    }
  }

  return patch;
}

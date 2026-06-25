import type {
  CreateReleaseDraftRequest,
  DraftArtist,
  DraftTrack,
  LegacyReleaseDocument,
  LegacyTrackDocument,
  ReleaseDetailResponse,
  ReleaseListItem,
  ReleaseType,
} from './types';
import { buildProfilesFromLegacy, profilesToLegacyFormFields } from './platform-ref.util';

export function isV2ReleaseDetail(value: unknown): value is ReleaseDetailResponse {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.release === 'object' &&
    record.release !== null &&
    typeof (record.release as Record<string, unknown>).type === 'string' &&
    Array.isArray(record.tracks)
  );
}

function toIsoDateInput(value?: string | Date | null): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function parsePreviouslyReleased(value?: string | boolean): boolean {
  if (typeof value === 'boolean') return value;
  return value?.toLowerCase() === 'yes';
}

function parseInstrumental(
  track: LegacyTrackDocument,
  release: LegacyReleaseDocument,
): boolean {
  if (typeof track.isInstrumental === 'boolean') return track.isInstrumental;
  if (track.isInstrumental === 'yes') return true;
  if (release.isInstrumentalFlag === true) return true;
  if (release.instrumental?.toLowerCase() === 'yes') return true;
  return false;
}

function mapLegacyArtist(artist: NonNullable<LegacyReleaseDocument['primaryArtists']>[number]): DraftArtist {
  return {
    name: artist.name,
    profiles: buildProfilesFromLegacy({
      spotifyProfile: artist.spotifyProfile,
      appleMusicProfile: artist.appleMusicProfile,
      youtubeMusicProfile: artist.youtubeMusicProfile,
      instagramProfile: artist.instagramProfile,
      instagramProfileUrl: artist.instagramProfileUrl,
      facebookProfile: artist.facebookProfile,
      facebookProfileUrl: artist.facebookProfileUrl,
    }),
  };
}

function buildMainArtists(legacy: LegacyReleaseDocument): DraftArtist[] {
  if (legacy.primaryArtists?.length) {
    return legacy.primaryArtists.map(mapLegacyArtist);
  }
  if (legacy.artistName?.trim()) {
    return [
      {
        name: legacy.artistName.trim(),
        profiles: buildProfilesFromLegacy({
          spotifyProfile: legacy.spotifyProfile ?? legacy.socialPlatforms?.spotifyProfile,
          appleMusicProfile: legacy.appleMusicProfile ?? legacy.socialPlatforms?.appleMusicProfile,
          youtubeMusicProfile: legacy.youtubeMusicProfile ?? legacy.socialPlatforms?.youtubeMusicProfile,
          instagramProfile: legacy.instagramProfile ?? legacy.socialPlatforms?.instagramProfile,
          instagramProfileUrl: legacy.instagramProfileUrl ?? legacy.socialPlatforms?.instagramProfileUrl,
          facebookProfile: legacy.facebookProfile ?? legacy.socialPlatforms?.facebookProfile,
          facebookProfileUrl: legacy.facebookProfileUrl ?? legacy.socialPlatforms?.facebookProfileUrl,
        }),
      },
    ];
  }
  return [];
}

function mapLegacyTrack(
  track: LegacyTrackDocument,
  index: number,
  legacy: LegacyReleaseDocument,
): DraftTrack | null {
  const audio = track.audioFile ?? (index === 0 ? legacy.audioFile : undefined);
  if (!audio?.url) return null;

  const primaryGenre = track.primaryGenre || legacy.primaryGenre || '';
  const secondaryGenre = track.secondaryGenre || legacy.secondaryGenre || legacy.subGenre;

  return {
    order: track.trackOrder ?? index + 1,
    title: track.title || legacy.title || 'Untitled',
    version: null,
    artistName: track.artistName || legacy.artistName || null,
    language: track.language || legacy.language || 'Hindi',
    genre: {
      primary: primaryGenre,
      secondary: secondaryGenre || undefined,
    },
    mood: track.mood || legacy.mood || '',
    isExplicit: track.isExplicit ?? legacy.isExplicit ?? false,
    isInstrumental: parseInstrumental(track, legacy),
    isrc: track.isrc || legacy.isrc || null,
    dolbyIsrc: track.dolbyIsrc || null,
    previouslyReleased: parsePreviouslyReleased(track.previouslyReleased),
    originalReleaseDate: toIsoDateInput(track.originalReleaseDate || legacy.originalReleaseDate),
    credits: {
      writers: track.writers?.length ? track.writers : legacy.writers || [],
      composers: track.composers?.length ? track.composers : legacy.composers || [],
      featuring: track.featuringArtist || legacy.featuredArtists?.[0] || null,
    },
    audio: {
      storageKey: audio.url,
      filename: audio.filename || `${track.title || 'track'}.wav`,
      size: audio.size ?? 0,
      duration: audio.duration,
      format: audio.format || 'wav',
      hash: audio.hash,
      fingerprint: audio.fingerprint,
    },
    previewClip: (track.previewStartTime || legacy.previewClipStartTime)
      ? { startTime: track.previewStartTime || legacy.previewClipStartTime || '' }
      : undefined,
    crbt:
      track.crbtCutName || track.crbtStartTimeSec != null
        ? {
            cutName: track.crbtCutName,
            startTimeSec: track.crbtStartTimeSec,
            durationSec: track.crbtDurationSec,
          }
        : undefined,
  };
}

function synthesizeSingleTrackFromRoot(legacy: LegacyReleaseDocument): DraftTrack | null {
  if (!legacy.audioFile?.url) return null;

  return {
    order: 1,
    title: legacy.title || 'Untitled',
    version: legacy.version || null,
    artistName: legacy.artistName || null,
    language: legacy.language || 'Hindi',
    genre: {
      primary: legacy.primaryGenre || '',
      secondary: legacy.secondaryGenre || legacy.subGenre || undefined,
    },
    mood: legacy.mood || '',
    isExplicit: legacy.isExplicit ?? false,
    isInstrumental:
      legacy.isInstrumentalFlag === true || legacy.instrumental?.toLowerCase() === 'yes',
    isrc: legacy.isrc || null,
    dolbyIsrc: null,
    previouslyReleased: parsePreviouslyReleased(
      typeof legacy.previouslyReleased === 'string' ? legacy.previouslyReleased : undefined,
    ),
    originalReleaseDate: toIsoDateInput(legacy.originalReleaseDate),
    credits: {
      writers: legacy.writers || [],
      composers: legacy.composers || [],
      featuring: legacy.featuredArtists?.[0] || null,
    },
    audio: {
      storageKey: legacy.audioFile.url,
      filename: legacy.audioFile.filename || 'audio.wav',
      size: legacy.audioFile.size ?? 0,
      duration: legacy.audioFile.duration,
      format: legacy.audioFile.format || 'wav',
      hash: legacy.audioFile.hash,
      fingerprint: legacy.audioFile.fingerprint,
    },
    previewClip: legacy.previewClipStartTime
      ? { startTime: legacy.previewClipStartTime }
      : undefined,
  };
}

function collectTracks(legacy: LegacyReleaseDocument): DraftTrack[] {
  const fromArray =
    legacy.tracks
      ?.map((track, index) => mapLegacyTrack(track, index, legacy))
      .filter((track): track is DraftTrack => track !== null) ?? [];

  if (fromArray.length > 0) return fromArray;

  const synthesized = synthesizeSingleTrackFromRoot(legacy);
  return synthesized ? [synthesized] : [];
}

/** Normalize any API/Mongo release document to v2 detail response. */
export function toReleaseDetailResponse(input: unknown): ReleaseDetailResponse {
  if (isV2ReleaseDetail(input)) {
    return input;
  }
  return legacyReleaseToDetail(input as LegacyReleaseDocument);
}

export function legacyReleaseToDetail(legacy: LegacyReleaseDocument): ReleaseDetailResponse {
  const id = String(legacy._id ?? legacy.id ?? '');
  const releaseType = (legacy.releaseType || 'single') as ReleaseType;
  const tracks = collectTracks(legacy);

  return {
    id,
    releaseCode: legacy.releaseCode,
    status: legacy.status || 'Draft',
    userId: legacy.userId,
    createdAt: legacy.createdAt,
    updatedAt: legacy.updatedAt,
    release: {
      title: legacy.title || '',
      version: legacy.version || null,
      type: releaseType,
      labelName: legacy.labelName || '',
      releaseDate: toIsoDateInput(legacy.releaseDate) || '',
      originalReleaseDate: toIsoDateInput(legacy.originalReleaseDate),
      previouslyReleased: parsePreviouslyReleased(
        typeof legacy.previouslyReleased === 'string'
          ? legacy.previouslyReleased
          : legacy.previouslyReleased,
      ),
      distributionTerritories: legacy.distributionTerritories || ['Worldwide'],
      upc: legacy.upc || legacy.barcode || null,
      copyright: legacy.copyright || null,
      publisher: legacy.publisher || null,
      recordingYear: legacy.recordingYear,
    },
    artists: {
      main: buildMainArtists(legacy),
      featured: legacy.featuredArtists || [],
    },
    coverArt: {
      storageKey: legacy.coverArt?.url || '',
      url: legacy.coverArt?.url,
      filename: legacy.coverArt?.filename || 'cover.jpg',
      size: legacy.coverArt?.size ?? 0,
      dimensions: legacy.coverArt?.dimensions || { width: 0, height: 0 },
      format: legacy.coverArt?.format || 'jpeg',
    },
    tracks: tracks.map((track, index) => ({
      ...track,
      id: legacy.tracks?.[index]?._id ? String(legacy.tracks[index]._id) : `track-${index}`,
      audio: {
        ...track.audio,
        playbackUrl: track.audio.storageKey,
      },
    })),
    rights: {
      rightsAccepted: legacy.rightsAccepted ?? false,
      acceptedAt: legacy.acceptedAt || null,
    },
    distribution: {
      pdlAlbumId: legacy.pdlAlbumId || null,
      pdlSubmittedAt: legacy.pdlSubmittedAt || null,
      platforms: legacy.pdlPlatformsToRelease || null,
      catalogNumber: legacy.catalogNumber || null,
      upc: legacy.upc || legacy.barcode || null,
    },
    workflow: {
      submittedAt: legacy.submittedAt || null,
      approvedAt: legacy.approvedAt || null,
      approvedBy: legacy.approvedBy ? String(legacy.approvedBy) : null,
      rejectionReason: legacy.rejectionReason || null,
      riskScore: legacy.riskScore,
      riskStatus: (legacy.riskStatus as ReleaseDetailResponse['workflow']['riskStatus']) || 'Safe',
    },
  };
}

export function isV2ReleaseListItem(value: unknown): value is ReleaseListItem {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === 'string' &&
    typeof record.title === 'string' &&
    typeof record.artistName === 'string' &&
    typeof record.type === 'string' &&
    typeof record.trackCount === 'number' &&
    !Array.isArray(record.tracks)
  );
}

/** Map v2 list item to flat legacy Release for existing dashboard UI. */
export function listItemToLegacyRelease(item: ReleaseListItem): Record<string, unknown> {
  return {
    _id: item.id,
    releaseCode: item.releaseCode,
    status: item.status,
    title: item.title,
    artistName: item.artistName,
    releaseType: item.type,
    releaseDate: item.releaseDate,
    upc: item.upc,
    pdlAlbumId: item.pdlAlbumId,
    createdAt: item.createdAt,
    language: '',
    primaryGenre: '',
    isExplicit: false,
    coverArt: item.coverArtUrl
      ? {
          url: item.coverArtUrl,
          filename: '',
          size: 0,
          dimensions: { width: 0, height: 0 },
          format: '',
        }
      : undefined,
  };
}

export function releaseDetailToListItem(detail: ReleaseDetailResponse): {
  id: string;
  releaseCode?: string;
  status: ReleaseDetailResponse['status'];
  title: string;
  artistName: string;
  type: ReleaseType;
  trackCount: number;
  coverArtUrl?: string;
  releaseDate?: string;
  upc?: string;
  createdAt?: string;
} {
  return {
    id: detail.id,
    releaseCode: detail.releaseCode,
    status: detail.status,
    title: detail.release.title,
    artistName: detail.artists.main[0]?.name || '',
    type: detail.release.type,
    trackCount: detail.tracks.length,
    coverArtUrl: detail.coverArt.url || detail.coverArt.storageKey,
    releaseDate: detail.release.releaseDate,
    upc: detail.distribution.upc || detail.release.upc || undefined,
    createdAt: detail.createdAt,
  };
}

/**
 * Flat legacy `Release` shape for existing list/detail UI until fully migrated.
 */
export function detailResponseToLegacyRelease(detail: ReleaseDetailResponse): Record<string, unknown> {
  const main = detail.artists.main[0];
  const social = profilesToLegacyFormFields(main?.profiles);
  const first = detail.tracks[0];

  return {
    _id: detail.id,
    releaseCode: detail.releaseCode,
    userId: detail.userId,
    status: detail.status,
    title: detail.release.title,
    artistName: main?.name || '',
    version: detail.release.version,
    releaseType: detail.release.type,
    labelName: detail.release.labelName,
    language: first?.language,
    primaryGenre: first?.genre.primary,
    secondaryGenre: first?.genre.secondary,
    subGenre: first?.genre.secondary,
    mood: first?.mood,
    isExplicit: first?.isExplicit ?? false,
    instrumental: first?.isInstrumental ? 'yes' : 'no',
    isrc: first?.isrc,
    releaseDate: detail.release.releaseDate,
    originalReleaseDate: detail.release.originalReleaseDate,
    distributionTerritories: detail.release.distributionTerritories,
    upc: detail.distribution.upc || detail.release.upc,
    barcode: detail.distribution.upc || detail.release.upc,
    catalogNumber: detail.distribution.catalogNumber,
    copyright: detail.release.copyright,
    publisher: detail.release.publisher,
    recordingYear: detail.release.recordingYear,
    featuredArtists: detail.artists.featured,
    primaryArtists: detail.artists.main.map((artist) => ({
      name: artist.name,
      spotifyProfile: artist.profiles?.spotify,
      appleMusicProfile: artist.profiles?.appleMusic,
      youtubeMusicProfile: artist.profiles?.youtubeMusic,
      instagramProfile: artist.profiles?.instagram?.url,
      facebookProfile: artist.profiles?.facebook?.url,
    })),
    spotifyProfile: social.spotifyProfile,
    appleMusicProfile: social.appleMusicProfile,
    youtubeMusicProfile: social.youtubeMusicProfile,
    instagramProfile: social.instagramProfile,
    instagramProfileUrl: social.instagramProfileUrl,
    facebookProfile: social.facebookProfile,
    facebookProfileUrl: social.facebookProfileUrl,
    socialPlatforms: {
      spotifyProfile: social.spotifyProfile,
      appleMusicProfile: social.appleMusicProfile,
      youtubeMusicProfile: social.youtubeMusicProfile,
      instagramProfile: social.instagramProfile,
      instagramProfileUrl: social.instagramProfileUrl,
      facebookProfile: social.facebookProfile,
      facebookProfileUrl: social.facebookProfileUrl,
    },
    coverArt: {
      url: detail.coverArt.storageKey,
      filename: detail.coverArt.filename,
      size: detail.coverArt.size,
      dimensions: detail.coverArt.dimensions,
      format: detail.coverArt.format,
    },
    audioFile: first
      ? {
          url: first.audio.storageKey,
          filename: first.audio.filename,
          size: first.audio.size,
          duration: first.audio.duration,
          format: first.audio.format,
          hash: first.audio.hash,
          fingerprint: first.audio.fingerprint,
        }
      : undefined,
    tracks: detail.tracks.map((track) => ({
      title: track.title,
      artistName: track.artistName,
      language: track.language,
      primaryGenre: track.genre.primary,
      secondaryGenre: track.genre.secondary,
      mood: track.mood,
      isExplicit: track.isExplicit,
      isInstrumental: track.isInstrumental,
      isrc: track.isrc,
      writers: track.credits.writers,
      composers: track.credits.composers,
      featuringArtist: track.credits.featuring,
      previewStartTime: track.previewClip?.startTime,
      audioFile: {
        url: track.audio.storageKey,
        filename: track.audio.filename,
        size: track.audio.size,
        duration: track.audio.duration,
        format: track.audio.format,
        hash: track.audio.hash,
        fingerprint: track.audio.fingerprint,
      },
    })),
    previewClipStartTime: first?.previewClip?.startTime,
    rightsAccepted: detail.rights.rightsAccepted,
    pdlAlbumId: detail.distribution.pdlAlbumId,
    submittedAt: detail.workflow.submittedAt,
    approvedAt: detail.workflow.approvedAt,
    rejectionReason: detail.workflow.rejectionReason,
    createdAt: detail.createdAt,
    updatedAt: detail.updatedAt,
  };
}


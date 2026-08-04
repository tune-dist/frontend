import type {
  DraftArtist,
  DraftTrack,
  MongoReleaseDocument,
  MongoReleaseTrack,
  ReleaseDetailResponse,
  ReleaseListItem,
  ReleaseType,
} from './types';
import { buildProfilesFromFlatFields, profilesToFormFields } from './platform-ref.util';

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
  track: MongoReleaseTrack,
  document: MongoReleaseDocument,
): boolean {
  if (typeof track.isInstrumental === 'boolean') return track.isInstrumental;
  if (track.isInstrumental === 'yes') return true;
  if (document.isInstrumentalFlag === true) return true;
  if (document.instrumental?.toLowerCase() === 'yes') return true;
  return false;
}

function mapMongoArtist(
  artist: NonNullable<MongoReleaseDocument['primaryArtists']>[number],
): DraftArtist {
  return {
    name: artist.name,
    profiles: buildProfilesFromFlatFields({
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

function buildMainArtists(document: MongoReleaseDocument): DraftArtist[] {
  if (document.primaryArtists?.length) {
    return document.primaryArtists.map(mapMongoArtist);
  }
  if (document.artistName?.trim()) {
    return [
      {
        name: document.artistName.trim(),
        profiles: buildProfilesFromFlatFields({
          spotifyProfile: document.spotifyProfile ?? document.socialPlatforms?.spotifyProfile,
          appleMusicProfile: document.appleMusicProfile ?? document.socialPlatforms?.appleMusicProfile,
          youtubeMusicProfile: document.youtubeMusicProfile ?? document.socialPlatforms?.youtubeMusicProfile,
          instagramProfile: document.instagramProfile ?? document.socialPlatforms?.instagramProfile,
          instagramProfileUrl: document.instagramProfileUrl ?? document.socialPlatforms?.instagramProfileUrl,
          facebookProfile: document.facebookProfile ?? document.socialPlatforms?.facebookProfile,
          facebookProfileUrl: document.facebookProfileUrl ?? document.socialPlatforms?.facebookProfileUrl,
        }),
      },
    ];
  }
  return [];
}

function mapMongoTrack(
  track: MongoReleaseTrack,
  index: number,
  document: MongoReleaseDocument,
): DraftTrack | null {
  const audio = track.audioFile ?? (index === 0 ? document.audioFile : undefined);
  if (!audio?.url) return null;

  const primaryGenre = track.primaryGenre || document.primaryGenre || '';
  const secondaryGenre = track.secondaryGenre || document.secondaryGenre || document.subGenre;

  return {
    order: track.trackOrder ?? index + 1,
    title: track.title || document.title || 'Untitled',
    version: null,
    artistName: track.artistName || document.artistName || null,
    language: track.language || document.language || 'Hindi',
    genre: {
      primary: primaryGenre,
      secondary: secondaryGenre || undefined,
    },
    mood: track.mood || document.mood || '',
    isExplicit: track.isExplicit ?? document.isExplicit ?? false,
    isInstrumental: parseInstrumental(track, document),
    isrc: track.isrc || document.isrc || null,
    dolbyIsrc: track.dolbyIsrc || null,
    previouslyReleased: parsePreviouslyReleased(track.previouslyReleased),
    originalReleaseDate: toIsoDateInput(track.originalReleaseDate || document.originalReleaseDate),
    credits: {
      writers: track.writers?.length ? track.writers : document.writers || [],
      composers: track.composers?.length ? track.composers : document.composers || [],
      featuring: track.featuringArtist || document.featuredArtists?.[0] || null,
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
    previewClip: (track.previewStartTime || document.previewClipStartTime)
      ? { startTime: track.previewStartTime || document.previewClipStartTime || '' }
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

function synthesizeSingleTrackFromRoot(document: MongoReleaseDocument): DraftTrack | null {
  if (!document.audioFile?.url) return null;

  return {
    order: 1,
    title: document.title || 'Untitled',
    version: document.version || null,
    artistName: document.artistName || null,
    language: document.language || 'Hindi',
    genre: {
      primary: document.primaryGenre || '',
      secondary: document.secondaryGenre || document.subGenre || undefined,
    },
    mood: document.mood || '',
    isExplicit: document.isExplicit ?? false,
    isInstrumental:
      document.isInstrumentalFlag === true || document.instrumental?.toLowerCase() === 'yes',
    isrc: document.isrc || null,
    dolbyIsrc: null,
    previouslyReleased: parsePreviouslyReleased(
      typeof document.previouslyReleased === 'string' ? document.previouslyReleased : undefined,
    ),
    originalReleaseDate: toIsoDateInput(document.originalReleaseDate),
    credits: {
      writers: document.writers || [],
      composers: document.composers || [],
      featuring: document.featuredArtists?.[0] || null,
    },
    audio: {
      storageKey: document.audioFile.url,
      filename: document.audioFile.filename || 'audio.wav',
      size: document.audioFile.size ?? 0,
      duration: document.audioFile.duration,
      format: document.audioFile.format || 'wav',
      hash: document.audioFile.hash,
      fingerprint: document.audioFile.fingerprint,
    },
    previewClip: document.previewClipStartTime
      ? { startTime: document.previewClipStartTime }
      : undefined,
  };
}

function collectTracks(document: MongoReleaseDocument): DraftTrack[] {
  const fromArray =
    document.tracks
      ?.map((track, index) => mapMongoTrack(track, index, document))
      .filter((track): track is DraftTrack => track !== null) ?? [];

  if (fromArray.length > 0) return fromArray;

  const synthesized = synthesizeSingleTrackFromRoot(document);
  return synthesized ? [synthesized] : [];
}

/** Normalize any API/Mongo release document to v2 detail response. */
export function toReleaseDetailResponse(input: unknown): ReleaseDetailResponse {
  if (isV2ReleaseDetail(input)) {
    return input;
  }
  return mapMongoReleaseToDetail(input as MongoReleaseDocument);
}

export function mapMongoReleaseToDetail(document: MongoReleaseDocument): ReleaseDetailResponse {
  const id = String(document._id ?? document.id ?? '');
  const releaseType = (document.releaseType || 'single') as ReleaseType;
  const tracks = collectTracks(document);

  return {
    id,
    releaseCode: document.releaseCode,
    status: document.status || 'Draft',
    userId: document.userId,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
    release: {
      title: document.title || '',
      version: document.version || null,
      type: releaseType,
      labelName: document.labelName || '',
      releaseDate: toIsoDateInput(document.releaseDate) || '',
      originalReleaseDate: toIsoDateInput(document.originalReleaseDate),
      previouslyReleased: parsePreviouslyReleased(
        typeof document.previouslyReleased === 'string'
          ? document.previouslyReleased
          : document.previouslyReleased,
      ),
      distributionTerritories: document.distributionTerritories || ['Worldwide'],
      upc: document.upc || document.barcode || null,
      copyright: document.copyright || null,
      publisher:
        document.publisher ||
        document.producers?.[0] ||
        document.copyright ||
        document.labelName ||
        null,
      recordingYear: document.recordingYear,
    },
    artists: {
      main: buildMainArtists(document),
      featured: document.featuredArtists || [],
    },
    coverArt: {
      storageKey: document.coverArt?.url || '',
      url: document.coverArt?.url,
      filename: document.coverArt?.filename || 'cover.jpg',
      size: document.coverArt?.size ?? 0,
      dimensions: document.coverArt?.dimensions || { width: 0, height: 0 },
      format: document.coverArt?.format || 'jpeg',
    },
    tracks: tracks.map((track, index) => ({
      ...track,
      id: document.tracks?.[index]?._id ? String(document.tracks[index]._id) : `track-${index}`,
      audio: {
        ...track.audio,
        playbackUrl: track.audio.storageKey,
      },
    })),
    rights: {
      rightsAccepted: document.rightsAccepted ?? false,
      acceptedAt: document.acceptedAt || null,
    },
    distribution: {
      pdlAlbumId: document.pdlAlbumId || null,
      pdlSubmittedAt: document.pdlSubmittedAt || null,
      platforms: document.pdlPlatformsToRelease || null,
      catalogNumber: document.catalogNumber || null,
      upc: document.upc || document.barcode || null,
    },
    workflow: {
      submittedAt: document.submittedAt || null,
      approvedAt: document.approvedAt || null,
      approvedBy: document.approvedBy ? String(document.approvedBy) : null,
      rejectionReason: document.rejectionReason || null,
      riskScore: document.riskScore,
      riskStatus: (document.riskStatus as ReleaseDetailResponse['workflow']['riskStatus']) || 'Safe',
    },
    reportedIssue: document.reportedIssue,
    distributionIssueNote: document.distributionIssueNote ?? null,
    distributionIssueDetectedAt: document.distributionIssueDetectedAt ?? null,
    releasedOn: document.releasedOn,
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

/** Map v2 list item to flat dashboard Release shape. */
export function mapListItemToFlatRelease(item: ReleaseListItem): Record<string, unknown> {
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
    reportedIssue: item.reportedIssue,
    distributionIssueNote: item.distributionIssueNote,
    distributionIssueDetectedAt: item.distributionIssueDetectedAt,
    releasedOn: item.releasedOn,
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

/** Map v2 detail response to flat dashboard Release shape. */
export function mapDetailToFlatRelease(detail: ReleaseDetailResponse): Record<string, unknown> {
  const main = detail.artists.main[0];
  const social = profilesToFormFields(main?.profiles);
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
    isInstrumentalFlag: Boolean(first?.isInstrumental),
    isrc: first?.isrc,
    releaseDate: detail.release.releaseDate,
    originalReleaseDate: detail.release.originalReleaseDate,
    distributionTerritories: detail.release.distributionTerritories,
    upc: detail.distribution.upc || detail.release.upc,
    barcode: detail.distribution.upc || detail.release.upc,
    catalogNumber: detail.distribution.catalogNumber,
    copyright: detail.release.copyright,
    publisher: detail.release.publisher,
    producers: detail.release.publisher ? [detail.release.publisher] : undefined,
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
    coverArt: {
      // Durable key for edit/save; getSignedUrl accepts raw keys (and passthrough for http).
      url: detail.coverArt.storageKey || detail.coverArt.url,
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
    reportedIssue: detail.reportedIssue,
    distributionIssueNote: detail.distributionIssueNote ?? null,
    distributionIssueDetectedAt: detail.distributionIssueDetectedAt ?? null,
    createdAt: detail.createdAt,
    updatedAt: detail.updatedAt,
    releasedOn: detail.releasedOn,
  };
}

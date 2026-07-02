/** Release upload API v2 — canonical types (see docs/RELEASE_UPLOAD_V2_REFACTOR.md). */

export type ReleaseStatus =
  | 'Draft'
  | 'In Process'
  | 'Submitted'
  | 'Rejected'
  | 'Released';

export type ReleaseType = 'single' | 'ep' | 'album' | 'remix' | 'compilation';

export interface PlatformRef {
  id?: string;
  url?: string;
}

export interface AppleMusicPlatformRef extends PlatformRef {
  appleId?: string;
}

export interface ArtistProfiles {
  spotify?: PlatformRef;
  appleMusic?: AppleMusicPlatformRef;
  youtubeMusic?: PlatformRef;
  instagram?: PlatformRef;
  facebook?: PlatformRef;
}

export interface DraftArtist {
  name: string;
  cosmosId?: string;
  profiles?: ArtistProfiles;
}

export interface DraftArtists {
  main: DraftArtist[];
  featured: string[];
}

export interface DraftGenre {
  primary: string;
  secondary: string;
}

export interface DraftMediaAsset {
  storageKey: string;
  filename: string;
  size: number;
  format: string;
  duration?: number;
  hash?: string;
  fingerprint?: string;
}

export interface DraftCoverArt extends DraftMediaAsset {
  dimensions: { width: number; height: number };
}

export interface DraftTrackCredits {
  writers: string[];
  composers: string[];
  featuring?: string | null;
}

export interface DraftPreviewClip {
  startTime: string;
}

export interface DraftCrbt {
  cutName?: string;
  startTimeSec?: number;
  durationSec?: number;
}

export interface DraftTrack {
  order: number;
  title: string;
  version?: string | null;
  artistName?: string | null;
  language: string;
  genre: DraftGenre;
  mood: string;
  isExplicit: boolean;
  isInstrumental: boolean;
  isrc?: string | null;
  dolbyIsrc?: string | null;
  previouslyReleased?: boolean;
  originalReleaseDate?: string | null;
  credits: DraftTrackCredits;
  audio: DraftMediaAsset;
  previewClip?: DraftPreviewClip;
  crbt?: DraftCrbt;
}

export interface DraftReleaseMeta {
  title: string;
  version?: string | null;
  type: ReleaseType;
  labelName: string;
  releaseDate: string;
  originalReleaseDate?: string | null;
  previouslyReleased?: boolean;
  distributionTerritories: string[];
  upc?: string | null;
  copyright?: string | null;
  publisher?: string | null;
  recordingYear?: number;
}

export interface DraftSubmission {
  rightsAccepted: boolean;
  audioDuplicateConsent?: boolean;
  coverArtValidationConsent?: boolean;
}

/** POST /releases · PUT /releases/:id */
export interface CreateReleaseDraftRequest {
  release: DraftReleaseMeta;
  artists: DraftArtists;
  coverArt: DraftCoverArt;
  tracks: DraftTrack[];
  submission: DraftSubmission;
}

export interface ResponseMediaAsset extends DraftMediaAsset {
  playbackUrl?: string;
}

export interface ResponseCoverArt extends DraftCoverArt {
  url?: string;
}

export interface ResponseTrack extends Omit<DraftTrack, 'audio'> {
  id?: string;
  audio: ResponseMediaAsset;
}

export interface DraftRights {
  rightsAccepted: boolean;
  acceptedAt?: string | null;
}

export interface DraftDistribution {
  pdlAlbumId?: string | null;
  pdlSubmittedAt?: string | null;
  platforms?: string | null;
  catalogNumber?: string | null;
  upc?: string | null;
}

export interface DraftWorkflow {
  submittedAt?: string | null;
  approvedAt?: string | null;
  approvedBy?: string | null;
  rejectionReason?: string | null;
  riskScore?: number;
  riskStatus?: 'Safe' | 'Review' | 'Hold';
}

/** GET /releases/:id */
export interface ReleaseDetailResponse {
  id: string;
  releaseCode?: string;
  status: ReleaseStatus;
  userId?: string | { _id: string; email?: string; fullName?: string };
  createdAt?: string;
  updatedAt?: string;
  release: DraftReleaseMeta;
  artists: DraftArtists;
  coverArt: ResponseCoverArt;
  tracks: ResponseTrack[];
  rights: DraftRights;
  distribution: DraftDistribution;
  workflow: DraftWorkflow;
}

/** GET /releases list item */
export interface ReleaseListItem {
  id: string;
  releaseCode?: string;
  status: ReleaseStatus;
  title: string;
  artistName: string;
  type: ReleaseType;
  trackCount: number;
  coverArtUrl?: string;
  releaseDate?: string;
  upc?: string;
  pdlAlbumId?: string;
  createdAt?: string;
}

/** Flat Mongo release document — mapper input when API response is not yet v2-shaped. */
export interface MongoReleaseDocument {
  _id?: string;
  id?: string;
  releaseCode?: string;
  status?: ReleaseStatus;
  userId?: string | { _id: string; email?: string; fullName?: string };
  createdAt?: string;
  updatedAt?: string;
  title?: string;
  version?: string;
  releaseType?: ReleaseType;
  artistName?: string;
  labelName?: string;
  releaseDate?: string;
  originalReleaseDate?: string;
  previouslyReleased?: string | boolean;
  distributionTerritories?: string[];
  upc?: string;
  barcode?: string;
  catalogNumber?: string;
  copyright?: string;
  publisher?: string;
  recordingYear?: number;
  primaryGenre?: string;
  secondaryGenre?: string;
  subGenre?: string;
  genres?: string[];
  mood?: string;
  language?: string;
  isExplicit?: boolean;
  instrumental?: string;
  isInstrumentalFlag?: boolean;
  isrc?: string;
  previewClipStartTime?: string;
  rightsAccepted?: boolean;
  acceptedAt?: string;
  pdlAlbumId?: string;
  pdlSubmittedAt?: string;
  pdlPlatformsToRelease?: string;
  submittedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
  riskScore?: number;
  riskStatus?: string;
  primaryArtists?: Array<{
    name: string;
    appleId?: string;
    spotifyProfile?: unknown;
    appleMusicProfile?: unknown;
    youtubeMusicProfile?: unknown;
    instagramProfile?: string;
    facebookProfile?: string;
    instagramProfileUrl?: string;
    facebookProfileUrl?: string;
  }>;
  featuredArtists?: string[];
  spotifyProfile?: unknown;
  appleMusicProfile?: unknown;
  youtubeMusicProfile?: unknown;
  instagramProfile?: unknown;
  instagramProfileUrl?: string;
  facebookProfile?: unknown;
  facebookProfileUrl?: string;
  socialPlatforms?: {
    spotifyProfile?: unknown;
    appleMusicProfile?: unknown;
    youtubeMusicProfile?: unknown;
    instagramProfile?: unknown;
    instagramProfileUrl?: string;
    facebookProfile?: unknown;
    facebookProfileUrl?: string;
  };
  coverArt?: {
    url?: string;
    filename?: string;
    size?: number;
    dimensions?: { width: number; height: number };
    format?: string;
  };
  audioFile?: {
    url?: string;
    filename?: string;
    size?: number;
    duration?: number;
    format?: string;
    hash?: string;
    fingerprint?: string;
  };
  tracks?: MongoReleaseTrack[];
  writers?: string[];
  composers?: string[];
  producers?: string[];
}

export interface MongoReleaseTrack {
  _id?: string;
  trackOrder?: number;
  title?: string;
  artistName?: string;
  language?: string;
  primaryGenre?: string;
  secondaryGenre?: string;
  mood?: string;
  isExplicit?: boolean;
  isInstrumental?: boolean | string;
  isrc?: string;
  dolbyIsrc?: string;
  previouslyReleased?: string;
  originalReleaseDate?: string;
  writers?: string[];
  composers?: string[];
  producers?: string[];
  featuringArtist?: string;
  previewStartTime?: string;
  crbtCutName?: string;
  crbtStartTimeSec?: number;
  crbtDurationSec?: number;
  spotifyProfile?: unknown;
  appleMusicProfile?: unknown;
  youtubeMusicProfile?: unknown;
  instagramProfile?: unknown;
  facebookProfile?: unknown;
  audioFile?: {
    url?: string;
    filename?: string;
    size?: number;
    duration?: number;
    format?: string;
    hash?: string;
    fingerprint?: string;
  };
}

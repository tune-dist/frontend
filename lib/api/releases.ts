import apiClient from "../api-client";
import Cookies from "js-cookie";
import { config } from "@/lib/config";
import {
  buildDraftPayload,
  toReleaseDetailResponse,
  mapDetailToFlatRelease,
  isV2ReleaseListItem,
  mapListItemToFlatRelease,
  draftRequestToWriteSnapshot,
  pickChangedDraftFields,
  type ReleaseWriteSnapshot,
} from "@/lib/releases";
import type { CreateReleaseDraftRequest } from "@/lib/releases";
import type { SubmitProgressCallback } from "@/lib/upload/submit-progress";

export type { ReleaseWriteSnapshot };

export type SubmitReleaseOptions = {
  onProgress?: SubmitProgressCallback;
  /** Edit-mode baseline write snapshot; only changed keys are PUTed. */
  baseline?: ReleaseWriteSnapshot;
};

export interface ReleaseFormData {
  title: string;
  artistName: string;
  artists?: Array<{
    name: string;
    spotifyProfile?: any;
    appleMusicProfile?: any;
    youtubeMusicProfile?: any;
    instagramProfile?: string;
    facebookProfile?: string;
  }>;
  numberOfSongs?: string;
  userId?: string;
  version?: string;

  // Release info
  previouslyReleased?: string;
  originalReleaseDate?: string;
  releaseDate?: string;
  recordLabel?: string;
  labelName?: string;
  language: string;
  primaryGenre: string;
  secondaryGenre?: string;
  subGenre?: string;
  genres?: string[];

  // Social media & platforms
  socialMediaPack?: boolean;
  spotifyProfile?: any;
  appleMusicProfile?: any;
  youtubeMusicProfile?: any;
  instagramProfile?: string;
  instagramProfileUrl?: string;
  facebookProfile?: string;
  facebookProfileUrl?: string;

  // Files
  coverArt: any; // Can be File or object
  coverArtPreview?: string;
  audioFile?: any; // Can be File or object
  audioFileName?: string;
  audioFiles?: any[];

  // Track details (Legacy/Single)
  artworkConfirmed?: boolean;
  explicitLyrics?: string;
  isExplicit?: boolean;
  radioEdit?: string;
  instrumental?: string;
  previewClipStartTime?: string;
  trackNumber?: number;
  catalogNumber?: string;
  barcode?: string;
  upc?: string;
  isrc?: string;
  writers?: string[];
  composers?: string[];
  producers?: string[];
  publisher?: string;
  copyright?: string;
  recordingYear?: string | number;
  albumTitle?: string;

  distributionTerritories?: string[];
  format?: string;
  mood?: string;

  // Multi-track support
  tracks?: any[];

  // Other
  releaseType: ReleaseType;
  featuredArtists?: string[];
  featuringArtist?: string;
  audioConsent?: boolean;
  coverArtConsent?: boolean;
}

export type ReleaseStatus = "Draft" | "In Process" | "Submitted" | "Rejected" | "Released";
export type ReleaseType = "single" | "ep" | "album" | "remix" | "compilation";

export interface AudioFile {
  url: string;
  filename: string;
  size: number;
  duration: number;
  format: string;
  bitrate?: number;
  sampleRate?: number;
  fingerprint?: string;
  hash?: string;
}

export interface CoverArt {
  url: string;
  filename: string;
  size: number;
  dimensions: {
    width: number;
    height: number;
  };
  format: string;
}

export interface TrackPayload {
  title: string;
  artistName: string;
  audioFile: AudioFile | null;
  isExplicit: boolean;
  isInstrumental: boolean;
  previewStartTime?: string;
  price?: string;
  writers?: string[];
  composers?: string[];
  primaryGenre?: string;
  secondaryGenre?: string;
  previouslyReleased?: string;
  originalReleaseDate?: string;
  fingerprint?: string;
  hash?: string;
  featuringArtist?: string;
  isrc?: string;
  language?: string;
  spotifyProfile?: any;
  appleMusicProfile?: any;
  youtubeMusicProfile?: any;
  instagramProfile?: string;
  facebookProfile?: string;
  mood?: string;
}

export interface Release {
  _id: string;
  releaseCode?: string;
  userId: string | { _id: string; email: string; fullName: string };
  status: ReleaseStatus;
  title: string;
  artistName: string;
  featuredArtists?: string[];
  labelName?: string;
  language: string;
  primaryGenre: string;
  secondaryGenre?: string;
  releaseType: ReleaseType;
  isExplicit: boolean;
  audioFile?: AudioFile; // Optional
  trackNumber?: number;
  coverArt: CoverArt;
  releaseDate?: string;
  originalReleaseDate?: string;
  distributionTerritories?: string[];
  catalogNumber?: string;
  barcode?: string;
  upc?: string;
  isrc?: string;
  writers?: string[];
  composers?: string[];
  producers?: string[];
  publisher?: string;
  copyright?: string;
  recordingYear?: number;
  albumTitle?: string;
  rejectionReason?: string;
  adminNotes?: string;
  approvedBy?: string | { _id: string; fullName: string };
  submittedAt?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
  primaryArtists?: Array<{
    name: string;
    spotifyProfile?: any;
    appleMusicProfile?: any;
    youtubeMusicProfile?: any;
    instagramProfile?: string;
    facebookProfile?: string;
  }>;
  // Multi-track
  tracks?: TrackPayload[];
  socialPlatforms?: {
    spotifyProfile?: any;
    appleMusicProfile?: any;
    youtubeMusicProfile?: any;
    instagramProfile?: string;
    instagramProfileUrl?: string;
    facebookProfile?: string;
    facebookProfileUrl?: string;
  };
  /** Set after initial platform processing (metadata + assets upload) succeeds */
  pdlAlbumId?: string;
  reportedIssue?: {
    reportComment?: string;
    isResolved?: boolean;
    isAllIssueOfAlbumResolved?: boolean;
    syncedAt?: string;
  };
  /** Present only when the release is Released — DSP display data. */
  releasedOn?: {
    syncedAt?: string;
    platforms: Array<{
      name: string;
      key: string;
      liveLink?: string;
      openUrl?: string;
    }>;
  };
  previewClipStartTime?: string;
}


export interface ReleasesResponse {
  releases: Release[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    pages: number;
  };
}

export interface GetReleasesParams {
  status?: ReleaseStatus;
  page?: number;
  limit?: number;
  userId?: string;
  search?: string;
}

// Build API payload from upload form (shared by create + update)
export const buildCreateReleaseData = async (
  formData: ReleaseFormData,
  token: string,
  onProgress?: SubmitProgressCallback,
): Promise<CreateReleaseDraftRequest> => {
  return buildDraftPayload(
    formData as Parameters<typeof buildDraftPayload>[0],
    token,
    onProgress,
  );
};

// Helper to normalize release data from backend
export const normalizeRelease = (release: any): Release => {
  if (isV2ReleaseListItem(release)) {
    return mapListItemToFlatRelease(release) as unknown as Release;
  }
  const detail = toReleaseDetailResponse(release);
  return mapDetailToFlatRelease(detail) as unknown as Release;
};


// Process and submit new release with file uploads
export const submitNewRelease = async (
  formData: ReleaseFormData,
  options?: SubmitReleaseOptions,
) => {
  const token = Cookies.get(config.tokenKey) || "";
  const onProgress = options?.onProgress;

  try {
    const releaseData = await buildCreateReleaseData(formData, token, onProgress);
    onProgress?.({ percent: 92, label: "Saving release…" });
    const result = await createRelease(releaseData);
    onProgress?.({ percent: 100, label: "Complete" });
    return result;
  } catch (error: any) {
    console.error("Release submission failed:", error);
    throw error;
  }
};

// Update an existing Draft / In Process release (PUT sparse patch of changed fields)
export const submitReleaseUpdate = async (
  id: string,
  formData: ReleaseFormData,
  options?: SubmitReleaseOptions,
): Promise<(Release & { pdlSynced?: boolean; pdlMessage?: string }) & { writeSnapshot: ReleaseWriteSnapshot }> => {
  const token = Cookies.get(config.tokenKey) || "";
  const onProgress = options?.onProgress;

  try {
    const releaseData = await buildCreateReleaseData(formData, token, onProgress);
    const writeSnapshot = draftRequestToWriteSnapshot(releaseData);
    const patch = pickChangedDraftFields(options?.baseline ?? {}, writeSnapshot);

    if (Object.keys(patch).length === 0) {
      onProgress?.({ percent: 100, label: "Complete" });
      return { _id: id, writeSnapshot } as (Release & { pdlSynced?: boolean; pdlMessage?: string }) & {
        writeSnapshot: ReleaseWriteSnapshot;
      };
    }

    onProgress?.({ percent: 92, label: "Saving release…" });
    const result = await updateRelease(id, patch);
    onProgress?.({ percent: 100, label: "Complete" });
    return { ...result, writeSnapshot };
  } catch (error: any) {
    console.error("Release update failed:", error);
    throw error;
  }
};

// Get all user releases
export const getReleases = async (
  params?: GetReleasesParams
): Promise<ReleasesResponse> => {
  const response = await apiClient.get<ReleasesResponse>("/releases", {
    params,
  });
  if (response.data.releases) {
    response.data.releases = response.data.releases.map(normalizeRelease);
  }
  return response.data;

};

// Get single release by ID
export const getRelease = async (id: string): Promise<Release> => {
  const response = await apiClient.get<Release>(`/releases/${id}`);
  return normalizeRelease(response.data);
};


// Create new release (draft)
export const createRelease = async (
  data: CreateReleaseDraftRequest
): Promise<Release> => {
  const response = await apiClient.post("/releases", data);
  return normalizeRelease(response.data);
};

// Update release (draft only) — accepts full v2 draft or sparse flat write patch
export const updateRelease = async (
  id: string,
  data: CreateReleaseDraftRequest | Record<string, unknown>,
): Promise<Release & { pdlSynced?: boolean; pdlMessage?: string }> => {
  const response = await apiClient.put(`/releases/${id}`, data);
  const payload = response.data;
  if (payload && typeof payload === 'object' && '_id' in payload && !('release' in payload)) {
    return payload as Release & { pdlSynced?: boolean; pdlMessage?: string };
  }
  return normalizeRelease(payload);
};





// Delete release (draft only)
export const deleteRelease = async (
  id: string
): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>(
    `/releases/${id}`
  );
  return response.data;
};

// Approve release (Admin only)
export const approveRelease = async (id: string): Promise<Release> => {
  const response = await apiClient.post<Release>(`/releases/${id}/approve`);
  return response.data;
};

// Reject release (Admin only)
export const rejectRelease = async (
  id: string,
  reason: string
): Promise<Release> => {
  const response = await apiClient.post<Release>(`/releases/${id}/reject`, {
    reason,
  });
  return response.data;
};

/** Phase 1: verify metadata + upload artwork & audio to distribution pipeline */
export const submitToPdl = async (id: string, data: any = {}): Promise<any> => {
  const response = await apiClient.post(`/releases/${id}/submit-to-pdl`, data);
  return response.data;
};

/** Phase 2: final distribute to selected platforms */
export const pdlSubmit = async (id: string, data: any = {}): Promise<any> => {
  const response = await apiClient.post(`/releases/${id}/pdl-submit`, data);
  return response.data;
};



// Get artist usage
export const getArtistUsage = async (): Promise<{ artists: any[] }> => {
  const response = await apiClient.get<{ artists: any[] }>(
    "/releases/artists/usage"
  );
  return response.data;
};

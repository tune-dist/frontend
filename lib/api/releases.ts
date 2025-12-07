import apiClient from '../api-client';

export type ReleaseStatus = 'draft' | 'pending_review' | 'processing' | 'distributed' | 'rejected';
export type ReleaseType = 'single' | 'ep' | 'album' | 'compilation';

export interface AudioFile {
  url: string;
  filename: string;
  size: number;
  duration: number;
  format: string;
  bitrate?: number;
  sampleRate?: number;
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

export interface Release {
  _id: string;
  userId: string;
  status: ReleaseStatus;
  title: string;
  artistName: string;
  featuredArtists?: string[];
  labelName?: string;
  genres: string[];
  subGenre?: string;
  language: string;
  releaseType: ReleaseType;
  isExplicit: boolean;
  audioFile: AudioFile;
  trackNumber?: number;
  coverArt: CoverArt;
  releaseDate: string;
  originalReleaseDate?: string;
  distributionTerritories?: string[];
  catalogNumber?: string;
  barcode?: string;
  isrc?: string;
  producers?: string[];
  writers?: string[];
  composers?: string[];
  publisher?: string;
  copyright?: string;
  recordingYear?: number;
  albumTitle?: string;
  rejectionReason?: string;
  adminNotes?: string;
  submittedAt?: string;
  distributedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReleaseData {
  title: string;
  artistName: string;
  featuredArtists?: string[];
  labelName?: string;
  genres: string[];
  subGenre?: string;
  language: string;
  releaseType: ReleaseType;
  isExplicit: boolean;
  audioFile: AudioFile;
  trackNumber?: number;
  coverArt: CoverArt;
  releaseDate: string;
  originalReleaseDate?: string;
  distributionTerritories?: string[];
  catalogNumber?: string;
  barcode?: string;
  isrc?: string;
  producers?: string[];
  writers?: string[];
  composers?: string[];
  publisher?: string;
  copyright?: string;
  recordingYear?: number;
  albumTitle?: string;
}

export interface ReleasesResponse {
  releases: Release[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface GetReleasesParams {
  status?: ReleaseStatus;
  page?: number;
  limit?: number;
}

// Get all user releases
export const getReleases = async (params?: GetReleasesParams): Promise<ReleasesResponse> => {
  const response = await apiClient.get<ReleasesResponse>('/releases', { params });
  return response.data;
};

// Get single release by ID
export const getRelease = async (id: string): Promise<Release> => {
  const response = await apiClient.get<Release>(`/releases/${id}`);
  return response.data;
};

// Create new release (draft)
export const createRelease = async (data: CreateReleaseData): Promise<Release> => {
  const response = await apiClient.post<Release>('/releases', data);
  return response.data;
};

// Update release (draft only)
export const updateRelease = async (id: string, data: Partial<CreateReleaseData>): Promise<Release> => {
  const response = await apiClient.put<Release>(`/releases/${id}`, data);
  return response.data;
};

// Submit release for review
export const submitRelease = async (id: string): Promise<Release> => {
  const response = await apiClient.post<Release>(`/releases/${id}/submit`);
  return response.data;
};

// Cancel submitted release
export const cancelRelease = async (id: string): Promise<Release> => {
  const response = await apiClient.post<Release>(`/releases/${id}/cancel`);
  return response.data;
};

// Delete release (draft only)
export const deleteRelease = async (id: string): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>(`/releases/${id}`);
  return response.data;
};


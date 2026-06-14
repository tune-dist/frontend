import apiClient from '../api-client';

export interface DashboardTrends {
  releasesChangePercent: number;
  streamsChangePercent: number;
}

export interface PlatformStreamItem {
  dsp: string;
  label: string;
  streams: number;
  percentage: number;
}

export interface DashboardStats {
  totalReleases: number;
  pendingReleases: number;
  totalStreams: number;
  revenueEarned: number;
  trends: DashboardTrends;
  platformStreams: PlatformStreamItem[];
}

export interface DashboardLatestRelease {
  id: string;
  title: string;
  artistName: string;
  coverArtUrl?: string;
  status: string;
  releaseDate?: string;
  createdAt: string;
  totalStreams: number;
}

export interface DashboardLatestReleasesResponse {
  releases: DashboardLatestRelease[];
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await apiClient.get<DashboardStats>('/dashboard/stats');
  return response.data;
};

export const getLatestReleases = async (limit = 6): Promise<DashboardLatestReleasesResponse> => {
  const response = await apiClient.get<DashboardLatestReleasesResponse>('/dashboard/latest-releases', {
    params: { limit },
  });
  return response.data;
};

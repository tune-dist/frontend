import apiClient from '@/lib/api-client';

export interface CosmosArtistResult {
  cosmosId: string;
  name: string;
  appleId: string;
  spotifyId: string;
  metaId: string;
  facebookUrl: string;
  instagramUrl: string;
  isIprsMember: boolean;
  ipiNumber: string;
  verified: boolean;
  hasItunesError: boolean;
  hasSpotifyError: boolean;
  isNewSpotifyProfile: boolean;
  isNewAppleProfile: boolean;
  image?: string;
  followers?: number;
  spotifyUrl?: string;
}

export interface CosmosArtistSearchResponse {
  totalCount: number;
  filterCount: number;
  artists: CosmosArtistResult[];
}

export async function searchCosmosArtists(
  query: string,
  options?: { page?: number; limit?: number; enrich?: boolean },
): Promise<CosmosArtistSearchResponse> {
  const response = await apiClient.get<CosmosArtistSearchResponse>(
    '/integrations/cosmos/artists/search',
    {
      params: {
        q: query.trim(),
        page: options?.page ?? 1,
        limit: options?.limit ?? 15,
        enrich: options?.enrich ?? true,
      },
    },
  );
  return response.data;
}

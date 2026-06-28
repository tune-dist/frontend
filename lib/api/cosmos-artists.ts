import { config } from '@/lib/config';

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
  const params = new URLSearchParams({
    q: query.trim(),
    page: String(options?.page ?? 1),
    limit: String(options?.limit ?? 15),
    enrich: String(options?.enrich ?? true),
  });

  const response = await fetch(
    `${config.apiUrl}/integrations/cosmos/artists/search?${params.toString()}`,
  );
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Request failed (${response.status})`);
  }
  return response.json() as Promise<CosmosArtistSearchResponse>;
}

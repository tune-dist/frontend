import apiClient from '@/lib/api-client';

export type ArtistSearchSource = 'cosmos';

export interface PlatformArtistSearchHit {
  id: string;
  name: string;
  image?: string;
  externalUrl?: string;
  url?: string;
  channelUrl?: string;
  followers?: number;
  track?: string;
  cosmosId?: string;
}

export interface ArtistSearchResponse {
  source: ArtistSearchSource;
  spotify: PlatformArtistSearchHit[];
  apple: PlatformArtistSearchHit[];
}

/** Unified upload UI artist search (COSMOS catalog). */
export async function searchArtists(
  query: string,
  options?: {
    spotifyLimit?: number;
    appleLimit?: number;
    cosmosLimit?: number;
  },
): Promise<ArtistSearchResponse> {
  const response = await apiClient.get<ArtistSearchResponse>('/integrations/artists/search', {
    params: {
      q: query.trim(),
      spotifyLimit: options?.spotifyLimit ?? 10,
      appleLimit: options?.appleLimit ?? 15,
      cosmosLimit: options?.cosmosLimit ?? 15,
    },
  });
  return response.data;
}

export interface ArtistEnrichmentResponse {
  spotify?: {
    image?: string;
    followers?: number;
    externalUrl?: string;
  };
  apple?: {
    image?: string;
    albumName?: string;
    genre?: string;
  };
}

/** Fetch Spotify photos / Apple iTunes album-art fallback for linked profile ids or URLs. */
export async function enrichArtistProfile(input: {
  spotifyId?: string;
  appleId?: string;
  appleUrl?: string;
}): Promise<ArtistEnrichmentResponse> {
  const response = await apiClient.get<ArtistEnrichmentResponse>('/integrations/artists/enrich', {
    params: {
      spotifyId: input.spotifyId,
      appleId: input.appleId,
      appleUrl: input.appleUrl,
    },
  });
  return response.data;
}

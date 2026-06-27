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

export interface CosmosAddArtistResponse {
  cosmosId?: string;
  name: string;
  raw?: unknown;
}

export interface CosmosFindOrAddResponse extends CosmosAddArtistResponse {
  matchedExisting: boolean;
}

export interface CosmosAddArtistInput {
  name: string;
  spotify_id?: string;
  apple_id?: string;
  meta_id?: string;
  facebook_artist_page_url?: string;
  insta_artist_page_url?: string;
  is_iprs_member?: boolean;
  ipi_number?: string;
  spotifyProfile?: unknown;
  appleMusicProfile?: unknown;
  instagramProfile?: unknown;
  instagramProfileUrl?: unknown;
  facebookProfile?: unknown;
  facebookProfileUrl?: unknown;
  createNewSpotifyProfile?: boolean;
  createNewAppleProfile?: boolean;
}

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
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
  return parseJson<CosmosArtistSearchResponse>(response);
}

export async function addCosmosArtist(
  input: CosmosAddArtistInput,
): Promise<CosmosAddArtistResponse> {
  const response = await fetch(`${config.apiUrl}/integrations/cosmos/artists/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return parseJson<CosmosAddArtistResponse>(response);
}

export async function findOrAddCosmosArtist(
  input: CosmosAddArtistInput,
): Promise<CosmosFindOrAddResponse> {
  const response = await fetch(
    `${config.apiUrl}/integrations/cosmos/artists/find-or-add`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    },
  );
  return parseJson<CosmosFindOrAddResponse>(response);
}

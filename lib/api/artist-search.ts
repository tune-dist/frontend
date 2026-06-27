import { config } from '@/lib/config';

export type ArtistSearchSource = 'cosmos' | 'legacy';

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
  youtube: PlatformArtistSearchHit[];
}

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

/** Single upload UI entry point — backend picks COSMOS vs legacy via USE_COSMOS_ARTIST_SEARCH. */
export async function searchArtists(
  query: string,
  options?: {
    spotifyLimit?: number;
    appleLimit?: number;
    youtubeLimit?: number;
    cosmosLimit?: number;
  },
): Promise<ArtistSearchResponse> {
  const params = new URLSearchParams({
    q: query.trim(),
    spotifyLimit: String(options?.spotifyLimit ?? 10),
    appleLimit: String(options?.appleLimit ?? 15),
    youtubeLimit: String(options?.youtubeLimit ?? 15),
    cosmosLimit: String(options?.cosmosLimit ?? 15),
  });

  const response = await fetch(
    `${config.apiUrl}/integrations/artists/search?${params.toString()}`,
  );
  return parseJson<ArtistSearchResponse>(response);
}

export async function getArtistSearchMode(): Promise<{
  useCosmosArtistSearch: boolean;
}> {
  const response = await fetch(
    `${config.apiUrl}/integrations/artists/search-mode`,
  );
  return parseJson(response);
}

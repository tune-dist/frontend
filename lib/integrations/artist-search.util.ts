import {
  searchArtists,
  type ArtistSearchResponse,
  type ArtistSearchSource,
  type PlatformArtistSearchHit,
} from '@/lib/api/artist-search';

export type { ArtistSearchSource, PlatformArtistSearchHit };

export type ArtistSearchResults = ArtistSearchResponse;

export function emptyArtistSearchResults(): ArtistSearchResults {
  return { source: 'cosmos', spotify: [], apple: [], youtube: [] };
}

export async function searchArtistProfiles(
  query: string,
  options?: {
    spotifyLimit?: number;
    appleLimit?: number;
    youtubeLimit?: number;
    cosmosLimit?: number;
  },
): Promise<ArtistSearchResults> {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return emptyArtistSearchResults();
  }

  try {
    return await searchArtists(trimmed, options);
  } catch (error) {
    console.error('Artist search error:', error);
    return emptyArtistSearchResults();
  }
}

/** @deprecated use ArtistSearchResults */
export type PlatformSearchResults = ArtistSearchResults;

export function emptySearchResults(): ArtistSearchResults {
  return emptyArtistSearchResults();
}

export function isCosmosArtistSearch(source: ArtistSearchSource): boolean {
  return source === 'cosmos';
}

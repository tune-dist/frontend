import { findOrAddCosmosArtist } from '@/lib/api/cosmos-artists';
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

export async function ensureCosmosArtistId(input: {
  name: string;
  spotifyProfile?: unknown;
  appleMusicProfile?: unknown;
  createNewSpotifyProfile?: boolean;
  createNewAppleProfile?: boolean;
  existingCosmosId?: string;
  cosmosIdFromSelection?: string;
}): Promise<string | undefined> {
  const existing =
    input.existingCosmosId?.trim() || input.cosmosIdFromSelection?.trim();
  if (existing) return existing;

  const name = input.name.trim();
  if (!name) return undefined;

  const result = await findOrAddCosmosArtist({
    name,
    spotifyProfile: input.spotifyProfile,
    appleMusicProfile: input.appleMusicProfile,
    createNewSpotifyProfile: input.createNewSpotifyProfile,
    createNewAppleProfile: input.createNewAppleProfile,
  });

  return result.cosmosId;
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

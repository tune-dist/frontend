import type { ArtistSearchResponse } from '@/lib/api/artist-search';
import { ensureCosmosArtistId, isCosmosArtistSearch } from '@/lib/integrations/artist-search.util';

export type PlatformKey = 'spotify' | 'apple' | 'youtube';

export type ProfileSelectionValue = {
  spotifyProfile?: unknown;
  appleMusicProfile?: unknown;
  youtubeMusicProfile?: unknown;
  cosmosArtistId?: string;
};

export function buildProfileValueToSave(
  profile: unknown | 'new' | '',
): unknown {
  if (profile === 'new' || profile === '') return profile;
  if (typeof profile === 'string') return profile;
  if (profile && typeof profile === 'object') {
    const row = profile as Record<string, unknown>;
    return {
      id: row.id,
      name: row.name,
      image: row.image || '',
      url: row.externalUrl || row.channelUrl || row.url || '',
      followers: row.followers,
      track: row.track,
    };
  }
  return profile;
}

export function profileFieldForPlatform(platform: PlatformKey): keyof ProfileSelectionValue {
  if (platform === 'spotify') return 'spotifyProfile';
  if (platform === 'apple') return 'appleMusicProfile';
  return 'youtubeMusicProfile';
}

export async function registerCosmosArtistIfNeeded(input: {
  searchResults: ArtistSearchResponse;
  artistName: string;
  platform: PlatformKey;
  profile: unknown | 'new' | '';
  valueToSave: unknown;
  existingProfiles: ProfileSelectionValue;
}): Promise<string | undefined> {
  if (!isCosmosArtistSearch(input.searchResults.source)) return undefined;
  if (!input.artistName.trim()) return undefined;

  // YouTube is legacy-only — not part of COSMOS artist catalog.
  if (input.platform === 'youtube') return undefined;

  const cosmosIdFromRow =
    input.profile && typeof input.profile === 'object'
      ? String((input.profile as { cosmosId?: string }).cosmosId || '').trim()
      : '';
  if (cosmosIdFromRow) return cosmosIdFromRow;

  const existingCosmosId = input.existingProfiles.cosmosArtistId?.trim();
  if (existingCosmosId) return existingCosmosId;

  // Only Spotify/Apple "Create New" or linked profiles can be registered in COSMOS.
  const isSpotifyNew =
    input.profile === 'new' && input.platform === 'spotify';
  const isAppleNew =
    input.profile === 'new' && input.platform === 'apple';
  const hasSpotifyLink =
    input.platform === 'spotify' &&
    input.profile !== '' &&
    input.profile !== 'new';
  const hasAppleLink =
    input.platform === 'apple' &&
    input.profile !== '' &&
    input.profile !== 'new';

  if (!isSpotifyNew && !isAppleNew && !hasSpotifyLink && !hasAppleLink) {
    return undefined;
  }

  // PDL creates new Spotify/Apple profiles on album submit (spotify_id/apple_id = "new").
  // POST /v2.0/artist/add rejects that sentinel — skip find-or-add here.
  if (isSpotifyNew || isAppleNew) {
    return undefined;
  }

  const spotifyValue =
    input.platform === 'spotify'
      ? input.valueToSave
      : input.existingProfiles.spotifyProfile;
  const appleValue =
    input.platform === 'apple'
      ? input.valueToSave
      : input.existingProfiles.appleMusicProfile;

  try {
    return await ensureCosmosArtistId({
      name: input.artistName,
      spotifyProfile: spotifyValue,
      appleMusicProfile: appleValue,
      createNewSpotifyProfile: isSpotifyNew,
      createNewAppleProfile: isAppleNew,
      existingCosmosId,
    });
  } catch (error) {
    console.error('COSMOS artist find-or-add failed:', error);
    // Non-blocking: release save can still register on backend.
    return undefined;
  }
}

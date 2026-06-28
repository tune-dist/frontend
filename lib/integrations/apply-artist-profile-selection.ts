import type { ArtistSearchResponse } from '@/lib/api/artist-search';

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
      cosmosId: row.cosmosId,
    };
  }
  return profile;
}

export function profileFieldForPlatform(platform: PlatformKey): keyof ProfileSelectionValue {
  if (platform === 'spotify') return 'spotifyProfile';
  if (platform === 'apple') return 'appleMusicProfile';
  return 'youtubeMusicProfile';
}

export function isCosmosArtistSearch(source: ArtistSearchResponse['source']): boolean {
  return source === 'cosmos';
}

export function rosterArtistHasPendingProfiles(artist: unknown): boolean {
  if (!artist || typeof artist !== 'object') return false;
  const row = artist as {
    profilesPending?: boolean;
    spotifyProfile?: unknown;
    appleMusicProfile?: unknown;
  };
  if (row.profilesPending) return true;
  return row.spotifyProfile === 'new' || row.appleMusicProfile === 'new';
}

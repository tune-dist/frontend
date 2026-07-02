import type { AppleMusicPlatformRef, ArtistProfiles, PlatformRef } from './types';

const SENTINEL_VALUES = new Set(['yes', 'no', 'new']);

/** Normalize flat profile values (string URL, rich object, or sentinel) to v2 PlatformRef. */
export function toPlatformRef(value: unknown): PlatformRef | undefined {
  if (value == null) return undefined;

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    if (trimmed.toLowerCase() === 'new') return { id: 'new' };
    if (SENTINEL_VALUES.has(trimmed.toLowerCase())) return undefined;
    return { url: trimmed };
  }

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const url =
      typeof record.url === 'string'
        ? record.url
        : typeof record.id === 'string' && record.id.startsWith('http')
          ? record.id
          : undefined;
    const id =
      typeof record.id === 'string' && !record.id.startsWith('http')
        ? record.id
        : typeof record.spotify_id === 'string'
          ? record.spotify_id
          : undefined;

    if (!url && !id) return undefined;
    return { ...(id ? { id } : {}), ...(url ? { url } : {}) };
  }

  return undefined;
}

export function toAppleMusicPlatformRef(value: unknown): AppleMusicPlatformRef | undefined {
  if (typeof value === 'string' && value.trim().toLowerCase() === 'new') {
    return { id: 'new', appleId: 'new' };
  }

  const base = toPlatformRef(value);
  if (!base && value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const appleId =
      typeof record.appleId === 'string'
        ? record.appleId
        : typeof record.apple_id === 'string'
          ? record.apple_id
          : undefined;
    if (appleId) {
      return { appleId, ...toPlatformRef(value) };
    }
  }
  if (!base) return undefined;
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const appleId =
      typeof record.appleId === 'string'
        ? record.appleId
        : typeof record.apple_id === 'string'
          ? record.apple_id
          : undefined;
    return appleId ? { ...base, appleId } : base;
  }
  return base;
}

export function buildProfilesFromFlatFields(sources: {
  spotifyProfile?: unknown;
  appleMusicProfile?: unknown;
  youtubeMusicProfile?: unknown;
  instagramProfile?: unknown;
  instagramProfileUrl?: string;
  facebookProfile?: unknown;
  facebookProfileUrl?: string;
}): ArtistProfiles | undefined {
  const spotify = toPlatformRef(sources.spotifyProfile);
  const appleMusic = toAppleMusicPlatformRef(sources.appleMusicProfile);
  const youtubeMusic = toPlatformRef(sources.youtubeMusicProfile);

  const instagramUrl =
    sources.instagramProfile === 'yes'
      ? sources.instagramProfileUrl?.trim()
      : toPlatformRef(sources.instagramProfile)?.url;
  const instagram = instagramUrl ? { url: instagramUrl } : undefined;

  const facebookUrl =
    sources.facebookProfile === 'yes'
      ? sources.facebookProfileUrl?.trim()
      : toPlatformRef(sources.facebookProfile)?.url;
  const facebook = facebookUrl ? { url: facebookUrl } : undefined;

  const profiles: ArtistProfiles = {
    ...(spotify ? { spotify } : {}),
    ...(appleMusic ? { appleMusic } : {}),
    ...(youtubeMusic ? { youtubeMusic } : {}),
    ...(instagram ? { instagram } : {}),
    ...(facebook ? { facebook } : {}),
  };

  return Object.keys(profiles).length > 0 ? profiles : undefined;
}

/** Map v2 profiles back to flat upload form fields. */
export function profilesToFormFields(profiles?: ArtistProfiles): {
  spotifyProfile?: unknown;
  appleMusicProfile?: unknown;
  youtubeMusicProfile?: unknown;
  instagramProfile: string;
  instagramProfileUrl?: string;
  facebookProfile: string;
  facebookProfileUrl?: string;
} {
  const instagramUrl = profiles?.instagram?.url;
  const facebookUrl = profiles?.facebook?.url;

  const toFormProfile = (ref?: PlatformRef | AppleMusicPlatformRef) => {
    if (!ref) return undefined;
    if (ref.id === 'new') return 'new';
    return ref;
  };

  return {
    spotifyProfile: toFormProfile(profiles?.spotify),
    appleMusicProfile: toFormProfile(profiles?.appleMusic),
    youtubeMusicProfile: toFormProfile(profiles?.youtubeMusic),
    instagramProfile: instagramUrl ? 'yes' : 'no',
    instagramProfileUrl: instagramUrl,
    facebookProfile: facebookUrl ? 'yes' : 'no',
    facebookProfileUrl: facebookUrl,
  };
}

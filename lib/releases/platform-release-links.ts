import { PLATFORM_BADGES } from '@/config/platform-badges';

/** One DSP entry from release.releasedOn.platforms (Released only). */
export interface ReleasedOnPlatform {
  /** Platform display name from COSMOS platform list (e.g. "Spotify"). */
  name: string;
  /** Frontend badge key (spotify, apple-music, …). */
  key: string;
  liveLink?: string;
  openUrl?: string;
}

export interface ReleasedOn {
  syncedAt?: string;
  platforms: ReleasedOnPlatform[];
}

/** Resolve badge asset for a COSMOS-synced platform key. */
export function getPlatformBadge(platformKey: string) {
  const key = platformKey.trim().toLowerCase();
  return (
    PLATFORM_BADGES.find((badge) => badge.id === key) ||
    PLATFORM_BADGES.find((badge) => key.includes(badge.id) || badge.id.includes(key))
  );
}

export function getPlatformOpenUrl(platform: ReleasedOnPlatform): string | undefined {
  const url = platform.openUrl || platform.liveLink;
  if (!url?.trim()) return undefined;
  return url.trim();
}

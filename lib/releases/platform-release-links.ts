import { PLATFORM_BADGES } from '@/config/platform-badges';
import type { ReleasedOnPlatform } from '@/lib/releases/types';

/** Resolve badge asset for a COSMOS-synced platform key (exact id match only). */
export function getPlatformBadge(platformKey: string) {
  const key = platformKey.trim().toLowerCase();
  return PLATFORM_BADGES.find((badge) => badge.id === key);
}

export function getPlatformOpenUrl(platform: ReleasedOnPlatform): string | undefined {
  const url = platform.openUrl || platform.liveLink;
  if (!url?.trim()) return undefined;
  return url.trim();
}

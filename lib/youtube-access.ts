import type { User } from '@/lib/api/auth';

const YOUTUBE_SERVICE_ROLES = new Set([
  'artist',
  'release_manager',
  'admin',
  'super_admin',
]);

export function canAccessYouTubeService(user: User | null | undefined): boolean {
  if (!user) return false;
  if (YOUTUBE_SERVICE_ROLES.has(user.role)) return true;
  return user.permissions?.includes('USE_YOUTUBE_SERVICE') ?? false;
}

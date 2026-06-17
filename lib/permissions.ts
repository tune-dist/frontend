import type { User } from '@/lib/api/auth';

export const STAFF_ROLES = ['super_admin', 'admin', 'release_manager'] as const;

export type StaffRole = (typeof STAFF_ROLES)[number];

type PermissionUser = Pick<User, 'role' | 'permissions'> | null | undefined;

/** Permissions that remain available by role when DB seeds are stale */
const PERMISSION_ROLE_FALLBACKS: Record<string, readonly string[]> = {
  USE_YOUTUBE_SERVICE: ['artist', 'release_manager', 'admin', 'super_admin'],
};

export function isStaffUser(user: PermissionUser): boolean {
  return !!user?.role && STAFF_ROLES.includes(user.role as StaffRole);
}

export function hasPermission(user: PermissionUser, permission: string): boolean {
  if (!user) return false;
  if (user.role === 'super_admin') return true;
  if (user.permissions?.includes(permission)) return true;

  const roleFallback = PERMISSION_ROLE_FALLBACKS[permission];
  return roleFallback?.includes(user.role ?? '') ?? false;
}

export function canAccessYouTubeService(user: PermissionUser): boolean {
  return hasPermission(user, 'USE_YOUTUBE_SERVICE');
}

export function canManageReleases(user: PermissionUser): boolean {
  if (!user) return false;
  if (isStaffUser(user)) return true;
  return hasPermission(user, 'APPROVE_RELEASE');
}

export function canManageUsers(user: PermissionUser): boolean {
  return hasPermission(user, 'MANAGE_USERS');
}

export function canManagePermissions(user: PermissionUser): boolean {
  return hasPermission(user, 'MANAGE_PERMISSIONS');
}

export function canViewAnalytics(user: PermissionUser): boolean {
  return hasPermission(user, 'VIEW_ANALYTICS');
}

export function canAccessNavItem(
  user: PermissionUser,
  permission?: string,
): boolean {
  if (!permission) return true;
  return hasPermission(user, permission);
}

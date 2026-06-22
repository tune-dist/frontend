import type { User } from '@/lib/api/auth';

export const STAFF_ROLES = ['super_admin', 'admin', 'release_manager'] as const;

export type StaffRole = (typeof STAFF_ROLES)[number];

type PermissionUser = Pick<User, 'role' | 'permissions'> | null | undefined;

export function hasPermission(user: PermissionUser, permission: string): boolean {
  if (!user) return false;
  if (user.role === 'super_admin') return true;
  return user.permissions?.includes(permission) ?? false;
}

export function isStaffUser(user: PermissionUser): boolean {
  return hasPermission(user, 'APPROVE_RELEASE');
}

export function canAccessYouTubeService(user: PermissionUser): boolean {
  return hasPermission(user, 'USE_YOUTUBE_SERVICE');
}

export function canManageReleases(user: PermissionUser): boolean {
  return hasPermission(user, 'APPROVE_RELEASE');
}

export function canManageUsers(user: PermissionUser): boolean {
  return hasPermission(user, 'MANAGE_USERS');
}

export function canViewUsers(user: PermissionUser): boolean {
  return hasPermission(user, 'VIEW_USERS');
}

export function canManagePermissions(user: PermissionUser): boolean {
  return hasPermission(user, 'MANAGE_PERMISSIONS');
}

export function canViewPermissions(user: PermissionUser): boolean {
  return hasPermission(user, 'VIEW_PERMISSIONS');
}

export function canViewBilling(user: PermissionUser): boolean {
  return hasPermission(user, 'VIEW_BILLING');
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

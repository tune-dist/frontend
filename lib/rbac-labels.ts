/** Display labels for roles (API uses snake_case keys). */
export const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  release_manager: 'Release Manager',
  artist: 'Artist',
};

export function formatRoleLabel(role: string): string {
  if (!role) return '';
  return (
    ROLE_LABELS[role] ??
    role
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')
  );
}

/** Permission slugs — keep in sync with backend auth/permissions.constants.ts */
export const PERMISSIONS = {
  VIEW_RELEASES: 'VIEW_RELEASES',
  UPLOAD_RELEASE: 'UPLOAD_RELEASE',
  EDIT_RELEASE: 'EDIT_RELEASE',
  DELETE_RELEASE: 'DELETE_RELEASE',
  APPROVE_RELEASE: 'APPROVE_RELEASE',
  REJECT_RELEASE: 'REJECT_RELEASE',
  VIEW_USERS: 'VIEW_USERS',
  MANAGE_USERS: 'MANAGE_USERS',
  VIEW_PLANS: 'VIEW_PLANS',
  MANAGE_PLANS: 'MANAGE_PLANS',
  VIEW_PERMISSIONS: 'VIEW_PERMISSIONS',
  MANAGE_PERMISSIONS: 'MANAGE_PERMISSIONS',
  VIEW_BILLING: 'VIEW_BILLING',
  MANAGE_BILLING: 'MANAGE_BILLING',
  VIEW_ANALYTICS: 'VIEW_ANALYTICS',
  MANAGE_STREAM_IMPORTS: 'MANAGE_STREAM_IMPORTS',
  MANAGE_PROMOTION: 'MANAGE_PROMOTION',
  MANAGE_TESTIMONIALS: 'MANAGE_TESTIMONIALS',
  VIEW_CONTACT_INQUIRIES: 'VIEW_CONTACT_INQUIRIES',
  USE_YOUTUBE_SERVICE: 'USE_YOUTUBE_SERVICE',
  PROFILE: 'PROFILE',
} as const;

export type PermissionSlug = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/** Optional display overrides (API/DB may still store longer names). */
export const PERMISSION_LABELS: Partial<Record<PermissionSlug, string>> = {
  USE_YOUTUBE_SERVICE: 'YouTube Service',
  MANAGE_STREAM_IMPORTS: 'Stream Imports',
  VIEW_CONTACT_INQUIRIES: 'Contact Inquiries',
};

export function formatPermissionLabel(
  permission: { name: string; slug: string },
): string {
  const slug = permission.slug as PermissionSlug;
  return PERMISSION_LABELS[slug] ?? permission.name;
}

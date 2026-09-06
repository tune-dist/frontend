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
  VIEW_RELEASES: 'My Releases',
  UPLOAD_RELEASE: 'Upload Music',
  VIEW_BILLING: 'Billing / Finance',
  VIEW_ANALYTICS: 'Analytics',
  MANAGE_PROMOTION: 'Promotion',
  MANAGE_TESTIMONIALS: 'Testimonials',
  VIEW_CONTACT_INQUIRIES: 'Inquiries',
  MANAGE_STREAM_IMPORTS: 'Stream Imports',
  PROFILE: 'Profile',
  USE_YOUTUBE_SERVICE: 'YouTube Service',
  APPROVE_RELEASE: 'Verifications',
  VIEW_USERS: 'Users',
  MANAGE_PLANS: 'Plan Management',
  VIEW_PERMISSIONS: 'Permissions',
  MANAGE_USERS: 'Manage Users',
  MANAGE_PERMISSIONS: 'Manage Permissions',
  VIEW_PLANS: 'View Plans',
  MANAGE_BILLING: 'Manage Billing',
  EDIT_RELEASE: 'Edit Release',
  DELETE_RELEASE: 'Delete Release',
  REJECT_RELEASE: 'Reject Release',
};

/** Matrix display order — sidebar nav first, then remaining permissions. */
export const PERMISSION_DISPLAY_ORDER: PermissionSlug[] = [
  'VIEW_RELEASES',
  'UPLOAD_RELEASE',
  'EDIT_RELEASE',
  'DELETE_RELEASE',
  'APPROVE_RELEASE',
  'REJECT_RELEASE',
  'VIEW_BILLING',
  'MANAGE_BILLING',
  'VIEW_ANALYTICS',
  'MANAGE_PROMOTION',
  'MANAGE_TESTIMONIALS',
  'VIEW_CONTACT_INQUIRIES',
  'MANAGE_STREAM_IMPORTS',
  'PROFILE',
  'USE_YOUTUBE_SERVICE',
  'VIEW_USERS',
  'MANAGE_USERS',
  'VIEW_PLANS',
  'MANAGE_PLANS',
  'VIEW_PERMISSIONS',
  'MANAGE_PERMISSIONS',
];

export function sortPermissionsForDisplay<T extends { slug: string }>(
  items: T[],
): T[] {
  return [...items].sort((a, b) => {
    const indexA = PERMISSION_DISPLAY_ORDER.indexOf(a.slug as PermissionSlug);
    const indexB = PERMISSION_DISPLAY_ORDER.indexOf(b.slug as PermissionSlug);

    if (indexA === -1 && indexB === -1) {
      return a.slug.localeCompare(b.slug);
    }
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });
}

function formatPermissionSlug(slug: string): string {
  const known = PERMISSION_LABELS[slug as PermissionSlug];
  if (known) return known;

  return slug
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

export function formatPermissionLabel(
  permission: string | { name: string; slug: string },
): string {
  if (typeof permission === 'string') {
    return formatPermissionSlug(permission);
  }

  const slug = permission.slug as PermissionSlug;
  return PERMISSION_LABELS[slug] ?? permission.name ?? formatPermissionSlug(permission.slug);
}

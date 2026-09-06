import type { PermissionSlug } from '@/lib/rbac-labels';

export interface DashboardNavItem {
  name: string;
  href: string;
  permission?: PermissionSlug;
}

/** Sidebar nav items that require a permission (Overview has none). */
export const DASHBOARD_PERMISSION_NAV: DashboardNavItem[] = [
  { name: 'My Releases', href: '/dashboard/releases', permission: 'VIEW_RELEASES' },
  { name: 'Upload Music', href: '/dashboard/upload', permission: 'UPLOAD_RELEASE' },
  { name: 'Billing', href: '/dashboard/billing', permission: 'VIEW_BILLING' },
  { name: 'Analytics', href: '/dashboard/analytics', permission: 'VIEW_ANALYTICS' },
  { name: 'Finance', href: '/dashboard/finance', permission: 'VIEW_BILLING' },
  { name: 'Promotion', href: '/dashboard/promotion', permission: 'MANAGE_PROMOTION' },
  { name: 'Testimonials', href: '/dashboard/admin/testimonials', permission: 'MANAGE_TESTIMONIALS' },
  { name: 'Inquiries', href: '/dashboard/admin/inquiries', permission: 'VIEW_CONTACT_INQUIRIES' },
  { name: 'Stream Imports', href: '/dashboard/admin/stream-imports', permission: 'MANAGE_STREAM_IMPORTS' },
  { name: 'Profile', href: '/dashboard/profile', permission: 'PROFILE' },
  { name: 'YouTube Service', href: '/dashboard/youtube-service', permission: 'USE_YOUTUBE_SERVICE' },
  { name: 'Verifications', href: '/dashboard/verifications', permission: 'APPROVE_RELEASE' },
  { name: 'Users', href: '/dashboard/users', permission: 'VIEW_USERS' },
  { name: 'Plan Management', href: '/dashboard/admin/plans', permission: 'MANAGE_PLANS' },
  { name: 'Permissions', href: '/dashboard/admin/permissions', permission: 'VIEW_PERMISSIONS' },
];

/** Unique permission slugs used by dashboard navigation (sidebar order). */
export const NAV_PERMISSION_SLUGS = Array.from(
  new Set(
    DASHBOARD_PERMISSION_NAV.map((item) => item.permission).filter(Boolean),
  ),
) as PermissionSlug[];

import { ReleaseStatus } from '@/lib/api/releases';

export { canManageReleases, isStaffUser, hasPermission } from '@/lib/permissions';

/** Legacy DB value — display only, not a filter option */
const LEGACY_APPROVED = 'Approved';

export function formatReleaseStatus(status: string): string {
  if (status === LEGACY_APPROVED) return 'In Process';
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function getReleaseStatusColor(status: string): string {
  switch (status) {
    case 'Released':
      return 'bg-green-500/10 text-green-500';
    case LEGACY_APPROVED:
    case 'In Process':
      return 'bg-blue-500/10 text-blue-500';
    case 'Submitted':
      return 'bg-cyan-500/10 text-cyan-500';
    case 'Rejected':
      return 'bg-red-500/10 text-red-500';
    case 'Draft':
      return 'bg-yellow-500/10 text-yellow-500';
    default:
      return 'bg-gray-500/10 text-gray-500';
  }
}

export const PROMOTABLE_RELEASE_STATUSES: ReleaseStatus[] = [
  'In Process',
  'Submitted',
  'Released',
];

export function isPromotableRelease(status: string): boolean {
  return (
    PROMOTABLE_RELEASE_STATUSES.includes(status as ReleaseStatus) ||
    status === LEGACY_APPROVED
  );
}

export function sanitizeReleaseError(message: string | undefined, fallback: string): string {
  if (!message) return fallback;
  if (/pdl|cosmos/i.test(message)) return fallback;
  return message;
}

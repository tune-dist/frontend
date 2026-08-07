import type { ReleaseStatus } from '@/lib/api/releases';

export type DistributionIssueLifecycleState =
  | 'pending'
  | 'resubmitted'
  | 'resolved';

export interface DistributionIssueLifecycleFields {
  distributionIssueNote?: string | null;
  distributionIssueResubmittedAt?: string | Date | null;
  distributionIssueResolvedAt?: string | Date | null;
}

/** True when an In Process release was kicked back with a distributor issue note. */
export function hasDistributionIssueAction(
  status: ReleaseStatus | string,
  distributionIssueNote?: string | null,
): boolean {
  return (
    status === 'In Process' &&
    typeof distributionIssueNote === 'string' &&
    distributionIssueNote.trim().length > 0
  );
}

/** RM-facing lifecycle derived from stored timestamps (admin badges/filters). */
export function deriveDistributionIssueState(
  fields: DistributionIssueLifecycleFields,
): DistributionIssueLifecycleState | null {
  if (fields.distributionIssueResolvedAt) {
    return 'resolved';
  }
  if (fields.distributionIssueResubmittedAt) {
    return 'resubmitted';
  }
  const note =
    typeof fields.distributionIssueNote === 'string'
      ? fields.distributionIssueNote.trim()
      : '';
  if (note) {
    return 'pending';
  }
  return null;
}

/** Earliest release date allowed by the upload form (today + 2 calendar days). */
export function earliestValidReleaseDate(from: Date = new Date()): string {
  const d = new Date(from);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 2);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/** Whether a YYYY-MM-DD release date fails the 2-day-from-today rule. */
export function isReleaseDateBelowMinimum(dateStr: string, from: Date = new Date()): boolean {
  if (!dateStr) return true;
  return dateStr < earliestValidReleaseDate(from);
}

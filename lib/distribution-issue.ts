import type { ReleaseStatus } from '@/lib/api/releases';

export const DISTRIBUTION_ISSUE_ACK_LABEL =
  'I have fixed the suggested issue';

/** True for In Process releases with an open distributor issue (any stage). */
export function hasOpenDistributionIssueAction(
  status: ReleaseStatus | string,
  distributionIssueNote?: string | null,
  distributionIssueResolvedAt?: string | null,
): boolean {
  if (distributionIssueResolvedAt) return false;
  return (
    status === 'In Process' &&
    typeof distributionIssueNote === 'string' &&
    distributionIssueNote.trim().length > 0
  );
}

/** Artist has not yet confirmed the fix (checkbox still available). */
export function hasPendingDistributionIssue(
  status: ReleaseStatus | string,
  distributionIssueNote?: string | null,
  distributionIssueResubmittedAt?: string | null,
  distributionIssueResolvedAt?: string | null,
): boolean {
  if (!hasOpenDistributionIssueAction(status, distributionIssueNote, distributionIssueResolvedAt)) {
    return false;
  }
  return !distributionIssueResubmittedAt;
}

/** Artist confirmed fix — awaiting RM accept (still In Process). */
export function hasDistributionIssueAwaitingRm(
  status: ReleaseStatus | string,
  distributionIssueNote?: string | null,
  distributionIssueResubmittedAt?: string | null,
  distributionIssueResolvedAt?: string | null,
): boolean {
  if (!hasOpenDistributionIssueAction(status, distributionIssueNote, distributionIssueResolvedAt)) {
    return false;
  }
  return Boolean(distributionIssueResubmittedAt);
}

/** True when the artist submitted a fix and admin has not resolved the issue yet. */
export function hasDistributionIssueResubmitted(
  distributionIssueResubmittedAt?: string | null,
  distributionIssueResolvedAt?: string | null,
): boolean {
  return Boolean(distributionIssueResubmittedAt) && !distributionIssueResolvedAt;
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

import type { ReleaseStatus } from './releases/types';

export interface ReportedIssue {
  reportComment?: string;
  isResolved?: boolean;
  isAllIssueOfAlbumResolved?: boolean;
  syncedAt?: string;
}

/** Show the issue flag when an In Process release still has unresolved COSMOS issues. */
export function hasActiveReportedIssue(
  status: ReleaseStatus | string,
  issue?: ReportedIssue | null,
): boolean {
  if (status !== 'In Process' || !issue) {
    return false;
  }

  return !issue.isAllIssueOfAlbumResolved || !issue.isResolved;
}

export function getReportedIssueLabel(issue?: ReportedIssue | null): string {
  if (!issue?.reportComment?.trim()) {
    return 'A reported issue requires your attention.';
  }
  return issue.reportComment.trim();
}

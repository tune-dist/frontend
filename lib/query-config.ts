/** Default cache window for dashboard list/stats data (sidebar navigation). */
export const DASHBOARD_STALE_TIME_MS = 2 * 60 * 1000; // 2 minutes

/** Breakdown charts change rarely — keep warm longer. */
export const ANALYTICS_BREAKDOWN_STALE_TIME_MS = 5 * 60 * 1000; // 5 minutes

export const QUERY_GC_TIME_MS = 10 * 60 * 1000; // 10 minutes

import type { BreakdownDimension, SupportedDspFilter, TrendPeriod } from "@/lib/api/analytics";

export const queryKeys = {
  dashboard: {
    stats: (userId: string) => ["dashboard", "stats", userId] as const,
    latestReleases: (userId: string, limit: number) =>
      ["dashboard", "latest-releases", userId, limit] as const,
    topTracks: (userId: string, limit: number) =>
      ["dashboard", "top-tracks", userId, limit] as const,
  },
  analytics: {
    trends: (
      userId: string,
      period: TrendPeriod,
      dsp: SupportedDspFilter,
      startDate: string,
      endDate: string,
    ) => ["analytics", "trends", userId, period, dsp, startDate, endDate] as const,
    breakdown: (userId: string, dimension: BreakdownDimension, limit: number) =>
      ["analytics", "breakdown", userId, dimension, limit] as const,
  },
  youtube: {
    requests: (userId: string) => ["youtube", "requests", userId] as const,
  },
  releases: {
    list: (params: Record<string, unknown>) =>
      ["releases", "list", params] as const,
  },
  permissions: {
    all: () => ["permissions"] as const,
    roles: () => ["roles"] as const,
  },
} as const;

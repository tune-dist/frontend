import type { BreakdownDimension, SupportedDspFilter, TrendPeriod } from "@/lib/api/analytics";

export const queryKeys = {
  dashboard: {
    stats: () => ["dashboard", "stats"] as const,
    latestReleases: (limit: number) =>
      ["dashboard", "latest-releases", limit] as const,
    topTracks: (limit: number) => ["dashboard", "top-tracks", limit] as const,
  },
  analytics: {
    trends: (
      period: TrendPeriod,
      dsp: SupportedDspFilter,
      startDate: string,
      endDate: string,
    ) => ["analytics", "trends", period, dsp, startDate, endDate] as const,
    breakdown: (dimension: BreakdownDimension, limit: number) =>
      ["analytics", "breakdown", dimension, limit] as const,
  },
  youtube: {
    requests: () => ["youtube", "requests"] as const,
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

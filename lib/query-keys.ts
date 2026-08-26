import type {
  BreakdownDimension,
  DashboardTrendPeriod,
  SupportedDspFilter,
  TrendPeriod,
} from "@/lib/api/analytics";

export const queryKeys = {
  dashboard: {
    stats: (userId: string) => ["dashboard", "stats", userId] as const,
    latestReleases: (userId: string, limit: number) =>
      ["dashboard", "latest-releases", userId, limit] as const,
    topTracks: (userId: string, limit: number) =>
      ["dashboard", "top-tracks", userId, limit] as const,
    streamingTrends: (
      userId: string,
      period: DashboardTrendPeriod,
      startDate: string,
      endDate: string,
    ) => ["dashboard", "streaming-trends", userId, period, startDate, endDate] as const,
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

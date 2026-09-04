"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getErrorMessage } from "@/lib/get-error-message";
import { isPlanInactiveError } from "@/lib/plan-inactive";
import {
  BreakdownResponse,
  getBreakdown,
  getStreamingTrends,
  getTodayDateKey,
  MIN_TREND_DATE,
  StreamingTrendsResponse,
  SupportedDspFilter,
  TrendPeriod,
} from "@/lib/api/analytics";
import { ANALYTICS_BREAKDOWN_STALE_TIME_MS } from "@/lib/query-config";
import { queryKeys } from "@/lib/query-keys";

export interface TrendFilters {
  period: TrendPeriod;
  dsp: SupportedDspFilter;
  startDate: string;
  endDate: string;
}

interface UseAnalyticsDataResult {
  trends: StreamingTrendsResponse | null;
  languages: BreakdownResponse | null;
  genres: BreakdownResponse | null;
  loading: boolean;
  trendsLoading: boolean;
}

function fetchTrends(filters: TrendFilters) {
  return getStreamingTrends({
    period: filters.period,
    dsp: filters.dsp,
    startDate: filters.period === "custom" ? filters.startDate : undefined,
    endDate: filters.period === "custom" ? filters.endDate : undefined,
  });
}

export function useAnalyticsData(
  trendFilters: TrendFilters,
  languageLimit = 7,
  genreLimit = 7,
): UseAnalyticsDataResult {
  const { user } = useAuth();
  const userId = user?._id ?? "";
  const enabled = !!userId;

  const languagesQuery = useQuery({
    queryKey: queryKeys.analytics.breakdown(userId, "language", languageLimit),
    queryFn: () => getBreakdown("language", languageLimit),
    enabled,
    staleTime: ANALYTICS_BREAKDOWN_STALE_TIME_MS,
  });

  const genresQuery = useQuery({
    queryKey: queryKeys.analytics.breakdown(userId, "genre", genreLimit),
    queryFn: () => getBreakdown("genre", genreLimit),
    enabled,
    staleTime: ANALYTICS_BREAKDOWN_STALE_TIME_MS,
  });

  const trendsQuery = useQuery({
    queryKey: queryKeys.analytics.trends(
      userId,
      trendFilters.period,
      trendFilters.dsp,
      trendFilters.startDate,
      trendFilters.endDate,
    ),
    queryFn: () => fetchTrends(trendFilters),
    enabled,
  });

  useEffect(() => {
    const error = languagesQuery.error ?? genresQuery.error;
    if ((languagesQuery.isError || genresQuery.isError) && !isPlanInactiveError(error)) {
      toast.error(getErrorMessage(error, "Failed to fetch analytics breakdowns"));
    }
  }, [languagesQuery.isError, genresQuery.isError, languagesQuery.error, genresQuery.error]);

  useEffect(() => {
    if (trendsQuery.isError && !isPlanInactiveError(trendsQuery.error)) {
      toast.error(getErrorMessage(trendsQuery.error, "Failed to load streaming trends"));
      console.error(trendsQuery.error);
    }
  }, [trendsQuery.isError, trendsQuery.error]);

  const loading =
    enabled &&
    trendsQuery.isPending &&
    languagesQuery.isPending &&
    genresQuery.isPending;

  const trendsLoading = trendsQuery.isFetching;

  return {
    trends: trendsQuery.data ?? null,
    languages: languagesQuery.data ?? null,
    genres: genresQuery.data ?? null,
    loading,
    trendsLoading,
  };
}

export function createDefaultTrendFilters(): TrendFilters {
  return {
    period: "weekly",
    dsp: "total",
    startDate: MIN_TREND_DATE,
    endDate: getTodayDateKey(),
  };
}

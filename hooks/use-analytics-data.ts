"use client";

import { useCallback, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  BreakdownDimension,
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
  refreshTrends: (filters: TrendFilters) => Promise<void>;
  refreshBreakdown: (
    dimension: BreakdownDimension,
    limit: number,
  ) => Promise<BreakdownResponse | null>;
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
  const queryClient = useQueryClient();
  const enabled = !!user;

  const languagesQuery = useQuery({
    queryKey: queryKeys.analytics.breakdown("language", languageLimit),
    queryFn: () => getBreakdown("language", languageLimit),
    enabled,
    staleTime: ANALYTICS_BREAKDOWN_STALE_TIME_MS,
  });

  const genresQuery = useQuery({
    queryKey: queryKeys.analytics.breakdown("genre", genreLimit),
    queryFn: () => getBreakdown("genre", genreLimit),
    enabled,
    staleTime: ANALYTICS_BREAKDOWN_STALE_TIME_MS,
  });

  const trendsQuery = useQuery({
    queryKey: queryKeys.analytics.trends(
      trendFilters.period,
      trendFilters.dsp,
      trendFilters.startDate,
      trendFilters.endDate,
    ),
    queryFn: () => fetchTrends(trendFilters),
    enabled,
  });

  useEffect(() => {
    if (languagesQuery.isError || genresQuery.isError) {
      toast.error("Failed to fetch analytics breakdowns");
    }
  }, [languagesQuery.isError, genresQuery.isError]);

  useEffect(() => {
    if (trendsQuery.isError) {
      toast.error("Failed to load streaming trends");
      console.error(trendsQuery.error);
    }
  }, [trendsQuery.isError, trendsQuery.error]);

  const refreshTrends = useCallback(
    async (filters: TrendFilters) => {
      await queryClient.fetchQuery({
        queryKey: queryKeys.analytics.trends(
          filters.period,
          filters.dsp,
          filters.startDate,
          filters.endDate,
        ),
        queryFn: () => fetchTrends(filters),
      });
    },
    [queryClient],
  );

  const refreshBreakdown = useCallback(
    async (dimension: BreakdownDimension, limit: number) => {
      try {
        return await queryClient.fetchQuery({
          queryKey: queryKeys.analytics.breakdown(dimension, limit),
          queryFn: () => getBreakdown(dimension, limit),
        });
      } catch (error) {
        toast.error(`Failed to load ${dimension} breakdown`);
        console.error(error);
        return null;
      }
    },
    [queryClient],
  );

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
    refreshTrends,
    refreshBreakdown,
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

"use client";

import { useCallback, useEffect, useState } from "react";
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

export function useAnalyticsData(
  trendFilters: TrendFilters,
  languageLimit = 7,
  genreLimit = 7,
): UseAnalyticsDataResult {
  const { user } = useAuth();
  const [trends, setTrends] = useState<StreamingTrendsResponse | null>(null);
  const [languages, setLanguages] = useState<BreakdownResponse | null>(null);
  const [genres, setGenres] = useState<BreakdownResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [trendsLoading, setTrendsLoading] = useState(false);

  const refreshTrends = useCallback(async (filters: TrendFilters) => {
    setTrendsLoading(true);
    try {
      const data = await getStreamingTrends({
        period: filters.period,
        dsp: filters.dsp,
        startDate: filters.period === "custom" ? filters.startDate : undefined,
        endDate: filters.period === "custom" ? filters.endDate : undefined,
      });
      setTrends(data);
    } catch (error) {
      toast.error("Failed to load streaming trends");
      console.error(error);
    } finally {
      setTrendsLoading(false);
    }
  }, []);

  const refreshBreakdown = useCallback(
    async (dimension: BreakdownDimension, limit: number) => {
      try {
        const data = await getBreakdown(dimension, limit);
        if (dimension === "language") setLanguages(data);
        if (dimension === "genre") setGenres(data);
        return data;
      } catch (error) {
        toast.error(`Failed to load ${dimension} breakdown`);
        console.error(error);
        return null;
      }
    },
    [],
  );

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    const fetchAll = async () => {
      setTrendsLoading(true);
      try {
        const [trendsData, languagesData, genresData] = await Promise.all([
          getStreamingTrends({
            period: trendFilters.period,
            dsp: trendFilters.dsp,
            startDate: trendFilters.period === "custom" ? trendFilters.startDate : undefined,
            endDate: trendFilters.period === "custom" ? trendFilters.endDate : undefined,
          }),
          getBreakdown("language", languageLimit),
          getBreakdown("genre", genreLimit),
        ]);

        if (cancelled) return;

        setTrends(trendsData);
        setLanguages(languagesData);
        setGenres(genresData);
      } catch (error) {
        if (!cancelled) {
          toast.error("Failed to fetch analytics data");
          console.error(error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setTrendsLoading(false);
        }
      }
    };

    fetchAll();

    return () => {
      cancelled = true;
    };
  }, [
    user,
    trendFilters.period,
    trendFilters.dsp,
    trendFilters.startDate,
    trendFilters.endDate,
    languageLimit,
    genreLimit,
  ]);

  return {
    trends,
    languages,
    genres,
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

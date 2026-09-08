"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getErrorMessage } from "@/lib/get-error-message";
import { isPlanInactiveError } from "@/lib/plan-inactive";
import {
  DashboardLatestRelease,
  DashboardStats,
  getDashboardStats,
  getLatestReleases,
  getTopTracks,
} from "@/lib/api/dashboard";
import { queryKeys } from "@/lib/query-keys";

interface UseDashboardDataResult {
  stats: DashboardStats | null;
  latestReleases: DashboardLatestRelease[];
  topTracks: DashboardLatestRelease[];
  loading: boolean;
}

export function useDashboardData(
  latestLimit = 6,
  topTracksLimit = 4,
): UseDashboardDataResult {
  const { user } = useAuth();
  const userId = user?._id ?? "";
  const enabled = !!userId;

  const statsQuery = useQuery({
    queryKey: queryKeys.dashboard.stats(userId),
    queryFn: getDashboardStats,
    enabled,
  });

  const latestQuery = useQuery({
    queryKey: queryKeys.dashboard.latestReleases(userId, latestLimit),
    queryFn: () => getLatestReleases(latestLimit),
    enabled,
  });

  const topTracksQuery = useQuery({
    queryKey: queryKeys.dashboard.topTracks(userId, topTracksLimit),
    queryFn: () => getTopTracks(topTracksLimit),
    enabled,
  });

  useEffect(() => {
    if (statsQuery.isError && !isPlanInactiveError(statsQuery.error)) {
      toast.error(getErrorMessage(statsQuery.error, "Failed to fetch dashboard data"));
      console.error(statsQuery.error);
    }
  }, [statsQuery.isError, statsQuery.error]);

  useEffect(() => {
    const error = latestQuery.error ?? topTracksQuery.error;
    if ((latestQuery.isError || topTracksQuery.isError) && !isPlanInactiveError(error)) {
      toast.error(getErrorMessage(error, "Failed to fetch dashboard data"));
    }
  }, [latestQuery.isError, topTracksQuery.isError, latestQuery.error, topTracksQuery.error]);

  const loading =
    enabled &&
    (statsQuery.isPending || latestQuery.isPending || topTracksQuery.isPending);

  return {
    stats: statsQuery.data ?? null,
    latestReleases: latestQuery.data?.releases ?? [],
    topTracks: topTracksQuery.data?.releases ?? [],
    loading,
  };
}

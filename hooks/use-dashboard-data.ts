"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
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
  isFetching: boolean;
}

export function useDashboardData(
  latestLimit = 6,
  topTracksLimit = 4,
): UseDashboardDataResult {
  const { user } = useAuth();
  const enabled = !!user;

  const statsQuery = useQuery({
    queryKey: queryKeys.dashboard.stats(),
    queryFn: getDashboardStats,
    enabled,
  });

  const latestQuery = useQuery({
    queryKey: queryKeys.dashboard.latestReleases(latestLimit),
    queryFn: () => getLatestReleases(latestLimit),
    enabled,
  });

  const topTracksQuery = useQuery({
    queryKey: queryKeys.dashboard.topTracks(topTracksLimit),
    queryFn: () => getTopTracks(topTracksLimit),
    enabled,
  });

  useEffect(() => {
    if (statsQuery.isError) {
      toast.error("Failed to fetch dashboard data");
      console.error(statsQuery.error);
    }
  }, [statsQuery.isError, statsQuery.error]);

  useEffect(() => {
    if (latestQuery.isError || topTracksQuery.isError) {
      toast.error("Failed to fetch dashboard data");
    }
  }, [latestQuery.isError, topTracksQuery.isError]);

  const loading =
    enabled &&
    (statsQuery.isPending || latestQuery.isPending || topTracksQuery.isPending);

  const isFetching =
    statsQuery.isFetching || latestQuery.isFetching || topTracksQuery.isFetching;

  return {
    stats: statsQuery.data ?? null,
    latestReleases: latestQuery.data?.releases ?? [],
    topTracks: topTracksQuery.data?.releases ?? [],
    loading,
    isFetching,
  };
}

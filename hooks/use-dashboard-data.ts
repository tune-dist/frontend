"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  DashboardLatestRelease,
  DashboardStats,
  getDashboardStats,
  getLatestReleases,
} from "@/lib/api/dashboard";

interface UseDashboardDataResult {
  stats: DashboardStats | null;
  latestReleases: DashboardLatestRelease[];
  topTracks: DashboardLatestRelease[];
  loading: boolean;
}

export function useDashboardData(latestLimit = 6, topTracksLimit = 4): UseDashboardDataResult {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [releases, setReleases] = useState<DashboardLatestRelease[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    const fetchData = async () => {
      try {
        const [statsData, releasesData] = await Promise.all([
          getDashboardStats(),
          getLatestReleases(Math.max(latestLimit, topTracksLimit, 20)),
        ]);

        if (cancelled) return;

        setStats(statsData);
        setReleases(releasesData.releases);
      } catch (error) {
        if (!cancelled) {
          toast.error("Failed to fetch dashboard data");
          console.error(error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [user, latestLimit, topTracksLimit]);

  const latestReleases = useMemo(
    () => releases.slice(0, latestLimit),
    [releases, latestLimit],
  );

  const topTracks = useMemo(
    () =>
      [...releases]
        .sort((a, b) => b.totalStreams - a.totalStreams)
        .slice(0, topTracksLimit),
    [releases, topTracksLimit],
  );

  return {
    stats,
    latestReleases,
    topTracks,
    loading,
  };
}

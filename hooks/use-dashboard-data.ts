"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  DashboardLatestRelease,
  DashboardStats,
  getDashboardStats,
  getLatestReleases,
  getTopTracks,
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
  const [latestReleases, setLatestReleases] = useState<DashboardLatestRelease[]>([]);
  const [topTracks, setTopTracks] = useState<DashboardLatestRelease[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    const fetchData = async () => {
      try {
        const [statsData, latestData, topTracksData] = await Promise.all([
          getDashboardStats(),
          getLatestReleases(latestLimit),
          getTopTracks(topTracksLimit),
        ]);

        if (cancelled) return;

        setStats(statsData);
        setLatestReleases(latestData.releases);
        setTopTracks(topTracksData.releases);
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

  return {
    stats,
    latestReleases,
    topTracks,
    loading,
  };
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import PageLoading from "@/components/dashboard/page-loading";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrendingUp, Music, ListMusic, Activity, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { getErrorMessage } from "@/lib/get-error-message";
import { isPlanInactiveError } from "@/lib/plan-inactive";
import { formatReleaseStatus, getReleaseStatusColor } from "@/lib/release-status";
import { ReleaseCoverArt } from "@/components/releases/release-cover-art";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import {
  DashboardTrendPeriod,
  getDashboardTrendCacheKey,
  getStreamingTrends,
  getTodayDateKey,
  MIN_TREND_DATE,
  resolveTrendQueryParams,
} from "@/lib/api/analytics";
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";
import { PLATFORM_COLORS } from "@/lib/platform-logos";
import { PlatformLegendItem } from "@/components/analytics/platform-icon";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

const DASHBOARD_TREND_PERIODS: Array<{ key: DashboardTrendPeriod; label: string }> = [
  { key: "all_time", label: "All time" },
  { key: "monthly", label: "Monthly" },
  { key: "weekly", label: "Weekly" },
  { key: "custom", label: "Custom range" },
];

function formatTrend(value: number) {
  return `${value >= 0 ? "+" : ""}${value}%`;
}

function formatChartDate(dateStr: string, compact = false): string {
  const date = new Date(`${dateStr}T00:00:00`);
  if (compact) {
    return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  }
  return date.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
}

function computeStreamChartScale(values: number[]) {
  const maxValue = Math.max(...values, 0);
  if (maxValue === 0) {
    return { min: 0, max: 10, stepSize: 2 };
  }

  const paddedMax = Math.ceil(maxValue * 1.1);
  let stepSize: number;
  if (paddedMax <= 10) stepSize = 1;
  else if (paddedMax <= 100) stepSize = 10;
  else if (paddedMax <= 1000) stepSize = 100;
  else if (paddedMax <= 10000) stepSize = 1000;
  else stepSize = 5000;

  const max = Math.ceil(paddedMax / stepSize) * stepSize;
  return { min: 0, max, stepSize };
}

function formatStreamAxisTick(value: number | string) {
  const num = Number(value);
  if (num >= 1000) {
    return `${num / 1000}K`;
  }
  return num.toLocaleString();
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { stats, latestReleases, topTracks, loading } = useDashboardData(6, 4);
  const userId = user?._id ?? "";

  const [trendPeriod, setTrendPeriod] = useState<DashboardTrendPeriod>("weekly");
  const [appliedCustomRange, setAppliedCustomRange] = useState({
    startDate: MIN_TREND_DATE,
    endDate: getTodayDateKey(),
  });
  const [customDraft, setCustomDraft] = useState({
    startDate: MIN_TREND_DATE,
    endDate: getTodayDateKey(),
  });

  const trendCacheKey = getDashboardTrendCacheKey({
    period: trendPeriod,
    startDate: appliedCustomRange.startDate,
    endDate: appliedCustomRange.endDate,
  });

  const streamingTrendsQuery = useQuery({
    queryKey: queryKeys.dashboard.streamingTrends(
      userId,
      trendCacheKey.period,
      trendCacheKey.startDate,
      trendCacheKey.endDate,
    ),
    queryFn: () =>
      getStreamingTrends(
        resolveTrendQueryParams({
          period: trendPeriod,
          startDate: appliedCustomRange.startDate,
          endDate: appliedCustomRange.endDate,
        }),
      ),
    enabled: !!userId,
  });

  useEffect(() => {
    if (streamingTrendsQuery.isError && !isPlanInactiveError(streamingTrendsQuery.error)) {
      toast.error(getErrorMessage(streamingTrendsQuery.error, "Failed to load streaming trends"));
      console.error(streamingTrendsQuery.error);
    }
  }, [streamingTrendsQuery.isError, streamingTrendsQuery.error]);

  const streamingTrends = streamingTrendsQuery.data ?? null;
  const streamingTrendsLoading = streamingTrendsQuery.isFetching;
  const maxCustomDate = getTodayDateKey();
  const trendPointCount = streamingTrends?.dataPoints.length ?? 0;
  const useCompactTrendLabels = trendPointCount > 14;

  const trendLabels =
    streamingTrends?.dataPoints.map((point) =>
      formatChartDate(point.date, useCompactTrendLabels),
    ) ?? [];
  const trendDateKeys = streamingTrends?.dataPoints.map((point) => point.date) ?? [];
  const trendValues =
    streamingTrends?.dataPoints.map((point) => point.plays) ?? [];
  const chartScale = computeStreamChartScale(trendValues);
  const hasStreamData = (stats?.totalStreams ?? 0) > 0;

  const handleTrendPeriodChange = (period: DashboardTrendPeriod) => {
    if (period === "custom") {
      setCustomDraft({
        startDate: appliedCustomRange.startDate,
        endDate: appliedCustomRange.endDate,
      });
    }
    setTrendPeriod(period);
  };

  const handleCustomApply = () => {
    setAppliedCustomRange({
      startDate: customDraft.startDate,
      endDate: customDraft.endDate,
    });
    setTrendPeriod("custom");
  };

  const getStatusColor = getReleaseStatusColor;
  const formatStatus = formatReleaseStatus;

  if (loading) {
    return <PageLoading />;
  }

  return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-bold mb-2">
            Welcome back,{" "}
            <span className="animated-gradient">{user?.fullName}!</span>{" "}
            <motion.span
              animate={{ rotate: [0, 20, -10, 20, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              className="inline-block origin-bottom-right"
            >
              👋
            </motion.span>
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening with your music today.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <motion.div variants={itemVariants}>
            <Card className="glass-card relative overflow-hidden group hover:bg-gradient-to-br hover:from-primary/30 hover:to-primary/10 hover:border-primary/30">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Total Releases</p>
                    <h3 className="text-2xl font-bold">{stats?.totalReleases ?? 0}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-green-500 font-medium">
                      <TrendingUp className="h-3 w-3" />
                      <span>{formatTrend(stats?.trends.releasesChangePercent ?? 0)}</span>
                      <span className="text-muted-foreground/60 font-normal ml-1">vs last 28 days</span>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                    <div className="relative h-12 w-12 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/20 flex items-center justify-center shadow-inner group-hover:border-primary/60">
                      <Music className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="glass-card relative overflow-hidden group hover:bg-gradient-to-br hover:from-purple-500/30 hover:to-purple-500/10 hover:border-purple-500/30">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Pending Releases</p>
                    <h3 className="text-2xl font-bold">{stats?.pendingReleases ?? 0}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-yellow-500 font-medium">
                      <span>In Process</span>
                      <span className="text-muted-foreground/60 font-normal ml-1">Current status</span>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full" />
                    <div className="relative h-12 w-12 rounded-full bg-gradient-to-br from-purple-500/30 to-purple-500/10 border border-purple-500/20 flex items-center justify-center shadow-inner group-hover:border-purple-500/60">
                      <ListMusic className="h-6 w-6 text-purple-500" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="glass-card relative overflow-hidden group hover:bg-gradient-to-br hover:from-blue-500/30 hover:to-blue-500/10 hover:border-blue-500/30">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Total Streams</p>
                    <h3 className="text-2xl font-bold">{stats?.totalStreams?.toLocaleString() ?? 0}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-green-500 font-medium">
                      <TrendingUp className="h-3 w-3" />
                      <span>{formatTrend(stats?.trends.streamsChangePercent ?? 0)}</span>
                      <span className="text-muted-foreground/60 font-normal ml-1">vs last 28 days</span>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
                    <div className="relative h-12 w-12 rounded-full bg-gradient-to-br from-blue-500/30 to-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-inner group-hover:border-blue-500/60">
                      <Activity className="h-6 w-6 text-blue-500" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="glass-card relative overflow-hidden group hover:bg-gradient-to-br hover:from-green-500/30 hover:to-green-500/10 hover:border-green-500/30">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Total Revenue Earned</p>
                    <h3 className="text-2xl font-bold">
                      {new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                        maximumFractionDigits: 0,
                      }).format(stats?.revenueEarned || 0)}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                      <span>From your catalog</span>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full" />
                    <div className="relative h-12 w-12 rounded-full bg-gradient-to-br from-emerald-500/30 to-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-inner group-hover:border-emerald-500/60">
                      <div className="text-lg font-bold text-emerald-500">₹</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div variants={itemVariants}>
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-bold">Latest releases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {latestReleases.length === 0 ? (
                  <p className="text-sm text-muted-foreground col-span-full py-6 text-center">
                    No releases yet. Start by uploading your first track!
                  </p>
                ) : (
                  latestReleases.map((release) => (
                    <Link
                      key={release.id}
                      href={`/dashboard/releases/${release.id}`}
                      className="bg-secondary/20 rounded-2xl p-3 flex items-center justify-between hover:bg-primary/40 transition-all duration-300 group border border-transparent hover:border-primary/30"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="h-14 w-14 rounded-xl overflow-hidden border border-border/50 group-hover:border-primary/30 transition-colors shadow-lg shrink-0">
                          <ReleaseCoverArt
                            coverArtUrl={release.coverArtUrl}
                            title={release.title}
                            className="transform group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <h4 className="font-bold text-sm text-foreground/80 group-hover:text-white transition-colors line-clamp-1">
                            {release.title}
                          </h4>
                          <p className="text-xs text-muted-foreground line-clamp-1">{release.artistName}</p>
                        </div>
                      </div>
                      <div className="text-right ml-4 shrink-0">
                        <p className="text-xs font-medium text-foreground/80">
                          {release.totalStreams.toLocaleString()} streams
                        </p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="glass-card">
            <CardHeader className="pb-3 space-y-4">
              <CardTitle className="text-xl font-bold">Streaming performance</CardTitle>
              {hasStreamData && (
                <div className="flex flex-col gap-3">
                  <div className="flex rounded-xl border border-border/60 p-1 bg-secondary/20 w-full sm:w-fit overflow-x-auto">
                    {DASHBOARD_TREND_PERIODS.map((period) => (
                      <button
                        key={period.key}
                        type="button"
                        onClick={() => handleTrendPeriodChange(period.key)}
                        className={cn(
                          "rounded-lg px-4 py-2 text-sm font-semibold transition-all whitespace-nowrap",
                          trendPeriod === period.key
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {period.label}
                      </button>
                    ))}
                  </div>

                  {trendPeriod === "custom" && (
                    <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-secondary/10 p-4 sm:flex-row sm:items-end">
                      <div className="flex flex-1 flex-col gap-1.5">
                        <Label htmlFor="dashboard-trend-start-date" className="text-xs text-muted-foreground">
                          From
                        </Label>
                        <Input
                          id="dashboard-trend-start-date"
                          type="date"
                          min={MIN_TREND_DATE}
                          max={customDraft.endDate || maxCustomDate}
                          value={customDraft.startDate}
                          onChange={(event) =>
                            setCustomDraft((current) => ({
                              ...current,
                              startDate: event.target.value,
                            }))
                          }
                          className="h-10"
                        />
                      </div>
                      <div className="flex flex-1 flex-col gap-1.5">
                        <Label htmlFor="dashboard-trend-end-date" className="text-xs text-muted-foreground">
                          To
                        </Label>
                        <Input
                          id="dashboard-trend-end-date"
                          type="date"
                          min={customDraft.startDate || MIN_TREND_DATE}
                          max={maxCustomDate}
                          value={customDraft.endDate}
                          onChange={(event) =>
                            setCustomDraft((current) => ({
                              ...current,
                              endDate: event.target.value,
                            }))
                          }
                          className="h-10"
                        />
                      </div>
                      <Button
                        className="h-10 shrink-0"
                        onClick={handleCustomApply}
                        disabled={
                          streamingTrendsLoading ||
                          !customDraft.startDate ||
                          !customDraft.endDate
                        }
                      >
                        Apply
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardHeader>
            <CardContent>
              {!hasStreamData ? (
                <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">
                  Stream data will appear here once daily DSP reports are received.
                </div>
              ) : streamingTrendsLoading ? (
                <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading stream trends...
                </div>
              ) : (
                <div className="h-[280px] w-full mt-4">
                  <Line
                    data={{
                      labels: trendLabels,
                      datasets: [
                        {
                          label: "Streams",
                          data: trendValues,
                          fill: true,
                          borderColor: "#d901bc",
                          backgroundColor: (context: { chart: { ctx: CanvasRenderingContext2D } }) => {
                            const ctx = context.chart.ctx;
                            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                            gradient.addColorStop(0, "rgba(244, 114, 182, 0.2)");
                            gradient.addColorStop(1, "rgba(244, 114, 182, 0)");
                            return gradient;
                          },
                          tension: 0.4,
                          borderWidth: 3,
                          pointRadius: 0,
                          pointHoverRadius: 6,
                          pointHoverBackgroundColor: "#d901bc",
                          pointHoverBorderColor: "#fff",
                          pointHoverBorderWidth: 2,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          mode: "index",
                          intersect: false,
                          backgroundColor: "#1f2937",
                          padding: 12,
                          cornerRadius: 8,
                          callbacks: {
                            title: (items) =>
                              trendDateKeys[items[0]?.dataIndex ?? 0] ??
                              trendLabels[items[0]?.dataIndex ?? 0] ??
                              "",
                            label: (context) => {
                              const value = context.parsed.y ?? 0;
                              return `Streams: ${value.toLocaleString()}`;
                            },
                          },
                        },
                      },
                      scales: {
                        x: {
                          grid: { display: false },
                          ticks: {
                            color: "#9ca3af",
                            maxTicksLimit: trendPointCount > 31 ? 15 : 12,
                            font: { size: 10, weight: 600 },
                          },
                        },
                        y: {
                          min: chartScale.min,
                          max: chartScale.max,
                          grid: { color: "rgba(156, 163, 175, 0.05)" },
                          ticks: {
                            color: "#9ca3af",
                            stepSize: chartScale.stepSize,
                            callback: (value) => formatStreamAxisTick(value),
                            font: { size: 10, weight: 600 },
                          },
                        },
                      },
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={itemVariants}>
            <Card className="glass-card h-full">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-bold">Top tracks</CardTitle>
                <span className="text-xs text-muted-foreground font-medium">By total streams</span>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {topTracks.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-6 text-center">
                      No stream data for your releases yet.
                    </p>
                  ) : (
                    topTracks.map((track, index) => (
                      <div
                        key={track.id}
                        className={`pb-2 ${index !== topTracks.length - 1 ? "border-b border-border/40 mb-2" : ""}`}
                      >
                        <Link
                          href={`/dashboard/releases/${track.id}`}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-primary/40 transition-colors group"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="h-14 w-14 rounded-xl overflow-hidden border border-border/50 group-hover:border-primary/30 transition-colors shrink-0">
                              <ReleaseCoverArt
                                coverArtUrl={track.coverArtUrl}
                                title={track.title}
                                className="group-hover:scale-110 transition-transform duration-500"
                              />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <h4 className="font-bold text-sm text-foreground/90 group-hover:text-white transition-colors line-clamp-1">
                                {track.title}
                              </h4>
                              <p className="text-xs text-muted-foreground line-clamp-1">{track.artistName}</p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-bold text-foreground/90">
                              {track.totalStreams.toLocaleString()}
                            </p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                              streams
                            </p>
                          </div>
                        </Link>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="glass-card h-full">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-bold">Top stores</CardTitle>
                <span className="text-xs text-muted-foreground font-medium">All platforms</span>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-6 gap-6">
                {(stats?.platformStreams?.length ?? 0) === 0 ? (
                  <p className="text-sm text-muted-foreground text-center px-4">
                    Store breakdown will appear here after DSP daily reports are ingested.
                  </p>
                ) : (
                  <>
                    <div className="relative w-64 h-64">
                      <Doughnut
                        data={{
                          labels: stats!.platformStreams.map((p) => p.label),
                          datasets: [{
                            data: stats!.platformStreams.map((p) => p.streams),
                            backgroundColor: stats!.platformStreams.map(
                              (p) => PLATFORM_COLORS[p.dsp] ?? "#94a3b8",
                            ),
                            borderWidth: 0,
                          }],
                        }}
                        options={{
                          cutout: "75%",
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { display: false },
                            tooltip: {
                              enabled: true,
                              backgroundColor: "#1f2937",
                              padding: 10,
                              cornerRadius: 8,
                              callbacks: {
                                label: (ctx) => {
                                  const item = stats!.platformStreams[ctx.dataIndex];
                                  return `${item.label}: ${item.streams.toLocaleString()} (${item.percentage}%)`;
                                },
                              },
                            },
                          },
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                          <p className="text-2xl font-black text-white">
                            {(stats?.totalStreams ?? 0).toLocaleString()}
                          </p>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                            Total
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-4 w-full">
                      {stats!.platformStreams.map((store) => (
                        <div key={store.dsp} className="flex items-center gap-2 group cursor-pointer">
                          <PlatformLegendItem dsp={store.dsp} label={store.label} />
                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground font-medium group-hover:text-white transition-colors">
                              {store.label}
                            </span>
                            <span className="text-sm font-black text-white leading-tight">
                              {store.percentage}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div variants={itemVariants}>
          <Card className="glass-card hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5" />
                Recent Releases
              </CardTitle>
              <CardDescription>Your latest music releases and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Artist</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {latestReleases.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                          No releases yet. Start by uploading your first track!
                        </TableCell>
                      </TableRow>
                    ) : (
                      latestReleases.map((release) => (
                        <TableRow key={release.id}>
                          <TableCell className="font-medium">{release.title}</TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">{release.artistName}</span>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                                release.status,
                              )}`}
                            >
                              {formatStatus(release.status)}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
  );
}

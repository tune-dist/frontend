"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
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
import { TrendingUp, Music, ListMusic, Activity } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { formatReleaseStatus, getReleaseStatusColor } from "@/lib/release-status";
import Preloader from "@/components/Preloader";
import { S3Image } from "@/components/ui/s3-image";
import { useDashboardData } from "@/hooks/use-dashboard-data";
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

function formatTrend(value: number) {
  return `${value >= 0 ? "+" : ""}${value}%`;
}

const PLATFORM_COLORS: Record<string, string> = {
  spotify: "#f472b6",
  amazon: "#fb923c",
  applemusic: "#818cf8",
  gaana: "#a3e635",
  jiosaavn: "#38bdf8",
  facebook: "#c084fc",
};

function ReleaseCover({
  coverArtUrl,
  title,
  className,
}: {
  coverArtUrl?: string;
  title: string;
  className?: string;
}) {
  const fallback = (
    <div className={`${className} bg-secondary/40 flex items-center justify-center`}>
      <Music className="h-5 w-5 text-muted-foreground" />
    </div>
  );

  if (!coverArtUrl) {
    return fallback;
  }

  return (
    <S3Image
      src={coverArtUrl}
      alt={title}
      className={className}
      fallback={fallback}
    />
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { stats, latestReleases, topTracks, loading } = useDashboardData(6, 4);

  const getStatusColor = getReleaseStatusColor;
  const formatStatus = formatReleaseStatus;

  if (loading) {
    return <Preloader />;
  }

  return (
    <DashboardLayout>
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
                          <ReleaseCover
                            coverArtUrl={release.coverArtUrl}
                            title={release.title}
                            className="h-full w-full object-cover transform group-hover:scale-110 transition-transform duration-500"
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
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-bold">Streaming performance</CardTitle>
            </CardHeader>
            <CardContent>
              {(stats?.totalStreams ?? 0) === 0 ? (
                <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">
                  Stream data will appear here once daily DSP reports are received.
                </div>
              ) : (
                <div className="h-[280px] w-full mt-4">
                  <Line
                    data={{
                      labels: ["May 04", "May 05", "May 06", "May 07", "May 08", "May 09", "May 10"],
                      datasets: [
                        {
                          label: "Streams",
                          data: [85000, 88500, 87000, 85800, 87200, 84800, 85200],
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
                        },
                      },
                      scales: {
                        x: {
                          grid: { display: false },
                          ticks: { color: "#9ca3af", font: { size: 10, weight: 600 } },
                        },
                        y: {
                          min: 75000,
                          max: 95000,
                          grid: { color: "rgba(156, 163, 175, 0.05)" },
                          ticks: {
                            color: "#9ca3af",
                            stepSize: 5000,
                            callback: (value) => `${Number(value) / 1000}K`,
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
                    topTracks.map((track) => (
                      <Link
                        key={track.id}
                        href={`/dashboard/releases/${track.id}`}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-primary/40 transition-colors group"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="h-14 w-14 rounded-xl overflow-hidden border border-border/50 group-hover:border-primary/30 transition-colors shrink-0">
                            <ReleaseCover
                              coverArtUrl={track.coverArtUrl}
                              title={track.title}
                              className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
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
              <CardContent className="flex items-center justify-center py-6">
                {(stats?.platformStreams?.length ?? 0) === 0 ? (
                  <p className="text-sm text-muted-foreground text-center px-4">
                    Store breakdown will appear here after DSP daily reports are ingested.
                  </p>
                ) : (
                  <div className="flex flex-col md:flex-row items-center gap-12 w-full max-w-md">
                    <div className="relative w-40 h-40">
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

                    <div className="flex flex-col gap-4 flex-1">
                      {stats!.platformStreams.map((store) => (
                        <div key={store.dsp} className="flex items-center gap-3 group cursor-pointer">
                          <div
                            className="h-3 w-3 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.1)] group-hover:scale-125 transition-transform"
                            style={{ backgroundColor: PLATFORM_COLORS[store.dsp] ?? "#94a3b8" }}
                          />
                          <div className="flex flex-col">
                            <span className="text-sm text-muted-foreground font-medium group-hover:text-white transition-colors">
                              {store.label}
                            </span>
                            <span className="text-lg font-black text-white leading-tight">
                              {store.percentage}%
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {store.streams.toLocaleString()} streams
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
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
    </DashboardLayout>
  );
}

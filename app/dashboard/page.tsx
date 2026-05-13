"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
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
import { TrendingUp, DollarSign, Globe, Music, Loader2, Users, Activity, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getReleases, Release } from "@/lib/api/releases";
import { getUsageStats, UsageStats } from "@/lib/api/users";
import Preloader from "@/components/Preloader";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [releases, setReleases] = useState<Release[]>([]);
  const [totalReleases, setTotalReleases] = useState(0);
  const [pendingReleases, setPendingReleases] = useState(0);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const isSuperAdmin = user.role === 'super_admin';
        const [releasesData, pendingData, statsData] = await Promise.all([
          getReleases({
            limit: 5,
            ...(isSuperAdmin ? {} : { userId: user._id, status: 'Approved' })
          }),
          getReleases({
            limit: 1,
            ...(isSuperAdmin ? { status: 'In Process' as any } : { userId: user._id, status: 'In Process' as any })
          }),
          getUsageStats(),
        ]);
        setReleases(releasesData.releases);
        setTotalReleases(releasesData.pagination.total);
        setPendingReleases(pendingData.pagination.total);
        setUsageStats(statsData);
      } catch (error) {
        toast.error("Failed to fetch dashboard data");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "distributed":
        return "bg-green-500/10 text-green-500";
      case "processing":
        return "bg-blue-500/10 text-blue-500";
      case "pending_review":
        return "bg-yellow-500/10 text-yellow-500";
      case "rejected":
        return "bg-red-500/10 text-red-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  const formatStatus = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

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
        {/* Welcome Section */}
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-bold mb-2">
            Welcome back,{" "}
            <span className="animated-gradient">{user?.fullName}!</span>{" "}
            <motion.span
              animate={{ rotate: [0, 20, -10, 20, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1
              }}
              className="inline-block origin-bottom-right"
            >
              👋
            </motion.span>
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your music today.
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <motion.div variants={itemVariants}>
            <Card className="glass-card relative overflow-hidden group hover:bg-gradient-to-br hover:from-primary/30 hover:to-primary/10 hover:border-primary/30">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Total Releases</p>
                    <h3 className="text-2xl font-bold">{totalReleases}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-green-500 font-medium">
                      <TrendingUp className="h-3 w-3" />
                      <span>+12.5%</span>
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
                    <h3 className="text-2xl font-bold">{pendingReleases}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-yellow-500 font-medium">
                      <span>In Process</span>
                      <span className="text-muted-foreground/60 font-normal ml-1">Current status</span>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full" />
                    <div className="relative h-12 w-12 rounded-full bg-gradient-to-br from-purple-500/30 to-purple-500/10 border border-purple-500/20 flex items-center justify-center shadow-inner group-hover:border-purple-500/60">
                      <Users className="h-6 w-6 text-purple-500" />
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
                    <h3 className="text-2xl font-bold">{usageStats?.totalStreams || 0}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-green-500 font-medium">
                      <TrendingUp className="h-3 w-3" />
                      <span>+18.6%</span>
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
                      {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(usageStats?.revenueEarned || 0)}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-green-500 font-medium">
                      <TrendingUp className="h-3 w-3" />
                      <span>+12.6%</span>
                      <span className="text-muted-foreground/60 font-normal ml-1">vs last 28 days</span>
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

        {/* Latest Releases Section */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold flex items-center gap-2 group hover:text-primary transition-colors">
                  Latest releases
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: "Masoom Dil", artist: "Surabhi Singh", streams: "5", image: "/assets/images/testi-img/geeta-jhala.jpg" },
                  { title: "Old Player", artist: "Dhaval Telani, Sunil Thakor", streams: "2", image: "/assets/images/testi-img/sunil-thakor-pic.jpg" },
                  { title: "Alakh Na Otala", artist: "Rajan Kapra", streams: "2,576", image: "/assets/images/testi-img/herry-nakum-pic.jpg" },
                  { title: "Jagat Mata Khodiyar", artist: "Dhruvin Mevada", streams: "29", image: "/assets/images/testi-img/gaurav-dhola-pic.jpg" },
                  { title: "Raj Ne Ratan Na Lekh", artist: "Kishan Raval", streams: "352", image: "/assets/images/testi-img/kishan-raval-pic.jpg" },
                  { title: "Meldi Maa", artist: "Twinkle Patel", streams: "1,240", image: "/assets/images/testi-img/twinkle-patel-pic.jpg" }
                ].map((release, i) => (
                  <div key={i} className="bg-secondary/20 rounded-2xl p-3 flex items-center justify-between hover:bg-primary/40 transition-all duration-300 group cursor-pointer border border-transparent hover:border-primary/30">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-xl overflow-hidden border border-border/50 group-hover:border-primary/30 transition-colors shadow-lg">
                        <img
                          src={release.image}
                          alt={release.title}
                          className="h-full w-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="flex flex-col">
                        <h4 className="font-bold text-sm text-foreground/80 group-hover:text-white transition-colors line-clamp-1">{release.title}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-1">{release.artist}</p>
                      </div>
                    </div>
                    <div className="text-right ml-4 shrink-0">
                      <p className="text-xs font-medium text-foreground/80">{release.streams} streams</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Tracks & Top Stores Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Tracks Card */}
          <motion.div variants={itemVariants}>
            <Card className="glass-card h-full">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold flex items-center gap-2 group hover:text-primary transition-colors">
                    Top tracks
                  </CardTitle>
                </div>
                <span className="text-xs text-muted-foreground font-medium">Last 7 days</span>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {[
                    { title: "Gal Goto Me Zanjariya", artist: "Geeta Rabari", streams: "35,872", image: "/assets/images/testi-img/geeta-jhala.jpg" },
                    { title: "Rasiyo Rupalo Garbo", artist: "Kirtidan Gadhvi", streams: "20,192", image: "/assets/images/testi-img/kirtidan-gadhvi.jpg" },
                    { title: "Sakalche Shlok", artist: "Vajrang Aphale", streams: "19,685", image: "/assets/images/testi-img/gaurav-dhola-pic.jpg" },
                    { title: "Sukhkarta Dukhharta", artist: "Vajrang Aphale", streams: "28,706", image: "/assets/images/testi-img/kishan-raval-pic.jpg" }
                  ].map((track, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-xl hover:bg-primary/40 transition-colors group cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-xl overflow-hidden border border-border/50 group-hover:border-primary/30 transition-colors">
                          <img src={track.image} alt={track.title} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div className="flex flex-col">
                          <h4 className="font-bold text-sm text-foreground/90 group-hover:text-white transition-colors line-clamp-1">{track.title}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-1">{track.artist}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-foreground/90">{track.streams}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">streams</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Top Stores Card */}
          <motion.div variants={itemVariants}>
            <Card className="glass-card h-full">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold flex items-center gap-2 group hover:text-primary transition-colors">
                    Top stores
                  </CardTitle>
                </div>
                <span className="text-xs text-muted-foreground font-medium">Last 7 days</span>
              </CardHeader>
              <CardContent className="flex items-center justify-center py-6">
                <div className="flex flex-col md:flex-row items-center gap-12 w-full max-w-md">
                  {/* Donut Chart SVG */}
                  <div className="relative w-40 h-40">
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                      {/* Spotify - 61.3% */}
                      <circle
                        cx="50" cy="50" r="40"
                        fill="transparent"
                        stroke="#f472b6"
                        strokeWidth="12"
                        strokeDasharray="154.06 97.26"
                        className="transition-all duration-1000"
                      />
                      {/* Amazon - 23.0% */}
                      <circle
                        cx="50" cy="50" r="40"
                        fill="transparent"
                        stroke="#fb923c"
                        strokeWidth="12"
                        strokeDasharray="57.8 193.52"
                        strokeDashoffset="-154.06"
                        className="transition-all duration-1000"
                      />
                      {/* Apple Music - 7.3% */}
                      <circle
                        cx="50" cy="50" r="40"
                        fill="transparent"
                        stroke="#818cf8"
                        strokeWidth="12"
                        strokeDasharray="18.35 232.97"
                        strokeDashoffset="-211.86"
                        className="transition-all duration-1000"
                      />
                      {/* Others - 8.4% */}
                      <circle
                        cx="50" cy="50" r="40"
                        fill="transparent"
                        stroke="#a3e635"
                        strokeWidth="12"
                        strokeDasharray="21.1 230.22"
                        strokeDashoffset="-230.21"
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-2xl font-black text-white">100%</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Growth</p>
                      </div>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex flex-col gap-4 flex-1">
                    {[
                      { name: "Spotify", percentage: "61.3%", color: "bg-[#f472b6]" },
                      { name: "Amazon.com", percentage: "23.0%", color: "bg-[#fb923c]" },
                      { name: "Apple Music", percentage: "7.3%", color: "bg-[#818cf8]" },
                      { name: "Others", percentage: "8.4%", color: "bg-[#a3e635]" }
                    ].map((store, i) => (
                      <div key={i} className="flex items-center gap-3 group cursor-pointer">
                        <div className={`h-3 w-3 rounded-full ${store.color} shadow-[0_0_10px_rgba(255,255,255,0.1)] group-hover:scale-125 transition-transform`} />
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground font-medium group-hover:text-white transition-colors">{store.name}</span>
                          <span className="text-lg font-black text-white leading-tight">{store.percentage}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Releases Section */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Music className="h-5 w-5" />
                    Recent Releases
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Your latest music releases and their status
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Artist</TableHead>
                      {/* <TableHead>Release Date</TableHead> */}
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {releases?.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center text-muted-foreground py-8"
                        >
                          No releases yet. Start by uploading your first track!
                        </TableCell>
                      </TableRow>
                    ) : (
                      releases?.map((release) => (
                        <TableRow key={release._id}>
                          <TableCell className="font-medium">
                            {release.title}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {release.artistName}
                            </span>
                          </TableCell>
                          {/* <TableCell className="text-muted-foreground">
                            {release.releaseDate
                              ? new Date(release.releaseDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })
                              : 'Not set'}
                          </TableCell> */}
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                                release.status
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

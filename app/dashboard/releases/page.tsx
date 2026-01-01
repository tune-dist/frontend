"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { getPromotionByReleaseId } from "@/lib/api/promotions";
import { FormatSelectionDialog } from "@/components/promotion/format-selection-dialog";
import { useRouter } from "next/navigation";
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
import { Button } from "@/components/ui/button";

import {
  Loader2,
  Plus,
  Filter,
  Eye,
  Trash2,
  X,
  Sparkles,
  ExternalLink,
  CheckCircle,
  Send,
  XCircle,
  Music,
  UploadCloud,
  Ban,
} from "lucide-react";
import {
  getReleases,
  deleteRelease,
  approveRelease,
  rejectRelease,
  Release,
  ReleaseStatus,
} from "@/lib/api/releases";
import { getUsers } from "@/lib/api/users";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { S3Image } from "@/components/ui/s3-image";

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

type StatusFilter = "all" | ReleaseStatus;

export default function ReleasesPage() {
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedUserId, setSelectedUserId] = useState<string>("all");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [formatDialogOpen, setFormatDialogOpen] = useState(false);
  const [selectedReleaseForPromo, setSelectedReleaseForPromo] = useState<string | null>(null);
  const [promotions, setPromotions] = useState<Map<string, any>>(new Map());
  const { user } = useAuth();
  const router = useRouter();

  const isPrivileged =
    user?.role === "super_admin" ||
    user?.role === "admin" ||
    user?.role === "release_manager";

  const fetchReleases = async () => {
    try {
      setLoading(true);
      const params: any =
        statusFilter !== "all" ? { status: statusFilter } : {};

      if (selectedUserId !== "all") {
        params.userId = selectedUserId;
      } else if (user?._id && !isPrivileged) {
        params.userId = user._id;
      }
      const response = await getReleases(params);
      setReleases(response.releases);

      // Fetch promotions for all releases
      const promoMap = new Map();
      await Promise.all(
        response.releases.map(async (release: Release) => {
          try {
            const promo = await getPromotionByReleaseId(release._id);
            if (promo) {
              promoMap.set(release._id, promo);
            }
          } catch (e) {
            // No promotion exists for this release
          }
        })
      );
      setPromotions(promoMap);
    } catch (error) {
      toast.error("Failed to fetch releases");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReleases();
  }, [statusFilter, selectedUserId]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (isPrivileged) {
        try {
          const response = await getUsers({ limit: 100 });
          setUsers(response.users || []);
        } catch (error) {
          console.error("Failed to fetch users:", error);
        }
      }
    };
    fetchUsers();
  }, [isPrivileged]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Released":
        return "bg-green-500/10 text-green-500";
      case "Approved":
        return "bg-purple-500/10 text-purple-500";
      case "In Process":
        return "bg-blue-500/10 text-blue-500";
      case "Rejected":
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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this release? This action cannot be undone.")) return;
    try {
      setActionLoading(id);
      await deleteRelease(id);
      toast.success("Release deleted successfully");
      fetchReleases();
    } catch (error) {
      toast.error("Failed to delete release");
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async (id: string) => {
    if (!confirm("Approve this release?")) return;
    try {
      setActionLoading(id);
      await approveRelease(id);
      toast.success("Release approved");
      fetchReleases();
    } catch (error) {
      toast.error("Failed to approve release");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;
    try {
      setActionLoading(id);
      await rejectRelease(id, reason);
      toast.success("Release rejected");
      fetchReleases();
    } catch (error) {
      toast.error("Failed to reject release");
    } finally {
      setActionLoading(null);
    }
  };

  const handlePromoteClick = (releaseId: string) => {
    setSelectedReleaseForPromo(releaseId);
    setFormatDialogOpen(true);
  };

  const handleFormatSelect = (format: string) => {
    if (selectedReleaseForPromo) {
      router.push(`/dashboard/promotion/${selectedReleaseForPromo}?format=${format}`);
    }
  };

  const statusFilters: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "In Process", label: "In Process" },
    { value: "Approved", label: "Approved" },
    { value: "Rejected", label: "Rejected" },
    { value: "Released", label: "Released" },
  ];

  return (
    <DashboardLayout>
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">My <span className="animated-gradient">Releases</span></h1>
            <p className="text-muted-foreground">Manage all your music releases in one place</p>
          </div>
          {user?.role !== "release_manager" && (statusFilter === "all" || statusFilter === "In Process") && (
            <Link href="/dashboard/upload">
              <Button size="lg" className="gap-2">
                <Plus className="h-4 w-4" />
                New Release
              </Button>
            </Link>
          )}
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                <CardTitle>Filters</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-end gap-6">
                <div className="flex flex-col gap-2">
                  <div className="text-sm font-medium text-muted-foreground">Status</div>
                  <div className="flex flex-wrap gap-2">
                    {statusFilters.map((filter) => (
                      <Button
                        key={filter.value}
                        variant={statusFilter === filter.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setStatusFilter(filter.value)}
                      >
                        {filter.label}
                      </Button>
                    ))}
                  </div>
                </div>
                {isPrivileged && (
                  <div className="flex flex-col gap-2 min-w-[200px]">
                    <div className="text-sm font-medium text-muted-foreground">User</div>
                    <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                      <SelectTrigger className="bg-background/50 backdrop-blur-sm h-9">
                        <SelectValue placeholder="All Users" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        {users.map((u) => (
                          <SelectItem key={u._id} value={u._id}>{u.fullName || u.email}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5" />
                All Releases
              </CardTitle>
              <CardDescription>{releases.length} releases found</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : (
                <div className="rounded-md border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">Poster</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Artist</TableHead>
                        <TableHead>UPC/ISRC</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {releases.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                            <div className="flex flex-col items-center gap-2 underline-offset-4">
                              <Music className="h-12 w-12 text-muted-foreground/50 mb-2" />
                              <p className="text-lg font-medium">No releases found</p>
                              {user?.role !== "release_manager" && (
                                <Link href="/dashboard/upload" className="mt-2">
                                  <Button variant="outline" size="sm"><Plus className="h-4 w-4 mr-2" />Create Release</Button>
                                </Link>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        releases.map((release) => (
                          <TableRow key={release._id}>
                            <TableCell>
                              <div className="h-12 w-12 rounded-md overflow-hidden bg-muted relative cursor-zoom-in group" onClick={() => release.coverArt?.url && setPreviewImage(release.coverArt.url)}>
                                {release.coverArt?.url ? (
                                  <>
                                    <S3Image src={release.coverArt.url} alt={release.title} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Eye className="h-4 w-4 text-white" /></div>
                                  </>
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center"><Music className="h-6 w-6 text-muted-foreground/50" /></div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{release.title}</TableCell>
                            <TableCell>{release.artistName}</TableCell>
                            <TableCell>
                              <div className="flex flex-col text-[10px] text-muted-foreground font-mono">
                                <span>UPC: {release.barcode || "-"}</span>
                                <span>ISRC: {release.isrc || "-"}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getStatusColor(release.status)}`}>
                                {formatStatus(release.status)}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Link href={`/dashboard/releases/${release._id}`}>
                                  <Button variant="ghost" size="sm" title="View details"><Eye className="h-4 w-4" /></Button>
                                </Link>
                                {(release.status === "Released" || release.status === "Approved") && (
                                  <>
                                    {promotions.has(release._id) ? (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        title="Copy promotion link"
                                        className="text-green-500 hover:text-green-600 hover:bg-green-500/10"
                                        onClick={async () => {
                                          const promo = promotions.get(release._id);
                                          const url = `${window.location.origin}/p/${promo.slug}`;
                                          await navigator.clipboard.writeText(url);
                                          toast.success("Promotion link copied to clipboard!");
                                        }}
                                      >
                                        <ExternalLink className="h-4 w-4" />
                                      </Button>
                                    ) : (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        title="Promote"
                                        className="text-amber-500 hover:text-amber-600 hover:bg-amber-500/10"
                                        onClick={() => handlePromoteClick(release._id)}
                                      >
                                        <Sparkles className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </>
                                )}
                                {release.status === "In Process" && (
                                  <Button variant="ghost" size="sm" onClick={() => handleDelete(release._id)} className="text-red-500 hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></Button>
                                )}
                                {isPrivileged && release.status === "In Process" && (
                                  <>
                                    <Button variant="ghost" size="sm" onClick={() => handleApprove(release._id)} className="text-purple-500 hover:bg-purple-500/10"><CheckCircle className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleReject(release._id)} className="text-red-500 hover:bg-red-500/10"><Ban className="h-4 w-4" /></Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <AnimatePresence>
          {previewImage && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPreviewImage(null)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 cursor-zoom-out">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative max-w-4xl w-full max-h-[90vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                <S3Image src={previewImage} alt="Poster Preview" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" />
                <Button variant="ghost" className="absolute -top-12 right-0 text-white" onClick={() => setPreviewImage(null)}><X className="h-6 w-6" /></Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <FormatSelectionDialog
        open={formatDialogOpen}
        onClose={() => setFormatDialogOpen(false)}
        onSelect={handleFormatSelect}
      />
    </DashboardLayout>
  );
}

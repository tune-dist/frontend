"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
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
  XCircle,
  Music,
  Ban,
  UploadCloud,
} from "lucide-react";
import {
  getReleases,
  deleteRelease,
  rejectRelease,
  submitToPdl,
  pdlSubmit,
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

  const { user } = useAuth();
  const router = useRouter();

  const isPrivileged =
    user?.role === "super_admin" ||
    user?.role === "admin" ||
    user?.role === "release_manager" ||
    user?.plan === "enterprise";

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
      case "Submitted":
        return "bg-cyan-500/10 text-cyan-500";
      case "Rejected":
        return "bg-red-500/10 text-red-500";
      case "Draft":
        return "bg-yellow-500/10 text-yellow-500";
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

  /**
   * Approve action (Draft only) — calls PDL phase 1 (`/submit-to-pdl`).
   * The backend uploads metadata + artwork + audio and verifies on COSMOS,
   * then moves the release to "In Process" with a `pdlAlbumId`.
   * After this, the row shows the "Submit to PDL" button which triggers
   * phase 2 (`/pdl-submit`, final distribution).
   */
  const handleApprove = async (id: string) => {
    if (
      !confirm(
        "Approve and upload this release to PDL? (Metadata, cover art, audio — phase 1.)",
      )
    )
      return;
    try {
      setActionLoading(id);
      await submitToPdl(id);
      toast.success("Release approved and uploaded to PDL");
      fetchReleases();
    } catch (error: any) {
      toast.error(error.message || "Failed to approve release");
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

  /** PDL phase 2: final distribution to platforms (`/pdl-submit`). */
  const handlePdlPhase2Distribute = async (id: string) => {
    if (
      !confirm(
        "Finalize and distribute this release to all selected platforms?",
      )
    )
      return;
    try {
      setActionLoading(id);
      await pdlSubmit(id);
      toast.success("Release distributed to platforms successfully");
      fetchReleases();
    } catch (error: any) {
      toast.error(error.message || "Failed to distribute to platforms");
    } finally {
      setActionLoading(null);
    }
  };



  const statusFilters: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "Draft", label: "Draft" },
    { value: "In Process", label: "In Process" },
    { value: "Submitted", label: "Submitted" },
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
          <Card className="glass-card overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-primary/5 pb-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">

                {isPrivileged && (
                  <div className="flex flex-col gap-1.5 min-w-[200px]">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Filter by User</div>
                    <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                      <SelectTrigger className="h-10 bg-background/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all rounded-xl">
                        <SelectValue placeholder="All Users" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-border/50 backdrop-blur-xl">
                        <SelectItem value="all">All Users</SelectItem>
                        {users.map((u) => (
                          <SelectItem key={u._id} value={u._id}>{u.fullName || u.email}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-4">
                <CardDescription className="flex items-center gap-2 text-sm font-medium">
                  <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                  {releases.length} total releases found
                </CardDescription>

                <div className="flex flex-col gap-2">
                  {/* <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground lg:text-right mr-1">Filter by Status</div> */}
                  <div className="flex flex-wrap lg:justify-end gap-2">
                    {statusFilters.map((filter) => (
                      <Button
                        key={filter.value}
                        variant={statusFilter === filter.value ? "default" : "outline"}
                        size="sm"
                        className={`h-9 px-5 rounded-xl text-xs font-semibold transition-all duration-300 ${statusFilter === filter.value
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105"
                          : "bg-background/40 hover:bg-primary/10 hover:border-primary/30 hover:text-primary"
                          }`}
                        onClick={() => setStatusFilter(filter.value)}
                      >
                        {filter.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground animate-pulse">Loading releases...</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow className="hover:bg-transparent border-border/50">
                        <TableHead className="w-[100px] pl-6 font-bold uppercase tracking-wider text-[10px]">Poster</TableHead>
                        <TableHead className="font-bold uppercase tracking-wider text-[10px]">Title</TableHead>
                        <TableHead className="font-bold uppercase tracking-wider text-[10px]">Artist</TableHead>
                        <TableHead className="font-bold uppercase tracking-wider text-[10px]">UPC/ISRC</TableHead>
                        <TableHead className="font-bold uppercase tracking-wider text-[10px]">Status</TableHead>
                        <TableHead className="font-bold uppercase tracking-wider text-[10px]">Approved By</TableHead>
                        <TableHead className="font-bold uppercase tracking-wider text-[10px]">WorldWide DSP</TableHead>
                        <TableHead className="text-right pr-6 font-bold uppercase tracking-wider text-[10px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {releases.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center text-muted-foreground py-24">
                            <div className="flex flex-col items-center gap-4">
                              <div className="h-20 w-20 rounded-full bg-primary/5 flex items-center justify-center mb-2">
                                <Music className="h-10 w-10 text-primary/30" />
                              </div>
                              <div className="space-y-1">
                                <p className="text-xl font-bold text-foreground">No releases found</p>
                                <p className="text-sm">Try adjusting your filters or create a new release.</p>
                              </div>
                              {user?.role !== "release_manager" && (
                                <Link href="/dashboard/upload" className="mt-2">
                                  <Button className="rounded-xl px-6 h-11 gap-2 shadow-lg shadow-primary/20">
                                    <Plus className="h-5 w-5" />
                                    Create Your First Release
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        releases.map((release) => (
                          <TableRow key={release._id} className="group hover:bg-primary/5 border-border/30 transition-colors">
                            <TableCell className="pl-6 py-4">
                              <div className="h-14 w-14 rounded-xl overflow-hidden bg-muted relative cursor-zoom-in group/img shadow-md border border-border/50" onClick={() => release.coverArt?.url && setPreviewImage(release.coverArt.url)}>
                                {release.coverArt?.url ? (
                                  <>
                                    <S3Image src={release.coverArt.url} alt={release.title} className="h-full w-full object-cover transition-transform duration-500 group-hover/img:scale-115" />
                                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                      <Eye className="h-5 w-5 text-white" />
                                    </div>
                                  </>
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                                    <Music className="h-7 w-7 text-muted-foreground/30" />
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="font-bold text-foreground/90">{release.title}</TableCell>
                            <TableCell className="text-muted-foreground">{release.artistName}</TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1 text-[10px] text-muted-foreground font-mono">
                                <span className="px-1.5 py-0.5 rounded bg-muted/50 w-fit">UPC: {release.barcode || "N/A"}</span>
                                <span className="px-1.5 py-0.5 rounded bg-muted/50 w-fit">ISRC: {release.isrc || "N/A"}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${getStatusColor(release.status)}`}>
                                <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
                                {formatStatus(release.status)}
                              </span>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm font-medium">
                              {typeof release.approvedBy === 'object' && release.approvedBy?.fullName
                                ? release.approvedBy.fullName
                                : "-"
                              }
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm font-medium">
                              {release.pdlAlbumId ? "Yes" : "-"}
                            </TableCell>
                            <TableCell className="text-right pr-6">
                              <div className="flex items-center justify-end gap-2">
                                <Link href={`/dashboard/releases/${release._id}`}>
                                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/20 hover:text-primary transition-all" title="View details">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </Link>

                                 {release.status === "Draft" && (
                                   <Button variant="ghost" size="sm" onClick={() => handleDelete(release._id)} className="text-red-500 hover:bg-red-500/10" title="Delete"><Trash2 className="h-4 w-4" /></Button>
                                 )}
                                 {isPrivileged && release.status === "Draft" && (
                                   <>
                                     <Button variant="ghost" size="sm" onClick={() => handleApprove(release._id)} className="text-purple-500 hover:bg-purple-500/10" title="Approve"><CheckCircle className="h-4 w-4" /></Button>
                                     <Button variant="ghost" size="sm" onClick={() => handleReject(release._id)} className="text-red-500 hover:bg-red-500/10" title="Reject"><Ban className="h-4 w-4" /></Button>
                                   </>
                                 )}
                                 {/*
                                   Phase 2 trigger ("Submit to PDL" → /pdl-submit).
                                   Shown only after phase 1 has succeeded
                                   (release.pdlAlbumId is set), and only while the
                                   release is still in the post-upload pipeline.
                                   Approve action above already calls phase 1, so
                                   the legacy "Approved" state usually shouldn't
                                   appear in the normal flow — we still allow it
                                   here in case pdlAlbumId is set with that status.
                                 */}
                                 {isPrivileged &&
                                   release.pdlAlbumId &&
                                   (release.status === "In Process" ||
                                     release.status === "Approved") && (
                                     <Button
                                       size="sm"
                                       onClick={() =>
                                         handlePdlPhase2Distribute(release._id)
                                       }
                                       title="Distribute to platforms"
                                       className="gap-1.5 text-xs h-8 px-3.5 font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20 transition-all border-none"
                                     >
                                       <UploadCloud className="h-3.5 w-3.5" />
                                       Distribute
                                     </Button>
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


    </DashboardLayout>
  );
}

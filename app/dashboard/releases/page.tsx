"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
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
import { Button } from "@/components/ui/button";

import {
  Loader2,
  Plus,
  Filter,
  Eye,
  Trash2,
  Send,
  XCircle,
  Music,
  UploadCloud,
  Ban,
  X,
  CheckCircle,
} from "lucide-react";
import {
  getReleases,
  deleteRelease,
  submitRelease,
  cancelRelease,
  approveRelease,
  rejectRelease,
  releaseRelease,
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
      console.log(response);
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
    if (
      !confirm(
        "Are you sure you want to delete this release? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setActionLoading(id);
      await deleteRelease(id);
      toast.success("Release deleted successfully");
      fetchReleases();
    } catch (error) {
      toast.error("Failed to delete release");
      console.error(error);
    } finally {
      setActionLoading(null);
    }
  };

  // const handleSubmit = async (id: string) => {
  //   if (!confirm("Submit this release for review?")) {
  //     return;
  //   }

  //   try {
  //     setActionLoading(id);
  //     await submitRelease(id);
  //     toast.success("Release submitted for review");
  //     fetchReleases();
  //   } catch (error) {
  //     toast.error("Failed to submit release");
  //     console.error(error);
  //   } finally {
  //     setActionLoading(null);
  //   }
  // };

  // const handleCancel = async (id: string) => {
  //   if (!confirm("Cancel this release submission?")) {
  //     return;
  //   }

  //   try {
  //     setActionLoading(id);
  //     await cancelRelease(id);
  //     toast.success("Release submission cancelled");
  //     fetchReleases();
  //   } catch (error) {
  //     toast.error("Failed to cancel release");
  //     console.error(error);
  //   } finally {
  //     setActionLoading(null);
  //   }
  // };

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

  const handleRelease = async (id: string) => {
    if (!confirm("Mark this release as distributed/released?")) return;
    try {
      setActionLoading(id);
      await releaseRelease(id);
      toast.success("Release marked as distributed");
      fetchReleases();
    } catch (error) {
      toast.error("Failed to release");
    } finally {
      setActionLoading(null);
    }
  };

  const statusFilters: {
    value: StatusFilter;
    label: string;
    count?: number;
  }[] = [
      { value: "all", label: "All" },
      { value: "In Process", label: "In Process" },
      { value: "Approved", label: "Approved" },
      { value: "Rejected", label: "Rejected" },
      { value: "Released", label: "Released" },
    ];

  return (
    <DashboardLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold mb-2">
              My <span className="animated-gradient">Releases</span>
            </h1>
            <p className="text-muted-foreground">
              Manage all your music releases in one place
            </p>
          </div>
          {user?.role !== "release_manager" &&
            (statusFilter === "all" || statusFilter === "In Process") && (
              <Link href="/dashboard/upload">
                <Button size="lg" className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Release
                </Button>
              </Link>
            )}
        </motion.div>

        {/* Filters */}
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
                  <div className="text-sm font-medium text-muted-foreground">
                    Status
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {statusFilters.map((filter) => (
                      <Button
                        key={filter.value}
                        variant={
                          statusFilter === filter.value ? "default" : "outline"
                        }
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
                    <div className="text-sm font-medium text-muted-foreground">
                      User
                    </div>
                    <Select
                      value={selectedUserId}
                      onValueChange={setSelectedUserId}
                    >
                      <SelectTrigger className="bg-background/50 backdrop-blur-sm h-9">
                        <SelectValue placeholder="All Users" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        {users.map((u) => (
                          <SelectItem key={u._id} value={u._id}>
                            {u.fullName || u.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Releases Table */}
        <motion.div variants={itemVariants}>
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Music className="h-5 w-5" />
                    All Releases
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {releases.length} release{releases.length !== 1 ? "s" : ""}{" "}
                    found
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="rounded-md border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">Poster</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Member</TableHead>
                        <TableHead>Artist</TableHead>
                        <TableHead>UPC/ISRC</TableHead>
                        <TableHead>Approved By</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {releases.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={9}
                            className="text-center text-muted-foreground py-12"
                          >
                            <div className="flex flex-col items-center gap-2">
                              <Music className="h-12 w-12 text-muted-foreground/50" />
                              <p className="text-lg font-medium">
                                No releases found
                              </p>
                              <p className="text-sm">
                                Start by creating your first release
                              </p>
                              {user?.role !== "release_manager" &&
                                (statusFilter === "all" ||
                                  statusFilter === "In Process") && (
                                  <Link
                                    href="/dashboard/upload"
                                    className="mt-4"
                                  >
                                    <Button>
                                      <Plus className="h-4 w-4 mr-2" />
                                      Create Release
                                    </Button>
                                  </Link>
                                )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        releases.map((release) => (
                          <TableRow key={release._id}>
                            <TableCell>
                              <div
                                className="h-12 w-12 rounded-md overflow-hidden bg-muted relative cursor-zoom-in group"
                                onClick={() =>
                                  release.coverArt?.url &&
                                  setPreviewImage(release.coverArt.url)
                                }
                              >
                                {release.coverArt?.url ? (
                                  <>
                                    <img
                                      src={release.coverArt.url}
                                      alt={release.title}
                                      className="h-full w-full object-cover transition-transform group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <Eye className="h-4 w-4 text-white" />
                                    </div>
                                  </>
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center bg-muted">
                                    <Music className="h-6 w-6 text-muted-foreground/50" />
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              {release.title}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">
                                  {typeof release.userId === "object"
                                    ? release.userId.fullName
                                    : "System"}
                                </span>
                                {typeof release.userId === "object" && (
                                  <span className="text-xs text-muted-foreground">
                                    {release.userId.email}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-muted-foreground">
                                {[
                                  release.artistName,
                                  ...(release.primaryArtists?.map(
                                    (a) => a.name
                                  ) || []),
                                ]
                                  .filter(
                                    (name, index, self) =>
                                      name && self.indexOf(name) === index
                                  )
                                  .join(", ")}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <span className="text-xs font-mono text-muted-foreground">
                                  UPC: {release.barcode || "-"}
                                </span>
                                <span className="text-xs font-mono text-muted-foreground">
                                  ISRC: {release.isrc || "-"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-muted-foreground italic">
                                {typeof release.approvedBy === "object"
                                  ? release.approvedBy.fullName
                                  : "-"}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                                  release.status
                                )}`}
                              >
                                {formatStatus(release.status)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="text-xs text-muted-foreground">
                                {new Date(
                                  release.createdAt
                                ).toLocaleDateString()}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                {/* View button (always available) */}
                                <Link
                                  href={`/dashboard/releases/${release._id}`}
                                >
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    title="View details"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </Link>

                                {/* Submit button (only for drafts - In Process without submittedAt) */}
                                {/* {release.status === "In Process" &&
                                  !release.submittedAt && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleSubmit(release._id)}
                                      disabled={actionLoading === release._id}
                                      title="Submit for review"
                                    >
                                      {actionLoading === release._id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <Send className="h-4 w-4" />
                                      )}
                                    </Button>
                                  )} */}

                                {/* Cancel button (for In Process with submittedAt) */}
                                {/* {release.status === "In Process" &&
                                  release.submittedAt && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleCancel(release._id)}
                                      disabled={actionLoading === release._id}
                                      title="Cancel submission"
                                    >
                                      {actionLoading === release._id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <XCircle className="h-4 w-4" />
                                      )}
                                    </Button>
                                  )} */}

                                {/* Delete button (only for drafts - In Process without submittedAt) */}
                                {release.status === "In Process" &&
                                  !release.submittedAt && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDelete(release._id)}
                                      disabled={actionLoading === release._id}
                                      title="Delete release"
                                      className="text-red-500 hover:text-red-500 hover:bg-red-500/10"
                                    >
                                      {actionLoading === release._id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <Trash2 className="h-4 w-4" />
                                      )}
                                    </Button>
                                  )}
                                {/* Admin/Manager Actions */}
                                {(user?.role === "release_manager" ||
                                  user?.role === "admin" ||
                                  user?.role === "super_admin") && (
                                    <>
                                      {/* Approve Button (Admin Only) */}
                                      {(user?.role === "admin" ||
                                        user?.role === "release_manager") &&
                                        release.status === "In Process" && (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                              handleApprove(release._id)
                                            }
                                            disabled={
                                              actionLoading === release._id
                                            }
                                            title="Approve Release"
                                            className="text-purple-500 hover:text-purple-600 hover:bg-purple-500/10"
                                          >
                                            {actionLoading === release._id ? (
                                              <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                              <CheckCircle className="h-4 w-4" />
                                            )}
                                          </Button>
                                        )}

                                      {/* Reject Button (Admin Only) */}
                                      {(user?.role === "admin" ||
                                        user?.role === "release_manager") &&
                                        release.status === "In Process" &&
                                        release.submittedAt && (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                              handleReject(release._id)
                                            }
                                            disabled={
                                              actionLoading === release._id
                                            }
                                            title="Reject Release"
                                            className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                          >
                                            {actionLoading === release._id ? (
                                              <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                              <Ban className="h-4 w-4" />
                                            )}
                                          </Button>
                                        )}

                                      {/* Release Button (Admins + Release Manager)
                                    {release.status === "Approved" && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          handleRelease(release._id)
                                        }
                                        disabled={actionLoading === release._id}
                                        title="Mark as Distributed"
                                        className="text-green-500 hover:text-green-600 hover:bg-green-500/10"
                                      >
                                        {actionLoading === release._id ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <UploadCloud className="h-4 w-4" />
                                        )}
                                      </Button>
                                    )} */}
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

        {/* Image Preview Modal */}
        <AnimatePresence>
          {previewImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewImage(null)}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 cursor-zoom-out"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative max-w-4xl w-full max-h-[90vh] flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={previewImage}
                  alt="Poster Preview"
                  className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl border border-white/10"
                />
                <Button
                  variant="ghost"
                  // size="icon"
                  className="absolute -top-12 right-0 text-white hover:bg-white/10"
                  onClick={() => setPreviewImage(null)}
                >
                  <X className="h-6 w-6" />
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </DashboardLayout>
  );
}

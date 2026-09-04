"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { getErrorMessage, extractApiFieldErrors, type ApiFieldError } from "@/lib/get-error-message";
import { isPlanInactiveError } from "@/lib/plan-inactive";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import PageLoading from "@/components/dashboard/page-loading";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

import {
  Loader2,
  Plus,
  Eye,
  Trash2,
  X,
  Music,
  Ban,
  UploadCloud,
  Pencil,
  AlertTriangle,
} from "lucide-react";
import {
  getReleases,
  deleteRelease,
  rejectRelease,
  submitToPdl,
  pdlSubmit,
  acknowledgeDistributionIssue,
  acceptDistributionFix,
  submitDraftReview,
  acknowledgeDraftReview,
  Release,
  ReleaseStatus,
} from "@/lib/api/releases";
import { PageSearchBar, PageSearchSection } from "@/components/dashboard/page-search-bar";
import { UserFilterSelect } from "@/components/dashboard/user-filter-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { S3Image } from "@/components/ui/s3-image";
import {
  canManageReleases,
  canEditReleases,
  formatReleaseStatus,
  getReleaseStatusColor,
  isRmEditableRelease,
  isReleaseStaff,
} from "@/lib/release-status";
import { formatReleaseCodeDisplay, formatUpcDisplay, formatIsrcListDisplay, formatIsrcDetailDisplay, getTrackIsrcDisplay } from "@/lib/release-codes";
import {
  hasOpenDistributionIssueAction,
  hasDistributionIssueAwaitingRm,
  hasDistributionIssueResubmitted,
  DISTRIBUTION_ISSUE_ACK_LABEL,
} from "@/lib/distribution-issue";
import { PlatformReleaseIcons } from "@/components/releases/platform-release-icons";
import {
  getAudioUploadWarning,
  getCoverArtUploadWarnings,
  hasUploadWarning,
} from "@/lib/upload-warning";

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

type StatusFilter = "all" | ReleaseStatus | "action_needed";

const PAGE_SIZE = 10;

export default function ReleasesPage() {
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalReleases, setTotalReleases] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedUserId, setSelectedUserId] = useState<string>("all");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<
    { type: "delete" | "approve" | "distribute"; id: string } | null
  >(null);
  const [rejectDialog, setRejectDialog] = useState<{ id: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [reviewDialog, setReviewDialog] = useState<{ id: string } | null>(null);
  const [reviewComment, setReviewComment] = useState("");
  const [staffActionSelect, setStaffActionSelect] = useState<Record<string, string>>({});
  const [validationErrorDialog, setValidationErrorDialog] = useState<{
    title: string;
    summary: string;
    issues: ApiFieldError[];
  } | null>(null);
  const [fixDialog, setFixDialog] = useState<{
    kind: "distribution" | "draft";
    id: string;
    title: string;
    note: string;
    resubmittedAt?: string | null;
    status?: string;
  } | null>(null);
  const [issueAckChecked, setIssueAckChecked] = useState(false);
  const [issueAckSubmitting, setIssueAckSubmitting] = useState(false);
  const [issueAcceptSubmitting, setIssueAcceptSubmitting] = useState(false);
  const [uploadWarningDialog, setUploadWarningDialog] = useState<{
    title: string;
    audioWarning: string | null;
    coverArtWarnings: Array<{ code?: string; message: string; severity?: string }>;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { user } = useAuth();
  const router = useRouter();
  const fetchRequestIdRef = useRef(0);

  const canManage = canManageReleases(user);
  const canEdit = canEditReleases(user);

  const fetchReleases = async () => {
    const requestId = ++fetchRequestIdRef.current;

    try {
      setLoading(true);
      const params: any = {
        page,
        limit: PAGE_SIZE,
      };

      if (statusFilter === "action_needed") {
        params.needsDistributionAction = true;
      } else if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      if (selectedUserId !== "all") {
        params.userId = selectedUserId;
      } else if (user?._id && !canManage) {
        params.userId = user._id;
      }

      if (debouncedSearch) {
        params.search = debouncedSearch;
      }

      const response = await getReleases(params);
      if (requestId !== fetchRequestIdRef.current) return;

      const items = response.releases;
      const pagination = response.pagination;

      if (
        items.length === 0 &&
        page > 1 &&
        (pagination?.totalPages ?? 1) < page
      ) {
        setPage((pagination?.totalPages ?? 1) || 1);
        return;
      }

      setReleases(items);
      setTotalReleases(pagination?.total ?? items.length);
      setTotalPages(pagination?.totalPages ?? 1);
    } catch (error) {
      if (requestId !== fetchRequestIdRef.current) return;
      toast.error(getErrorMessage(error, "Failed to fetch releases"));
      console.error(error);
    } finally {
      if (requestId === fetchRequestIdRef.current) {
        setLoading(false);
      }
    }
  };

  const handleStatusFilterChange = (value: StatusFilter) => {
    setPage(1);
    setStatusFilter(value);
  };

  useEffect(() => {
    if (!fixDialog) {
      setIssueAckChecked(false);
      return;
    }
    setIssueAckChecked(Boolean(fixDialog.resubmittedAt));
  }, [fixDialog]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, selectedUserId, debouncedSearch]);

  useEffect(() => {
    fetchReleases();
  }, [statusFilter, selectedUserId, page, debouncedSearch]);

  const getStatusColor = getReleaseStatusColor;
  const formatStatus = formatReleaseStatus;

  const openDeleteDialog = (id: string) => {
    setConfirmDialog({ type: "delete", id });
  };

  const openApproveDialog = (id: string) => {
    setConfirmDialog({ type: "approve", id });
  };

  const openRejectDialog = (id: string) => {
    setRejectReason("");
    setRejectDialog({ id });
  };

  const openReviewDialog = (releaseId: string) => {
    setReviewComment("");
    setReviewDialog({ id: releaseId });
  };

  const handleStaffDraftAction = (releaseId: string, action: string) => {
    setStaffActionSelect((prev) => ({ ...prev, [releaseId]: "" }));
    if (action === "approve") {
      openApproveDialog(releaseId);
    } else if (action === "reject") {
      openRejectDialog(releaseId);
    } else if (action === "review") {
      openReviewDialog(releaseId);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewDialog || actionLoading) return;
    if (!reviewComment.trim()) {
      toast.error("Review comment is required");
      return;
    }

    const { id } = reviewDialog;
    try {
      setActionLoading(id);
      await submitDraftReview(id, reviewComment.trim());
      toast.success("Review submitted — artist has been notified");
      setReviewDialog(null);
      setReviewComment("");
      await fetchReleases();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to submit review"));
    } finally {
      setActionLoading(null);
    }
  };

  const openDistributeDialog = (id: string) => {
    setConfirmDialog({ type: "distribute", id });
  };

  const handleAcknowledgeDistributionIssue = async () => {
    if (!fixDialog || issueAckSubmitting || fixDialog.kind !== "distribution") return;
    if (fixDialog.resubmittedAt) return;
    if (!issueAckChecked) {
      toast.error("Please confirm you have fixed the suggested issue");
      return;
    }

    setIssueAckSubmitting(true);
    try {
      await acknowledgeDistributionIssue(fixDialog.id);
      toast.success("Fix submitted — waiting for RM review");
      setFixDialog(null);
      await fetchReleases();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to submit fix"));
    } finally {
      setIssueAckSubmitting(false);
    }
  };

  const handleAcknowledgeDraftReview = async () => {
    if (!fixDialog || issueAckSubmitting || fixDialog.kind !== "draft") return;
    if (fixDialog.resubmittedAt) return;
    if (!issueAckChecked) {
      toast.error("Please confirm you have fixed the suggested issues");
      return;
    }

    setIssueAckSubmitting(true);
    try {
      await acknowledgeDraftReview(fixDialog.id);
      toast.success("Fix submitted — waiting for RM review");
      setFixDialog(null);
      await fetchReleases();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to submit fix"));
    } finally {
      setIssueAckSubmitting(false);
    }
  };

  const handleSubmitFix = async () => {
    if (fixDialog?.kind === "draft") {
      await handleAcknowledgeDraftReview();
    } else {
      await handleAcknowledgeDistributionIssue();
    }
  };

  const handleAcceptDistributionFix = async () => {
    if (!fixDialog || issueAcceptSubmitting || fixDialog.kind !== "distribution") return;
    if (!fixDialog.resubmittedAt) return;

    setIssueAcceptSubmitting(true);
    try {
      await acceptDistributionFix(fixDialog.id);
      toast.success("Fix accepted — release moved to Submitted");
      setFixDialog(null);
      await fetchReleases();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to accept fix"));
    } finally {
      setIssueAcceptSubmitting(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmDialog || actionLoading) return;

    const { type, id } = confirmDialog;

    try {
      setActionLoading(id);
      if (type === "delete") {
        await deleteRelease(id);
        toast.success("Release deleted successfully");
      } else if (type === "approve") {
        await submitToPdl(id);
        toast.success("Release submitted for processing successfully");
      } else {
        await pdlSubmit(id);
        toast.success("Release distributed to platforms successfully");
      }
      setConfirmDialog(null);
      fetchReleases();
    } catch (error: any) {
      // Clear spinners immediately so row actions / confirm button don't stay stuck
      // while error dialogs or toasts are shown.
      setActionLoading(null);

      if (isPlanInactiveError(error)) {
        setConfirmDialog(null);
        return;
      }

      const issues = extractApiFieldErrors(error);
      if (issues.length > 0) {
        const summary = getErrorMessage(
          error,
          type === "approve"
            ? "This release cannot be submitted for processing yet."
            : type === "distribute"
              ? "This release cannot be distributed yet."
              : "This action could not be completed.",
        );
        const distinctIssues = issues.filter((issue) => issue.message !== summary);

        setConfirmDialog(null);
        setValidationErrorDialog({
          title:
            type === "approve"
              ? "Cannot submit release"
              : type === "distribute"
                ? "Cannot distribute release"
                : "Action blocked",
          summary,
          issues: distinctIssues,
        });
      } else {
        toast.error(
          getErrorMessage(
            error,
            type === "delete"
              ? "Failed to delete release"
              : type === "approve"
                ? "Failed to submit release for processing"
                : "Failed to distribute to platforms",
          ),
        );
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectDialog || actionLoading) return;
    if (!rejectReason.trim()) {
      toast.error("Rejection reason is required");
      return;
    }

    const { id } = rejectDialog;

    try {
      setActionLoading(id);
      await rejectRelease(id, rejectReason.trim());
      toast.success("Release rejected");
      setRejectDialog(null);
      setRejectReason("");
      fetchReleases();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to reject release"));
    } finally {
      setActionLoading(null);
    }
  };

  const confirmDialogCopy = {
    delete: {
      title: "Delete release?",
      description:
        "Are you sure you want to delete this release? This action cannot be undone.",
      confirmLabel: "Delete",
      variant: "destructive" as const,
    },
    approve: {
      title: "Submit release for processing?",
      description:
        "Submit this release for processing? Metadata, cover art, and audio will be verified.",
      confirmLabel: "Submit",
      variant: "default" as const,
    },
    distribute: {
      title: "Distribute to platforms?",
      description:
        "Finalize and distribute this release to all selected platforms?",
      confirmLabel: "Distribute",
      variant: "default" as const,
    },
  };



  const statusFilters: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "action_needed", label: "Action needed" },
    { value: "Draft", label: "Draft" },
    { value: "In Process", label: "In Process" },
    { value: "Submitted", label: "Submitted" },
    { value: "Rejected", label: "Rejected" },
    { value: "Released", label: "Released" },
  ];

    return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">My <span className="animated-gradient">Releases</span></h1>
            <p className="text-muted-foreground">Manage all your music releases in one place</p>
          </div>
          {!isReleaseStaff(user) &&
            (statusFilter === "all" ||
              statusFilter === "In Process" ||
              statusFilter === "action_needed") && (
            <Link href="/dashboard/upload">
              <Button size="lg" className="gap-2">
                <Plus className="h-4 w-4" />
                New Release
              </Button>
            </Link>
          )}
        </motion.div>

        <motion.div variants={itemVariants}>
          <PageSearchSection>
            <PageSearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by title, artist, release ID, UPC, or ISRC..."
            />
          </PageSearchSection>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="glass-card overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-primary/5 pb-6">
              <div className="space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">

                {canManage && (
                  <div className="flex flex-col gap-1.5 min-w-[200px]">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Filter by User</div>
                    <UserFilterSelect
                      value={selectedUserId}
                      onValueChange={setSelectedUserId}
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-4">
                <CardDescription className="flex items-center gap-2 text-sm font-medium">
                  <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                  {debouncedSearch
                    ? `${totalReleases} matching release${totalReleases !== 1 ? "s" : ""}`
                    : `${totalReleases} total releases found`}
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
                        onClick={() => handleStatusFilterChange(filter.value)}
                      >
                        {filter.label}
                      </Button>
                    ))}
                  </div>
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
                <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow className="hover:bg-transparent border-border/50">
                        <TableHead className="w-[100px] pl-6 font-bold uppercase tracking-wider text-[10px]">Poster</TableHead>
                        <TableHead className="font-bold uppercase tracking-wider text-[10px]">Title</TableHead>
                        <TableHead className="font-bold uppercase tracking-wider text-[10px]">Artist</TableHead>
                        <TableHead className="font-bold uppercase tracking-wider text-[10px]">Release ID</TableHead>
                        {canManage && (
                          <>
                            <TableHead className="font-bold uppercase tracking-wider text-[10px]">UPC</TableHead>
                            <TableHead className="font-bold uppercase tracking-wider text-[10px]">ISRC</TableHead>
                          </>
                        )}
                        <TableHead className="font-bold uppercase tracking-wider text-[10px]">Status</TableHead>
                        <TableHead className="font-bold uppercase tracking-wider text-[10px]">WorldWide DSP</TableHead>
                        <TableHead className="text-right pr-6 font-bold uppercase tracking-wider text-[10px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {releases.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={canManage ? 9 : 7} className="text-center text-muted-foreground py-24">
                            <div className="flex flex-col items-center gap-4">
                              <div className="h-20 w-20 rounded-full bg-primary/5 flex items-center justify-center mb-2">
                                <Music className="h-10 w-10 text-primary/30" />
                              </div>
                              <div className="space-y-1">
                                <p className="text-xl font-bold text-foreground">No releases found</p>
                                <p className="text-sm">Try adjusting your filters or create a new release.</p>
                              </div>
                              {!isReleaseStaff(user) && (
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
                              <span className="px-2 py-1 rounded bg-muted/50 text-[11px] text-muted-foreground font-mono font-semibold w-fit">
                                {formatReleaseCodeDisplay(release)}
                              </span>
                            </TableCell>
                            {canManage && (
                              <>
                                <TableCell>
                                  <span className="px-2 py-1 rounded bg-muted/50 text-[11px] text-muted-foreground font-mono font-semibold w-fit max-w-[140px] truncate block" title={formatUpcDisplay(release)}>
                                    {formatUpcDisplay(release)}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <span className="px-2 py-1 rounded bg-muted/50 text-[11px] text-muted-foreground font-mono font-semibold w-fit max-w-[180px] truncate block" title={formatIsrcListDisplay(release)}>
                                    {release.isrc || formatIsrcListDisplay(release)}
                                  </span>
                                </TableCell>
                              </>
                            )}
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {hasOpenDistributionIssueAction(
                                  release.status,
                                  release.distributionIssueNote,
                                  release.distributionIssueResolvedAt,
                                ) ? (
                                  <button
                                    type="button"
                                    className="inline-flex flex-col items-start gap-0.5 rounded-lg text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                    title="View distribution issue"
                                    onClick={() =>
                                      setFixDialog({
                                        kind: "distribution",
                                        id: release._id,
                                        title: release.title,
                                        note: release.distributionIssueNote!.trim(),
                                        resubmittedAt: release.distributionIssueResubmittedAt ?? null,
                                      })
                                    }
                                  >
                                    <span className="inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-amber-500/15 text-amber-600 dark:text-amber-400">
                                      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
                                      In Process
                                    </span>
                                    <span className="pl-1 text-[10px] font-semibold text-amber-600/90 dark:text-amber-400/90 underline-offset-2 hover:underline">
                                      {hasDistributionIssueAwaitingRm(
                                        release.status,
                                        release.distributionIssueNote,
                                        release.distributionIssueResubmittedAt,
                                        release.distributionIssueResolvedAt,
                                      )
                                        ? "Awaiting RM review"
                                        : "Action needed"}
                                    </span>
                                  </button>
                                ) : (release.status === "Draft" || release.status === "In Process") &&
                                  release.draftReviewNote?.trim() ? (
                                  <button
                                    type="button"
                                    className="inline-flex flex-col items-start gap-0.5 rounded-lg text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                    title="View admin review"
                                    onClick={() =>
                                      setFixDialog({
                                        kind: "draft",
                                        id: release._id,
                                        title: release.title,
                                        note: release.draftReviewNote!.trim(),
                                        resubmittedAt: release.draftReviewResubmittedAt ?? null,
                                        status: release.status,
                                      })
                                    }
                                  >
                                    <span className="inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-sky-500/15 text-sky-600 dark:text-sky-400">
                                      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
                                      {release.status}
                                    </span>
                                    <span className="pl-1 text-[10px] font-semibold text-sky-600/90 dark:text-sky-400/90 underline-offset-2 hover:underline">
                                      {release.draftReviewResubmittedAt
                                        ? "Awaiting RM review"
                                        : "Review feedback"}
                                    </span>
                                  </button>
                                ) : (
                                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${getStatusColor(release.status)}`}>
                                    <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
                                    {formatStatus(release.status)}
                                  </span>
                                )}
                                {canManage &&
                                  hasDistributionIssueResubmitted(
                                    release.distributionIssueResubmittedAt,
                                    release.distributionIssueResolvedAt,
                                  ) && (
                                    <span
                                      className="inline-flex items-center rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-widest bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                      title={
                                        release.distributionIssueResubmittedAt
                                          ? `Artist marked as fixed on ${new Date(release.distributionIssueResubmittedAt).toLocaleString()}`
                                          : "Artist marked as fixed"
                                      }
                                    >
                                      Artist fixed
                                    </span>
                                  )}
                                {canManage &&
                                  release.draftReviewResubmittedAt &&
                                  release.draftReviewNote?.trim() && (
                                    <span
                                      className="inline-flex items-center rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-widest bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                      title={`Artist marked as fixed on ${new Date(release.draftReviewResubmittedAt).toLocaleString()}`}
                                    >
                                      Artist fixed
                                    </span>
                                  )}
                                {hasUploadWarning(release) && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-full text-amber-500 hover:bg-amber-500/10 hover:text-amber-400"
                                    title="View upload warnings"
                                    onClick={() =>
                                      setUploadWarningDialog({
                                        title: release.title,
                                        audioWarning: getAudioUploadWarning(release),
                                        coverArtWarnings: getCoverArtUploadWarnings(release),
                                      })
                                    }
                                  >
                                    <AlertTriangle className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm font-medium">
                              {release.status === "Released" &&
                              Array.isArray(release.releasedOn?.platforms) &&
                              release.releasedOn.platforms.length > 0 ? (
                                <PlatformReleaseIcons
                                  platforms={release.releasedOn.platforms}
                                  className="flex items-center gap-1.5 flex-wrap max-w-[180px]"
                                  iconsOnly
                                  emptyFallback={release.pdlAlbumId ? "Yes" : "-"}
                                />
                              ) : release.pdlAlbumId ? (
                                "Yes"
                              ) : (
                                "-"
                              )}
                            </TableCell>
                            <TableCell className="text-right pr-6">
                              <div className="flex items-center justify-end gap-2">
                                <Link href={`/dashboard/releases/${release._id}`}>
                                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/20 hover:text-primary transition-all" title="View details">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </Link>

                                {canEdit && isRmEditableRelease(release.status) && (
                                  <Link href={`/dashboard/upload?edit=${release._id}`}>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-9 w-9 rounded-xl hover:bg-amber-500/20 hover:text-amber-500 transition-all"
                                      title="Edit release"
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                  </Link>
                                )}

                                 {release.status === "Draft" && (
                                   <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(release._id)} disabled={actionLoading === release._id} className="text-red-500 hover:bg-red-500/10" title="Delete">
                                     {actionLoading === release._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                   </Button>
                                 )}
                                 {canManage && release.status === "Draft" && (
                                   <Select
                                     value={staffActionSelect[release._id] || ""}
                                     onValueChange={(value) =>
                                       handleStaffDraftAction(release._id, value)
                                     }
                                     disabled={actionLoading === release._id}
                                   >
                                     <SelectTrigger
                                       className="h-8 w-[130px] text-xs font-semibold bg-background/50 border-border/50"
                                       title="Staff actions"
                                     >
                                       <SelectValue placeholder="Actions" />
                                     </SelectTrigger>
                                     <SelectContent>
                                       <SelectItem value="approve">Approve</SelectItem>
                                       <SelectItem value="reject">Reject</SelectItem>
                                       <SelectItem value="review">Review</SelectItem>
                                     </SelectContent>
                                   </Select>
                                 )}
                                 {canManage && release.status === "In Process" && (
                                   <>
                                     <Button
                                       variant="ghost"
                                       size="sm"
                                       onClick={() => openReviewDialog(release._id)}
                                       disabled={actionLoading === release._id}
                                       className="text-sky-600 hover:bg-sky-500/10 dark:text-sky-400"
                                       title="Submit review feedback"
                                     >
                                       Review
                                     </Button>
                                     <Button variant="ghost" size="sm" onClick={() => openRejectDialog(release._id)} disabled={actionLoading === release._id} className="text-red-500 hover:bg-red-500/10" title="Reject">
                                       {actionLoading === release._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
                                     </Button>
                                   </>
                                 )}
                                 {/*
                                   Distribute: shown after processing step 1 succeeds
                                   (platform link exists), while release is still
                                   in the post-upload pipeline.
                                 */}
                                 {canManage &&
                                   release.pdlAlbumId &&
                                   release.status === "In Process" && (
                                     <Button
                                       size="sm"
                                       onClick={() =>
                                         openDistributeDialog(release._id)
                                       }
                                       disabled={actionLoading === release._id}
                                       title="Distribute to platforms"
                                       className="gap-1.5 text-xs h-8 px-3.5 font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20 transition-all border-none"
                                     >
                                       {actionLoading === release._id ? (
                                         <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                       ) : (
                                         <UploadCloud className="h-3.5 w-3.5" />
                                       )}
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

                {totalReleases > 0 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-border/50 bg-card/20 backdrop-blur-sm">
                    <p className="text-sm text-text-secondary">
                      Showing{" "}
                      <span className="font-medium text-white">
                        {(page - 1) * PAGE_SIZE + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-medium text-white">
                        {Math.min(page * PAGE_SIZE, totalReleases)}
                      </span>{" "}
                      of{" "}
                      <span className="font-medium text-white">{totalReleases}</span>{" "}
                      results
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 text-sm font-medium text-white bg-surface-highlight rounded-lg hover:bg-surface-highlight/80 disabled:opacity-50 transition-colors"
                      >
                        Previous
                      </button>
                      <button
                        type="button"
                        onClick={() => setPage((p) => p + 1)}
                        disabled={page >= totalPages}
                        className="px-4 py-2 text-sm font-medium text-background-dark bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
                </>
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

        <Dialog
          open={confirmDialog !== null}
          onOpenChange={(open) => {
            if (!open && !actionLoading) setConfirmDialog(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {confirmDialog ? confirmDialogCopy[confirmDialog.type].title : ""}
              </DialogTitle>
              <DialogDescription>
                {confirmDialog
                  ? confirmDialogCopy[confirmDialog.type].description
                  : ""}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setConfirmDialog(null)}
                disabled={!!confirmDialog && actionLoading === confirmDialog.id}
              >
                Cancel
              </Button>
              <Button
                variant={
                  confirmDialog
                    ? confirmDialogCopy[confirmDialog.type].variant
                    : "default"
                }
                onClick={handleConfirmAction}
                disabled={!!confirmDialog && actionLoading === confirmDialog.id}
              >
                {confirmDialog && actionLoading === confirmDialog.id ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing…
                  </>
                ) : confirmDialog ? (
                  confirmDialogCopy[confirmDialog.type].confirmLabel
                ) : (
                  "Confirm"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={validationErrorDialog !== null}
          onOpenChange={(open) => {
            if (!open) setValidationErrorDialog(null);
          }}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{validationErrorDialog?.title}</DialogTitle>
              <DialogDescription>{validationErrorDialog?.summary}</DialogDescription>
            </DialogHeader>
            {(validationErrorDialog?.issues.length ?? 0) > 0 ? (
              <div className="max-h-[50vh] overflow-y-auto space-y-3 pr-1">
                {validationErrorDialog?.issues.map((issue, index) => (
                  <div
                    key={`${issue.code || issue.field}-${index}`}
                    className="rounded-lg border border-border/60 bg-muted/20 p-3"
                  >
                    <p className="text-sm font-medium text-foreground">{issue.message}</p>
                    {issue.action ? (
                      <p className="mt-1 text-sm text-muted-foreground">{issue.action}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}
            <DialogFooter>
              <Button onClick={() => setValidationErrorDialog(null)}>Got it</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={fixDialog !== null}
          onOpenChange={(open) => {
            if (!open && !issueAckSubmitting && !issueAcceptSubmitting) {
              setFixDialog(null);
            }
          }}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {fixDialog?.kind === "draft" ? "Admin review feedback" : "Distribution issue"}
              </DialogTitle>
              <DialogDescription>
                {fixDialog?.title
                  ? `What needs fixing on "${fixDialog.title}".`
                  : "What needs fixing on this release."}
              </DialogDescription>
            </DialogHeader>
            <div
              className={`max-h-[50vh] overflow-y-auto rounded-lg border p-4 ${
                fixDialog?.kind === "draft"
                  ? "border-sky-500/20 bg-sky-500/5"
                  : "border-amber-500/20 bg-amber-500/5"
              }`}
            >
              <p className="whitespace-pre-wrap text-sm text-foreground">{fixDialog?.note}</p>
            </div>
            {canManage && fixDialog?.resubmittedAt ? (
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                  Artist marked this as fixed
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(fixDialog.resubmittedAt).toLocaleString()}
                  {fixDialog.kind === "draft"
                    ? fixDialog.status === "In Process"
                      ? " — use Distribute when ready."
                      : " — use Approve from Actions to submit for processing."
                    : " — accept to move the release to Submitted."}
                </p>
              </div>
            ) : null}
            {fixDialog?.id && !canManage ? (
              <div className="space-y-3 rounded-lg border border-border/60 bg-muted/20 p-4">
                <label
                  className={`flex items-start gap-3 ${
                    fixDialog.resubmittedAt ? "cursor-default opacity-90" : "cursor-pointer"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={issueAckChecked}
                    disabled={Boolean(fixDialog.resubmittedAt) || issueAckSubmitting}
                    onChange={(event) => setIssueAckChecked(event.target.checked)}
                    className={`mt-0.5 h-4 w-4 rounded border-border ${
                      fixDialog.kind === "draft" ? "accent-sky-500" : "accent-amber-500"
                    }`}
                  />
                  <span className="text-sm text-foreground">{DISTRIBUTION_ISSUE_ACK_LABEL}</span>
                </label>
                {fixDialog.resubmittedAt ? (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">
                    Fix submitted — waiting for RM review. You cannot change this confirmation.
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Edit the release first if needed, then confirm. Status stays{" "}
                    {fixDialog.kind === "draft" ? fixDialog.status ?? "Draft" : "In Process"} until RM{" "}
                    {fixDialog.kind === "draft"
                      ? fixDialog.status === "In Process"
                        ? "reviews"
                        : "approves"
                      : "accepts"}.
                  </p>
                )}
                {!fixDialog.resubmittedAt ? (
                  <Link
                    href={`/dashboard/upload?edit=${fixDialog.id}`}
                    className={`inline-flex text-xs font-semibold underline-offset-2 hover:underline ${
                      fixDialog.kind === "draft"
                        ? "text-sky-600 dark:text-sky-400"
                        : "text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    Edit release to fix
                  </Link>
                ) : null}
              </div>
            ) : null}
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setFixDialog(null)}
                disabled={issueAckSubmitting || issueAcceptSubmitting}
              >
                Close
              </Button>
              {fixDialog?.id && canManage && fixDialog.resubmittedAt && fixDialog.kind === "distribution" ? (
                <Button onClick={handleAcceptDistributionFix} disabled={issueAcceptSubmitting}>
                  {issueAcceptSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Accepting…
                    </>
                  ) : (
                    "Accept & submit"
                  )}
                </Button>
              ) : null}
              {fixDialog?.id && !canManage && !fixDialog.resubmittedAt ? (
                <Button onClick={handleSubmitFix} disabled={issueAckSubmitting || !issueAckChecked}>
                  {issueAckSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    "Submit fix"
                  )}
                </Button>
              ) : null}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={uploadWarningDialog !== null}
          onOpenChange={(open) => {
            if (!open) setUploadWarningDialog(null);
          }}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Upload Warnings
              </DialogTitle>
              <DialogDescription>
                {uploadWarningDialog?.title
                  ? `Upload warnings for "${uploadWarningDialog.title}". These are separate from distributor issues — edit the release to replace audio or cover art if needed.`
                  : "Upload warnings for this release. These are separate from distributor issues — edit the release to replace audio or cover art if needed."}
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[50vh] space-y-4 overflow-y-auto rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
              {uploadWarningDialog?.audioWarning ? (
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                    Audio
                  </p>
                  <p className="whitespace-pre-wrap text-sm text-foreground">
                    {uploadWarningDialog.audioWarning}
                  </p>
                </div>
              ) : null}
              {(uploadWarningDialog?.coverArtWarnings?.length ?? 0) > 0 ? (
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                    Cover art
                  </p>
                  <ul className="space-y-1.5">
                    {uploadWarningDialog!.coverArtWarnings.map((issue, idx) => (
                      <li
                        key={`${issue.code || "cover"}-${idx}`}
                        className="flex items-start gap-2 text-sm text-foreground"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                        <span>{issue.message}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
            <DialogFooter>
              <Button onClick={() => setUploadWarningDialog(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={reviewDialog !== null}
          onOpenChange={(open) => {
            if (!open && !actionLoading) {
              setReviewDialog(null);
              setReviewComment("");
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit admin review</DialogTitle>
              <DialogDescription>
                Add feedback for the artist. They will be emailed and can fix while the release stays in its current status.
              </DialogDescription>
            </DialogHeader>
            <Textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="What needs to be fixed or updated"
              rows={4}
              disabled={!!reviewDialog && actionLoading === reviewDialog.id}
            />
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setReviewDialog(null);
                  setReviewComment("");
                }}
                disabled={!!reviewDialog && actionLoading === reviewDialog.id}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitReview}
                disabled={
                  !!reviewDialog &&
                  (actionLoading === reviewDialog.id || !reviewComment.trim())
                }
              >
                {reviewDialog && actionLoading === reviewDialog.id ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  "Submit review"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={rejectDialog !== null}
          onOpenChange={(open) => {
            if (!open && !actionLoading) {
              setRejectDialog(null);
              setRejectReason("");
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject release</DialogTitle>
              <DialogDescription>
                Enter a reason for rejecting this release.
              </DialogDescription>
            </DialogHeader>
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Rejection reason"
              rows={4}
              disabled={!!rejectDialog && actionLoading === rejectDialog.id}
            />
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setRejectDialog(null);
                  setRejectReason("");
                }}
                disabled={!!rejectDialog && actionLoading === rejectDialog.id}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmReject}
                disabled={
                  !!rejectDialog && actionLoading === rejectDialog.id
                }
              >
                {rejectDialog && actionLoading === rejectDialog.id ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Rejecting…
                  </>
                ) : (
                  "Reject"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
  );
}

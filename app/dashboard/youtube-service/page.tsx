"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/lib/get-error-message";
import { useAuth } from "@/contexts/AuthContext";
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
    Youtube,
} from "lucide-react";
import { YouTubeServiceRequest, updateYouTubeRequestStatus, YouTubeRequestStatus, buildYouTubeExportRows, getStatusLabel, getReleaseIdDisplay } from "@/lib/api/youtube-service";
import { useYouTubeRequests } from "@/hooks/use-youtube-requests";
import { isStaffUser } from "@/lib/permissions";
import RequestModal from "@/components/dashboard/youtube-service/request-modal";
import { PageSearchBar, PageSearchSection } from "@/components/dashboard/page-search-bar";
import { CheckCircle, Ban, MessageSquare, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";

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

const COMMENT_PREVIEW_LENGTH = 60;

function getCommentPreview(text: string) {
    if (text.length <= COMMENT_PREVIEW_LENGTH) return text;
    return `${text.slice(0, COMMENT_PREVIEW_LENGTH).trim()}...`;
}

function matchesYouTubeSearch(request: YouTubeServiceRequest, query: string) {
    const q = query.trim().toLowerCase();
    if (!q) return true;

    const song = (request.songName || request.albumTrackTitle || "").toLowerCase();
    const releaseId = getReleaseIdDisplay(request).toLowerCase();
    const status = getStatusLabel(request.status).toLowerCase();
    const comment = (request.rejectionReason || "").toLowerCase();
    const links = request.infringingLinks.join(" ").toLowerCase();

    let userText = "";
    if (typeof request.userId === "object" && request.userId) {
        userText = [
            request.userId.fullName,
            request.userId.email,
            request.userId.userCode,
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
    }

    return [song, releaseId, status, comment, links, userText].some((field) =>
        field.includes(q)
    );
}

export default function YouTubeServicePage() {
    const { requests, loading, invalidate } = useYouTubeRequests();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [approveDialogId, setApproveDialogId] = useState<string | null>(null);
    const [rejectDialog, setRejectDialog] = useState<{ id: string } | null>(null);
    const [rejectReason, setRejectReason] = useState("");
    const [commentDialog, setCommentDialog] = useState<{ text: string; title?: string } | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const { user } = useAuth();

    const isStaff = isStaffUser(user);
    const canSubmitClaim = !isStaff;

    const filteredRequests = useMemo(
        () => requests.filter((request) => matchesYouTubeSearch(request, searchQuery)),
        [requests, searchQuery]
    );

    const openApproveDialog = (id: string) => {
        setApproveDialogId(id);
    };

    const openRejectDialog = (id: string) => {
        setRejectReason("");
        setRejectDialog({ id });
    };

    const handleConfirmApprove = async () => {
        if (!approveDialogId || actionLoading) return;

        const id = approveDialogId;

        try {
            setActionLoading(id);
            await updateYouTubeRequestStatus(id, YouTubeRequestStatus.APPROVED);
            toast.success("Request approved successfully");
            setApproveDialogId(null);
            invalidate();
        } catch (error) {
            toast.error(getErrorMessage(error, "Failed to approve request"));
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
            await updateYouTubeRequestStatus(id, YouTubeRequestStatus.REJECTED, rejectReason.trim());
            toast.success("Request rejected");
            setRejectDialog(null);
            setRejectReason("");
            invalidate();
        } catch (error) {
            toast.error(getErrorMessage(error, "Failed to reject request"));
        } finally {
            setActionLoading(null);
        }
    };

    const handleExportExcel = () => {
        const approvedRequests = requests.filter(
            (request) => request.status === YouTubeRequestStatus.APPROVED,
        );
        const { rows, skippedInvalidLinks, skippedRequestsWithoutLinks } =
            buildYouTubeExportRows(approvedRequests);

        if (rows.length === 0) {
            toast.error("No accepted claims with valid YouTube URLs to export");
            return;
        }

        const worksheet = XLSX.utils.json_to_sheet(rows);
        worksheet["!cols"] = [
            { wch: 14 },
            { wch: 22 },
            { wch: 32 },
            { wch: 72 },
        ];
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Accepted Claims");
        XLSX.writeFile(workbook, "YouTube_Accepted_Claims.xlsx");

        if (skippedInvalidLinks > 0 || skippedRequestsWithoutLinks > 0) {
            toast.success(
                `Exported ${rows.length} row(s). Skipped ${skippedInvalidLinks} invalid URL(s)` +
                    (skippedRequestsWithoutLinks > 0
                        ? ` and ${skippedRequestsWithoutLinks} claim(s) with no valid URLs.`
                        : "."),
            );
        } else {
            toast.success("Excel exported successfully");
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Approved":
                return "bg-green-500/10 text-green-500";
            case "Pending":
                return "bg-blue-500/10 text-blue-500 text-yellow-600"; // Keeping it visible
            case "Rejected":
                return "bg-red-500/10 text-red-500";
            default:
                return "bg-gray-500/10 text-gray-500";
        }
    };

    return (
        <>
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
                            YouTube <span className="animated-gradient">Service</span>
                        </h1>
                        <p className="text-muted-foreground">
                            Manage your YouTube content claims and takedowns
                        </p>
                    </div>
                    <div className="flex gap-3">
                        {isStaff && requests.some((r) => r.status === YouTubeRequestStatus.APPROVED) && (
                            <Button
                                variant="outline"
                                size="lg"
                                className="gap-2 border-green-500/50 hover:bg-green-500/10 text-green-500"
                                onClick={handleExportExcel}
                            >
                                <FileSpreadsheet className="h-4 w-4" />
                                Export Excel
                            </Button>
                        )}
                        {canSubmitClaim && (
                            <Button size="lg" className="gap-2" onClick={() => setIsModalOpen(true)}>
                                <Plus className="h-4 w-4" />
                                Send request form
                            </Button>
                        )}
                    </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <PageSearchSection>
                        <PageSearchBar
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder={
                                isStaff
                                    ? "Search by song, user, release ID, URL, or status..."
                                    : "Search by song, release ID, URL, or status..."
                            }
                        />
                    </PageSearchSection>
                </motion.div>

                {/* Requests Table */}
                <motion.div variants={itemVariants}>
                    <Card className="glass-card">
                        <CardHeader>
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Youtube className="h-5 w-5 text-red-600" />
                                    All Rights Issues
                                </CardTitle>
                                <CardDescription className="mt-1">
                                    {searchQuery.trim()
                                        ? `${filteredRequests.length} of ${requests.length} request${requests.length !== 1 ? "s" : ""} found`
                                        : `${requests.length} request${requests.length !== 1 ? "s" : ""} found`}
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : (
                                <div className="rounded-md border border-border/80 overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-muted/50">
                                            <TableRow>
                                                {isStaff && <TableHead>USER</TableHead>}
                                                <TableHead>SONG</TableHead>
                                                <TableHead>RELEASE ID</TableHead>
                                                <TableHead>YOUTUBE URL</TableHead>
                                                <TableHead>STATUS</TableHead>
                                                <TableHead>COMMENT</TableHead>
                                                {isStaff && <TableHead className="text-right">ACTIONS</TableHead>}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredRequests.length === 0 ? (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={isStaff ? 7 : 5}
                                                        className="text-center text-muted-foreground py-12"
                                                    >
                                                        <div className="flex flex-col items-center gap-2">
                                                            <Youtube className="h-12 w-12 text-muted-foreground/50" />
                                                            <p className="text-lg font-medium">
                                                                {searchQuery.trim()
                                                                    ? "No matching requests found"
                                                                    : "No requests found"}
                                                            </p>
                                                            <p className="text-sm">
                                                                {searchQuery.trim()
                                                                    ? "Try a different search term"
                                                                    : "Start by sending your first request form"}
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                filteredRequests.map((request) => (
                                                    <TableRow key={request._id}>
                                                        {isStaff && (
                                                            <TableCell>
                                                                <div className="flex flex-col">
                                                                    <span className="text-sm font-medium">
                                                                        {typeof request.userId === "object" ? request.userId.fullName : "Unknown"}
                                                                    </span>
                                                                    <span className="text-[10px] text-muted-foreground">
                                                                        {typeof request.userId === "object" ? request.userId.email : ""}
                                                                    </span>
                                                                </div>
                                                            </TableCell>
                                                        )}
                                                        <TableCell className="text-sm font-medium">
                                                            {request.songName || request.albumTrackTitle}
                                                        </TableCell>
                                                        <TableCell className="text-sm font-mono">
                                                            {getReleaseIdDisplay(request)}
                                                        </TableCell>
                                                        <TableCell className="text-sm max-w-[220px]">
                                                            <div className="space-y-1">
                                                                {request.infringingLinks.map((link) => (
                                                                    <a
                                                                        key={link}
                                                                        href={link}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className="block truncate text-primary hover:underline"
                                                                    >
                                                                        {link}
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <span
                                                                className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-bold uppercase ${getStatusColor(
                                                                    request.status
                                                                )}`}
                                                                style={{ border: '1px solid currentColor' }}
                                                            >
                                                                {getStatusLabel(request.status)}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="max-w-[200px]">
                                                            {request.rejectionReason ? (
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setCommentDialog({
                                                                            text: request.rejectionReason!,
                                                                            title: request.songName || request.albumTrackTitle,
                                                                        })
                                                                    }
                                                                    className="flex items-start gap-1 text-xs text-left text-muted-foreground bg-muted/50 p-2 rounded border border-border/50 hover:bg-muted/80 hover:border-border transition-colors w-full cursor-pointer"
                                                                    title="Click to view full comment"
                                                                >
                                                                    <MessageSquare className="h-3 w-3 mt-0.5 shrink-0" />
                                                                    <span className="italic line-clamp-2">
                                                                        &ldquo;{getCommentPreview(request.rejectionReason)}&rdquo;
                                                                    </span>
                                                                </button>
                                                            ) : (
                                                                <span className="text-muted-foreground/30">-</span>
                                                            )}
                                                        </TableCell>
                                                        {isStaff && (
                                                            <TableCell className="text-right">
                                                                {request.status === YouTubeRequestStatus.PENDING ? (
                                                                    <div className="flex items-center justify-end gap-1">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => openApproveDialog(request._id)}
                                                                            disabled={actionLoading === request._id}
                                                                            className="text-green-500 hover:bg-green-500/10 h-8 w-8 p-0"
                                                                            title="Approve"
                                                                        >
                                                                            {actionLoading === request._id ? (
                                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                                            ) : (
                                                                                <CheckCircle className="h-4 w-4" />
                                                                            )}
                                                                        </Button>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => openRejectDialog(request._id)}
                                                                            disabled={actionLoading === request._id}
                                                                            className="text-red-500 hover:bg-red-500/10 h-8 w-8 p-0"
                                                                            title="Reject"
                                                                        >
                                                                            {actionLoading === request._id ? (
                                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                                            ) : (
                                                                                <Ban className="h-4 w-4" />
                                                                            )}
                                                                        </Button>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-xs text-muted-foreground uppercase font-bold opacity-30">Processed</span>
                                                                )}
                                                            </TableCell>
                                                        )}
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
            </motion.div>

            <RequestModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    setIsModalOpen(false);
                    invalidate();
                }}
            />

            <Dialog
                open={approveDialogId !== null}
                onOpenChange={(open) => {
                    if (!open && !actionLoading) setApproveDialogId(null);
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Approve request?</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to approve this YouTube service request?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setApproveDialogId(null)}
                            disabled={!!approveDialogId && actionLoading === approveDialogId}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirmApprove}
                            disabled={!!approveDialogId && actionLoading === approveDialogId}
                        >
                            {approveDialogId && actionLoading === approveDialogId ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Approving…
                                </>
                            ) : (
                                "Approve"
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
                        <DialogTitle>Reject request</DialogTitle>
                        <DialogDescription>
                            Enter a reason for rejecting this YouTube service request.
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
                            disabled={!!rejectDialog && actionLoading === rejectDialog.id}
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

            <Dialog
                open={commentDialog !== null}
                onOpenChange={(open) => {
                    if (!open) setCommentDialog(null);
                }}
            >
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Comment</DialogTitle>
                        {commentDialog?.title && (
                            <DialogDescription>{commentDialog.title}</DialogDescription>
                        )}
                    </DialogHeader>
                    <div className="text-sm text-foreground/90 bg-muted/50 p-4 rounded-lg border border-border/50 whitespace-pre-wrap break-words leading-relaxed">
                        {commentDialog?.text}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCommentDialog(null)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

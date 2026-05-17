"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
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
    Youtube,
    Music,
} from "lucide-react";
import { getYouTubeRequests, YouTubeServiceRequest, updateYouTubeRequestStatus, YouTubeRequestStatus } from "@/lib/api/youtube-service";
import RequestModal from "@/components/dashboard/youtube-service/request-modal";
import { CheckCircle, XCircle, Ban, MessageSquare, Download, FileSpreadsheet } from "lucide-react";
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

export default function YouTubeServicePage() {
    const [requests, setRequests] = useState<YouTubeServiceRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const { user } = useAuth();

    const isReleaseManager = user?.role === "release_manager";

    const isLimited = (user?.plan === 'free' || user?.plan === 'solo') && user?.role === 'artist';
    const approvedCount = requests.filter(r => r.status === 'Approved').length;
    const totalCount = requests.length;

    const hasHitLimit = isLimited && (
        (approvedCount === 0 && totalCount >= 1) ||
        (approvedCount >= 1 && totalCount >= 2)
    );

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const data = await getYouTubeRequests();
            setRequests(data);
        } catch (error) {
            toast.error("Failed to fetch YouTube requests");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleApprove = async (id: string) => {
        if (!confirm("Are you sure you want to approve this YouTube service request?")) return;
        try {
            setActionLoading(id);
            await updateYouTubeRequestStatus(id, YouTubeRequestStatus.APPROVED);
            toast.success("Request approved successfully");
            fetchRequests();
        } catch (error) {
            toast.error("Failed to approve request");
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (id: string) => {
        const reason = prompt("Enter rejection reason:");
        if (reason === null) return; // User cancelled
        if (!reason.trim()) {
            toast.error("Rejection reason is required");
            return;
        }

        try {
            setActionLoading(id);
            await updateYouTubeRequestStatus(id, YouTubeRequestStatus.REJECTED, reason);
            toast.success("Request rejected");
            fetchRequests();
        } catch (error) {
            toast.error("Failed to reject request");
        } finally {
            setActionLoading(null);
        }
    };

    const handleExportExcel = () => {
        if (requests.length === 0) {
            toast.error("No data to export");
            return;
        }

        const data = requests.map((req) => ({
            "User Name": (req.userId as any)?.fullName || "N/A",
            "User Email": (req.userId as any)?.email || "N/A",
            "Store": "YouTube",
            "Category": req.requestType,
            "Asset Title": req.assetTitle,
            "Artist/Asset ID": req.artistId,
            "UPC": req.upc,
            "Status": req.status,
            "Rejection Reason": req.rejectionReason || "-",
            "Approved By": (req.processedBy as any)?.fullName || "-",
            "Approved At": req.processedAt ? new Date(req.processedAt).toLocaleString() : "-",
            "Created At": new Date(req.createdAt).toLocaleString(),
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Requests");
        XLSX.writeFile(workbook, "YouTube_Service_Requests.xlsx");
        toast.success("Excel exported successfully");
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
                            YouTube <span className="animated-gradient">Service</span>
                        </h1>
                        <p className="text-muted-foreground">
                            {hasHitLimit 
                                ? "You have reached the maximum number of requests for your plan"
                                : "Manage your YouTube content claims and takedowns"
                            }
                        </p>
                    </div>
                    <div className="flex gap-3">
                        {isReleaseManager && requests.length > 0 && (
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
                        {!loading && !hasHitLimit && (
                            <Button size="lg" className="gap-2" onClick={() => setIsModalOpen(true)}>
                                <Plus className="h-4 w-4" />
                                Send request form
                            </Button>
                        )}
                    </div>
                </motion.div>

                {/* Requests Table */}
                <motion.div variants={itemVariants}>
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Youtube className="h-5 w-5 text-red-600" />
                                        All Rights Issues
                                    </CardTitle>
                                    <CardDescription className="mt-1">
                                        {requests.length} request{requests.length !== 1 ? "s" : ""}{" "}
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
                                        <TableHeader className="bg-muted/50">
                                            <TableRow>
                                                {isReleaseManager && <TableHead>USER</TableHead>}
                                                <TableHead>STORE</TableHead>
                                                <TableHead>CATEGORY</TableHead>
                                                <TableHead>ASSET TITLE</TableHead>
                                                <TableHead>ARTIST/ASSET ID</TableHead>
                                                <TableHead>UPC</TableHead>
                                                <TableHead>STATUS</TableHead>
                                                <TableHead>COMMENT</TableHead>
                                                {isReleaseManager && <TableHead className="text-right">ACTIONS</TableHead>}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {requests.length === 0 ? (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={isReleaseManager ? 8 : 7}
                                                        className="text-center text-muted-foreground py-12"
                                                    >
                                                        <div className="flex flex-col items-center gap-2">
                                                            <Youtube className="h-12 w-12 text-muted-foreground/50" />
                                                            <p className="text-lg font-medium">
                                                                No requests found
                                                            </p>
                                                            <p className="text-sm">
                                                                Start by sending your first request form
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                requests.map((request) => (
                                                    <TableRow key={request._id}>
                                                        {isReleaseManager && (
                                                            <TableCell>
                                                                <div className="flex flex-col">
                                                                    <span className="text-sm font-medium">{(request.userId as any)?.fullName || 'Unknown'}</span>
                                                                    <span className="text-[10px] text-muted-foreground">{(request.userId as any)?.email}</span>
                                                                </div>
                                                            </TableCell>
                                                        )}
                                                        <TableCell>
                                                            <Youtube className="h-5 w-5 text-red-600" />
                                                        </TableCell>
                                                        <TableCell className="text-sm font-medium">
                                                            {request.requestType}
                                                        </TableCell>
                                                        <TableCell className="text-sm">
                                                            {request.assetTitle}
                                                        </TableCell>
                                                        <TableCell className="text-sm">
                                                            {request.artistId}
                                                        </TableCell>
                                                        <TableCell className="text-sm font-mono">
                                                            {request.upc}
                                                        </TableCell>
                                                        <TableCell>
                                                            <span
                                                                className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-bold uppercase ${getStatusColor(
                                                                    request.status
                                                                )}`}
                                                                style={{ border: '1px solid currentColor' }}
                                                            >
                                                                {request.status}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="max-w-[200px]">
                                                            {request.rejectionReason ? (
                                                                <div className="flex items-start gap-1 text-xs text-muted-foreground bg-muted/50 p-2 rounded border border-border/50">
                                                                    <MessageSquare className="h-3 w-3 mt-0.5 shrink-0" />
                                                                    <span className="italic">"{request.rejectionReason}"</span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-muted-foreground/30">-</span>
                                                            )}
                                                        </TableCell>
                                                        {isReleaseManager && (
                                                            <TableCell className="text-right">
                                                                {request.status === YouTubeRequestStatus.PENDING ? (
                                                                    <div className="flex items-center justify-end gap-1">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => handleApprove(request._id)}
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
                                                                            onClick={() => handleReject(request._id)}
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
                    fetchRequests();
                }}
            />
        </DashboardLayout>
    );
}

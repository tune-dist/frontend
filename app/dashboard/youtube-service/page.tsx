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
import { getYouTubeRequests, YouTubeServiceRequest } from "@/lib/api/youtube-service";
import RequestModal from "@/components/dashboard/youtube-service/request-modal";

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
    const { user } = useAuth();

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
                            Manage your YouTube content claims and takedowns
                        </p>
                    </div>
                    {!loading && requests.length === 0 && (
                        <Button size="lg" className="gap-2" onClick={() => setIsModalOpen(true)}>
                            <Plus className="h-4 w-4" />
                            Send request form
                        </Button>
                    )}
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
                                                <TableHead>STORE</TableHead>
                                                <TableHead>CATEGORY</TableHead>
                                                <TableHead>ASSET TITLE</TableHead>
                                                <TableHead>ALBUM/TRACK TITLE</TableHead>
                                                <TableHead>ARTIST/ASSET ID</TableHead>
                                                <TableHead>UPC</TableHead>
                                                <TableHead>STATUS</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {requests.length === 0 ? (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={7}
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
                                                            {request.albumTrackTitle}
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

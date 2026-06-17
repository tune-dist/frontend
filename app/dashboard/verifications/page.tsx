"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  Shield,
  CheckCircle,
  XCircle,
  MessageSquare,
  Eye,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { isStaffUser } from "@/lib/permissions";
import {
  getVerificationRequests,
  updateVerificationStatus,
  ProfileVerificationRequest,
  VerificationRequestStatus,
  VerificationDocumentType,
  getVerificationStatusLabel,
} from "@/lib/api/profile-verifications";
import { getDisplayUrl } from "@/lib/api/s3";

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

function getDocumentTypeLabel(type: VerificationDocumentType) {
  return type === VerificationDocumentType.PAN ? "PAN" : "Aadhar";
}

function getStatusColor(status: VerificationRequestStatus) {
  switch (status) {
    case VerificationRequestStatus.APPROVED:
      return "bg-green-500/10 text-green-500";
    case VerificationRequestStatus.PENDING:
      return "bg-amber-500/10 text-amber-500";
    case VerificationRequestStatus.REJECTED:
      return "bg-red-500/10 text-red-500";
    default:
      return "bg-gray-500/10 text-gray-500";
  }
}

export default function VerificationsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [requests, setRequests] = useState<ProfileVerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [approveDialogId, setApproveDialogId] = useState<string | null>(null);
  const [rejectDialog, setRejectDialog] = useState<{ id: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [viewingDoc, setViewingDoc] = useState<string | null>(null);

  const isStaff = isStaffUser(user);

  useEffect(() => {
    if (!authLoading && user && !isStaff) {
      router.push("/dashboard");
    }
  }, [authLoading, user, isStaff, router]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await getVerificationRequests();
      setRequests(data);
    } catch (error) {
      toast.error("Failed to fetch verification requests");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isStaff) {
      fetchRequests();
    }
  }, [isStaff]);

  const handleViewDocument = async (url: string, id: string) => {
    setViewingDoc(id);
    try {
      const signedUrl = await getDisplayUrl(url);
      window.open(signedUrl, "_blank", "noopener,noreferrer");
    } catch {
      toast.error("Failed to open document");
    } finally {
      setViewingDoc(null);
    }
  };

  const handleConfirmApprove = async () => {
    if (!approveDialogId || actionLoading) return;

    const id = approveDialogId;
    try {
      setActionLoading(id);
      await updateVerificationStatus(id, VerificationRequestStatus.APPROVED);
      toast.success("Verification approved");
      setApproveDialogId(null);
      fetchRequests();
    } catch {
      toast.error("Failed to approve verification");
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectDialog || actionLoading) return;
    if (!rejectReason.trim()) {
      toast.error("Rejection message is required");
      return;
    }

    const { id } = rejectDialog;
    try {
      setActionLoading(id);
      await updateVerificationStatus(
        id,
        VerificationRequestStatus.REJECTED,
        rejectReason.trim(),
      );
      toast.success("Verification rejected");
      setRejectDialog(null);
      setRejectReason("");
      fetchRequests();
    } catch {
      toast.error("Failed to reject verification");
    } finally {
      setActionLoading(null);
    }
  };

  if (authLoading || !isStaff) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
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
            Profile <span className="animated-gradient">Verifications</span>
          </h1>
          <p className="text-muted-foreground">
            Review artist PAN and Aadhar verification requests
          </p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Verification Requests
              </CardTitle>
              <CardDescription>
                {requests.length} request{requests.length !== 1 ? "s" : ""} found
              </CardDescription>
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
                        <TableHead>ARTIST</TableHead>
                        <TableHead>DOCUMENT</TableHead>
                        <TableHead>FILE</TableHead>
                        <TableHead>STATUS</TableHead>
                        <TableHead>MESSAGE</TableHead>
                        <TableHead className="text-right">ACTIONS</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requests.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center text-muted-foreground py-12"
                          >
                            <div className="flex flex-col items-center gap-2">
                              <Shield className="h-12 w-12 text-muted-foreground/50" />
                              <p className="text-lg font-medium">No verification requests</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        requests.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">
                                  {request.user?.fullName || "Unknown"}
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                  {request.user?.email || ""}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm font-medium">
                              {getDocumentTypeLabel(request.documentType)}
                            </TableCell>
                            <TableCell className="text-sm max-w-[180px]">
                              <div className="flex items-center gap-2">
                                <span className="truncate" title={request.document.filename}>
                                  {request.document.filename}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 shrink-0"
                                  onClick={() =>
                                    handleViewDocument(request.document.url, request.id)
                                  }
                                  disabled={viewingDoc === request.id}
                                >
                                  {viewingDoc === request.id ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <Eye className="h-3.5 w-3.5" />
                                  )}
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-bold uppercase ${getStatusColor(
                                  request.status,
                                )}`}
                                style={{ border: "1px solid currentColor" }}
                              >
                                {getVerificationStatusLabel(request.status)}
                              </span>
                            </TableCell>
                            <TableCell className="max-w-[200px]">
                              {request.rejectionReason ? (
                                <div className="flex items-start gap-1 text-xs text-muted-foreground bg-muted/50 p-2 rounded border border-border/50">
                                  <MessageSquare className="h-3 w-3 mt-0.5 shrink-0" />
                                  <span className="italic">&quot;{request.rejectionReason}&quot;</span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground/30">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {request.status === VerificationRequestStatus.PENDING ? (
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setApproveDialogId(request.id)}
                                    disabled={actionLoading === request.id}
                                    className="text-green-500 hover:bg-green-500/10 h-8 w-8 p-0"
                                    title="Approve"
                                  >
                                    {actionLoading === request.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <CheckCircle className="h-4 w-4" />
                                    )}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setRejectReason("");
                                      setRejectDialog({ id: request.id });
                                    }}
                                    disabled={actionLoading === request.id}
                                    className="text-red-500 hover:bg-red-500/10 h-8 w-8 p-0"
                                    title="Reject"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">-</span>
                              )}
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

      <Dialog open={!!approveDialogId} onOpenChange={() => setApproveDialogId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve verification?</DialogTitle>
            <DialogDescription>
              This will mark the document as verified on the artist profile.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogId(null)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmApprove} disabled={!!actionLoading}>
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!rejectDialog} onOpenChange={() => setRejectDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject verification</DialogTitle>
            <DialogDescription>
              Provide a reason so the artist knows what to fix.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Enter rejection message..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmReject}
              disabled={!!actionLoading || !rejectReason.trim()}
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

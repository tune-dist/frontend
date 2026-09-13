"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/lib/get-error-message";
import PageLoading from "@/components/dashboard/page-loading";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FileText,
  Loader2,
  Eye,
  PenLine,
  Plus,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { isStaffUser } from "@/lib/permissions";
import { getDisplayUrl } from "@/lib/api/s3";
import { getUsers } from "@/lib/api/users";
import {
  B2bDocument,
  createB2bDocument,
  createDefaultB2bDocument,
  getB2bDocumentStatusColor,
  getB2bDocumentStatusLabel,
  getB2bDocuments,
  startB2bDocumentSign,
  syncB2bDocument,
} from "@/lib/api/digisign";
import { startDigioSign } from "@/lib/digisign/start-digio-sign";
import { PageSearchBar, PageSearchSection } from "@/components/dashboard/page-search-bar";

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

function matchesDocumentSearch(document: B2bDocument, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const fields = [
    document.title,
    document.signerLabel,
    document.signerName,
    document.user?.fullName,
    document.user?.email,
    getB2bDocumentStatusLabel(document.status),
    document.sourceDocument.filename,
  ];

  return fields.some((field) => (field || "").toLowerCase().includes(q));
}

export default function DocumentsPage() {
  const { user, loading: authLoading } = useAuth();
  const [documents, setDocuments] = useState<B2bDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [userOptions, setUserOptions] = useState<
    { id: string; fullName: string; email: string }[]
  >([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [title, setTitle] = useState("B2B agreement");
  const [signerLabel, setSignerLabel] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const isStaff = isStaffUser(user);

  const filteredDocuments = useMemo(
    () => documents.filter((document) => matchesDocumentSearch(document, searchQuery)),
    [documents, searchQuery],
  );

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const data = await getB2bDocuments();
      setDocuments(data);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load documents"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      void fetchDocuments();
    }
  }, [authLoading, user]);

  useEffect(() => {
    if (!createOpen || !isStaff) return;

    const timeout = window.setTimeout(async () => {
      try {
        const result = await getUsers({
          page: 1,
          limit: 20,
          search: userSearch,
          role: "artist",
        });
        setUserOptions(
          result.users.map((item) => ({
            id: item._id,
            fullName: item.fullName,
            email: item.email,
          })),
        );
      } catch (error) {
        toast.error(getErrorMessage(error, "Failed to search users"));
      }
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [createOpen, isStaff, userSearch]);

  const handleView = async (url: string, id: string) => {
    setActionId(`view-${id}`);
    try {
      const signedUrl = await getDisplayUrl(url);
      if (!signedUrl) {
        toast.error("Could not open the document");
        return;
      }
      window.open(signedUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to open document"));
    } finally {
      setActionId(null);
    }
  };

  const handleSign = async (id: string) => {
    setActionId(`sign-${id}`);
    try {
      const session = await startB2bDocumentSign(id);
      await startDigioSign(session);
      const updated = await syncB2bDocument(id);
      setDocuments((current) =>
        current.map((document) => (document.id === id ? updated : document)),
      );
      if (updated.status === "signed") {
        toast.success("Document signed and verified");
      } else {
        toast.success("Signing submitted. Status will update when Digio confirms it.");
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to start Digio signing"));
      try {
        const updated = await syncB2bDocument(id);
        setDocuments((current) =>
          current.map((document) => (document.id === id ? updated : document)),
        );
      } catch {
        // Status refresh is best-effort after a cancelled/failed SDK session.
      }
    } finally {
      setActionId(null);
    }
  };

  const handleSync = async (id: string) => {
    setActionId(`sync-${id}`);
    try {
      const updated = await syncB2bDocument(id);
      setDocuments((current) =>
        current.map((document) => (document.id === id ? updated : document)),
      );
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to refresh signing status"));
    } finally {
      setActionId(null);
    }
  };

  const handleCreateDefault = async () => {
    setActionId("default");
    try {
      const created = await createDefaultB2bDocument();
      setDocuments((current) => [created, ...current]);
        toast.success("B2B letter ready to sign");
    } catch (error) {
      toast.error(getErrorMessage(error, "No default B2B document is available"));
    } finally {
      setActionId(null);
    }
  };

  const handleCreate = async () => {
    if (!selectedUserId || !title.trim()) {
      toast.error("Select a user and title");
      return;
    }

    setCreating(true);
    try {
      const created = await createB2bDocument({
        userId: selectedUserId,
        title: title.trim(),
        signerLabel: signerLabel.trim() || undefined,
        file,
      });
      setDocuments((current) => [created, ...current]);
      setCreateOpen(false);
      setSelectedUserId("");
      setSignerLabel("");
      setFile(null);
      toast.success("Document assigned");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to assign document"));
    } finally {
      setCreating(false);
    }
  };

  if (authLoading || !user) {
    return <PageLoading />;
  }

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={itemVariants} className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              B2B <span className="animated-gradient">Documents</span>
            </h1>
            <p className="text-muted-foreground">
              Review and digitally sign B2B agreements through Digio DigiSign.
            </p>
          </div>
          {isStaff ? (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Assign Document
            </Button>
          ) : null}
        </motion.div>

        <motion.div variants={itemVariants}>
          <PageSearchSection>
            <PageSearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by title, artist, label, or status..."
            />
          </PageSearchSection>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Agreements
              </CardTitle>
              <CardDescription>
                {searchQuery.trim()
                  ? `${filteredDocuments.length} of ${documents.length} document${documents.length !== 1 ? "s" : ""} found`
                  : `${documents.length} document${documents.length !== 1 ? "s" : ""} found`}
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
                        {isStaff ? <TableHead>ARTIST</TableHead> : null}
                        <TableHead>DOCUMENT</TableHead>
                        <TableHead>STATUS</TableHead>
                        <TableHead className="text-right">ACTIONS</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDocuments.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={isStaff ? 4 : 3}
                            className="text-center text-muted-foreground py-12"
                          >
                            <div className="flex flex-col items-center gap-3">
                              <FileText className="h-12 w-12 text-muted-foreground/50" />
                              <p className="text-lg font-medium">
                                {searchQuery.trim()
                                  ? "No matching documents"
                                  : "No B2B documents yet"}
                              </p>
                              {!isStaff && !searchQuery.trim() ? (
                                <Button
                                  variant="outline"
                                  onClick={handleCreateDefault}
                                  disabled={actionId === "default"}
                                >
                                  {actionId === "default" ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  ) : null}
                                  Open B2B agreement
                                </Button>
                              ) : null}
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredDocuments.map((document) => {
                          const fileToView =
                            document.status === "signed" && document.signedDocument
                              ? document.signedDocument
                              : document.sourceDocument;
                          const canSign =
                            document.status === "pending" ||
                            document.status === "signing" ||
                            document.status === "failed" ||
                            document.status === "expired";

                          return (
                            <TableRow key={document.id}>
                              {isStaff ? (
                                <TableCell>
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium">
                                      {document.user?.fullName || "Unknown"}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">
                                      {document.user?.email || ""}
                                    </span>
                                  </div>
                                </TableCell>
                              ) : null}
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium">{document.title}</span>
                                  <span className="text-[10px] text-muted-foreground">
                                    {document.signerLabel || document.sourceDocument.filename}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span
                                  className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-bold uppercase ${getB2bDocumentStatusColor(
                                    document.status,
                                  )}`}
                                  style={{ border: "1px solid currentColor" }}
                                >
                                  {getB2bDocumentStatusLabel(document.status)}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleView(fileToView.url, document.id)}
                                    disabled={actionId === `view-${document.id}`}
                                  >
                                    {actionId === `view-${document.id}` ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Eye className="h-4 w-4" />
                                    )}
                                  </Button>
                                  {document.status === "signing" ? (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleSync(document.id)}
                                      disabled={actionId === `sync-${document.id}`}
                                    >
                                      {actionId === `sync-${document.id}` ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <RefreshCw className="h-4 w-4" />
                                      )}
                                    </Button>
                                  ) : null}
                                  {canSign ? (
                                    <Button
                                      size="sm"
                                      onClick={() => handleSign(document.id)}
                                      disabled={actionId === `sign-${document.id}`}
                                    >
                                      {actionId === `sign-${document.id}` ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      ) : (
                                        <PenLine className="h-4 w-4 mr-2" />
                                      )}
                                      Sign Document
                                    </Button>
                                  ) : null}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign B2B document</DialogTitle>
            <DialogDescription>
              Leave the file empty to use the official sub-label B2B letter. Digio signs on the “(stamp and sign)” block.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user-search">Artist</Label>
              <Input
                id="user-search"
                value={userSearch}
                onChange={(event) => setUserSearch(event.target.value)}
                placeholder="Search artist name or email"
              />
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={selectedUserId}
                onChange={(event) => setSelectedUserId(event.target.value)}
              >
                <option value="">Select artist</option>
                {userOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.fullName} ({option.email})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="doc-title">Title</Label>
              <Input
                id="doc-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signer-label">Sub-label name</Label>
              <Input
                id="signer-label"
                value={signerLabel}
                onChange={(event) => setSignerLabel(event.target.value)}
                placeholder="For 'name of sub-label'"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="doc-file">PDF (optional)</Label>
              <Input
                id="doc-file"
                type="file"
                accept="application/pdf,.docx"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

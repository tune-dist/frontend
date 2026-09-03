"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/lib/get-error-message";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getPromotionByReleaseId } from "@/lib/api/promotions";
import { S3Image } from "@/components/ui/s3-image";
import { PromotionWizardDialog } from "@/components/promotion/promotion-wizard-dialog";
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
import { Loader2, Music, Sparkles, ExternalLink } from "lucide-react";
import { isPromotableRelease } from "@/lib/release-status";
import { canManageReleases } from "@/lib/permissions";
import { getReleases, Release } from "@/lib/api/releases";
import { PageSearchBar, PageSearchSection } from "@/components/dashboard/page-search-bar";
import { UserFilterSelect } from "@/components/dashboard/user-filter-select";
import { formatReleaseCodeDisplay } from "@/lib/release-codes";

export default function PromotionListingPage() {
    const [releases, setReleases] = useState<Release[]>([]);
    const [loading, setLoading] = useState(true);
    const [promotions, setPromotions] = useState<Map<string, any>>(new Map());
    const [formatDialogOpen, setFormatDialogOpen] = useState(false);
    const [selectedReleaseForPromo, setSelectedReleaseForPromo] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUserId, setSelectedUserId] = useState<string>("all");
    const { user } = useAuth();

    const canManage = canManageReleases(user);

    const fetchReleases = async () => {
        try {
            setLoading(true);
            const params: { limit: number; userId?: string } = { limit: 100 };

            // Artists: own releases only. Staff/super admin: all (or filter by user).
            if (selectedUserId !== "all") {
                params.userId = selectedUserId;
            } else if (user?._id && !canManage) {
                params.userId = user._id;
            }

            const response = await getReleases(params);
            const promoteable = response.releases.filter((r: Release) =>
                isPromotableRelease(r.status)
            );
            setReleases(promoteable);

            const promoMap = new Map();
            await Promise.all(
                promoteable.map(async (release: Release) => {
                    try {
                        const promo = await getPromotionByReleaseId(release._id);
                        if (promo) {
                            promoMap.set(release._id, promo);
                        }
                    } catch {
                        // No promotion yet
                    }
                })
            );
            setPromotions(promoMap);
        } catch (error) {
            toast.error(getErrorMessage(error, "Failed to fetch releases"));
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user?._id) return;
        fetchReleases();
        // eslint-disable-next-line react-hooks/exhaustive-deps -- refetch when staff filter changes
    }, [user?._id, canManage, selectedUserId]);

    const handlePromoteClick = (releaseId: string) => {
        setSelectedReleaseForPromo(releaseId);
        setFormatDialogOpen(true);
    };

    const filteredReleases = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return releases;

        return releases.filter((release) => {
            const fields = [
                release.title,
                release.artistName,
                formatReleaseCodeDisplay(release),
                release.status,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return fields.includes(q);
        });
    }, [releases, searchQuery]);

    return (
        <>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold mb-2">
                        Release <span className="animated-gradient">Promotion</span>
                    </h1>
                    <p className="text-muted-foreground">
                        {canManage
                            ? "Generate social media creatives and smart links for any release"
                            : "Generate social media creatives and smart links for your music"}
                    </p>
                </div>

                <PageSearchSection>
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <PageSearchBar
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder="Search by title, artist, or release ID..."
                        />
                        {canManage && (
                            <div className="flex flex-col gap-1.5 min-w-[220px]">
                                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
                                    Filter by User
                                </div>
                                <UserFilterSelect
                                    value={selectedUserId}
                                    onValueChange={setSelectedUserId}
                                />
                            </div>
                        )}
                    </div>
                </PageSearchSection>

                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Music className="h-5 w-5" />
                            {canManage ? "Promote Releases" : "Promote Your Music"}
                        </CardTitle>
                        <CardDescription>
                            {searchQuery.trim()
                                ? `${filteredReleases.length} of ${releases.length} release${releases.length !== 1 ? "s" : ""} found`
                                : "Select a release to start generating promotional content"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : filteredReleases.length === 0 ? (
                            <div className="text-center py-12">
                                <Music className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                                <p className="text-lg font-medium">
                                    {searchQuery.trim()
                                        ? "No matching releases found"
                                        : "No releases available for promotion"}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {searchQuery.trim()
                                        ? "Try a different search term"
                                        : "Releases must be In Process, Submitted, or Released before they can be promoted."}
                                </p>
                            </div>
                        ) : (
                            <div className="rounded-md border border-border overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[80px]">Poster</TableHead>
                                            <TableHead>Title</TableHead>
                                            <TableHead>Artist</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredReleases.map((release) => (
                                            <TableRow key={release._id}>
                                                <TableCell>
                                                    <div className="h-12 w-12 rounded-md overflow-hidden bg-muted">
                                                        {release.coverArt?.url ? (
                                                            <S3Image
                                                                src={release.coverArt.url}
                                                                alt={release.title}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center">
                                                                <Music className="h-6 w-6 text-muted-foreground/50" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-medium">{release.title}</TableCell>
                                                <TableCell>{release.artistName}</TableCell>
                                                <TableCell>
                                                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-500/10 text-blue-500">
                                                        {release.status}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {promotions.has(release._id) && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                title="Open promotion link"
                                                                className="text-green-500 border-green-500/20 hover:bg-green-500/10"
                                                                onClick={() => {
                                                                    const promo = promotions.get(release._id);
                                                                    const url = `${window.location.origin}/p/${promo.slug}`;
                                                                    window.open(url, "_blank", "noopener,noreferrer");
                                                                }}
                                                            >
                                                                <ExternalLink className="h-4 w-4 mr-1" />
                                                                Open Link
                                                            </Button>
                                                        )}
                                                        {promotions.has(release._id) ? (
                                                            <Link href={`/dashboard/promotion/${release._id}`}>
                                                                <Button size="sm" className="gap-2">
                                                                    <Sparkles className="h-4 w-4" />
                                                                    Edit
                                                                </Button>
                                                            </Link>
                                                        ) : (
                                                            <Button
                                                                size="sm"
                                                                className="gap-2"
                                                                onClick={() => handlePromoteClick(release._id)}
                                                            >
                                                                <Sparkles className="h-4 w-4" />
                                                                Promote
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            <PromotionWizardDialog
                open={formatDialogOpen}
                onClose={() => {
                    setFormatDialogOpen(false);
                    setSelectedReleaseForPromo(null);
                }}
                onSuccess={fetchReleases}
                releaseId={selectedReleaseForPromo}
            />
        </>
    );
}

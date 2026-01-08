"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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
import { Loader2, Music, Sparkles, ExternalLink } from "lucide-react";
import { getReleases, Release } from "@/lib/api/releases";

export default function PromotionListingPage() {
    const [releases, setReleases] = useState<Release[]>([]);
    const [loading, setLoading] = useState(true);
    const [promotions, setPromotions] = useState<Map<string, any>>(new Map());
    const [formatDialogOpen, setFormatDialogOpen] = useState(false);
    const [selectedReleaseForPromo, setSelectedReleaseForPromo] = useState<string | null>(null);
    const { user } = useAuth();
    const router = useRouter();

    const fetchReleases = async () => {
        try {
            setLoading(true);
            // Only show released or approved releases for promotion
            const response = await getReleases({
                userId: user?._id,
                // status: 'Released' // Maybe also Approved?
            });
            // Filter only Released ones for actual promotion link generation, 
            // but maybe let them design even if just Approved.
            const promoteable = response.releases.filter((r: Release) =>
                r.status === 'Released' || r.status === 'Approved'
            );
            setReleases(promoteable);

            // Fetch promotions for these releases
            const promoMap = new Map();
            await Promise.all(
                promoteable.map(async (release: Release) => {
                    try {
                        const promo = await getPromotionByReleaseId(release._id);
                        if (promo) {
                            promoMap.set(release._id, promo);
                        }
                    } catch (e) {
                        // No promotion
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
        if (user?._id) {
            fetchReleases();
        }
    }, [user?._id]);

    const handlePromoteClick = (releaseId: string) => {
        setSelectedReleaseForPromo(releaseId);
        setFormatDialogOpen(true);
    };

    const handleFormatSelect = (format: string) => {
        if (selectedReleaseForPromo) {
            router.push(`/dashboard/promotion/${selectedReleaseForPromo}?format=${format}`);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold mb-2">
                        Release <span className="animated-gradient">Promotion</span>
                    </h1>
                    <p className="text-muted-foreground">
                        Generate social media creatives and smart links for your music
                    </p>
                </div>

                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Music className="h-5 w-5" />
                            Promote Your Music
                        </CardTitle>
                        <CardDescription>
                            Select a release to start generating promotional content
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : releases.length === 0 ? (
                            <div className="text-center py-12">
                                <Music className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                                <p className="text-lg font-medium">No releases available for promotion</p>
                                <p className="text-sm text-muted-foreground">
                                    Your releases must be Approved or Released before you can promote them.
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
                                        {releases.map((release) => (
                                            <TableRow key={release._id}>
                                                <TableCell>
                                                    <div className="h-12 w-12 rounded-md overflow-hidden bg-muted">
                                                        {release.coverArt?.url ? (
                                                            <img
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
                                                                title="Copy promotion link"
                                                                className="text-green-500 border-green-500/20 hover:bg-green-500/10"
                                                                onClick={async () => {
                                                                    const promo = promotions.get(release._id);
                                                                    const url = `${window.location.origin}/p/${promo.slug}`;
                                                                    await navigator.clipboard.writeText(url);
                                                                    toast.success("Promotion link copied to clipboard!");
                                                                }}
                                                            >
                                                                <ExternalLink className="h-4 w-4 mr-1" />
                                                                Copy Link
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
            <FormatSelectionDialog
                open={formatDialogOpen}
                onClose={() => setFormatDialogOpen(false)}
                onSelect={handleFormatSelect}
            />
        </DashboardLayout>
    );
}

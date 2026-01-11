"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Resizable } from "re-resizable";
import toast from "react-hot-toast";
import {
    Loader2,
    ChevronLeft,
    Download,
    Save,
    Layout,
    Type,
    Image as ImageIcon,
    Plus,
    Trash2,
    Globe,
    Smartphone,
    Check,
    Eye,
    Instagram,
    Music,
    Share2,
    ExternalLink,
    Badge as BadgeIcon
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { ThumbnailPreview } from "@/components/dashboard/promotion/thumbnail-preview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getRelease, Release } from "@/lib/api/releases";
import { createOrUpdatePromotion, getPromotionByReleaseId, getPromoTemplates, seedPromoTemplates } from "@/lib/api/promotions";
import { toPng } from 'html-to-image';
import download from 'downloadjs';
import { getDisplayUrl } from "@/lib/api/s3";
import { PLATFORM_BADGES } from "@/config/platform-badges";
import { PromoTemplate, PromoElement } from "@/config/promo-templates";



const PLATFORMS = [
    { id: 'spotify', name: 'Spotify', color: '#1DB954' },
    { id: 'apple-music', name: 'Apple Music', color: '#FC3C44' },
    { id: 'youtube-music', name: 'YouTube Music', color: '#FF0000' },
    { id: 'instagram', name: 'Instagram', color: '#E1306C' },
    { id: 'amazon-music', name: 'Amazon Music', color: '#00A8E1' },
    { id: 'jiosaavn', name: 'JioSaavn', color: '#00B8F4' },
    { id: 'wynk', name: 'Wynk Music', color: '#E11B22' },
];

export default function PromotionEditorPage() {
    const params = useParams();
    const router = useRouter();
    const releaseId = params.id as string;

    const [release, setRelease] = useState<Release | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [templates, setTemplates] = useState<PromoTemplate[]>([]);
    const [activeTemplate, setActiveTemplate] = useState<PromoTemplate | null>(null);
    const [elementOverrides, setElementOverrides] = useState<Record<string, any>>({});
    const [selectedElement, setSelectedElement] = useState<string | null>(null);
    const [backgroundOverride, setBackgroundOverride] = useState<{
        imageUrl?: string;
        position?: { x: number; y: number };
        scale?: number;
        blur?: number;
    }>({ position: { x: 50, y: 50 }, scale: 1.1, blur: 0 });


    const [slug, setSlug] = useState("");
    const [streamingLinks, setStreamingLinks] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState("design");
    const [selectedFormat, setSelectedFormat] = useState<'story' | 'post'>('story');
    const [bgUrl, setBgUrl] = useState<string>("");
    const [coverUrl, setCoverUrl] = useState<string>("");
    const [resolvedOverrideUrl, setResolvedOverrideUrl] = useState<string>("");

    const previewRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const resolveImages = async () => {
            if (!activeTemplate) return;
            if (activeTemplate.background?.image) {
                const url = await getDisplayUrl(activeTemplate.background.image);
                setBgUrl(url);
            }
            if (release?.coverArt?.url) {
                const url = await getDisplayUrl(release.coverArt.url);
                setCoverUrl(url);
            }
            if (backgroundOverride.imageUrl) {
                const url = await getDisplayUrl(backgroundOverride.imageUrl);
                setResolvedOverrideUrl(url);
            } else {
                setResolvedOverrideUrl("");
            }
        };
        resolveImages();
    }, [activeTemplate, release, backgroundOverride.imageUrl]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch Release and Templates in parallel
                const [releaseData, fetchedTemplates] = await Promise.all([
                    getRelease(releaseId),
                    getPromoTemplates()
                ]);

                setRelease(releaseData);
                setTemplates(fetchedTemplates);
                setSlug(releaseData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'));

                const formatParam = searchParams.get('format');
                let currentTemplate = null;

                try {
                    const promo = await getPromotionByReleaseId(releaseId);
                    if (promo) {
                        setStreamingLinks(promo.streamingLinks || []);
                        setSlug(promo.slug);
                        if (promo.customization?.templateId) {
                            const found = fetchedTemplates.find((t: any) => t.id === promo.customization.templateId);
                            if (found) currentTemplate = found;
                        }
                        if (promo.customization?.elementOverrides) {
                            setElementOverrides(promo.customization.elementOverrides);
                        }
                        if (promo.customization?.backgroundOverride) {
                            console.log('innner')
                            setBackgroundOverride(promo.customization.backgroundOverride);
                        }
                    } else if (formatParam) {
                        // If no saved promo, respect the format from the initial selection dialog
                        currentTemplate = fetchedTemplates.find((t: any) => t.format === formatParam);
                    }
                } catch (e) {
                    // No promo yet or error, selective default below
                    if (formatParam) {
                        currentTemplate = fetchedTemplates.find((t: any) => t.format === formatParam);
                    }
                }

                if (!currentTemplate) {
                    currentTemplate = fetchedTemplates[0] || null;
                }

                // Ensure default badges are set if not present
                if (!elementOverrides.logo?.selectedBadges) {
                    setElementOverrides(prev => ({
                        ...prev,
                        logo: {
                            ...prev.logo,
                            selectedBadges: prev.logo?.selectedBadges || ['spotify', 'apple-music', 'youtube-music']
                        }
                    }));
                }

                setActiveTemplate(currentTemplate);
                if (currentTemplate?.format) {
                    setSelectedFormat(currentTemplate.format as 'story' | 'post');
                }

                // If elementOverrides (from saved promo or empty) doesn't have badges, set defaults
                setElementOverrides(prev => {
                    if (prev.logo?.selectedBadges && prev.logo.selectedBadges.length > 0) {
                        return prev;
                    }
                    return {
                        ...prev,
                        logo: {
                            ...prev.logo,
                            selectedBadges: ['spotify', 'apple-music', 'youtube-music']
                        }
                    };
                });
            } catch (error) {
                toast.error("Failed to load editor data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [releaseId]);

    // Handle format selection from URL
    const searchParams = useSearchParams();
    useEffect(() => {
        const format = searchParams.get('format');
        if (format && (format === 'story' || format === 'post')) {
            setSelectedFormat(format);

            // If we have templates but haven't set an active one that matches the format, 
            // and there's no saved template id, we could update it here.
            // But fetchData usually handles this. This is for late template loads.
            if (templates.length > 0 && !activeTemplate) {
                const match = templates.find(t => t.format === format);
                if (match) setActiveTemplate(match);
            }
        }
    }, [searchParams, templates]);

    const handleAddLink = (platformId: string) => {
        const platform = PLATFORMS.find(p => p.id === platformId);
        if (!platform) return;

        if (streamingLinks.some(l => l.platform === platform.name)) {
            toast.error("Platform already added");
            return;
        }

        setStreamingLinks([...streamingLinks, { platform: platform.name, url: "", isActive: true }]);
    };

    const handleRemoveLink = (index: number) => {
        setStreamingLinks(streamingLinks.filter((_, i) => i !== index));
    };

    const toggleBadge = (badgeId: string) => {
        const currentBadges = elementOverrides.logo?.selectedBadges || [];
        if (currentBadges.includes(badgeId)) {
            handleElementOverride('logo', { selectedBadges: currentBadges.filter((id: string) => id !== badgeId) });
        } else {
            if (currentBadges.length >= 4) {
                toast.error("Maximum 4 badges allowed");
                return;
            }
            handleElementOverride('logo', { selectedBadges: [...currentBadges, badgeId] });
        }
    };

    const handleResetLayout = () => {
        setElementOverrides({});
        toast.success("Design reset to default");
    };

    const handleElementOverride = (elementId: string, data: any) => {
        setElementOverrides(prev => ({
            ...prev,
            [elementId]: {
                ...(prev[elementId] || {}),
                ...data
            }
        }));
    };

    const handleSave = async () => {
        if (!activeTemplate) return;
        try {
            setSaving(true);
            await createOrUpdatePromotion({
                releaseId,
                slug,
                streamingLinks,
                customization: {
                    templateId: activeTemplate.id,
                    elementOverrides,
                    backgroundOverride
                }
            });

            // Copy landing page URL to clipboard
            const landingPageUrl = `${window.location.origin}/p/${slug}`;
            await navigator.clipboard.writeText(landingPageUrl);

            toast.success("Your landing page URL is copied to clipboard!");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to save promotion");
        } finally {
            setSaving(false);
        }
    };

    const handleDownload = async () => {
        if (!previewRef.current || !activeTemplate) return;

        try {
            const width = activeTemplate.canvas.width;
            const height = activeTemplate.canvas.height;

            const dataUrl = await toPng(previewRef.current, {
                quality: 0.95,
                width: width,
                height: height,
                style: {
                    transform: 'scale(1)',
                    transformOrigin: 'top left',
                    width: `${width}px`,
                    height: `${height}px`,
                },
                pixelRatio: 1,
                cacheBust: true,
            });
            download(dataUrl, `${release?.title}-${activeTemplate.id}.png`);
            toast.success("Image downloaded");
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate image");
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-[60vh]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.back()}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Promotion Editor</h1>
                            <p className="text-sm text-muted-foreground">{release?.title} - {release?.artistName}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleDownload} className="gap-2">
                            <Download className="h-4 w-4" />
                            Download Image
                        </Button>
                        <Button onClick={handleSave} disabled={saving} className="gap-2">
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Save Promotion
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Panel: Design Controls */}
                    <div className="lg:col-span-3 space-y-6">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="w-full mb-4">
                                <TabsTrigger value="design" className="flex-1">Design</TabsTrigger>
                                <TabsTrigger value="background" className="flex-1 text-[10px]">Background</TabsTrigger>
                                <TabsTrigger value="badges" className="flex-1">Badges</TabsTrigger>
                            </TabsList>

                            <TabsContent value="design" className="space-y-6">
                                <Card className="border-border/50 bg-card/50">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                                            <Layout className="h-4 w-4" />
                                            Templates
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {templates.filter(t => t.format === selectedFormat).length === 0 && (
                                            <div className="text-center py-4 space-y-2">
                                                <p className="text-xs text-muted-foreground">No {selectedFormat} templates found.</p>
                                                {templates.length === 0 && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={async () => {
                                                            try {
                                                                setLoading(true);
                                                                await seedPromoTemplates();
                                                                const fetched = await getPromoTemplates();
                                                                setTemplates(fetched);
                                                                if (fetched.length > 0) setActiveTemplate(fetched[0]);
                                                                toast.success("Templates seeded successfully");
                                                            } catch (e) {
                                                                toast.error("Failed to seed templates");
                                                            } finally {
                                                                setLoading(false);
                                                            }
                                                        }}
                                                    >
                                                        Seed Templates
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                        <div className="max-h-[400px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-primary/40 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent scrollbar-thin scrollbar-thumb-primary/40 scrollbar-track-transparent">
                                            <div className="grid grid-cols-2 gap-2">
                                                {templates.filter(t => t.format === selectedFormat).map((temp) => (
                                                    <button
                                                        key={temp.id}
                                                        onClick={() => {
                                                            setActiveTemplate(temp);
                                                            // handleResetLayout(); // Optional: Keep overrides or reset? Usually reset on template switch is safer for layout, but keeping text is nice.
                                                            // Let's keep specific reset call or user deciding.
                                                            // Usually switching template resets positions but keeps text.
                                                            // Current logic: handleResetLayout() resets everything including text overrides.
                                                            // Maybe better to just reset positions?
                                                            setElementOverrides(prev => {
                                                                // preserve text/badges, reset x/y/scale
                                                                const newOverrides: any = {};
                                                                Object.keys(prev).forEach(key => {
                                                                    if (prev[key].text) newOverrides[key] = { text: prev[key].text };
                                                                    if (prev[key].selectedBadges) newOverrides[key] = { selectedBadges: prev[key].selectedBadges };
                                                                });
                                                                return newOverrides;
                                                            });
                                                        }}
                                                        className={`p-2 rounded-lg border text-left transition-all ${activeTemplate?.id === temp.id
                                                            ? 'border-primary bg-primary/10'
                                                            : 'border-border hover:bg-accent'
                                                            }`}
                                                    >
                                                        <div
                                                            className="rounded mb-2 transition-transform hover:scale-105 relative overflow-hidden bg-black shadow-lg"
                                                            style={{
                                                                aspectRatio: `${temp.canvas.width}/${temp.canvas.height}`,
                                                                width: '100%'
                                                            }}
                                                        >
                                                            <ThumbnailPreview
                                                                template={temp}
                                                                release={release}
                                                                coverUrl={coverUrl}
                                                                backgroundOverride={backgroundOverride}
                                                                elementOverrides={elementOverrides}
                                                            />
                                                        </div>
                                                        <p className="text-[10px] font-bold uppercase truncate">{temp.name}</p>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full text-xs gap-2"
                                            onClick={handleResetLayout}
                                        >
                                            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
                                            Reset Custom Layout
                                        </Button>
                                    </CardContent>
                                </Card>

                                <Card className="border-border/50 bg-card/50">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                                            <Type className="h-4 w-4" />
                                            Custom Text
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs">Main Status (Header)</Label>
                                            <Input
                                                value={elementOverrides.header?.text || ""}
                                                onChange={(e) => handleElementOverride('header', { text: e.target.value })}
                                                placeholder="e.g. OUT NOW, TEASER..."
                                            />
                                        </div>
                                    </CardContent>
                                </Card>


                            </TabsContent>

                            <TabsContent value="background" className="space-y-4">
                                <Card className="border-border/50 bg-card/50">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                                            <ImageIcon className="h-4 w-4" />
                                            Background Settings
                                        </CardTitle>
                                        <CardDescription className="text-xs">
                                            Customize your background image and its position.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-3">
                                            <Label className="text-xs">Background Image</Label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <Button
                                                    variant={!backgroundOverride.imageUrl ? "default" : "outline"}
                                                    size="sm"
                                                    className="w-full text-[10px]"
                                                    onClick={() => setBackgroundOverride(prev => ({ ...prev, imageUrl: undefined }))}
                                                >
                                                    Template Default
                                                </Button>
                                                <Button
                                                    variant={backgroundOverride.imageUrl === release?.coverArt?.url ? "default" : "outline"}
                                                    size="sm"
                                                    className="w-full text-[10px]"
                                                    onClick={() => { console.log(release?.coverArt?.url), setBackgroundOverride(prev => ({ ...prev, imageUrl: release?.coverArt?.url })) }}
                                                >
                                                    Release Cover
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <Label className="text-xs">Horizontal Position ({backgroundOverride.position?.x || 50}%)</Label>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={backgroundOverride.position?.x || 50}
                                                onChange={(e) => setBackgroundOverride(prev => ({
                                                    ...prev,
                                                    position: { ...(prev.position || { x: 50, y: 50 }), x: parseInt(e.target.value) }
                                                }))}
                                                className="w-full h-1.5 bg-accent rounded-lg appearance-none cursor-pointer accent-primary"
                                            />

                                            <div className="flex justify-between items-center pt-2">
                                                <Label className="text-xs">Vertical Position ({backgroundOverride.position?.y || 50}%)</Label>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={backgroundOverride.position?.y || 50}
                                                onChange={(e) => setBackgroundOverride(prev => ({
                                                    ...prev,
                                                    position: { ...(prev.position || { x: 50, y: 50 }), y: parseInt(e.target.value) }
                                                }))}
                                                className="w-full h-1.5 bg-accent rounded-lg appearance-none cursor-pointer accent-primary"
                                            />

                                            <div className="flex justify-between items-center pt-2">
                                                <Label className="text-xs">Zoom ({backgroundOverride.scale ? backgroundOverride.scale.toFixed(1) : '1.1'}x)</Label>
                                            </div>
                                            <input
                                                type="range"
                                                min="1"
                                                max="3"
                                                step="0.1"
                                                value={backgroundOverride.scale || 1.1}
                                                onChange={(e) => setBackgroundOverride(prev => ({
                                                    ...prev,
                                                    scale: parseFloat(e.target.value)
                                                }))}
                                                className="w-full h-1.5 bg-accent rounded-lg appearance-none cursor-pointer accent-primary"
                                            />

                                            <div className="flex justify-between items-center pt-2">
                                                <Label className="text-xs">Blur ({backgroundOverride.blur !== undefined ? backgroundOverride.blur : 0}px)</Label>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="50"
                                                step="1"
                                                value={backgroundOverride.blur !== undefined ? backgroundOverride.blur : 0}
                                                onChange={(e) => setBackgroundOverride(prev => ({
                                                    ...prev,
                                                    blur: parseInt(e.target.value)
                                                }))}
                                                className="w-full h-1.5 bg-accent rounded-lg appearance-none cursor-pointer accent-primary"
                                            />
                                        </div>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full text-xs"
                                            onClick={() => setBackgroundOverride({ ...backgroundOverride, position: { x: 50, y: 50 }, scale: 1.1, blur: 0 })}
                                        >
                                            Reset Position & Zoom
                                        </Button>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="badges" className="space-y-4">
                                <Card className="border-border/50 bg-card/50">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                                            <BadgeIcon className="h-4 w-4" />
                                            Platform Badges
                                        </CardTitle>
                                        <CardDescription className="text-xs">
                                            Select badges to display.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 gap-2">
                                            {(() => {
                                                const logoElement = activeTemplate?.elements?.find(e => e.source === 'platform_logo');
                                                const allowedBadges = (logoElement?.allowed && logoElement.allowed.length > 0)
                                                    ? logoElement.allowed
                                                    : PLATFORM_BADGES.map(b => b.id);

                                                return allowedBadges.map((platformId) => {
                                                    const badge = PLATFORM_BADGES.find(b => b.id === platformId);
                                                    if (!badge) return null;
                                                    const isSelected = (elementOverrides?.logo?.selectedBadges || []).includes(badge.id);
                                                    return (
                                                        <button
                                                            key={badge.id}
                                                            onClick={() => toggleBadge(badge.id)}
                                                            className={`relative p-3 rounded-lg border flex flex-col items-center justify-center gap-2 transition-all h-24 ${isSelected
                                                                ? 'border-primary bg-primary/10 ring-1 ring-primary'
                                                                : 'border-border hover:bg-accent'
                                                                }`}
                                                        >
                                                            <div className="h-8 w-auto relative flex items-center justify-center">
                                                                <img
                                                                    src={badge.logoUrl}
                                                                    alt={badge.name}
                                                                    className="max-h-full max-w-full object-contain filter drop-shadow-sm invert dark:invert-0"
                                                                />
                                                            </div>
                                                            <span className="text-[10px] font-medium text-center truncate w-full">
                                                                {badge.name}
                                                            </span>
                                                            {isSelected && (
                                                                <div className="absolute top-1 right-1">
                                                                    <Check className="h-3 w-3 text-primary" />
                                                                </div>
                                                            )}
                                                        </button>
                                                    );
                                                });
                                            })()}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Center Panel: Preview */}
                    <div className="lg:col-span-5 flex flex-col items-center">
                        {activeTemplate ? (
                            <>
                                <div className="mb-4 flex items-center gap-2 text-xs font-medium text-muted-foreground bg-muted p-2 rounded-lg">
                                    <Smartphone className="h-3 w-3" />
                                    {activeTemplate.name} Preview ({activeTemplate.canvas.width}x{activeTemplate.canvas.height})
                                </div>

                                <div
                                    className="relative overflow-hidden shadow-2xl bg-black"
                                    style={{
                                        width: activeTemplate.canvas.width < activeTemplate.canvas.height ? '280px' : '400px',
                                        height: activeTemplate.canvas.width < activeTemplate.canvas.height
                                            ? '500px'
                                            : `${(400 * activeTemplate.canvas.height) / activeTemplate.canvas.width}px`,
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <div
                                        ref={previewRef}
                                        className="w-full h-full relative"
                                        style={{
                                            aspectRatio: `${activeTemplate.canvas.width}/${activeTemplate.canvas.height}`,
                                            width: `${activeTemplate.canvas.width}px`,
                                            height: `${activeTemplate.canvas.height}px`,
                                            transform: `scale(${activeTemplate.canvas.width < activeTemplate.canvas.height ? 280 / activeTemplate.canvas.width : 400 / activeTemplate.canvas.width})`,
                                            transformOrigin: 'top left'
                                        }}
                                    >
                                        {/* Background */}
                                        <div
                                            className="absolute inset-0 bg-cover opacity-60 overflow-hidden"
                                            style={{
                                                backgroundColor: '#000',
                                            }}
                                        >
                                            <div
                                                className="w-full h-full bg-cover"
                                                style={{
                                                    backgroundImage: (backgroundOverride.imageUrl === release?.coverArt?.url && coverUrl)
                                                        ? `url(${coverUrl})`
                                                        : (resolvedOverrideUrl ? `url(${resolvedOverrideUrl})` : (bgUrl ? `url(${bgUrl})` : (coverUrl ? `url(${coverUrl})` : 'none'))),
                                                    transform: `scale(${backgroundOverride.scale || 1.1}) translate(${(backgroundOverride.position?.x || 50) - 50}%, ${(backgroundOverride.position?.y || 50) - 50}%)`,
                                                    filter: `blur(${backgroundOverride.blur !== undefined ? backgroundOverride.blur : 0}px) brightness(0.7)`,
                                                    transition: 'transform 0.1s ease-out',
                                                    backgroundPosition: 'center',
                                                    width: '100%',
                                                    height: '100%'
                                                }}
                                            />
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />

                                        {/* Dynamic Elements */}
                                        <div
                                            className="relative z-10 w-full h-full"
                                            onClick={(e) => {
                                                if (e.target === e.currentTarget) {
                                                    setSelectedElement(null);
                                                }
                                            }}
                                        >
                                            <AnimatePresence mode="wait">
                                                {(() => {
                                                    // Helper to explode specific elements (like badges) into multiple renderable items
                                                    const getRenderableElements = () => {
                                                        const renderable: any[] = [];
                                                        activeTemplate.elements.forEach(element => {
                                                            if (element.type === 'image' && element.source === 'platform_logo') {
                                                                const selectedBadges = elementOverrides.logo?.selectedBadges || ['spotify', 'apple-music', 'youtube-music'];
                                                                const gap = 50;
                                                                const badgeBoxSize = 200;
                                                                const step = badgeBoxSize + gap;
                                                                const totalRowWidth = (selectedBadges.length * badgeBoxSize) + ((selectedBadges.length - 1) * gap);
                                                                const centerX = activeTemplate.canvas.width / 2;
                                                                // Start X is center minus half total width.
                                                                // Note: Position is usually top-left. So for the first item:
                                                                const startX = centerX - (totalRowWidth / 2);

                                                                selectedBadges.forEach((badgeId: string, index: number) => {
                                                                    renderable.push({
                                                                        ...element,
                                                                        id: `logo-${badgeId}`,
                                                                        source: 'platform_badge_single',
                                                                        badgeId: badgeId,
                                                                        size: { width: badgeBoxSize, height: badgeBoxSize }, // Fixed square box
                                                                        defaultX: startX + (index * step),
                                                                        defaultY: activeTemplate.canvas.height - 300 // slightly higher to fit 200px box
                                                                    });
                                                                });
                                                            } else {
                                                                renderable.push(element);
                                                            }
                                                        });
                                                        return renderable;
                                                    };

                                                    return getRenderableElements().map((element) => {
                                                        const override = elementOverrides[element.id] || {};

                                                        // Use exploded default position if available, otherwise template default
                                                        const defaultX = element.defaultX !== undefined ? element.defaultX : element.position.x;
                                                        const defaultY = element.defaultY !== undefined ? element.defaultY : element.position.y;

                                                        const x = defaultX + (override.x || 0);
                                                        const y = defaultY + (override.y || 0);

                                                        const width = override.sizeWidth || element.size?.width || 'auto';
                                                        const height = override.sizeHeight || element.size?.height || 'auto';
                                                        const isSelected = selectedElement === element.id;

                                                        const getTextContent = () => {
                                                            if (override.text) return override.text;
                                                            switch (element.source) {
                                                                case 'artist_name': return release?.artistName || "Artist Name";
                                                                case 'track_name': return release?.title || "Track Title";
                                                                case 'custom_text': return "OUT NOW";
                                                                default: return "";
                                                            }
                                                        };

                                                        return (
                                                            <motion.div
                                                                key={`${activeTemplate.id}-${element.id}`}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedElement(element.id);
                                                                }}
                                                                drag={element.source !== 'cover_art'}
                                                                dragMomentum={false}
                                                                dragElastic={0}
                                                                onDragEnd={(event, info) => {
                                                                    if (element.source === 'cover_art') return;

                                                                    const scale = activeTemplate.canvas.width < activeTemplate.canvas.height
                                                                        ? 280 / activeTemplate.canvas.width
                                                                        : 400 / activeTemplate.canvas.width;

                                                                    const deltaX = info.offset.x / scale;
                                                                    const deltaY = info.offset.y / scale;

                                                                    handleElementOverride(element.id, {
                                                                        x: (override.x || 0) + deltaX,
                                                                        y: (override.y || 0) + deltaY
                                                                    });
                                                                }}
                                                                style={{
                                                                    position: 'absolute',
                                                                    left: x,
                                                                    top: y,
                                                                    width: width,
                                                                    height: height,
                                                                    zIndex: isSelected ? 50 : 10,
                                                                    x: 0,
                                                                    y: 0
                                                                }}
                                                                initial={(() => {
                                                                    const type = element.animation?.mp4?.type;
                                                                    switch (type) {
                                                                        case 'slide_up': return { opacity: 0, y: 50 };
                                                                        case 'slide_down': return { opacity: 0, y: -50 };
                                                                        case 'zoom_in': return { opacity: 0, scale: 0.5 };
                                                                        case 'fade_in': return { opacity: 0 };
                                                                        default: return {};
                                                                    }
                                                                })()}
                                                                animate={(() => {
                                                                    const type = element.animation?.mp4?.type;
                                                                    switch (type) {
                                                                        case 'slide_up': return { opacity: 1, y: 0 };
                                                                        case 'slide_down': return { opacity: 1, y: 0 };
                                                                        case 'zoom_in': return { opacity: 1, scale: 1 };
                                                                        case 'fade_in': return { opacity: 1 };
                                                                        default: return {};
                                                                    }
                                                                })()}
                                                                transition={{
                                                                    delay: element.animation?.mp4?.start || 0,
                                                                    duration: element.animation?.mp4?.duration || 0.5,
                                                                    ease: "easeOut"
                                                                }}
                                                                className={`${element.source !== 'cover_art' ? 'cursor-move' : ''} group`}
                                                            >
                                                                <div className={`w-full h-full relative ${isSelected ? 'ring-4 ring-primary ring-offset-4' : 'group-hover:ring-2 group-hover:ring-white/40'}`}>
                                                                    {element.type === 'image' && element.source === 'cover_art' && (
                                                                        <img
                                                                            src={coverUrl}
                                                                            alt="Cover Art"
                                                                            className="w-full h-full object-cover shadow-2xl"
                                                                            style={{ borderRadius: element.radius || 0 }}
                                                                        />
                                                                    )}

                                                                    {element.source === 'platform_badge_single' && (
                                                                        <div
                                                                            className="flex justify-center items-center h-full"
                                                                            style={{
                                                                                transform: `scale(${override.scale || 1})`,
                                                                                transformOrigin: 'center'
                                                                            }}
                                                                        >
                                                                            {(() => {
                                                                                const badge = PLATFORM_BADGES.find(b => b.id === element.badgeId);
                                                                                if (!badge) return null;
                                                                                return (
                                                                                    <img
                                                                                        src={badge.logoUrl}
                                                                                        alt={badge.name}
                                                                                        className="h-24 w-auto object-contain filter drop-shadow-2xl"
                                                                                    />
                                                                                );
                                                                            })()}
                                                                        </div>
                                                                    )}

                                                                    {element.type === 'image' && element.source === 'platform_logo' && (
                                                                        <div
                                                                            className="flex flex-wrap gap-8 justify-center items-center h-full"
                                                                            style={{
                                                                                transform: `scale(${override.scale || 1})`,
                                                                                transformOrigin: 'center'
                                                                            }}
                                                                        >
                                                                            {(override.selectedBadges || []).map((badgeId: string) => {
                                                                                const badge = PLATFORM_BADGES.find(b => b.id === badgeId);
                                                                                if (!badge) return null;
                                                                                return (
                                                                                    <img
                                                                                        key={badgeId}
                                                                                        src={badge.logoUrl}
                                                                                        alt={badge.name}
                                                                                        className="h-20 w-auto object-contain filter drop-shadow-2xl"
                                                                                    />
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    )}

                                                                    {element.type === 'text' && (
                                                                        <div
                                                                            className="w-full h-full flex items-center justify-center p-4"
                                                                            style={{
                                                                                color: element.style?.color || '#fff',
                                                                                fontSize: `${element.style?.size || 16}px`,
                                                                                textAlign: (element.style?.align as any) || 'center',
                                                                                fontFamily: 'Inter, sans-serif',
                                                                                fontWeight: element.style?.font?.includes('Bold') ? 900 : 400,
                                                                                textTransform: 'uppercase',
                                                                                textShadow: '0 8px 24px rgba(0,0,0,0.8)'
                                                                            }}
                                                                        >
                                                                            {getTextContent()}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </motion.div>
                                                        );
                                                    })
                                                })()}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                </div>

                                <p className="mt-4 text-[10px] text-muted-foreground flex items-center gap-1 italic">
                                    <Eye className="h-3 w-3" /> Note: This is a low-res preview. Downloaded image will be high-res.
                                </p>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[500px] border-2 border-dashed border-border rounded-xl bg-muted/20">
                                <Layout className="h-8 w-8 text-muted-foreground mb-2" />
                                <p className="text-sm text-muted-foreground">Select a template to start</p>
                            </div>
                        )}
                    </div>

                    {/* Right Panel: Smart Link & Platforms */}
                    <div className="lg:col-span-4 space-y-6">
                        <Card className="border-border/50 bg-card/50">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <Globe className="h-4 w-4" />
                                    Landing Page Settings
                                </CardTitle>
                                <CardDescription className="text-[10px]">
                                    Customize your public smart link
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-xs">Custom URL Slug</Label>
                                    <div className="flex gap-1 items-center">
                                        <span className="text-xs text-muted-foreground">/p/</span>
                                        <Input
                                            value={slug}
                                            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}
                                            className="h-8 text-xs"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs">Streaming Platforms</Label>
                                        <div className="flex flex-wrap gap-1 justify-end">
                                            {PLATFORMS.map(p => (
                                                <button
                                                    key={p.id}
                                                    onClick={() => handleAddLink(p.id)}
                                                    className="h-6 w-6 flex items-center justify-center rounded-full bg-accent hover:bg-primary hover:text-white transition-colors"
                                                    title={`Add ${p.name}`}
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                        {streamingLinks.length === 0 ? (
                                            <div className="text-center py-6 border-2 border-dashed border-border rounded-lg">
                                                <p className="text-[10px] text-muted-foreground">No platforms added yet</p>
                                            </div>
                                        ) : (
                                            streamingLinks.map((link, idx) => (
                                                <div key={idx} className="flex gap-2 items-end p-3 rounded-lg bg-background/50 border border-border">
                                                    <div className="flex-1 space-y-1">
                                                        <Label className="text-[10px] font-bold text-primary">{link.platform}</Label>
                                                        <Input
                                                            value={link.url}
                                                            onChange={(e) => {
                                                                const newLinks = [...streamingLinks];
                                                                newLinks[idx].url = e.target.value;
                                                                setStreamingLinks(newLinks);
                                                            }}
                                                            placeholder="Paste platform URL here..."
                                                            className="h-7 text-[10px]"
                                                        />
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-red-400 hover:text-red-500 hover:bg-red-500/10"
                                                        onClick={() => handleRemoveLink(idx)}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {streamingLinks.length > 0 && (
                                    <Button
                                        variant="outline"
                                        className="w-full text-xs h-8 gap-2"
                                        onClick={() => {
                                            const url = `${window.location.origin}/p/${slug}`;
                                            window.open(url, '_blank');
                                        }}
                                    >
                                        <ExternalLink className="h-3 w-3" />
                                        Preview Landing Page
                                    </Button>
                                )}
                            </CardContent>
                        </Card>

                        {selectedElement && activeTemplate?.elements?.find(e => {
                            if (selectedElement.startsWith('logo-')) return e.source === 'platform_logo';
                            return e.id === selectedElement;
                        })?.source !== 'cover_art' && (
                                <Card className="border-border/50 bg-card/50 border-l-4 border-l-primary/50">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                            {(() => {
                                                if (selectedElement.startsWith('logo-')) {
                                                    const badgeId = selectedElement.replace('logo-', '');
                                                    const badge = PLATFORM_BADGES.find(b => b.id === badgeId);
                                                    return `${badge?.name || 'Badge'} Position`;
                                                }
                                                const el = activeTemplate?.elements.find(e => e.id === selectedElement);
                                                return `Adjust ${el?.source === 'artist_name' ? 'Artist Name' : (el?.source === 'track_name' ? 'Track Title' : 'Element')}`;
                                            })()}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <Label className="text-xs">Horizontal Position (X)</Label>
                                            </div>
                                            <input
                                                type="range"
                                                min="-500"
                                                max="500"
                                                value={elementOverrides[selectedElement]?.x || 0}
                                                onChange={(e) => handleElementOverride(selectedElement, { x: parseInt(e.target.value) })}
                                                className="w-full h-1.5 bg-accent rounded-lg appearance-none cursor-pointer accent-primary"
                                            />

                                            <div className="flex justify-between items-center pt-2">
                                                <Label className="text-xs">Vertical Position (Y)</Label>
                                            </div>
                                            <input
                                                type="range"
                                                min="-500"
                                                max="500"
                                                value={elementOverrides[selectedElement]?.y || 0}
                                                onChange={(e) => handleElementOverride(selectedElement, { y: parseInt(e.target.value) })}
                                                className="w-full h-1.5 bg-accent rounded-lg appearance-none cursor-pointer accent-primary"
                                            />

                                            <div className="flex justify-between items-center pt-2">
                                                <Label className="text-xs">Size Scale ({(elementOverrides[selectedElement]?.scale || 1).toFixed(1)}x)</Label>
                                            </div>
                                            <input
                                                type="range"
                                                min="0.1"
                                                max="5"
                                                step="0.1"
                                                value={elementOverrides[selectedElement]?.scale || 1}
                                                onChange={(e) => handleElementOverride(selectedElement, { scale: parseFloat(e.target.value) })}
                                                className="w-full h-1.5 bg-accent rounded-lg appearance-none cursor-pointer accent-primary"
                                            />
                                        </div>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full text-xs"
                                            onClick={() => handleElementOverride(selectedElement, { x: 0, y: 0, scale: 1 })}
                                        >
                                            Reset Element
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}
                    </div>
                </div>
            </div >
        </DashboardLayout >
    );
}

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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getRelease, Release } from "@/lib/api/releases";
import { createOrUpdatePromotion, getPromotionByReleaseId } from "@/lib/api/promotions";
import { toPng } from 'html-to-image';
import download from 'downloadjs';
import { PLATFORM_BADGES } from "@/config/platform-badges";

type DesignType = 'Story' | 'Post';
type DesignTheme = 'Teaser' | 'Launch';

interface Template {
    id: string;
    name: string;
    type: DesignType;
    theme: DesignTheme;
    previewColor: string;
}

const templates: Template[] = [
    { id: 'story-teaser-1', name: 'Story Teaser', type: 'Story', theme: 'Teaser', previewColor: '#FF4B2B' },
    { id: 'story-launch-1', name: 'Story Launch', type: 'Story', theme: 'Launch', previewColor: '#6A11CB' },
    { id: 'post-teaser-1', name: 'Post Teaser', type: 'Post', theme: 'Teaser', previewColor: '#2575FC' },
    { id: 'post-launch-1', name: 'Post Launch', type: 'Post', theme: 'Launch', previewColor: '#F093FB' },
];

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

    const [activeTemplate, setActiveTemplate] = useState<Template>(templates[0]);
    const [streamingLinks, setStreamingLinks] = useState<any[]>([]);
    const [slug, setSlug] = useState("");
    const [customText, setCustomText] = useState("");
    const [selectedBadges, setSelectedBadges] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState("design");
    const [elementPositions, setElementPositions] = useState<Record<string, { x: number, y: number }>>({
        header: { x: 0, y: 0 },
        artwork: { x: 0, y: 0 },
        info: { x: 0, y: 0 },
        badges: { x: 0, y: 0 }
    });
    const [elementSizes, setElementSizes] = useState<Record<string, { width: number | string, height: number | string }>>({
        header: { width: '100%', height: 'auto' },
        artwork: { width: 600, height: 600 },
        info: { width: '100%', height: 'auto' },
        badges: { width: '100%', height: 'auto' }
    });
    const [selectedElement, setSelectedElement] = useState<string | null>(null);


    const previewRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const releaseData = await getRelease(releaseId);
                setRelease(releaseData);
                setSlug(releaseData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                setCustomText(`NEW ${releaseData.releaseType === 'single' ? 'SINGLE' : 'RELEASE'} OUT NOW`);

                try {
                    const promo = await getPromotionByReleaseId(releaseId);
                    if (promo) {
                        setStreamingLinks(promo.streamingLinks || []);
                        setSlug(promo.slug);
                        if (promo.customization?.text) setCustomText(promo.customization.text);
                        if (promo.customization?.selectedBadges) setSelectedBadges(promo.customization.selectedBadges);
                        if (promo.customization?.layout) {
                            setElementPositions(promo.customization.layout);
                        }
                        if (promo.customization?.sizes) {
                            setElementSizes(promo.customization.sizes);
                        }
                    }
                } catch (e) {
                    // No promo yet, ignore
                }
            } catch (error) {
                toast.error("Failed to load release data");
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
        if (format) {
            let selectedTemplate = templates[0];
            if (format === 'story') {
                selectedTemplate = templates.find(t => t.type === 'Story') || templates[0];
            } else if (format === 'post') {
                selectedTemplate = templates.find(t => t.type === 'Post') || templates[0];
            } else if (format === 'reel') {
                // Reel uses same format as Story (9:16)
                selectedTemplate = templates.find(t => t.type === 'Story') || templates[0];
            }
            setActiveTemplate(selectedTemplate);
        }
    }, [searchParams]);

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
        if (selectedBadges.includes(badgeId)) {
            setSelectedBadges(selectedBadges.filter(id => id !== badgeId));
        } else {
            if (selectedBadges.length >= 4) {
                toast.error("Maximum 4 badges allowed");
                return;
            }
            setSelectedBadges([...selectedBadges, badgeId]);
        }
    };

    const handleResetLayout = () => {
        setElementPositions({
            header: { x: 0, y: 0 },
            artwork: { x: 0, y: 0 },
            info: { x: 0, y: 0 },
            badges: { x: 0, y: 0 }
        });
        setElementSizes({
            header: { width: '100%', height: 'auto' },
            artwork: { width: 600, height: 600 },
            info: { width: '100%', height: 'auto' },
            badges: { width: '100%', height: 'auto' }
        });
        toast.success("Layout and sizes reset to default");
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await createOrUpdatePromotion({
                releaseId,
                slug,
                streamingLinks,
                customization: {
                    text: customText,
                    lastTemplateId: activeTemplate.id,
                    selectedBadges,
                    layout: elementPositions,
                    sizes: elementSizes
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
        if (!previewRef.current) return;

        try {
            const width = activeTemplate.type === 'Story' ? 1080 : 1080;
            const height = activeTemplate.type === 'Story' ? 1920 : 1080;

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
                pixelRatio: 1, // Ensure 1:1 mapping with the explicit width/height
                cacheBust: true,
            });
            download(dataUrl, `${release?.title}-${activeTemplate.type}-${activeTemplate.theme}.png`);
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
                                        <div className="grid grid-cols-2 gap-2">
                                            {templates.map((temp) => (
                                                <button
                                                    key={temp.id}
                                                    onClick={() => {
                                                        setActiveTemplate(temp);
                                                        handleResetLayout();
                                                    }}
                                                    className={`p-2 rounded-lg border text-left transition-all ${activeTemplate.id === temp.id
                                                        ? 'border-primary bg-primary/10'
                                                        : 'border-border hover:bg-accent'
                                                        }`}
                                                >
                                                    <div
                                                        className="h-16 rounded mb-2 transition-transform hover:scale-105"
                                                        style={{ background: `linear-gradient(45deg, ${temp.previewColor}, #000)` }}
                                                    />
                                                    <p className="text-[10px] font-bold uppercase">{temp.theme}</p>
                                                    <p className="text-[10px] text-muted-foreground">{temp.type}</p>
                                                </button>
                                            ))}
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
                                    <CardContent>
                                        <Input
                                            value={customText}
                                            onChange={(e) => setCustomText(e.target.value)}
                                            placeholder="Enter custom text..."
                                        />
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
                                            Select up to 4 badges to display on your creative.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 gap-2">
                                            {PLATFORM_BADGES.map((badge) => {
                                                const isSelected = selectedBadges.includes(badge.id);
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
                                                                onError={(e) => {
                                                                    const target = e.target as HTMLImageElement;
                                                                    target.style.display = 'none';
                                                                    const parent = target.parentElement;
                                                                    if (parent && !parent.querySelector('.fallback-text')) {
                                                                        const fallback = document.createElement('div');
                                                                        fallback.className = 'fallback-text font-bold text-primary';
                                                                        fallback.style.cssText = `color: ${(badge as any).color || '#7c3aed'}`;
                                                                        fallback.textContent = (badge as any).fallbackText || badge.name.substring(0, 2).toUpperCase();
                                                                        parent.appendChild(fallback);
                                                                    }
                                                                }}
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
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Center Panel: Preview */}
                    <div className="lg:col-span-5 flex flex-col items-center">
                        <div className="mb-4 flex items-center gap-2 text-xs font-medium text-muted-foreground bg-muted p-2 rounded-lg">
                            <Smartphone className="h-3 w-3" />
                            {activeTemplate.type} Preview ({activeTemplate.type === 'Story' ? '1080x1920' : '1080x1080'})
                        </div>

                        <div
                            className={`relative overflow-hidden shadow-2xl bg-black ${activeTemplate.type === 'Story' ? 'w-[280px] h-[500px]' : 'w-[350px] h-[350px]'
                                }`}
                        >
                            <div
                                ref={previewRef}
                                className="w-full h-full relative"
                                style={{
                                    aspectRatio: activeTemplate.type === 'Story' ? '9/16' : '1/1',
                                    width: activeTemplate.type === 'Story' ? '1080px' : '1080px',
                                    height: activeTemplate.type === 'Story' ? '1920px' : '1080px',
                                    transform: `scale(${activeTemplate.type === 'Story' ? 280 / 1080 : 350 / 1080})`,
                                    transformOrigin: 'top left'
                                }}
                            >
                                {/* Background: Blurred Cover Art */}
                                <div
                                    className="absolute inset-0 bg-cover bg-center blur-2xl opacity-60 scale-110"
                                    style={{ backgroundImage: `url(${release?.coverArt?.url})` }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />

                                {/* Content */}
                                <div
                                    className="relative z-10 w-full h-full flex flex-col items-center justify-center gap-8 p-12 text-center"
                                    onClick={(e) => {
                                        if (e.target === e.currentTarget) {
                                            setSelectedElement(null);
                                        }
                                    }}
                                >
                                    {/* Top Section: OUT NOW */}
                                    <motion.div
                                        drag
                                        dragMomentum={false}
                                        onDragEnd={(_, info) => {
                                            setElementPositions(prev => ({
                                                ...prev,
                                                header: { x: prev.header.x + info.offset.x, y: prev.header.y + info.offset.y }
                                            }));
                                        }}
                                        onClick={() => setSelectedElement('header')}
                                        style={{ x: elementPositions.header.x, y: elementPositions.header.y }}
                                        className="cursor-move active:scale-95 transition-transform"
                                    >
                                        <Resizable
                                            size={{ width: elementSizes.header.width, height: elementSizes.header.height }}
                                            onResizeStop={(e, direction, ref, d) => {
                                                setElementSizes(prev => ({
                                                    ...prev,
                                                    header: {
                                                        width: ref.style.width,
                                                        height: ref.style.height
                                                    }
                                                }));
                                            }}
                                            enable={selectedElement === 'header' ? {
                                                top: false,
                                                right: true,
                                                bottom: true,
                                                left: true,
                                                topRight: false,
                                                bottomRight: true,
                                                bottomLeft: true,
                                                topLeft: false
                                            } : false}
                                            handleStyles={selectedElement === 'header' ? {
                                                right: { width: '8px', right: '-4px', cursor: 'ew-resize', backgroundColor: 'rgba(59, 130, 246, 0.5)', border: '2px solid rgba(59, 130, 246, 0.8)' },
                                                bottom: { height: '8px', bottom: '-4px', cursor: 'ns-resize', backgroundColor: 'rgba(59, 130, 246, 0.5)', border: '2px solid rgba(59, 130, 246, 0.8)' },
                                                bottomRight: { width: '14px', height: '14px', right: '-7px', bottom: '-7px', cursor: 'nwse-resize', backgroundColor: 'rgba(59, 130, 246, 0.8)', border: '2px solid rgba(59, 130, 246, 1)', borderRadius: '50%' },
                                                left: { width: '8px', left: '-4px', cursor: 'ew-resize', backgroundColor: 'rgba(59, 130, 246, 0.5)', border: '2px solid rgba(59, 130, 246, 0.8)' },
                                                bottomLeft: { width: '14px', height: '14px', left: '-7px', bottom: '-7px', cursor: 'nesw-resize', backgroundColor: 'rgba(59, 130, 246, 0.8)', border: '2px solid rgba(59, 130, 246, 1)', borderRadius: '50%' }
                                            } : {}}
                                            style={{
                                                border: selectedElement === 'header' ? '2px dashed rgba(59, 130, 246, 0.8)' : '2px dashed transparent',
                                                transition: 'border-color 0.2s'
                                            }}
                                        >
                                            <div className="w-full h-full space-y-1">
                                                <h1 className="text-white text-7xl font-black uppercase tracking-tight" style={{
                                                    textShadow: '0 0 20px rgba(0,0,0,0.8), 0 0 40px rgba(0,0,0,0.5)'
                                                }}>
                                                    {customText || "OUT NOW"}
                                                </h1>
                                                <p className="text-white/90 text-xl font-medium tracking-wide">
                                                    Distributed by <span className="font-bold text-primary">KRATOLIB</span>
                                                </p>
                                            </div>
                                        </Resizable>
                                    </motion.div>


                                    {/* Middle Section: Cover Art */}
                                    <motion.div
                                        drag
                                        dragMomentum={false}
                                        onDragEnd={(_, info) => {
                                            setElementPositions(prev => ({
                                                ...prev,
                                                artwork: { x: prev.artwork.x + info.offset.x, y: prev.artwork.y + info.offset.y }
                                            }));
                                        }}
                                        onClick={() => setSelectedElement('artwork')}
                                        style={{ x: elementPositions.artwork.x, y: elementPositions.artwork.y }}
                                        className="cursor-move active:scale-95 transition-transform"
                                    >
                                        <Resizable
                                            size={{ width: elementSizes.artwork.width, height: elementSizes.artwork.height }}
                                            onResizeStop={(e, direction, ref, d) => {
                                                const newWidth = parseInt(ref.style.width);
                                                setElementSizes(prev => ({
                                                    ...prev,
                                                    artwork: {
                                                        width: newWidth,
                                                        height: newWidth // Keep aspect ratio 1:1
                                                    }
                                                }));
                                            }}
                                            lockAspectRatio={true}
                                            enable={selectedElement === 'artwork' ? {
                                                top: true,
                                                right: true,
                                                bottom: true,
                                                left: true,
                                                topRight: true,
                                                bottomRight: true,
                                                bottomLeft: true,
                                                topLeft: true
                                            } : false}
                                            handleStyles={selectedElement === 'artwork' ? {
                                                top: { height: '8px', top: '-4px', cursor: 'ns-resize', backgroundColor: 'rgba(59, 130, 246, 0.5)', border: '2px solid rgba(59, 130, 246, 0.8)' },
                                                right: { width: '8px', right: '-4px', cursor: 'ew-resize', backgroundColor: 'rgba(59, 130, 246, 0.5)', border: '2px solid rgba(59, 130, 246, 0.8)' },
                                                bottom: { height: '8px', bottom: '-4px', cursor: 'ns-resize', backgroundColor: 'rgba(59, 130, 246, 0.5)', border: '2px solid rgba(59, 130, 246, 0.8)' },
                                                left: { width: '8px', left: '-4px', cursor: 'ew-resize', backgroundColor: 'rgba(59, 130, 246, 0.5)', border: '2px solid rgba(59, 130, 246, 0.8)' },
                                                topRight: { width: '14px', height: '14px', right: '-7px', top: '-7px', cursor: 'nesw-resize', backgroundColor: 'rgba(59, 130, 246, 0.8)', border: '2px solid rgba(59, 130, 246, 1)', borderRadius: '50%' },
                                                bottomRight: { width: '14px', height: '14px', right: '-7px', bottom: '-7px', cursor: 'nwse-resize', backgroundColor: 'rgba(59, 130, 246, 0.8)', border: '2px solid rgba(59, 130, 246, 1)', borderRadius: '50%' },
                                                bottomLeft: { width: '14px', height: '14px', left: '-7px', bottom: '-7px', cursor: 'nesw-resize', backgroundColor: 'rgba(59, 130, 246, 0.8)', border: '2px solid rgba(59, 130, 246, 1)', borderRadius: '50%' },
                                                topLeft: { width: '14px', height: '14px', left: '-7px', top: '-7px', cursor: 'nwse-resize', backgroundColor: 'rgba(59, 130, 246, 0.8)', border: '2px solid rgba(59, 130, 246, 1)', borderRadius: '50%' }
                                            } : {}}
                                            style={{
                                                border: selectedElement === 'artwork' ? '2px dashed rgba(59, 130, 246, 0.8)' : '2px dashed transparent',
                                                transition: 'border-color 0.2s'
                                            }}
                                        >
                                            <div className="relative w-full h-full shadow-[0_0_80px_rgba(0,0,0,0.6)] rounded-lg overflow-hidden border-4 border-white/10">
                                                <img
                                                    src={release?.coverArt?.url}
                                                    alt="Cover Art"
                                                    className="w-full h-full object-cover pointer-events-none"
                                                />
                                            </div>
                                        </Resizable>
                                    </motion.div>


                                    {/* Bottom Section: Artist Info + Available On */}
                                    <div className="w-full space-y-4">
                                        {/* Artist and Title */}
                                        <motion.div
                                            drag
                                            dragMomentum={false}
                                            onDragEnd={(_, info) => {
                                                setElementPositions(prev => ({
                                                    ...prev,
                                                    info: { x: prev.info.x + info.offset.x, y: prev.info.y + info.offset.y }
                                                }));
                                            }}
                                            onClick={() => setSelectedElement('info')}
                                            style={{ x: elementPositions.info.x, y: elementPositions.info.y }}
                                            className="cursor-move active:scale-95 transition-transform"
                                        >
                                            <Resizable
                                                size={{ width: elementSizes.info.width, height: elementSizes.info.height }}
                                                onResizeStop={(e, direction, ref, d) => {
                                                    setElementSizes(prev => ({
                                                        ...prev,
                                                        info: {
                                                            width: ref.style.width,
                                                            height: ref.style.height
                                                        }
                                                    }));
                                                }}
                                                enable={selectedElement === 'info' ? {
                                                    top: false,
                                                    right: true,
                                                    bottom: true,
                                                    left: true,
                                                    topRight: false,
                                                    bottomRight: true,
                                                    bottomLeft: true,
                                                    topLeft: false
                                                } : false}
                                                handleStyles={selectedElement === 'info' ? {
                                                    right: { width: '8px', right: '-4px', cursor: 'ew-resize', backgroundColor: 'rgba(59, 130, 246, 0.5)', border: '2px solid rgba(59, 130, 246, 0.8)' },
                                                    bottom: { height: '8px', bottom: '-4px', cursor: 'ns-resize', backgroundColor: 'rgba(59, 130, 246, 0.5)', border: '2px solid rgba(59, 130, 246, 0.8)' },
                                                    bottomRight: { width: '14px', height: '14px', right: '-7px', bottom: '-7px', cursor: 'nwse-resize', backgroundColor: 'rgba(59, 130, 246, 0.8)', border: '2px solid rgba(59, 130, 246, 1)', borderRadius: '50%' },
                                                    left: { width: '8px', left: '-4px', cursor: 'ew-resize', backgroundColor: 'rgba(59, 130, 246, 0.5)', border: '2px solid rgba(59, 130, 246, 0.8)' },
                                                    bottomLeft: { width: '14px', height: '14px', left: '-7px', bottom: '-7px', cursor: 'nesw-resize', backgroundColor: 'rgba(59, 130, 246, 0.8)', border: '2px solid rgba(59, 130, 246, 1)', borderRadius: '50%' }
                                                } : {}}
                                                style={{
                                                    border: selectedElement === 'info' ? '2px dashed rgba(59, 130, 246, 0.8)' : '2px dashed transparent',
                                                    transition: 'border-color 0.2s'
                                                }}
                                            >
                                                <div className="w-full h-full space-y-1">
                                                    <h2 className="text-white text-4xl font-black uppercase tracking-tight leading-tight">
                                                        {release?.title}
                                                    </h2>
                                                    <h3 className="text-white/80 text-2xl font-medium">
                                                        {release?.artistName}
                                                    </h3>
                                                </div>
                                            </Resizable>
                                        </motion.div>

                                        {/* Platform Badges */}
                                        {selectedBadges.length > 0 && (
                                            <motion.div
                                                drag
                                                dragMomentum={false}
                                                onDragEnd={(_, info) => {
                                                    setElementPositions(prev => ({
                                                        ...prev,
                                                        badges: { x: prev.badges.x + info.offset.x, y: prev.badges.y + info.offset.y }
                                                    }));
                                                }}
                                                onClick={() => setSelectedElement('badges')}
                                                style={{ x: elementPositions.badges.x, y: elementPositions.badges.y }}
                                                className="cursor-move active:scale-95 transition-transform"
                                            >
                                                <Resizable
                                                    size={{ width: elementSizes.badges.width, height: elementSizes.badges.height }}
                                                    onResizeStop={(e, direction, ref, d) => {
                                                        setElementSizes(prev => ({
                                                            ...prev,
                                                            badges: {
                                                                width: ref.style.width,
                                                                height: ref.style.height
                                                            }
                                                        }));
                                                    }}
                                                    enable={selectedElement === 'badges' ? {
                                                        top: false,
                                                        right: true,
                                                        bottom: true,
                                                        left: true,
                                                        topRight: false,
                                                        bottomRight: true,
                                                        bottomLeft: true,
                                                        topLeft: false
                                                    } : false}
                                                    handleStyles={selectedElement === 'badges' ? {
                                                        right: { width: '8px', right: '-4px', cursor: 'ew-resize', backgroundColor: 'rgba(59, 130, 246, 0.5)', border: '2px solid rgba(59, 130, 246, 0.8)' },
                                                        bottom: { height: '8px', bottom: '-4px', cursor: 'ns-resize', backgroundColor: 'rgba(59, 130, 246, 0.5)', border: '2px solid rgba(59, 130, 246, 0.8)' },
                                                        bottomRight: { width: '14px', height: '14px', right: '-7px', bottom: '-7px', cursor: 'nwse-resize', backgroundColor: 'rgba(59, 130, 246, 0.8)', border: '2px solid rgba(59, 130, 246, 1)', borderRadius: '50%' },
                                                        left: { width: '8px', left: '-4px', cursor: 'ew-resize', backgroundColor: 'rgba(59, 130, 246, 0.5)', border: '2px solid rgba(59, 130, 246, 0.8)' },
                                                        bottomLeft: { width: '14px', height: '14px', left: '-7px', bottom: '-7px', cursor: 'nesw-resize', backgroundColor: 'rgba(59, 130, 246, 0.8)', border: '2px solid rgba(59, 130, 246, 1)', borderRadius: '50%' }
                                                    } : {}}
                                                    style={{
                                                        border: selectedElement === 'badges' ? '2px dashed rgba(59, 130, 246, 0.8)' : '2px dashed transparent',
                                                        transition: 'border-color 0.2s'
                                                    }}
                                                >
                                                    <div className="w-full h-full space-y-2">
                                                        <p className="text-white/70 text-xl font-bold uppercase tracking-widest pointer-events-none">
                                                            Available on:
                                                        </p>
                                                        <div className="flex justify-center gap-6 flex-wrap pointer-events-none">
                                                            {selectedBadges.map((badgeId) => {
                                                                const badge = PLATFORM_BADGES.find(b => b.id === badgeId);
                                                                if (!badge) return null;
                                                                return (
                                                                    <div key={badgeId} className="h-12 w-auto flex items-center justify-center">
                                                                        <img
                                                                            src={badge.logoUrl}
                                                                            alt={badge.name}
                                                                            className="h-full w-auto object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                                                                        />
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </Resizable>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <p className="mt-4 text-[10px] text-muted-foreground flex items-center gap-1 italic">
                            <Eye className="h-3 w-3" /> Note: This is a low-res preview. Downloaded image will be high-res.
                        </p>
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
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

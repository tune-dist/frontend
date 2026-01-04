"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Music, ExternalLink, Play, Disc, Share2 } from "lucide-react";
import { getPublicPromotionBySlug, getPromoTemplates } from "@/lib/api/promotions";
import { PLATFORM_BADGES } from "@/config/platform-badges";
import { PROMO_TEMPLATES } from "@/config/promo-templates";
import { getDisplayUrl } from "@/lib/api/s3";

export default function PublicPromotionPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [data, setData] = useState<any>(null);
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cardWidth, setCardWidth] = useState(448);
    const [bgUrl, setBgUrl] = useState<string>("");
    const [coverUrl, setCoverUrl] = useState<string>("");
    const [overrideUrl, setOverrideUrl] = useState<string>("");
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch both promo and templates in parallel
                const [promo, fetchedTemplates] = await Promise.all([
                    getPublicPromotionBySlug(slug),
                    getPromoTemplates()
                ]);

                console.log('Fetched Promotion Data:', promo);
                console.log('Fetched Templates:', fetchedTemplates);

                setData(promo);
                setTemplates(fetchedTemplates);

                // 1. Resolve Cover Art
                if (promo.releaseId?.coverArt?.url) {
                    try {
                        const url = await getDisplayUrl(promo.releaseId.coverArt.url);
                        setCoverUrl(url);
                    } catch (e) {
                        console.error('Failed to resolve cover art:', e);
                    }
                }

                // 2. Resolve Template Background
                const templateId = promo.customization?.templateId;
                // Use fetched templates from DB, fallback to local if needed (though DB is priority)
                const currentTemplates = fetchedTemplates.length > 0 ? fetchedTemplates : PROMO_TEMPLATES;
                const template = currentTemplates.find((t: any) => t.id === templateId) || currentTemplates[0];

                console.log('Active Template from DB:', template?.id);

                if (template?.background?.image) {
                    try {
                        const url = await getDisplayUrl(template.background.image);
                        console.log('Resolved Template BG from DB path:', url);
                        setBgUrl(url);
                    } catch (e) {
                        console.error('Failed to resolve template bg:', e);
                    }
                }

                // 3. Resolve Override Background
                if (promo.customization?.backgroundOverride?.imageUrl) {
                    try {
                        const url = await getDisplayUrl(promo.customization.backgroundOverride.imageUrl);
                        setOverrideUrl(url);
                    } catch (e) {
                        console.error('Failed to resolve override bg:', e);
                    }
                }

            } catch (err: any) {
                console.error('Fetch error:', err);
                setError(err.response?.status === 404 ? "Page not found" : "Something went wrong");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [slug]);

    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                setCardWidth(containerRef.current.offsetWidth);
            }
        };
        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, [data, templates]); // Depend on templates for correct initial calculation

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 text-center">
                <Music className="h-16 w-16 text-muted-foreground/20 mb-4" />
                <h1 className="text-2xl font-bold text-white mb-2">{error || "Release not found"}</h1>
                <p className="text-gray-400">The link you are looking for might have moved or expired.</p>
            </div>
        );
    }

    const { releaseId: release, streamingLinks, customization } = data;
    const currentTemplates = templates.length > 0 ? templates : PROMO_TEMPLATES;
    const activeTemplate = currentTemplates.find((t: any) => t.id === customization?.templateId) || currentTemplates[0];
    const elementOverrides = customization?.elementOverrides || {};
    const backgroundOverride = customization?.backgroundOverride || { position: { x: 50, y: 50 }, scale: 1.1 };

    // Final Background Resolution (Priority: Override > Template > CoverArt)
    const finalBgUrl = overrideUrl || bgUrl || coverUrl;

    return (
        <div className="min-h-screen bg-[#050505] relative flex flex-col items-center overflow-x-hidden pt-12 pb-24">
            {/* Background with blurred immersive splash */}
            <div
                className="fixed inset-0 bg-cover bg-center scale-150 transform-gpu"
                style={{
                    backgroundImage: `url(${coverUrl || finalBgUrl})`,
                    filter: 'blur(100px) brightness(0.6)',
                    opacity: 0.6
                }}
            />
            <div className="fixed inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/40" />

            {/* Main Content Container */}
            <main className="relative z-10 w-full max-w-lg mx-auto px-4 flex flex-col items-center">

                {/* Header/Brand */}
                <div className="mb-10 flex items-center gap-2">
                    <Disc className="h-5 w-5 text-primary animate-spin-slow" />
                    <span className="font-black text-lg tracking-widest text-white/90">KRATOLIB</span>
                </div>

                {/* Release Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md bg-black rounded-[40px] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] border border-white/10"
                >
                    {/* Creative Container */}
                    <div ref={containerRef} className="relative w-full overflow-hidden" style={{
                        aspectRatio: `${activeTemplate.canvas.width}/${activeTemplate.canvas.height}`
                    }}>
                        <div
                            className="absolute top-0 left-0"
                            style={{
                                width: `${activeTemplate.canvas.width}px`,
                                height: `${activeTemplate.canvas.height}px`,
                                transform: `scale(${cardWidth / activeTemplate.canvas.width})`,
                                transformOrigin: 'top left',
                                backgroundColor: '#000',
                            }}
                        >
                            {/* Template Background Layer */}
                            <div
                                className="absolute inset-0 bg-cover bg-center"
                                style={{
                                    backgroundImage: finalBgUrl ? `url(${finalBgUrl})` : 'none',
                                    transform: `scale(${backgroundOverride.scale || 1.1}) translate(${(backgroundOverride.position?.x || 50) - 50}%, ${(backgroundOverride.position?.y || 50) - 50}%)`,
                                    filter: 'blur(40px) brightness(0.7)', // Robust blur for inner design parity
                                    backgroundPosition: 'center',
                                    width: '100%',
                                    height: '100%'
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />

                            {/* Elements Layer */}
                            <div className="absolute inset-0 z-10 w-full h-full">
                                {activeTemplate.elements.map((element: any) => {
                                    const override = elementOverrides[element.id] || {};
                                    const x = element.position.x + (override.x || 0);
                                    const y = element.position.y + (override.y || 0);
                                    const width = override.sizeWidth || element.size?.width || 'auto';
                                    const height = override.sizeHeight || element.size?.height || 'auto';

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
                                        <div
                                            key={element.id}
                                            style={{
                                                position: 'absolute',
                                                left: x,
                                                top: y,
                                                width: width,
                                                height: height,
                                                zIndex: 10,
                                            }}
                                        >
                                            <div className="w-full h-full relative">
                                                {element.type === 'image' && element.source === 'cover_art' && (
                                                    <img
                                                        src={coverUrl}
                                                        alt="Cover Art"
                                                        className="w-full h-full object-cover shadow-2xl"
                                                        style={{ borderRadius: element.radius || 0 }}
                                                    />
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
                                                                    className="h-20 w-auto object-contain filter drop-shadow-2xl brightness-200"
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
                                                            fontFamily: 'Inter, system-ui, sans-serif',
                                                            fontWeight: (element.id === 'artist_name' || element.id === 'track_name') ? 900 : 700,
                                                            textTransform: 'uppercase',
                                                            letterSpacing: (element.id === 'artist_name' || element.id === 'track_name') ? '-0.02em' : '0.1em',
                                                            textShadow: '0 4px 12px rgba(0,0,0,0.5), 0 12px 32px rgba(0,0,0,0.4)',
                                                            lineHeight: 1.1
                                                        }}
                                                    >
                                                        {getTextContent()}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Platforms List */}
                    <div className="bg-[#080808]/90 backdrop-blur-3xl border-t border-white/5 p-6 space-y-3">
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-2 mb-4">Choose your service</p>

                        {streamingLinks.filter((l: any) => l.isActive).map((link: any, idx: number) => (
                            <motion.a
                                key={idx}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.1)" }}
                                whileTap={{ scale: 0.98 }}
                                className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    {(() => {
                                        const badge = PLATFORM_BADGES.find(b =>
                                            b.name.toLowerCase() === link.platform.toLowerCase() ||
                                            b.id === link.platform.toLowerCase().replace(/\s+/g, '-')
                                        );
                                        return badge ? (
                                            <div className="w-10 h-10 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-lg">
                                                <img
                                                    src={badge.logoUrl}
                                                    alt={badge.name}
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-10 h-10 rounded-xl bg-black border border-white/10 flex items-center justify-center font-bold text-[10px] text-primary">
                                                {link.platform.substring(0, 2).toUpperCase()}
                                            </div>
                                        );
                                    })()}
                                    <span className="font-bold text-white tracking-tight text-sm">{link.platform}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-black text-primary tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">Listen</span>
                                    <div className="p-2.5 rounded-full bg-primary text-black shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                                        <Play className="h-3 w-3 fill-current ml-0.5" />
                                    </div>
                                </div>
                            </motion.a>
                        ))}
                    </div>
                </motion.div>

                {/* Footer */}
                <footer className="mt-16 text-center space-y-6">
                    <div className="flex justify-center gap-6">
                        <button className="text-white/20 hover:text-white transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest bg-white/5 px-6 py-3 rounded-full border border-white/5 hover:border-white/20">
                            <Share2 className="h-4 w-4" />
                            Share Experience
                        </button>
                    </div>
                    <p className="text-white/10 text-[10px] font-black uppercase tracking-[0.3em]">
                        &copy; 2026 KratoLib &bull; Advanced Music Experiences
                    </p>
                </footer>
            </main>

            <style jsx global>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 12s linear infinite;
                }
                body {
                    background-color: #050505;
                }
            `}</style>
        </div>
    );
}

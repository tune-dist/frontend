"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Music, Play, ExternalLink } from "lucide-react";
import { getPublicPromotionBySlug, getPromoTemplates } from "@/lib/api/promotions";
import { PromotionShareButtons } from "@/components/promotion/promotion-share-buttons";
import { getPromotionShareText, getPromotionUrl } from "@/lib/promotion-share";
import { PLATFORM_BADGES } from "@/config/platform-badges";
import { PROMO_TEMPLATES } from "@/config/promo-templates";
import { getDisplayUrl } from "@/lib/api/s3";
import PageLoader from "@/components/page-loader";

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

                if (template?.background?.image) {
                    try {
                        const url = await getDisplayUrl(template.background.image);
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
        return <PageLoader />;
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
        <div className="min-h-screen bg-[#050505] relative flex flex-col items-center overflow-x-hidden pt-6 pb-16">
            {/* Background with blurred immersive splash */}
            <div
                className="fixed inset-0 bg-cover bg-center scale-150 transform-gpu"
                style={{
                    backgroundImage: `url('${coverUrl || finalBgUrl}')`,
                    filter: 'blur(10px) brightness(0.8)',
                    opacity: 0.6
                }}
            />
            <div className="fixed inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/40" />

            {/* Main Content Container */}
            <main className="relative z-10 w-full max-w-lg mx-auto px-4 flex flex-col items-center">

                {/* Header/Brand */}
                <div className="mb-3 flex items-center justify-center">
                    <img src="/logo.png" alt="KratoLib" className="h-8 w-auto object-contain" />
                </div>

                {/* Release Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md bg-transparent rounded-[40px] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] border border-white/10"
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
                                    filter: `blur(${backgroundOverride.blur !== undefined ? backgroundOverride.blur : 0}px) brightness(0.7)`, // Dynamic blur for parity
                                    backgroundPosition: 'center',
                                    width: '100%',
                                    height: '100%'
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />

                            {/* Elements Layer */}
                            <div className="absolute inset-0 z-10 w-full h-full">
                                {(() => {
                                    return activeTemplate.elements.map((element: any) => {
                                        const override = elementOverrides[element.id] || {};
                                        // Use exploded default position if available, otherwise template default
                                        const defaultX = element.defaultX !== undefined ? element.defaultX : element.position.x;
                                        const defaultY = element.defaultY !== undefined ? element.defaultY : element.position.y;

                                        const x = defaultX + (override.x || 0);
                                        const y = defaultY + (override.y || 0);
                                        let width = override.sizeWidth || element.size?.width || (element.sizeOptions && element.sizeOptions[0]?.width) || 'max-content';
                                        if (element.source === 'platform_logo' && typeof width === 'number' && width < 400) {
                                            width = 600;
                                        }
                                        // const height = override.sizeHeight || element.size?.height || (element.sizeOptions && element.sizeOptions[0]?.height) || 'auto';

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
                                                style={{
                                                    position: 'absolute',
                                                    left: element.source === 'platform_logo' ? '50%' : x,
                                                    top: element.source === 'platform_logo' ? 'auto' : y,
                                                    bottom: element.source === 'platform_logo' ? '20px' : 'auto',
                                                    width: width,
                                                    maxWidth: element.type === 'text' ? `${activeTemplate.canvas.width * 0.9}px` : undefined,
                                                    height: 'auto',
                                                    zIndex: 10,
                                                    x: (element.type === 'text' || element.source === 'platform_logo') ? "-50%" : 0,
                                                    y: 0,
                                                    transformOrigin: 'center'
                                                }}
                                            >
                                                <div className="w-full h-full relative flex items-center justify-center">
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
                                                            className="flex justify-center items-center w-full"
                                                            style={{
                                                                transform: `scale(${override.scale || 1})`,
                                                                transformOrigin: 'center'
                                                            }}
                                                        >
                                                            <img
                                                                src="/assets/images/promotion-sociallogo-group.png"
                                                                alt="Platform Logos"
                                                                className="w-[350px] h-auto object-contain filter drop-shadow-2xl"
                                                            />
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
                                            </motion.div>
                                        );
                                    });
                                })()}
                            </div>
                        </div>
                    </div>

                    {/* Platforms List */}
                    <div className="bg-white/10 backdrop-blur-2xl border-t border-white/20 p-6 space-y-2">
                        <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] ml-2 mb-4 hidden">Choose your service</p>

                        {streamingLinks.filter((l: any) => l.isActive).map((link: any, idx: number) => (
                            <motion.a
                                key={idx}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ scale: 1.01, backgroundColor: "rgba(0,0,0,0.6)" }}
                                whileTap={{ scale: 0.99 }}
                                className="flex items-center justify-between p-2.5 rounded-[20px] bg-black/40 border border-white/5 transition-all group"
                            >
                                <div className="flex items-center gap-3.5">
                                    {(() => {
                                        const badge = PLATFORM_BADGES.find(b =>
                                            b.name.toLowerCase() === link.platform.toLowerCase() ||
                                            b.id === link.platform.toLowerCase().replace(/\s+/g, '-')
                                        );
                                        return badge ? (
                                            <div className="w-12 h-12 rounded-[100px] overflow-hidden flex items-center justify-center bg-black/20 shrink-0">
                                                <img
                                                    src={badge.logoUrl}
                                                    alt={badge.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-12 h-12 rounded-[100px] bg-black border border-white/10 flex items-center justify-center font-bold text-xs text-white shrink-0">
                                                {link.platform.substring(0, 2).toUpperCase()}
                                            </div>
                                        );
                                    })()}
                                    <div className="flex flex-col items-start">
                                        <span className="font-semibold text-white tracking-tight text-[15px] leading-tight">{link.platform}</span>
                                        <span className="text-[11px] text-white/50 font-medium mt-0.5">Listen on {link.platform}</span>
                                    </div>
                                </div>
                                <div className="flex items-center pr-1">
                                    <div className="px-4 py-1.5 rounded-full bg-white text-black font-bold text-[13px] flex items-center gap-1.5 group-hover:bg-gray-200 transition-colors">
                                        Play
                                        <ExternalLink className="h-3.5 w-3.5 text-black/80 stroke-[2.5px]" />
                                    </div>
                                </div>
                            </motion.a>
                        ))}
                    </div>
                </motion.div>

                {/* Footer */}
                <footer className="mt-16 text-center space-y-6 w-full">
                    <PromotionShareButtons
                        variant="public"
                        url={getPromotionUrl(slug)}
                        shareText={getPromotionShareText(release?.title, release?.artistName)}
                    />
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">
                        &copy; 2026 KratoLib &bull; Advanced Music Experiences
                    </p>
                </footer>
            </main>

            <style jsx global>{`
                body {
                    background-color: #050505;
                }
            `}</style>
        </div>
    );
}

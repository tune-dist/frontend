
import React, { useEffect, useState, useRef } from 'react';
import { motion } from "framer-motion";
import { Music, Play, Share2, ExternalLink } from "lucide-react";
import { PLATFORM_BADGES } from "@/config/platform-badges";
import { PromoTemplate } from "@/config/promo-templates";
import { getDisplayUrl } from "@/lib/api/s3";

interface LandingPagePreviewProps {
    release: any;
    streamingLinks: any[];
    activeTemplate: PromoTemplate | null;
    elementOverrides: any;
    backgroundOverride: any;
    coverUrl: string;
}

export const LandingPagePreview = ({
    release,
    streamingLinks,
    activeTemplate,
    elementOverrides,
    backgroundOverride,
    coverUrl
}: LandingPagePreviewProps) => {
    const [cardWidth, setCardWidth] = useState(350);
    const containerRef = useRef<HTMLDivElement>(null);
    const [templateBgUrl, setTemplateBgUrl] = useState<string>("");
    const [resolvedOverrideUrl, setResolvedOverrideUrl] = useState<string>("");

    useEffect(() => {
        const resolve = async () => {
            if (activeTemplate?.background?.image) {
                const url = await getDisplayUrl(activeTemplate.background.image);
                setTemplateBgUrl(url);
            }
        };
        resolve();
    }, [activeTemplate?.id]);

    useEffect(() => {
        const resolveOverride = async () => {
            if (backgroundOverride?.imageUrl) {
                const url = await getDisplayUrl(backgroundOverride.imageUrl);
                setResolvedOverrideUrl(url);
            } else {
                setResolvedOverrideUrl("");
            }
        };
        resolveOverride();
    }, [backgroundOverride?.imageUrl]);

    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                setCardWidth(entry.contentRect.width);
            }
        });

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    if (!activeTemplate) return null;

    const finalBgUrl = resolvedOverrideUrl || templateBgUrl || coverUrl;

    return (
        <div
            className="h-full w-full bg-[#050505] relative flex flex-col items-center overflow-x-hidden overflow-y-auto custom-scrollbar p-2 overscroll-contain"
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
        >
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
            `}</style>
            {/* Background with blurred immersive splash */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                    backgroundImage: `url(${finalBgUrl})`,
                    filter: 'blur(40px) brightness(0.4)',
                    opacity: 0.6
                }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/40" />

            {/* Main Content Container */}
            <div className="relative z-10 w-full flex flex-col items-center h-fit pb-24">
                {/* Header/Brand */}
                <div className="mb-3 mt-3 flex items-center justify-center shrink-0">
                    <img src="/logo.png" alt="KratoLib" className="h-5 w-auto object-contain" />
                </div>

                {/* Release Card */}
                <div className="w-full bg-black rounded-[32px] overflow-hidden shadow-2xl border border-white/10 mb-2">
                    {/* Creative Container */}
                    <div ref={containerRef} className="relative w-full overflow-hidden" style={{
                        aspectRatio: `${activeTemplate.canvas.width}/${activeTemplate.canvas.height}`
                    }}>
                        <div
                            className="absolute top-0 left-1/2"
                            style={{
                                width: `${activeTemplate.canvas.width}px`,
                                height: `${activeTemplate.canvas.height}px`,
                                transform: `translateX(-50%) scale(${cardWidth / activeTemplate.canvas.width})`,
                                transformOrigin: 'top center',
                                backgroundColor: '#000',
                            }}
                        >
                            {/* Template Background Layer */}
                            <div
                                className="absolute inset-0 bg-cover bg-center w-full"
                                style={{
                                    backgroundImage: finalBgUrl ? `url(${finalBgUrl})` : 'none',
                                    transform: `scale(${backgroundOverride.scale || 1.1}) translate(${(backgroundOverride.position?.x || 50) - 50}%, ${(backgroundOverride.position?.y || 50) - 50}%)`,
                                    filter: `blur(${backgroundOverride.blur !== undefined ? backgroundOverride.blur : 0}px) brightness(0.7)`,
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
                                        const defaultX = element.defaultX !== undefined ? element.defaultX : element.position.x;
                                        const defaultY = element.defaultY !== undefined ? element.defaultY : element.position.y;

                                        const x = defaultX + (override.x || 0);
                                        const y = defaultY + (override.y || 0);
                                        let width = override.sizeWidth || element.size?.width || (element.sizeOptions && element.sizeOptions[0]?.width) || 'max-content';
                                        if (element.source === 'platform_logo' && typeof width === 'number' && width < 400) {
                                            width = 600;
                                        }
                                        const height = override.sizeHeight || element.size?.height || (element.sizeOptions && element.sizeOptions[0]?.height) || 'auto';

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
                                                key={`${activeTemplate.id}-${element.id}`}
                                                style={{
                                                    position: 'absolute',
                                                    left: element.source === 'platform_logo' ? '50%' : x,
                                                    top: element.source === 'platform_logo' ? 'auto' : y,
                                                    bottom: element.source === 'platform_logo' ? '40px' : 'auto',
                                                    width: width,
                                                    maxWidth: element.type === 'text' ? `${activeTemplate.canvas.width * 0.9}px` : undefined,
                                                    height: height,
                                                    zIndex: element.source === 'static_promotion_logos' ? 50 : 10,
                                                    transformOrigin: 'center',
                                                    transform: (element.type === 'text' || element.source === 'platform_logo') ? 'translateX(-50%)' : 'none'
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
                                                        <div className="flex justify-center items-center w-full">
                                                            <img
                                                                src="/assets/images/promotion-sociallogo-group.png"
                                                                alt="Platforms"
                                                                className="w-full h-auto object-contain filter drop-shadow-2xl"
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
                                                                textShadow: '0 4px 12px rgba(0,0,0,0.5)',
                                                                lineHeight: 1.1
                                                            }}
                                                        >
                                                            {getTextContent()}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        </div>
                    </div>

                    {/* Platforms List */}
                    <div className="w-full mt-2 bg-[#080808]/90 backdrop-blur-3xl border border-white/5 rounded-3xl p-3 shadow-2xl shrink-0 flex flex-col max-h-[160px]">
                        <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] ml-2 mb-2 shrink-0 hidden">Choose your service</p>

                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1.5 pr-1">
                            {streamingLinks.length === 0 ? (
                                <div className="p-4 rounded-xl bg-white/5 border border-dashed border-white/10 text-center">
                                    <p className="text-[10px] text-white/40">No platforms added yet</p>
                                </div>
                            ) : streamingLinks.map((link: any, idx: number) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between p-2 rounded-[16px] bg-black/40 border border-white/5 shrink-0"
                                >
                                    <div className="flex items-center gap-2.5">
                                        {(() => {
                                            const badge = PLATFORM_BADGES.find(b =>
                                                b.name.toLowerCase().replace(/\s+/g, '') === link.platform.toLowerCase().replace(/\s+/g, '') ||
                                                b.id.toLowerCase() === link.platform.toLowerCase().replace(/\s+/g, '-')
                                            );
                                            return badge ? (
                                                <div className="w-8 h-8 rounded-[100px] overflow-hidden flex items-center justify-center bg-black/20 shrink-0">
                                                    <img
                                                        src={badge.logoUrl}
                                                        alt={badge.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-8 h-8 rounded-[100px] bg-black border border-white/10 flex items-center justify-center font-bold text-[8px] text-white shrink-0">
                                                    {link.platform.substring(0, 2).toUpperCase()}
                                                </div>
                                            );
                                        })()}
                                        <div className="flex flex-col items-start">
                                            <span className="font-semibold text-white tracking-tight text-[11px] leading-tight">{link.platform}</span>
                                            <span className="text-[8px] text-white/50 font-medium mt-0.5">Listen on {link.platform}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center pr-0.5">
                                        <div className="px-3 py-1 rounded-full bg-white text-black font-bold text-[9px] flex items-center gap-1">
                                            Play
                                            <ExternalLink className="h-2.5 w-2.5 text-black/80 stroke-[2.5px]" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center pb-6">
                    <p className="text-white/10 text-[8px] font-black uppercase tracking-[0.3em]">
                        &copy; {new Date().getFullYear()} KratoLib
                    </p>
                </div>
            </div>
        </div>
    );
};

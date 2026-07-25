
import React, { useEffect, useState } from 'react';
import { PromoTemplate } from "@/config/promo-templates";
import { getDisplayUrl } from "@/lib/api/s3";
import { PLATFORM_BADGES } from "@/config/platform-badges";

export const ThumbnailPreview = ({
    template,
    release,
    coverUrl,
    backgroundOverride,
    elementOverrides
}: {
    template: PromoTemplate,
    release: any,
    coverUrl: string,
    backgroundOverride: any,
    elementOverrides: any
}) => {
    const [templateBgUrl, setTemplateBgUrl] = useState<string>("");
    const [resolvedOverrideUrl, setResolvedOverrideUrl] = useState<string>("");

    useEffect(() => {
        const resolve = async () => {
            if (template.background?.image) {
                const url = await getDisplayUrl(template.background.image);
                setTemplateBgUrl(url);
            }
        };
        resolve();
    }, [template.id]);

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

    // Resolve final background for this thumbnail
    // Logic: Override ?? TemplateDefault ?? Cover
    // Note: If override is set to specific URL, use it. If override is release cover, use it.
    // If override is cleared (undefined), use template default.
    const effectiveBgUrl = (backgroundOverride?.imageUrl === release?.coverArt?.url && coverUrl)
        ? coverUrl
        : (resolvedOverrideUrl
            ? resolvedOverrideUrl
            : (templateBgUrl || coverUrl));

    return (
        <svg
            viewBox={`0 0 ${template.canvas.width} ${template.canvas.height}`}
            className="w-full h-full block pointer-events-none"
        >
            <foreignObject width={template.canvas.width} height={template.canvas.height}>
                <div className="w-full h-full relative bg-black overflow-hidden font-sans">
                    {/* Background Layer */}
                    <div className="absolute inset-0">
                        <div
                            className="w-full h-full bg-cover"
                            style={{
                                backgroundImage: effectiveBgUrl ? `url(${effectiveBgUrl})` : 'none',
                                // We don't apply position/scale overrides to thumbnails to keep them looking "standard" 
                                // unless we want to? User said "show THIS preview".
                                // Maybe applying zoom/pan to thumbnails is too chaotic?
                                // Let's keep thumbnails centered/cover for cleanliness, usually best for selection.
                                // BUT user said "show this preview". Let's stick to standard layout for the template list
                                // so they can see the TEMPLATE structure, but with the correct BG image.
                                backgroundPosition: 'center',
                                // Adding the requested blur if it's the inner card style (check parity)
                                // The user asked for parity. The editor has inner blur. The thumbnail should too.
                                filter: `blur(${backgroundOverride?.blur !== undefined ? backgroundOverride.blur : 0}px) brightness(1.0)`,
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />
                    </div>

                    {/* Elements Layer */}
                    {(() => {
                        const getRenderableElements = () => {
                            const renderable: any[] = [];
                            template.elements.forEach(element => {
                                if (element.type === 'image' && element.source === 'platform_logo') {
                                    // Ignore old platform logos
                                } else {
                                    renderable.push(element);
                                }
                            });

                            // Add static logos - smaller for post format to avoid overlap
                            const isStory = template.format === 'story';
                            renderable.push({
                                id: 'static_logos_fixed',
                                type: 'image',
                                source: 'static_promotion_logos',
                                defaultX: 0,
                                defaultY: isStory ? template.canvas.height - 300 : template.canvas.height - 80,
                                size: { width: '100%', height: isStory ? 280 : 70 }
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
                            const width = element.type === 'text' ? template.canvas.width : (override.sizeWidth || element.size?.width || 'auto');
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
                                        left: element.source === 'static_promotion_logos' ? 0 : x,
                                        top: y,
                                        width: width,
                                        height: height,
                                        zIndex: element.source === 'static_promotion_logos' ? 50 : 10,
                                        transform: element.type === 'text' ? 'translateX(-50%)' : 'none',
                                    }}
                                >
                                    <div className="w-full h-full relative flex items-center justify-center">
                                        {element.type === 'image' && element.source === 'cover_art' && (
                                            <img
                                                src={coverUrl}
                                                alt="Cover"
                                                className="w-full h-full object-cover shadow-2xl"
                                                style={{ borderRadius: element.radius || 0 }}
                                            />
                                        )}

                                        {element.source === 'static_promotion_logos' && (
                                            <div className="flex justify-center items-center h-full w-full">
                                                <img
                                                    src="/assets/images/promotion-sociallogo-group.png"
                                                    alt="Platforms"
                                                    className="h-full w-full object-contain filter drop-shadow-2xl"
                                                />
                                            </div>
                                        )}

                                        {element.type === 'image' && element.source === 'platform_logo' && (
                                            <div className="flex flex-wrap gap-4 justify-center items-center h-full">
                                                {(override.selectedBadges || []).map((badgeId: string) => {
                                                    const badge = PLATFORM_BADGES.find(b => b.id === badgeId);
                                                    if (!badge) return null;
                                                    return (
                                                        <img
                                                            key={badgeId}
                                                            src={badge.logoUrl}
                                                            alt={badge.name}
                                                            className="h-full w-auto object-contain filter drop-shadow-lg brightness-200"
                                                            style={{ maxHeight: '80%' }}
                                                        />
                                                    );
                                                })}
                                                {(!override.selectedBadges || override.selectedBadges.length === 0) && (
                                                    <div className="w-full h-full bg-white/20 rounded-full" />
                                                )}
                                            </div>
                                        )}

                                        {element.type === 'text' && (
                                            <div
                                                style={{
                                                    color: element.style?.color || '#fff',
                                                    fontSize: `${element.style?.size || 16}px`,
                                                    textAlign: (element.style?.align as any) || 'center',
                                                    fontFamily: 'Inter, system-ui, sans-serif',
                                                    fontWeight: (element.id === 'artist_name' || element.id === 'track_name') ? 900 : 700,
                                                    textTransform: 'uppercase',
                                                    textShadow: '0 4px 12px rgba(0,0,0,0.8)',
                                                    whiteSpace: 'nowrap'
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
            </foreignObject>
        </svg>
    );
};

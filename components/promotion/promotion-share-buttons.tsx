"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Copy, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    SharePlatform,
    sharePromotionLink,
} from "@/lib/promotion-share";

interface PromotionShareButtonsProps {
    url: string;
    shareText?: string;
    variant?: "default" | "compact" | "public";
    className?: string;
}

const SHARE_OPTIONS: {
    id: SharePlatform;
    label: string;
    color: string;
    hoverBg: string;
    icon: React.ReactNode;
}[] = [
    {
        id: "copy",
        label: "Copy URL",
        color: "text-emerald-400",
        hoverBg: "hover:bg-emerald-500/10 hover:border-emerald-500/30",
        icon: <Copy className="h-4 w-4" />,
    },
    {
        id: "facebook",
        label: "Facebook",
        color: "text-[#1877F2]",
        hoverBg: "hover:bg-[#1877F2]/10 hover:border-[#1877F2]/30",
        icon: (
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
            </svg>
        ),
    },
    {
        id: "instagram",
        label: "Instagram",
        color: "text-[#E1306C]",
        hoverBg: "hover:bg-[#E1306C]/10 hover:border-[#E1306C]/30",
        icon: (
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
        ),
    },
    {
        id: "whatsapp",
        label: "WhatsApp",
        color: "text-[#25D366]",
        hoverBg: "hover:bg-[#25D366]/10 hover:border-[#25D366]/30",
        icon: (
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
        ),
    },
    {
        id: "twitter",
        label: "Twitter",
        color: "text-white",
        hoverBg: "hover:bg-white/10 hover:border-white/30",
        icon: (
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
        ),
    },
];

export function PromotionShareButtons({
    url,
    shareText,
    variant = "default",
    className = "",
}: PromotionShareButtonsProps) {
    const [loadingPlatform, setLoadingPlatform] = useState<SharePlatform | null>(null);
    const [copied, setCopied] = useState(false);

    const handleShare = async (platform: SharePlatform) => {
        try {
            setLoadingPlatform(platform);
            const result = await sharePromotionLink(platform, url, shareText);

            if (platform === "copy") {
                setCopied(true);
                toast.success("Link copied to clipboard!");
                setTimeout(() => setCopied(false), 2000);
            } else if (platform === "instagram" && result.copied) {
                toast.success("Link copied! Paste it in your Instagram story or bio.");
            }
        } catch {
            toast.error("Could not share link. Please try again.");
        } finally {
            setLoadingPlatform(null);
        }
    };

    if (variant === "compact") {
        return (
            <div className={`flex flex-wrap items-center gap-2 ${className}`}>
                {SHARE_OPTIONS.map((option) => (
                    <Button
                        key={option.id}
                        variant="outline"
                        size="sm"
                        className={`gap-1.5 border-white/10 ${option.hoverBg}`}
                        onClick={() => handleShare(option.id)}
                        disabled={loadingPlatform !== null}
                    >
                        {loadingPlatform === option.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : option.id === "copy" && copied ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                            <span className={option.color}>{option.icon}</span>
                        )}
                        {option.label}
                    </Button>
                ))}
            </div>
        );
    }

    if (variant === "public") {
        return (
            <div className={`flex flex-col items-center gap-4 ${className}`}>
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                    Share this release
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                    {SHARE_OPTIONS.map((option) => (
                        <button
                            key={option.id}
                            type="button"
                            title={option.label}
                            onClick={() => handleShare(option.id)}
                            disabled={loadingPlatform !== null}
                            className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest bg-white/5 px-4 py-3 rounded-full border border-white/5 hover:border-white/20 hover:text-white text-white/40 transition-all disabled:opacity-50 ${option.hoverBg}`}
                        >
                            {loadingPlatform === option.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : option.id === "copy" && copied ? (
                                <Check className="h-4 w-4 text-emerald-400" />
                            ) : (
                                <span className={option.color}>{option.icon}</span>
                            )}
                            <span>{option.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className={`grid grid-cols-2 sm:grid-cols-3 gap-3 ${className}`}>
            {SHARE_OPTIONS.map((option) => (
                <button
                    key={option.id}
                    type="button"
                    onClick={() => handleShare(option.id)}
                    disabled={loadingPlatform !== null}
                    className={`flex items-center justify-center gap-2.5 p-4 rounded-2xl border border-white/10 bg-white/[0.03] transition-all ${option.hoverBg} disabled:opacity-50`}
                >
                    {loadingPlatform === option.id ? (
                        <Loader2 className="h-5 w-5 animate-spin text-white/60" />
                    ) : option.id === "copy" && copied ? (
                        <Check className="h-5 w-5 text-emerald-400" />
                    ) : (
                        <span className={option.color}>{option.icon}</span>
                    )}
                    <span className="font-semibold text-sm text-white/90">{option.label}</span>
                </button>
            ))}
        </div>
    );
}

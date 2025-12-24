"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Music, ExternalLink, Play, Disc, Share2 } from "lucide-react";
import { getPublicPromotionBySlug } from "@/lib/api/promotions";
import { PLATFORM_BADGES } from "@/config/platform-badges";

export default function PublicPromotionPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPromo = async () => {
            try {
                setLoading(true);
                const promo = await getPublicPromotionBySlug(slug);
                setData(promo);
            } catch (err: any) {
                setError(err.response?.status === 404 ? "Page not found" : "Something went wrong");
            } finally {
                setLoading(false);
            }
        };
        fetchPromo();
    }, [slug]);

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

    const { releaseId: release, streamingLinks } = data;

    return (
        <div className="min-h-screen bg-black relative flex flex-col items-center overflow-x-hidden">
            {/* Background with blurred cover art */}
            <div
                className="fixed inset-0 bg-cover bg-center blur-[120px] opacity-70 scale-125"
                style={{ backgroundImage: `url(${release.coverArt.url})` }}
            />
            <div className="fixed inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60" />

            {/* Main Content Container */}
            <main className="relative z-10 w-full max-w-lg mx-auto px-4 py-12 flex flex-col items-center">

                {/* Header/Brand */}
                <div className="mb-8 flex items-center gap-2">
                    <Disc className="h-6 w-6 text-primary animate-spin-slow" />
                    <span className="font-bold text-xl tracking-tighter text-white">KRATOLIB</span>
                </div>

                {/* Release Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md bg-white/10 border border-white/20 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-2xl"
                >
                    {/* Main Content */}
                    <div className="p-8 flex flex-col items-center text-center space-y-6">
                        {/* OUT NOW Header */}
                        <div className="w-full space-y-1">
                            <h1 className="text-white text-5xl font-black uppercase tracking-tight" style={{
                                textShadow: '0 0 20px rgba(0,0,0,0.8), 0 0 40px rgba(0,0,0,0.5)'
                            }}>
                                OUT NOW
                            </h1>
                            <p className="text-white/90 text-sm font-medium tracking-wide">
                                Distributed by <span className="font-bold text-primary">KRATOLIB</span>
                            </p>
                        </div>

                        {/* Cover Art */}
                        <div className="relative group">
                            <img
                                src={release.coverArt.url}
                                alt={release.title}
                                className="w-64 h-64 object-cover rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:scale-105"
                            />
                        </div>

                        {/* Artist Info */}
                        <div className="space-y-1">
                            <h2 className="text-2xl font-black text-white tracking-tight uppercase">{release.title}</h2>
                            <p className="text-lg text-gray-400 font-medium">{release.artistName}</p>
                        </div>

                        {/* Available On Section */}
                        {data.customization?.selectedBadges && data.customization.selectedBadges.length > 0 && (
                            <div className="w-full space-y-3">
                                <p className="text-white/70 text-sm font-bold uppercase tracking-widest">
                                    Available on:
                                </p>
                                <div className="flex justify-center gap-4 flex-wrap">
                                    {data.customization.selectedBadges.map((badgeId: string) => {
                                        const badge = PLATFORM_BADGES.find(b => b.id === badgeId);
                                        if (!badge) return null;
                                        return (
                                            <div key={badgeId} className="h-8 w-auto flex items-center justify-center">
                                                <img
                                                    src={badge.logoUrl}
                                                    alt={badge.name}
                                                    className="h-full w-auto object-contain filter drop-shadow-sm"
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Platforms List */}
                    <div className="bg-black/20 backdrop-blur-sm p-4 space-y-2">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2 mb-2">Choose your preferred service</p>

                        {streamingLinks.filter((l: any) => l.isActive).map((link: any, idx: number) => (
                            <motion.a
                                key={idx}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-2xl transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    {/* Platform Logo */}
                                    {(() => {
                                        const badge = PLATFORM_BADGES.find(b =>
                                            b.name.toLowerCase() === link.platform.toLowerCase() ||
                                            b.id === link.platform.toLowerCase().replace(/\s+/g, '-')
                                        );
                                        return badge ? (
                                            <div className="w-10 h-10 rounded-xl bg-white p-1.5 flex items-center justify-center">
                                                <img
                                                    src={badge.logoUrl}
                                                    alt={badge.name}
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-10 h-10 rounded-xl bg-black border border-white/5 flex items-center justify-center font-bold text-[10px] text-primary">
                                                {link.platform.substring(0, 2).toUpperCase()}
                                            </div>
                                        );
                                    })()}
                                    <span className="font-bold text-white">{link.platform}</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 group-hover:bg-primary transition-colors rounded-lg text-primary group-hover:text-white text-xs font-bold uppercase tracking-tighter">
                                    Play
                                </div>
                            </motion.a>
                        ))}

                        {streamingLinks.length === 0 && (
                            <div className="text-center py-8 text-gray-500 italic text-sm">
                                No streaming links available yet.
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Footer */}
                <footer className="mt-12 text-center space-y-4">
                    <div className="flex justify-center gap-6">
                        <button className="text-gray-500 hover:text-white transition-colors"><Share2 className="h-5 w-5" /></button>
                    </div>
                    <p className="text-gray-600 text-xs font-medium">
                        &copy; 2025 KratoLib. All rights reserved.
                    </p>
                </footer>
            </main>

            <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
        </div>
    );
}

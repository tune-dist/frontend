
"use client";

import { useEffect, useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Smartphone, 
    Square, 
    ChevronRight, 
    ChevronLeft, 
    Check, 
    Music, 
    Plus, 
    Trash2, 
    Save, 
    Loader2, 
    Instagram,
    ExternalLink,
    Play
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import { getRelease, Release } from "@/lib/api/releases";
import { 
    getPromoTemplates, 
    createOrUpdatePromotion, 
    getPromotionByReleaseId 
} from "@/lib/api/promotions";
import { PromoTemplate } from "@/config/promo-templates";
import { LandingPagePreview } from "@/components/dashboard/promotion/landing-page-preview";
import { ThumbnailPreview } from "@/components/dashboard/promotion/thumbnail-preview";
import { getDisplayUrl } from "@/lib/api/s3";

const PLATFORMS = [
    { id: 'spotify', name: 'Spotify', color: '#1DB954' },
    { id: 'apple-music', name: 'Apple Music', color: '#FC3C44' },
    { id: 'youtube-music', name: 'YouTube Music', color: '#FF0000' },
    { id: 'instagram', name: 'Instagram', color: '#E1306C' },
    { id: 'amazon-music', name: 'Amazon Music', color: '#00A8E1' },
    { id: 'jiosaavn', name: 'JioSaavn', color: '#00B8F4' },
    { id: 'wynk', name: 'Wynk Music', color: '#E11B22' },
];

interface PromotionWizardDialogProps {
    open: boolean;
    onClose: () => void;
    releaseId: string | null;
}

export function PromotionWizardDialog({ open, onClose, releaseId }: PromotionWizardDialogProps) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    
    const [release, setRelease] = useState<Release | null>(null);
    const [templates, setTemplates] = useState<PromoTemplate[]>([]);
    const [selectedFormat, setSelectedFormat] = useState<'story' | 'post'>('story');
    const [activeTemplate, setActiveTemplate] = useState<PromoTemplate | null>(null);
    const [streamingLinks, setStreamingLinks] = useState<any[]>([]);
    const [slug, setSlug] = useState("");
    const [coverUrl, setCoverUrl] = useState("");
    
    // Customization state (minimal for wizard, can be edited further in full editor)
    const [elementOverrides, setElementOverrides] = useState<Record<string, any>>({});
    const [backgroundOverride, setBackgroundOverride] = useState<any>({ position: { x: 50, y: 50 }, scale: 1.1 });

    // Step 4: Platform Details
    const [instaType, setInstaType] = useState<'story' | 'post'>('story');
    const [previewScale, setPreviewScale] = useState(1);
    const previewContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const updateScale = () => {
            if (previewContainerRef.current) {
                const parentHeight = previewContainerRef.current.offsetHeight;
                const parentWidth = previewContainerRef.current.offsetWidth;
                
                const phoneH = 812;
                const phoneW = 375;
                
                const scaleH = (parentHeight - 40) / phoneH;
                const scaleW = (parentWidth - 40) / phoneW;
                
                setPreviewScale(Math.min(scaleH, scaleW));
            }
        };

        updateScale();
        const observer = new ResizeObserver(updateScale);
        if (previewContainerRef.current) observer.observe(previewContainerRef.current);
        return () => observer.disconnect();
    }, [step, activeTemplate?.id]);

    useEffect(() => {
        if (open && releaseId) {
            fetchData();
        } else {
            setStep(1);
            setRelease(null);
            setActiveTemplate(null);
            setStreamingLinks([]);
            setElementOverrides({});
            setBackgroundOverride({ position: { x: 50, y: 50 }, scale: 1.1 });
        }
    }, [open, releaseId]);

    const fetchData = async () => {
        if (!releaseId) return;
        try {
            setLoading(true);
            const [releaseData, fetchedTemplates] = await Promise.all([
                getRelease(releaseId),
                getPromoTemplates()
            ]);

            setRelease(releaseData);
            setTemplates(fetchedTemplates);
            setSlug(releaseData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'));

            if (releaseData.coverArt?.url) {
                const url = await getDisplayUrl(releaseData.coverArt.url);
                setCoverUrl(url);
            }

            // Check if existing promotion exists
            try {
                const promo = await getPromotionByReleaseId(releaseId);
                if (promo) {
                    setStreamingLinks(promo.streamingLinks || []);
                    setSlug(promo.slug);
                    if (promo.customization?.templateId) {
                        const found = fetchedTemplates.find((t: any) => t.id === promo.customization.templateId);
                        if (found) {
                            setActiveTemplate(found);
                            setSelectedFormat(found.format as 'story' | 'post');
                        }
                    }
                    if (promo.customization?.elementOverrides) {
                        setElementOverrides(promo.customization.elementOverrides);
                    }
                    if (promo.customization?.backgroundOverride) {
                        setBackgroundOverride(promo.customization.backgroundOverride);
                    }
                } else {
                    // Default to first template of selected format
                    const defaultTemp = fetchedTemplates.find((t: PromoTemplate) => t.format === selectedFormat) || fetchedTemplates[0];
                    setActiveTemplate(defaultTemp);
                    setElementOverrides({});
                    setBackgroundOverride({ position: { x: 50, y: 50 }, scale: 1.1 });
                }
            } catch (e) {
                const defaultTemp = fetchedTemplates.find((t: PromoTemplate) => t.format === selectedFormat) || fetchedTemplates[0];
                setActiveTemplate(defaultTemp);
                setElementOverrides({});
                setBackgroundOverride({ position: { x: 50, y: 50 }, scale: 1.1 });
            }
        } catch (error) {
            toast.error("Failed to load release data");
        } finally {
            setLoading(false);
        }
    };

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

    const handleLinkChange = (index: number, url: string) => {
        const newLinks = [...streamingLinks];
        newLinks[index].url = url;
        setStreamingLinks(newLinks);
    };

    const handleSave = async () => {
        if (!activeTemplate || !releaseId) return;
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

            const landingPageUrl = `${window.location.origin}/p/${slug}`;
            
            try {
                await navigator.clipboard.writeText(landingPageUrl);
                toast.success("Promotion created! Link copied to clipboard.");
            } catch (clipboardError) {
                console.error("Clipboard failed:", clipboardError);
                toast.success("Promotion created successfully!");
            }
            
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to save promotion");
        } finally {
            setSaving(false);
        }
    };

    const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="max-w-[95vw] w-[1100px] h-[92vh] p-0 gap-0 flex flex-col overflow-hidden bg-[#0A0A0B] border-white/5 shadow-2xl rounded-3xl">
                {/* Header */}
                <DialogHeader className="p-4 border-b border-white/5 shrink-0">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-lg font-bold flex items-center gap-2 text-white/90">
                            <Music className="h-4 w-4 text-primary" />
                            Create Promotion Link
                        </DialogTitle>
                    </div>
                </DialogHeader>

                {/* Step Indicator */}
                <div className="px-12 py-3 flex items-center justify-center gap-6 border-b border-white/5 bg-black/20">
                    {[
                        { num: 1, label: 'Format' },
                        { num: 2, label: 'Template' },
                        { num: 3, label: 'Platforms' },
                        { num: 4, label: 'Review' }
                    ].map((s) => (
                        <div key={s.num} className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                step === s.num 
                                ? 'bg-primary text-black shadow-[0_0_15px_rgba(29,185,84,0.4)]' 
                                : step > s.num ? 'bg-primary/20 text-primary' : 'bg-white/5 text-white/40'
                            }`}>
                                {step > s.num ? <Check className="h-4 w-4" /> : s.num}
                            </div>
                            <span className={`text-sm font-medium transition-colors ${
                                step === s.num ? 'text-white' : 'text-white/40'
                            }`}>
                                {s.label}
                            </span>
                            {s.num < 4 && <div className="w-12 h-[1px] bg-white/5 ml-4" />}
                        </div>
                    ))}
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Left Side: Steps */}
                    <div className="w-[50%] flex flex-col overflow-hidden">
                        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                            <AnimatePresence mode="wait">
                                {step === 1 && (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-8"
                                    >
                                        <div className="space-y-2">
                                            <h2 className="text-2xl font-bold text-white">Select Type</h2>
                                            <p className="text-white/50">Choose how your music will be presented on social media.</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            {[
                                                { id: 'story', name: 'Story', desc: '9:16 Vertical format', icon: <Smartphone className="h-8 w-8" /> },
                                                { id: 'post', name: 'Post', desc: '1:1 Square format', icon: <Square className="h-8 w-8" /> }
                                            ].map((format) => (
                                                <button
                                                    key={format.id}
                                                    onClick={() => {
                                                        setSelectedFormat(format.id as any);
                                                        const match = templates.find(t => t.format === format.id);
                                                        if (match) setActiveTemplate(match);
                                                    }}
                                                    className={`p-8 rounded-3xl border-2 text-left transition-all relative overflow-hidden group ${
                                                        selectedFormat === format.id 
                                                        ? 'border-primary bg-primary/5' 
                                                        : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04]'
                                                    }`}
                                                >
                                                    <div className={`mb-6 w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
                                                        selectedFormat === format.id ? 'bg-primary text-black' : 'bg-white/5 text-white/40 group-hover:text-primary'
                                                    }`}>
                                                        {format.icon}
                                                    </div>
                                                    <h3 className="font-bold text-xl text-white">{format.name}</h3>
                                                    <p className="text-sm text-white/40 mt-1">{format.desc}</p>
                                                    {selectedFormat === format.id && (
                                                        <div className="absolute top-6 right-6 text-primary">
                                                            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                                                <Check className="h-4 w-4 text-black" />
                                                            </div>
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {step === 2 && (
                                    <motion.div
                                        key="step2"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-8"
                                    >
                                        <div className="space-y-2">
                                            <h2 className="text-2xl font-bold text-white">Select Template</h2>
                                            <p className="text-white/50">Pick a visual style for your promotional landing page.</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            {templates.filter(t => t.format === selectedFormat).map((temp) => (
                                                <button
                                                    key={temp.id}
                                                    onClick={() => setActiveTemplate(temp)}
                                                    className={`p-3 rounded-3xl border-2 transition-all group relative ${
                                                        activeTemplate?.id === temp.id 
                                                        ? 'border-primary bg-primary/5' 
                                                        : 'border-white/5 bg-white/[0.02] hover:border-primary/40'
                                                    }`}
                                                >
                                                    <div className="aspect-[9/12] rounded-2xl overflow-hidden bg-black mb-4 shadow-2xl group-hover:scale-[1.02] transition-transform origin-bottom">
                                                        <ThumbnailPreview 
                                                            template={temp} 
                                                            release={release} 
                                                            coverUrl={coverUrl} 
                                                            backgroundOverride={backgroundOverride} 
                                                            elementOverrides={elementOverrides} 
                                                        />
                                                    </div>
                                                    <p className="font-bold text-sm text-white/80 px-2 pb-2 text-center truncate">{temp.name}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {step === 3 && (
                                    <motion.div
                                        key="step3"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-8"
                                    >
                                        <div className="space-y-2">
                                            <h2 className="text-2xl font-bold text-white">Platform Links</h2>
                                            <p className="text-white/50">Add the URLs where fans can listen to your music.</p>
                                        </div>

                                        <div className="flex flex-wrap gap-2 mb-6 p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                                            {PLATFORMS.map((p) => (
                                                <Button
                                                    key={p.id}
                                                    variant="ghost"
                                                    size="sm"
                                                    className={`gap-2 h-10 rounded-full border border-white/10 hover:bg-white/10 hover:text-white ${
                                                        streamingLinks.some(l => l.platform === p.name) ? 'opacity-30 pointer-events-none' : ''
                                                    }`}
                                                    onClick={() => handleAddLink(p.id)}
                                                >
                                                    <Plus className="h-3 w-3" />
                                                    {p.name}
                                                </Button>
                                            ))}
                                        </div>

                                        <div className="space-y-4">
                                            {streamingLinks.map((link, idx) => (
                                                <div key={idx} className="flex items-center gap-4 p-5 rounded-3xl bg-white/[0.03] border border-white/5 group transition-all hover:border-white/10">
                                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                                                        <Music className="h-6 w-6 text-primary" />
                                                    </div>
                                                    <div className="flex-1 space-y-1">
                                                        <Label className="text-[10px] uppercase font-bold text-white/30 tracking-widest">{link.platform} URL</Label>
                                                        <Input 
                                                            value={link.url}
                                                            onChange={(e) => handleLinkChange(idx, e.target.value)}
                                                            placeholder={`Paste your ${link.platform} link here...`}
                                                            className="h-10 bg-black/40 border-white/10 text-white focus:border-primary/50 transition-all rounded-xl"
                                                        />
                                                    </div>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-xl"
                                                        onClick={() => handleRemoveLink(idx)}
                                                    >
                                                        <Trash2 className="h-5 w-5" />
                                                    </Button>
                                                </div>
                                            ))}
                                            {streamingLinks.length === 0 && (
                                                <div className="text-center py-16 border-2 border-dashed border-white/5 rounded-[40px] bg-white/[0.01]">
                                                    <div className="w-20 h-20 rounded-full bg-white/[0.03] flex items-center justify-center mx-auto mb-6">
                                                        <Music className="h-10 w-10 text-white/10" />
                                                    </div>
                                                    <p className="text-white/40 text-lg font-medium">No platforms added yet</p>
                                                    <p className="text-white/20 text-sm mt-1">Select platforms from the options above</p>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                                {step === 4 && (
                                    <motion.div
                                        key="step4"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-8"
                                    >
                                        <div className="space-y-2">
                                            <h2 className="text-2xl font-bold text-white">Review & Publish</h2>
                                            <p className="text-white/50">Finalize your promotion link details.</p>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="p-8 rounded-[40px] border border-white/5 bg-white/[0.02] space-y-8">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-20 h-20 rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                                                        <img src={coverUrl} className="w-full h-full object-cover" alt="Release Cover" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-2xl font-bold text-white">{release?.title}</h3>
                                                        <p className="text-white/40">{release?.artistName}</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/5">
                                                    <div>
                                                        <Label className="text-[10px] uppercase font-bold text-white/30 tracking-widest mb-3 block">Platforms Added</Label>
                                                        <div className="flex flex-wrap gap-2">
                                                            {streamingLinks.map((l, i) => (
                                                                <span key={i} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                                                                    {l.platform}
                                                                </span>
                                                            ))}
                                                            {streamingLinks.length === 0 && <span className="text-white/20 text-xs italic">None</span>}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <Label className="text-[10px] uppercase font-bold text-white/30 tracking-widest mb-3 block">Smart Link URL</Label>
                                                        <div className="flex items-center gap-2 text-primary font-bold text-sm bg-primary/5 p-3 rounded-2xl border border-primary/10">
                                                            <ExternalLink className="h-4 w-4 shrink-0" />
                                                            <span className="truncate">kratolib.com/p/{slug}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-8 rounded-[40px] border border-white/5 bg-white/[0.02] space-y-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-[#E1306C]/10 text-[#E1306C] flex items-center justify-center">
                                                        <Instagram className="h-6 w-6" />
                                                    </div>
                                                    <h3 className="font-bold text-white">Instagram Integration</h3>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    {['story', 'post'].map((type) => (
                                                        <button
                                                            key={type}
                                                            onClick={() => setInstaType(type as any)}
                                                            className={`p-4 rounded-2xl border-2 flex items-center justify-center gap-3 transition-all ${
                                                                instaType === type ? 'border-[#E1306C] bg-[#E1306C]/5 text-white' : 'border-white/5 text-white/40'
                                                            }`}
                                                        >
                                                            {type === 'story' ? <Smartphone className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                                                            <span className="font-bold capitalize">{type}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Right Side: Preview */}
                    <div className="w-[50%] bg-black/40 flex flex-col items-center justify-center relative border-l border-white/5 overflow-hidden p-6">
                        <div className="absolute top-6 right-6 z-50">
                            <div className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Live Preview</span>
                            </div>
                        </div>

                        <div ref={previewContainerRef} className="w-full h-full flex items-center justify-center relative">
                            <div className="relative shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] transition-all duration-700 ease-out flex items-center justify-center border-[8px] border-zinc-800 rounded-[60px] bg-[#050505] overflow-hidden"
                                style={{
                                    transform: `scale(${previewScale})`,
                                    width: '375px',
                                    height: '812px',
                                    minWidth: '375px',
                                    minHeight: '812px'
                                }}
                            >
                                <div className="absolute inset-0">
                                    {activeTemplate && (
                                        <LandingPagePreview 
                                            release={release}
                                            streamingLinks={streamingLinks}
                                            activeTemplate={activeTemplate}
                                            elementOverrides={elementOverrides}
                                            backgroundOverride={backgroundOverride}
                                            coverUrl={coverUrl}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/5 bg-black/40 flex items-center justify-between shrink-0">
                    <Button 
                        variant="ghost" 
                        onClick={prevStep} 
                        disabled={step === 1}
                        className="text-white/40 hover:text-white transition-colors gap-2 px-4 h-9 text-xs"
                    >
                        <ChevronLeft className="h-3 w-3" />
                        Back
                    </Button>
                    
                    <div className="flex gap-3">
                        {step < 4 ? (
                            <Button 
                                onClick={nextStep} 
                                className="bg-white text-black hover:bg-white/90 rounded-xl px-8 font-bold h-10 text-sm gap-2 shadow-xl shadow-white/5"
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        ) : (
                            <Button 
                                onClick={handleSave} 
                                disabled={saving}
                                className="bg-primary text-black hover:bg-primary/90 rounded-xl px-10 font-black h-10 text-sm gap-2 shadow-xl shadow-primary/20 transition-all active:scale-95"
                            >
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                Publish Smart Link
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
            `}</style>
        </Dialog>
    );
}

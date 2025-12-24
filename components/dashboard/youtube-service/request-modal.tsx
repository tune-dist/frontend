"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, ChevronRight, Loader2, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { getReleases, Release } from "@/lib/api/releases";
import { createYouTubeRequest, YouTubeRequestType } from "@/lib/api/youtube-service";
import toast from "react-hot-toast";

interface RequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const steps = [
    { id: "request_type", name: "Request type" },
    { id: "release", name: "Release" },
    { id: "content", name: "Content to claim" },
];

export default function RequestModal({ isOpen, onClose, onSuccess }: RequestModalProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [releases, setReleases] = useState<Release[]>([]);
    const [releasesLoading, setReleasesLoading] = useState(false);

    const [formData, setFormData] = useState({
        requestType: YouTubeRequestType.RELEASE_CLAIM,
        releaseId: "",
        infringingLinks: "",
    });

    useEffect(() => {
        if (isOpen) {
            fetchReleases();
        }
    }, [isOpen]);

    const fetchReleases = async () => {
        try {
            setReleasesLoading(true);
            const data = await getReleases({ limit: 100 });
            setReleases(data.releases);
        } catch (error) {
            console.error("Failed to fetch releases", error);
        } finally {
            setReleasesLoading(false);
        }
    };

    const handleNext = () => {
        if (currentStep === 0 && !formData.requestType) {
            toast.error("Please select a request type");
            return;
        }
        if (currentStep === 1 && !formData.releaseId) {
            toast.error("Please select a release");
            return;
        }
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleSubmit();
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        if (!formData.infringingLinks.trim()) {
            toast.error("Please provide infringing links");
            return;
        }

        try {
            setLoading(true);
            const links = formData.infringingLinks.split('\n').filter(link => link.trim() !== "");
            await createYouTubeRequest({
                requestType: formData.requestType,
                releaseId: formData.releaseId,
                infringingLinks: links,
            });
            toast.success("Request submitted successfully!");
            onSuccess();
            resetForm();
        } catch (error) {
            toast.error("Failed to submit request");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setCurrentStep(0);
        setFormData({
            requestType: YouTubeRequestType.RELEASE_CLAIM,
            releaseId: "",
            infringingLinks: "",
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-background w-full max-w-3xl max-h-[85vh] rounded-xl shadow-2xl flex flex-col overflow-hidden border border-border"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
                            <X className="h-4 w-4" />
                        </Button>
                        <h2 className="text-xl font-semibold">Request form</h2>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="hidden lg:flex">
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar Steps */}
                    <div className="w-64 border-r border-border bg-muted/30 p-6 hidden md:block">
                        <div className="space-y-8 relative">
                            {/* Vertical Line */}
                            <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border z-0" />

                            {steps.map((step, index) => (
                                <div key={step.id} className="flex items-center gap-4 relative z-10">
                                    <div
                                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-colors ${index < currentStep
                                            ? "bg-primary border-primary text-primary-foreground"
                                            : index === currentStep
                                                ? "bg-background border-primary text-primary"
                                                : "bg-background border-muted text-muted-foreground"
                                            }`}
                                    >
                                        {index < currentStep ? <Check className="h-3 w-3" /> : null}
                                        {index === currentStep ? <div className="w-2 h-2 rounded-full bg-primary" /> : null}
                                    </div>
                                    <span className={`text-sm font-medium ${index === currentStep ? "text-primary" : "text-muted-foreground"
                                        }`}>
                                        {step.name}
                                        {index < currentStep && <Check className="h-4 w-4 inline ml-2 text-primary" />}
                                    </span>
                                </div>
                            ))}

                            {/* <div className="flex items-center gap-4 opacity-30">
                                <div className="w-6 h-6 rounded-full border-2 border-gray-300 bg-white" />
                                <span className="text-sm text-muted-foreground">Validation</span>
                            </div> */}
                        </div>
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 p-6 overflow-y-auto bg-background">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                {currentStep === 0 && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-medium text-foreground">Request type</h3>
                                            <p className="text-sm text-muted-foreground">Select action to be performed</p>
                                        </div>

                                        <div className="space-y-3">
                                            {Object.values(YouTubeRequestType).map((type) => (
                                                <label
                                                    key={type}
                                                    className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${formData.requestType === type
                                                        ? "border-primary bg-primary/5"
                                                        : "border-border hover:bg-muted/50"
                                                        }`}
                                                >
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.requestType === type ? "border-primary" : "border-muted"
                                                        }`}>
                                                        {formData.requestType === type && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                                    </div>
                                                    <input
                                                        type="radio"
                                                        className="hidden"
                                                        name="requestType"
                                                        value={type}
                                                        checked={formData.requestType === type}
                                                        onChange={(e) => setFormData({ ...formData, requestType: e.target.value as YouTubeRequestType })}
                                                    />
                                                    <span className="text-sm text-foreground">{type}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {currentStep === 1 && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-medium text-foreground">Release</h3>
                                            <p className="text-sm text-muted-foreground">Select your release</p>
                                        </div>

                                        {releasesLoading ? (
                                            <div className="flex justify-center py-12">
                                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                            </div>
                                        ) : (
                                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                                {releases.map((release) => (
                                                    <label
                                                        key={release._id}
                                                        className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all ${formData.releaseId === release._id
                                                            ? "border-primary bg-primary/5"
                                                            : "border-border hover:bg-muted/50"
                                                            }`}
                                                    >
                                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${formData.releaseId === release._id ? "border-primary" : "border-muted"
                                                            }`}>
                                                            {formData.releaseId === release._id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                                        </div>
                                                        <input
                                                            type="radio"
                                                            className="hidden"
                                                            name="release"
                                                            value={release._id}
                                                            checked={formData.releaseId === release._id}
                                                            onChange={(e) => setFormData({ ...formData, releaseId: e.target.value })}
                                                        />
                                                        <div className="h-12 w-12 rounded bg-muted overflow-hidden flex-shrink-0">
                                                            {release.coverArt?.url ? (
                                                                <img src={release.coverArt.url} alt={release.title} className="h-full w-full object-cover" />
                                                            ) : (
                                                                <Music className="h-full w-full p-3 text-muted-foreground" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium truncate text-foreground">{release.title}</span>
                                                                <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded uppercase font-bold text-muted-foreground">Track</span>
                                                            </div>
                                                            <p className="text-xs text-muted-foreground truncate">{release.artistName}</p>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {currentStep === 2 && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-medium text-foreground">Content to claim</h3>
                                            <p className="text-sm text-muted-foreground">Copy and paste the link(s) of the content to claim in the associated text area</p>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-semibold">YouTube</Label>
                                                <p className="text-sm">Paste infringing link(s)</p>
                                                <textarea
                                                    className="w-full min-h-[150px] p-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-foreground placeholder:text-muted-foreground"
                                                    placeholder="https://youtube.com/watch?v=..."
                                                    value={formData.infringingLinks}
                                                    onChange={(e) => setFormData({ ...formData, infringingLinks: e.target.value })}
                                                />
                                                <p className="text-xs text-muted-foreground">One link per line</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-border flex items-center justify-between bg-muted/20">
                    <Button
                        variant="outline"
                        onClick={handlePrevious}
                        disabled={currentStep === 0 || loading}
                        className="text-primary border-primary/20 hover:bg-primary/5 hover:text-primary"
                    >
                        &lt; Previous
                    </Button>
                    <Button
                        onClick={handleNext}
                        disabled={loading}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[100px]"
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : currentStep === steps.length - 1 ? (
                            "Submit"
                        ) : (
                            "Next >"
                        )}
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}

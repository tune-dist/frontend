"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Loader2, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { getReleases, Release } from "@/lib/api/releases";
import { createYouTubeRequest } from "@/lib/api/youtube-service";
import { S3Image } from "@/components/ui/s3-image";
import toast from "react-hot-toast";
import { getInvalidYouTubeLinks, parseYouTubeLinks } from "@/lib/youtube-url";

interface RequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface TrackOption {
    index: number;
    title: string;
    isrc?: string;
}

const steps = [
    { id: "release", name: "Release" },
    { id: "track", name: "Song" },
    { id: "content", name: "YouTube link" },
];

function ReleaseCover({ release }: { release: Release }) {
    return (
        <div className="h-12 w-12 rounded bg-muted overflow-hidden flex-shrink-0 flex items-center justify-center">
            <S3Image
                src={release.coverArt?.url}
                alt={release.title}
                className="h-full w-full object-cover"
                fallback={<Music className="h-6 w-6 text-muted-foreground" />}
            />
        </div>
    );
}

function getReleaseTracks(release: Release): TrackOption[] {
    if (release.tracks?.length) {
        return release.tracks.map((track, index) => ({
            index,
            title: track.title,
            isrc: track.isrc,
        }));
    }

    return [{
        index: 0,
        title: release.title,
        isrc: release.isrc,
    }];
}

export default function RequestModal({ isOpen, onClose, onSuccess }: RequestModalProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [releases, setReleases] = useState<Release[]>([]);
    const [releasesLoading, setReleasesLoading] = useState(false);

    const [formData, setFormData] = useState({
        releaseId: "",
        trackIndex: 0,
        infringingLinks: "",
    });
    const [linkError, setLinkError] = useState<string | null>(null);

    const selectedRelease = useMemo(
        () => releases.find((release) => release._id === formData.releaseId),
        [releases, formData.releaseId],
    );

    const trackOptions = useMemo(
        () => (selectedRelease ? getReleaseTracks(selectedRelease) : []),
        [selectedRelease],
    );

    useEffect(() => {
        if (isOpen) {
            fetchReleases();
        }
    }, [isOpen]);

    const fetchReleases = async () => {
        try {
            setReleasesLoading(true);
            const data = await getReleases({ limit: 100, status: 'Released' });
            setReleases(data.releases);
        } catch (error) {
            console.error("Failed to fetch releases", error);
            toast.error("Failed to load your releases");
        } finally {
            setReleasesLoading(false);
        }
    };

    const validateYouTubeLinks = (input: string): string[] | null => {
        const links = parseYouTubeLinks(input);

        if (links.length === 0) {
            return ["Please provide at least one YouTube link"];
        }

        const invalidLinks = getInvalidYouTubeLinks(links);
        if (invalidLinks.length > 0) {
            return invalidLinks;
        }

        return null;
    };

    const handleNext = () => {
        if (currentStep === 0 && !formData.releaseId) {
            toast.error("Please select a release");
            return;
        }
        if (currentStep === 1 && trackOptions.length === 0) {
            toast.error("Please select a song");
            return;
        }
        if (currentStep === 2) {
            const invalid = validateYouTubeLinks(formData.infringingLinks);
            if (invalid) {
                if (invalid.length === 1 && invalid[0].startsWith("Please")) {
                    setLinkError(invalid[0]);
                    toast.error(invalid[0]);
                } else {
                    setLinkError(`Invalid YouTube URL(s): ${invalid.join(", ")}`);
                    toast.error("One or more links are not valid YouTube URLs");
                }
                return;
            }
            setLinkError(null);
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
        const invalid = validateYouTubeLinks(formData.infringingLinks);
        if (invalid) {
            if (invalid.length === 1 && invalid[0].startsWith("Please")) {
                setLinkError(invalid[0]);
                toast.error(invalid[0]);
            } else {
                setLinkError(`Invalid YouTube URL(s): ${invalid.join(", ")}`);
                toast.error("One or more links are not valid YouTube URLs");
            }
            return;
        }

        setLinkError(null);

        try {
            setLoading(true);
            const links = parseYouTubeLinks(formData.infringingLinks);

            await createYouTubeRequest({
                releaseId: formData.releaseId,
                trackIndex: formData.trackIndex,
                infringingLinks: links,
            });

            toast.success("Claim request submitted successfully!");
            onSuccess();
            resetForm();
        } catch (error: any) {
            const message = error?.response?.data?.message;
            toast.error(
                Array.isArray(message)
                    ? message.join(", ")
                    : message || "Failed to submit request",
            );
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setCurrentStep(0);
        setLinkError(null);
        setFormData({
            releaseId: "",
            trackIndex: 0,
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
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
                            <X className="h-4 w-4" />
                        </Button>
                        <h2 className="text-xl font-semibold">YouTube claim request</h2>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="hidden lg:flex">
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    <div className="w-64 border-r border-border bg-muted/30 p-6 hidden md:block">
                        <div className="space-y-8 relative">
                            <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border z-0" />

                            {steps.map((step, index) => (
                                <div key={step.id} className="flex items-center gap-4 relative z-10">
                                    <div
                                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-colors ${
                                            index < currentStep
                                                ? "bg-primary border-primary text-primary-foreground"
                                                : index === currentStep
                                                    ? "bg-background border-primary text-primary"
                                                    : "bg-background border-muted text-muted-foreground"
                                        }`}
                                    >
                                        {index < currentStep ? <Check className="h-3 w-3" /> : null}
                                        {index === currentStep ? <div className="w-2 h-2 rounded-full bg-primary" /> : null}
                                    </div>
                                    <span className={`text-sm font-medium ${index === currentStep ? "text-primary" : "text-muted-foreground"}`}>
                                        {step.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

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
                                            <h3 className="text-lg font-medium text-foreground">Select release</h3>
                                            <p className="text-sm text-muted-foreground">Choose the release that contains your song</p>
                                        </div>

                                        {releasesLoading ? (
                                            <div className="flex justify-center py-12">
                                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                            </div>
                                        ) : releases.length === 0 ? (
                                            <p className="text-sm text-muted-foreground">No released songs found. A release must be live before you can submit a YouTube claim.</p>
                                        ) : (
                                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                                {releases.map((release) => (
                                                    <label
                                                        key={release._id}
                                                        className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
                                                            formData.releaseId === release._id
                                                                ? "border-primary bg-primary/5"
                                                                : "border-border hover:bg-muted/50"
                                                        }`}
                                                    >
                                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                                            formData.releaseId === release._id ? "border-primary" : "border-muted"
                                                        }`}>
                                                            {formData.releaseId === release._id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                                        </div>
                                                        <input
                                                            type="radio"
                                                            className="hidden"
                                                            name="release"
                                                            value={release._id}
                                                            checked={formData.releaseId === release._id}
                                                            onChange={() => setFormData({ releaseId: release._id, trackIndex: 0, infringingLinks: formData.infringingLinks })}
                                                        />
                                                        <ReleaseCover release={release} />
                                                        <div className="flex-1 min-w-0">
                                                            <span className="font-medium truncate text-foreground block">{release.title}</span>
                                                            <p className="text-xs text-muted-foreground truncate">{release.artistName}</p>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {currentStep === 1 && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-medium text-foreground">Select song</h3>
                                            <p className="text-sm text-muted-foreground">Pick the exact track you want to claim on YouTube</p>
                                        </div>

                                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                            {trackOptions.map((track) => (
                                                <label
                                                    key={track.index}
                                                    className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
                                                        formData.trackIndex === track.index
                                                            ? "border-primary bg-primary/5"
                                                            : "border-border hover:bg-muted/50"
                                                    }`}
                                                >
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                                        formData.trackIndex === track.index ? "border-primary" : "border-muted"
                                                    }`}>
                                                        {formData.trackIndex === track.index && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                                    </div>
                                                    <input
                                                        type="radio"
                                                        className="hidden"
                                                        name="track"
                                                        checked={formData.trackIndex === track.index}
                                                        onChange={() => setFormData({ ...formData, trackIndex: track.index })}
                                                    />
                                                    {selectedRelease && <ReleaseCover release={selectedRelease} />}
                                                    <div className="flex-1 min-w-0">
                                                        <span className="font-medium truncate text-foreground block">{track.title}</span>
                                                        {track.isrc && (
                                                            <p className="text-xs text-muted-foreground font-mono">ISRC: {track.isrc}</p>
                                                        )}
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {currentStep === 2 && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-medium text-foreground">YouTube video link</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Paste the YouTube URL(s) you want to claim for &quot;{trackOptions.find((t) => t.index === formData.trackIndex)?.title}&quot;
                                            </p>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-semibold">YouTube URL(s)</Label>
                                                <textarea
                                                    className={`w-full min-h-[150px] p-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-foreground placeholder:text-muted-foreground ${
                                                        linkError ? "border-destructive" : "border-border"
                                                    }`}
                                                    placeholder="https://youtube.com/watch?v=...&#10;https://youtu.be/..."
                                                    value={formData.infringingLinks}
                                                    onChange={(e) => {
                                                        setFormData({ ...formData, infringingLinks: e.target.value });
                                                        if (linkError) setLinkError(null);
                                                    }}
                                                />
                                                {linkError ? (
                                                    <p className="text-xs text-destructive">{linkError}</p>
                                                ) : (
                                                    <p className="text-xs text-muted-foreground">
                                                        One link per line. Accepted: youtube.com, youtu.be, m.youtube.com
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

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

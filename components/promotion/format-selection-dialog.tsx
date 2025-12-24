"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { Smartphone, Square, Video } from "lucide-react";

interface FormatOption {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    aspectRatio: string;
}

const FORMAT_OPTIONS: FormatOption[] = [
    {
        id: "story",
        name: "Story",
        description: "Image or video 9:16 format",
        icon: <Smartphone className="h-8 w-8" />,
        aspectRatio: "9:16"
    },
    {
        id: "post",
        name: "Post",
        description: "Image or video 1:1 format",
        icon: <Square className="h-8 w-8" />,
        aspectRatio: "1:1"
    },
    {
        id: "reel",
        name: "Reel",
        description: "8 second video 9:16 format",
        icon: <Video className="h-8 w-8" />,
        aspectRatio: "9:16"
    }
];

interface FormatSelectionDialogProps {
    open: boolean;
    onClose: () => void;
    onSelect: (formatId: string) => void;
}

export function FormatSelectionDialog({ open, onClose, onSelect }: FormatSelectionDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create new asset</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 py-4">
                    {FORMAT_OPTIONS.map((format, index) => (
                        <motion.button
                            key={format.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => {
                                onSelect(format.id);
                                onClose();
                            }}
                            className="w-full flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary hover:bg-accent transition-all group"
                        >
                            <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                                {format.icon}
                            </div>
                            <div className="flex-1 text-left">
                                <h3 className="font-bold text-base">{format.name}</h3>
                                <p className="text-sm text-muted-foreground">{format.description}</p>
                            </div>
                        </motion.button>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}

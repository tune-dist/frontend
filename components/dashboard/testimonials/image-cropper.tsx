'use client';

import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface ImageCropperProps {
    image: string;
    onCropComplete: (croppedImage: Blob) => void;
    onCancel: () => void;
}

export default function ImageCropper({ image, onCropComplete, onCancel }: ImageCropperProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const onCropChange = (crop: { x: number; y: number }) => {
        setCrop(crop);
    };

    const onZoomChange = (zoom: number) => {
        setZoom(zoom);
    };

    const onCropAreaComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleCrop = async () => {
        try {
            console.log('Starting crop process...');
            const croppedImage = await getCroppedImg(image, croppedAreaPixels);
            console.log('Crop successful, blob created:', croppedImage.size);
            onCropComplete(croppedImage);
        } catch (e) {
            console.error('Cropping failed:', e);
            // Assuming 'toast' is imported or defined elsewhere
            // toast.error('Failed to crop image');
        }
    };

    return (
        <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
            <DialogContent className="sm:max-w-[500px] bg-[#0a0a0b] border-border/50 text-white p-0 overflow-hidden ring-0 outline-none">
                <DialogHeader className="p-4 border-b border-white/5">
                    <DialogTitle className="text-xl font-semibold">Crop Your Profile</DialogTitle>
                </DialogHeader>

                <div className="relative w-full h-[400px] bg-zinc-900">
                    <Cropper
                        image={image}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        cropShape="round"
                        showGrid={false}
                        onCropChange={onCropChange}
                        onCropComplete={onCropAreaComplete}
                        onZoomChange={onZoomChange}
                    />
                </div>

                <div className="p-6 space-y-4">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm text-white/60">
                            <span>Zoom</span>
                            <span>{Math.round(zoom * 100)}%</span>
                        </div>
                        <input
                            type="range"
                            min={1}
                            max={3}
                            step={0.1}
                            value={zoom}
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary hover:accent-primary/80 transition-all"
                        />
                    </div>
                </div>

                <DialogFooter className="p-4 bg-white/[0.02] border-t border-white/5 flex gap-3 sm:justify-end">
                    <Button
                        variant="ghost"
                        onClick={onCancel}
                        className="text-white/60 hover:text-white hover:bg-white/5"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCrop}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-8"
                    >
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

async function getCroppedImg(imageSrc: string, pixelCrop: any): Promise<Blob> {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('No 2d context');
    }

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );

    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error('Canvas is empty'));
                return;
            }
            resolve(blob);
        }, 'image/jpeg');
    });
}

function createImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => {
            console.error('Image creation FAILED for URL:', url.substring(0, 50) + '...');
            reject(error);
        });

        // CRITICAL: NEVER set crossOrigin for local data or blob URLs
        if (!url.startsWith('data:') && !url.startsWith('blob:')) {
            console.log('Setting crossOrigin=anonymous for remote URL');
            image.setAttribute('crossOrigin', 'anonymous');
        }

        image.src = url;
    });
}

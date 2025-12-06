'use client'

import { Button } from '@/components/ui/button'
import { Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { UploadFormData } from './types'

interface CoverArtStepProps {
    formData: UploadFormData
    setFormData: (data: UploadFormData) => void
}

export default function CoverArtStep({ formData, setFormData }: CoverArtStepProps) {

    const handleCoverArtChange = (file: File) => {
        console.log('🖼️ Album cover upload started:', file.name)

        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file (JPG, PNG, etc.)')
            return
        }

        if (file.size > 10 * 1024 * 1024) {
            toast.error('File size must be less than 10MB')
            return
        }

        const reader = new FileReader()
        reader.onloadend = () => {
            const img = new Image()
            img.onload = () => {
                if (img.width < 1000 || img.height < 1000) {
                    toast.error('Image dimensions must be at least 1000x1000 pixels')
                    return
                }

                setFormData({
                    ...formData,
                    coverArt: file,
                    coverArtPreview: reader.result as string
                })
                toast.success('Cover art selected')
            }
            img.src = reader.result as string
        }
        reader.readAsDataURL(file)
    }

    const handleCoverArtDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        const file = e.dataTransfer.files[0]
        if (file) {
            handleCoverArtChange(file)
        }
    }

    const handleCoverArtDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
    }

    const handleCoverArtClick = () => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'image/*'
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0]
            if (file) {
                handleCoverArtChange(file)
            }
        }
        input.click()
    }

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold">Cover Art Upload</h3>
            <p className="text-muted-foreground">Add eye-catching cover art for your release</p>

            <div className="mt-6">
                {/* Album Cover */}
                <div className="space-y-4 pt-6 border-t border-border">
                    <h3 className="text-lg font-semibold">Album cover</h3>

                    {!formData.coverArtPreview ? (
                        <div
                            className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary/50 transition-colors cursor-pointer bg-muted/20"
                            onClick={handleCoverArtClick}
                            onDrop={handleCoverArtDrop}
                            onDragOver={handleCoverArtDragOver}
                        >
                            <div className="flex flex-col items-center">
                                <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                                <p className="text-base font-medium mb-1 text-primary">Select an image</p>
                                <p className="text-sm text-muted-foreground">
                                    Or drag image here to upload
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="relative inline-block">
                                <img
                                    src={formData.coverArtPreview}
                                    alt="Album cover preview"
                                    className="w-full max-w-sm mx-auto rounded-lg border-2 border-border shadow-lg"
                                />
                            </div>
                            {formData.coverArt && (
                                <div className="text-sm text-muted-foreground text-center">
                                    <p className="font-medium">{formData.coverArt.name}</p>
                                    <p>{(formData.coverArt.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            )}
                            <div className="flex justify-center gap-3">
                                <Button
                                    variant="outline"
                                    onClick={handleCoverArtClick}
                                    type="button"
                                >
                                    Change Image
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setFormData({ ...formData, coverArt: null, coverArtPreview: '' })}
                                    type="button"
                                    className="text-destructive hover:text-destructive"
                                >
                                    Remove
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-sm text-blue-600 dark:text-blue-500">
                        <strong>Tip:</strong> Use high-resolution square images (1:1 aspect ratio) for best results across all platforms.
                    </p>
                </div>
            </div>
        </div>
    )
}

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Image as ImageIcon, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { UploadFormData } from './types'
import { useFormContext } from 'react-hook-form'
import { uploadFileInChunks, uploadFileDirectly } from '@/lib/upload/chunk-uploader'

interface CoverArtStepProps {
    formData?: UploadFormData
    setFormData?: (data: UploadFormData) => void
}

export default function CoverArtStep({ formData: propFormData, setFormData: propSetFormData }: CoverArtStepProps) {
    const { setValue, watch, formState: { errors } } = useFormContext<UploadFormData>()
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)

    const coverArtPreview = watch('coverArtPreview')
    const coverArt = watch('coverArt')

    const handleCoverArtChange = async (file: File) => {
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
        reader.onloadend = async () => {
            const img = new Image()
            img.onerror = () => {
                console.error('🖼️ Image load error - possibly unsupported format or corrupted file');
                toast.error('Failed to load image. If you are using a phone, please ensure it is a standard JPG or PNG file.');
                setIsUploading(false);
            }
            img.onload = async () => {
                if (img.width < 1000 || img.height < 1000) {
                    toast.error('Image dimensions must be at least 1000x1000 pixels')
                    return
                }

                // Initial preview set
                setValue('coverArtPreview', reader.result as string, { shouldValidate: true })

                // Conditional Upload Logic
                const COVER_CHUNK_THRESHOLD = 5 * 1024 * 1024; // 5MB

                console.log(`[CoverArt] Starting upload for ${file.name} (${file.size} bytes)`);
                setIsUploading(true);
                setUploadProgress(0);

                try {
                    let result;

                    if (file.size > COVER_CHUNK_THRESHOLD) {
                        console.log("Cover art > 5MB, using chunk uploader...");
                        result = await uploadFileInChunks(file, '', (progress) => {
                            console.log(`[CoverArt] Chunk Progress: ${progress}%`);
                            setUploadProgress(progress);
                        });
                    } else {
                        console.log("Cover art <= 5MB, using direct uploader...");
                        result = await uploadFileDirectly(file, (progress) => {
                            console.log(`[CoverArt] Direct Progress: ${progress}%`);
                            setUploadProgress(progress);
                        });
                    }

                    console.log('[CoverArt] Upload complete. Result:', result);

                    if (!result || !result.path) {
                        throw new Error('Upload completed but no path returned');
                    }

                    // Store file AND path
                    setValue('coverArt', {
                        file: file,
                        path: result.path,
                        fileName: file.name,
                        size: file.size
                    } as any, { shouldValidate: true });

                    toast.success('Cover art uploaded successfully');
                } catch (error) {
                    console.error('[CoverArt] Upload failed:', error);
                    toast.error(`Failed to upload: ${error instanceof Error ? error.message : 'Unknown error'}`);
                    setValue('coverArt', null, { shouldValidate: true });
                    setValue('coverArtPreview', '', { shouldValidate: true });
                } finally {
                    setIsUploading(false);
                }
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

    const handleRemove = () => {
        setValue('coverArt', null, { shouldValidate: true })
        setValue('coverArtPreview', '', { shouldValidate: true })
    }

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold">Cover Art Upload</h3>
            <p className="text-muted-foreground">Add eye-catching cover art for your release</p>

            <div className="mt-6">
                {/* Album Cover */}
                <div className="space-y-4 pt-6 border-t border-border">
                    <h3 className="text-lg font-semibold">Album cover</h3>

                    {!coverArtPreview ? (
                        <>
                            <div
                                className={`border-2 border-dashed rounded-lg p-12 text-center hover:border-primary/50 transition-colors cursor-pointer bg-muted/20 ${errors.coverArt ? 'border-red-500' : 'border-border'
                                    }`}
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
                            {errors.coverArt && <p className="text-xs text-red-500 mt-2">{String(errors.coverArt.message)}</p>}
                        </>
                    ) : (
                        <div className="space-y-4">
                            <div className="relative inline-block">
                                <img
                                    src={coverArtPreview}
                                    alt="Album cover preview"
                                    className="w-full max-w-sm mx-auto rounded-lg border-2 border-border shadow-lg"
                                />
                            </div>
                            {coverArt && (
                                <div className="text-sm text-muted-foreground text-center">
                                    <p className="font-medium">{(coverArt as File).name}</p>
                                    <p>{((coverArt as File).size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            )}
                            <div className="flex justify-center gap-3">
                                {isUploading ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                            <span className="text-sm text-primary">Uploading... {Math.round(uploadProgress)}%</span>
                                        </div>
                                        <div className="w-full max-w-[200px] h-1 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary transition-all duration-300 ease-in-out"
                                                style={{ width: `${uploadProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <Button
                                            variant="outline"
                                            onClick={handleCoverArtClick}
                                            type="button"
                                        >
                                            Change Image
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={handleRemove}
                                            type="button"
                                            className="text-destructive hover:text-destructive"
                                        >
                                            Remove
                                        </Button>
                                    </>
                                )}
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

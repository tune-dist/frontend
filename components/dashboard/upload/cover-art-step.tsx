import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Image as ImageIcon, Loader2, UploadCloud, Lightbulb, CheckCircle2, ClipboardCheck, Info } from 'lucide-react'
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

        if (file.size > 20 * 1024 * 1024) {
            toast.error('File size must be less than 20MB')
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
                // Keep client-side dimension check for instant feedback
                if (img.width < 3000 || img.height < 3000) {
                    toast.error('Image dimensions must be at least 3000x3000 pixels')
                    return
                }

                setIsUploading(true);
                setUploadProgress(0);

                try {
                    // 1. Strict Backend Validation
                    const formData = watch(); // Get all form data

                    // Extract metadata for validation
                    // Handle featured artists: from 'artists' array and potentially 'featuringArtist' field
                    const featuredArtists = (formData.artists || []).map(a => a.name);
                    if (formData.featuringArtist) {
                        featuredArtists.push(formData.featuringArtist);
                    }

                    const validationMetadata = {
                        artistName: formData.artistName,
                        trackTitle: formData.title,
                        featuredArtists: featuredArtists,
                        isExplicit: formData.isExplicit,
                        releaseYear: formData.releaseDate ? new Date(formData.releaseDate).getFullYear().toString() : undefined,
                        recordLabel: formData.labelName
                    };

                    console.log('Validating cover art with metadata:', validationMetadata);
                    // Dynamically import to avoid top-level issues if any
                    const { validateCoverArt } = await import('@/lib/api/cover-art');
                    const validationResult = await validateCoverArt(file, validationMetadata);

                    if (validationResult.status === 'rejected') {
                        // Consolidate errors
                        const errorMessages = validationResult.errors.map(e => e.message).join('\n');
                        console.error('Validation failed:', validationResult.errors);
                        toast.error(
                            (t) => (
                                <div className="space-y-2">
                                    <p className="font-bold">Cover Art Rejected</p>
                                    <ul className="list-disc pl-4 text-sm">
                                        {validationResult.errors.map((e, i) => (
                                            <li key={i}>{e.message}</li>
                                        ))}
                                    </ul>
                                </div>
                            ),
                            { duration: 6000 }
                        );
                        setIsUploading(false);
                        return; // Stop upload
                    }

                    if (validationResult.status === 'warning') {
                        toast(
                            (t) => (
                                <div className="space-y-2">
                                    <p className="font-bold text-yellow-600">Warning</p>
                                    <ul className="list-disc pl-4 text-sm">
                                        {validationResult.errors.map((e, i) => (
                                            <li key={i}>{e.message}</li>
                                        ))}
                                    </ul>
                                </div>
                            ),
                            { icon: '⚠️', duration: 5000 }
                        );
                    }


                    // 2. Proceed to Upload if Valid
                    // Initial preview set
                    setValue('coverArtPreview', reader.result as string, { shouldValidate: true })

                    // Conditional Upload Logic
                    const COVER_CHUNK_THRESHOLD = 5 * 1024 * 1024; // 5MB
                    let result;

                    if (file.size > COVER_CHUNK_THRESHOLD) {
                        console.log("Cover art > 5MB, using chunk uploader...");
                        result = await uploadFileInChunks(file, '', (progress) => {
                            setUploadProgress(progress);
                        });
                    } else {
                        console.log("Cover art <= 5MB, using direct uploader...");
                        result = await uploadFileDirectly(file, (progress) => {
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

                    toast.success('Cover art validated and uploaded successfully');
                } catch (error) {
                    console.error('[CoverArt] Upload/Validation failed:', error);
                    toast.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Upload Column */}
            <div className="lg:col-span-2 space-y-6">
                <div className="space-y-2">
                    <h2 className="text-4xl font-bold tracking-tight">Upload Cover Art</h2>
                    <p className="text-muted-foreground text-lg">
                        Make a great first impression. High quality, 1:1 ratio art is required for distribution.
                    </p>
                </div>

                <div className="relative">
                    {!coverArtPreview ? (
                        <div
                            className={`border-2 border-dashed rounded-3xl p-16 text-center transition-all duration-300 cursor-pointer 
                                bg-card/10 hover:bg-card/20 group
                                ${errors.coverArt ? 'border-red-500 bg-red-500/5' : 'border-border hover:border-primary/50'}`}
                            onClick={handleCoverArtClick}
                            onDrop={handleCoverArtDrop}
                            onDragOver={handleCoverArtDragOver}
                        >
                            <div className="flex flex-col items-center gap-6">
                                <div className="p-4 rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                                    <UploadCloud className="h-12 w-12" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-semibold">Drag and drop your art here</h3>
                                    <p className="text-muted-foreground">or browse from your computer</p>
                                </div>
                                <Button
                                    type="button"
                                    className="rounded-full px-8 py-6 bg-primary/20 hover:bg-primary/30 text-primary border-0 text-lg font-medium"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleCoverArtClick();
                                    }}
                                >
                                    Browse Files
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="relative mx-auto max-w-sm group">
                                <img
                                    src={coverArtPreview}
                                    alt="Album cover preview"
                                    className="w-full aspect-square object-cover rounded-2xl border-2 border-border shadow-2xl transition-all duration-300 group-hover:brightness-75"
                                />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="flex gap-3">
                                        <Button
                                            type="button"
                                            size="sm"
                                            className="rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 border-white/20"
                                            onClick={handleCoverArtClick}
                                        >
                                            Change
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="destructive"
                                            className="rounded-full"
                                            onClick={handleRemove}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {coverArt && (
                                <div className="flex flex-col items-center gap-1">
                                    <p className="text-lg font-semibold truncate max-w-md">{(coverArt as any).fileName || (coverArt as File).name}</p>
                                    <p className="text-muted-foreground">
                                        {((coverArt as any).size / 1024 / 1024).toFixed(2)} MB • {(coverArt as any).path ? 'Uploaded' : 'Pending'}
                                    </p>
                                </div>
                            )}

                            {isUploading && (
                                <div className="max-w-md mx-auto space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-primary font-medium flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Uploading cover art...
                                        </span>
                                        <span className="text-primary font-bold">{Math.round(uploadProgress)}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary transition-all duration-300 ease-out"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    {errors.coverArt && (
                        <p className="text-sm text-red-500 mt-4 flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                            <Info className="h-4 w-4" />
                            {String(errors.coverArt.message)}
                        </p>
                    )}
                </div>

                <p className="text-sm text-muted-foreground text-center">
                    Supported formats: JPG, PNG. Max size: 20MB.
                </p>
            </div>

            {/* Sidebar Column */}
            <div className="space-y-6">
                {/* Requirements Card */}
                <div className="p-6 rounded-3xl border border-border/50 bg-card/30 backdrop-blur-sm space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <ClipboardCheck className="h-5 w-5" />
                        </div>
                        <h3 className="text-xl font-bold">Art Requirements</h3>
                    </div>

                    <ul className="space-y-4">
                        {[
                            '3000 x 3000 pixels minimum resolution',
                            'Square aspect ratio (1:1)',
                            'RGB Color space (CMYK not supported)',
                            'Must match artist name & title perfectly',
                            'No blurred or pixelated images'
                        ].map((req, i) => (
                            <li key={i} className="flex items-start gap-3">
                                <div className="mt-1 flex-shrink-0">
                                    <div className="h-5 w-5 rounded-full border border-primary/30 flex items-center justify-center text-xs">
                                        <div className="w-2 h-2 rounded-full bg-primary/20" />
                                    </div>
                                </div>
                                <span className="text-muted-foreground leading-tight">{req}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Pro Tip Card */}
                <div className="p-6 rounded-3xl border-l-4 border-l-primary border border-primary/20 bg-primary/5 space-y-3">
                    <div className="flex items-center gap-2 text-primary">
                        <Lightbulb className="h-5 w-5" />
                        <h3 className="text-lg font-bold">Pro Tip</h3>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        Avoid using social media handles, website URLs, or pricing information on your cover art.
                        Stores will reject it.
                    </p>
                </div>
            </div>
        </div>
    )
}

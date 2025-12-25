import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Image as ImageIcon, Loader2, UploadCloud, Lightbulb, CheckCircle2, ClipboardCheck, Info, XCircle, Circle } from 'lucide-react'
import toast from 'react-hot-toast'
import { UploadFormData } from './types'
import { useFormContext } from 'react-hook-form'
import { uploadFileInChunks, uploadFileDirectly } from '@/lib/upload/chunk-uploader'

interface CoverArtStepProps {
    formData?: UploadFormData
    setFormData?: (data: UploadFormData) => void
}

type RequirementStatus = 'pending' | 'success' | 'error';

export default function CoverArtStep({ formData: propFormData, setFormData: propSetFormData }: CoverArtStepProps) {
    const { setValue, watch, formState: { errors } } = useFormContext<UploadFormData>()
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [validationErrors, setValidationErrors] = useState<any[]>([]);
    const [hasValidated, setHasValidated] = useState(false);

    const coverArtPreview = watch('coverArtPreview')
    const coverArt = watch('coverArt')

    const requirements = useMemo(() => [
        {
            id: 'resolution',
            label: 'HD Resolution (3000x3000px minimum)',
            codes: ['LOW_RESOLUTION', 'CANNOT_READ_DIMENSIONS']
        },
        {
            id: 'aspectRatio',
            label: 'Perfect Square (1:1 Ratio)',
            codes: ['NOT_SQUARE']
        },
        {
            id: 'colorSpace',
            label: 'RGB Color Space (No CMYK)',
            codes: ['INVALID_COLOR_MODE']
        },
        {
            id: 'borders',
            label: 'Full Bleed (No Borders or Watermarks)',
            codes: ['UNWANTED_BORDERS', 'COMPRESSION_ARTIFACTS', 'DISALLOWED_BRAND_LOGOS']
        },
        {
            id: 'metadata',
            label: 'Artist & Title Match (No Misleading Names)',
            codes: ['ARTIST_NAME_MISMATCH', 'TRACK_TITLE_MISMATCH', 'POTENTIAL_MISLEADING_ARTIST', 'MISLEADING_VERSION_TEXT']
        },
        {
            id: 'content',
            label: 'Prohibited Content & Social Handles',
            codes: ['BANNED_CONTENT', 'PROHIBITED_VISUAL_CONTENT', 'SOCIAL_MEDIA_HANDLES', 'DISALLOWED_TEXT', 'DISALLOWED_YEAR', 'EXPLICIT_CONTENT_MISMATCH']
        },
        {
            id: 'blur',
            label: 'Studio Quality (No Blur or Noise)',
            codes: ['BLURRED_IMAGE']
        }
    ], []);

    const getStatus = (reqCodes: string[]): RequirementStatus => {
        if (!hasValidated) return 'pending';
        const hasError = validationErrors.some(err => reqCodes.includes(err.code));
        return hasError ? 'error' : 'success';
    };

    const handleCoverArtChange = async (file: File) => {
        console.log('🖼️ Album cover upload started:', file.name)
        setHasValidated(false);
        setValidationErrors([]);

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
                    // Still move to backend validation to update UI radios? 
                    // No, client side catch is faster. But we want the UI to update.
                }

                setIsUploading(true);
                setUploadProgress(0);

                try {
                    // 1. Strict Backend Validation
                    const formData = watch(); // Get all form data

                    // Extract metadata for validation
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
                    const { validateCoverArt } = await import('@/lib/api/cover-art');
                    const validationResult = await validateCoverArt(file, validationMetadata);

                    setValidationErrors(validationResult.errors || []);
                    setHasValidated(true);

                    if (validationResult.status === 'rejected') {
                        console.error('Validation failed:', validationResult.errors);
                        toast.error('Cover art requirements not met. Please check the list.');
                        setIsUploading(false);
                        return; // Stop upload
                    }

                    if (validationResult.status === 'warning') {
                        toast('Warning: Some minor issues detected, but proceeding.', { icon: '⚠️', duration: 5000 });
                    }


                    // 2. Proceed to Upload if Valid
                    setValue('coverArtPreview', reader.result as string, { shouldValidate: true })

                    const COVER_CHUNK_THRESHOLD = 5 * 1024 * 1024; // 5MB
                    let result;

                    if (file.size > COVER_CHUNK_THRESHOLD) {
                        result = await uploadFileInChunks(file, '', (progress) => {
                            setUploadProgress(progress);
                        });
                    } else {
                        result = await uploadFileDirectly(file, (progress) => {
                            setUploadProgress(progress);
                        });
                    }

                    if (!result || !result.path) {
                        throw new Error('Upload completed but no path returned');
                    }

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
        setHasValidated(false);
        setValidationErrors([]);
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
                            <ClipboardCheck className="h-6 w-6" />
                        </div>
                        <h3 className="text-2xl font-bold italic tracking-tight uppercase">Art Requirements</h3>
                    </div>

                    <ul className="space-y-5">
                        {requirements.map((req, i) => {
                            const status = getStatus(req.codes);
                            return (
                                <li key={i} className="flex items-start gap-4 transition-all duration-300">
                                    <div className="mt-1 flex-shrink-0">
                                        {status === 'pending' && (
                                            <div className="h-6 w-6 rounded-full border-2 border-primary/40 flex items-center justify-center">
                                                <div className="w-2.5 h-2.5 rounded-full bg-primary/30" />
                                            </div>
                                        )}
                                        {status === 'success' && (
                                            <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center text-white scale-110 shadow-lg shadow-green-500/20">
                                                <CheckCircle2 className="h-4 w-4 stroke-[3px]" />
                                            </div>
                                        )}
                                        {status === 'error' && (
                                            <div className="h-6 w-6 rounded-full bg-red-500 flex items-center justify-center text-white scale-110 shadow-lg shadow-red-500/20">
                                                <XCircle className="h-4 w-4 stroke-[3px]" />
                                            </div>
                                        )}
                                    </div>
                                    <span className={`text-base font-medium leading-tight transition-colors duration-300 ${status === 'error' ? 'text-red-400' :
                                        status === 'success' ? 'text-green-400' :
                                            'text-muted-foreground'
                                        }`}>
                                        {req.label}
                                    </span>
                                </li>
                            );
                        })}
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

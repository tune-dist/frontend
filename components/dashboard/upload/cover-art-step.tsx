import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Image as ImageIcon, Loader2, UploadCloud, Lightbulb, CheckCircle2, ClipboardCheck, Info, XCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { UploadFormData } from './types'
import { useFormContext } from 'react-hook-form'
import { uploadFileInChunks, uploadFileDirectly } from '@/lib/upload/chunk-uploader'
import Cookies from 'js-cookie'
import { config } from '@/lib/config'
import { motion, AnimatePresence } from 'framer-motion'

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
    const [isValidating, setIsValidating] = useState(false);

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
            id: 'collab',
            label: 'Collaborations (Must match Metadata)',
            codes: ['POTENTIAL_MISLEADING_COLLAB', 'MISSING_FEATURED_ARTIST_METADATA']
        },
        {
            id: 'content',
            label: 'Prohibited Content & Social Handles',
            codes: ['BANNED_CONTENT', 'PROHIBITED_VISUAL_CONTENT', 'SUGGESTIVE_VISUAL_CONTENT', 'SOCIAL_MEDIA_HANDLES', 'DISALLOWED_TEXT', 'DISALLOWED_YEAR', 'EXPLICIT_CONTENT_MISMATCH', 'DISALLOWED_LABEL_NAME']
        },
        {
            id: 'quality',
            label: 'Studio Quality (No Blur or Noise)',
            codes: ['BLURRED_IMAGE', 'INVALID_IMAGE_FILE']
        }
    ], []);

    const getStatus = (reqCodes: string[]): RequirementStatus => {
        if (!hasValidated) return 'pending';
        const hasError = validationErrors.some((err: any) => reqCodes.includes(err.code));
        return hasError ? 'error' : 'success';
    };

    const handleCoverArtChange = async (file: File) => {
        if (isUploading) {
            toast.error('An upload is already in progress');
            return;
        }
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
                }

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
                    setIsUploading(true);
                    setIsValidating(true);
                    setUploadProgress(0);

                    const { validateCoverArt } = await import('@/lib/api/cover-art');
                    const validationResult = await validateCoverArt(file, validationMetadata);

                    setValidationErrors(validationResult.errors || []);
                    setHasValidated(true);
                    setIsValidating(false);

                    // Sync validation result with form state
                    setValue('coverArtValidationStatus', validationResult.status);
                    setValue('coverArtValidationIssues', validationResult.issues || validationResult.errors || []);
                    setValue('coverArtConsent', false); // Reset consent for new upload

                    if (validationResult.status === 'rejected') {
                        console.warn('Validation failed (rejected), but proceeding with upload as per requirements:', validationResult.errors);
                        toast.error('Cover art requirements not met. Please check the warnings below and provide consent if you want to proceed.');
                    } else if (validationResult.status === 'warned' || validationResult.status === 'warning') {
                        toast('Cover art has some warnings. Please review them below.', { icon: '⚠️', duration: 5000 });
                    }

                    // 2. Set Preview and Metadata (Deferred S3 Upload)
                    setValue('coverArtPreview', reader.result as string, { shouldValidate: true })

                    setValue('coverArt', {
                        file: file,
                        path: '', // Signal that it needs upload on final submit
                        fileName: file.name,
                        size: file.size,
                        dimensions: {
                            width: img.width,
                            height: img.height
                        },
                        format: file.type.split('/')[1] || 'jpg'
                    } as any, { shouldValidate: true });

                    toast.success('Cover art validated successfully');
                } catch (error) {
                    console.error('[CoverArt] Upload/Validation failed:', error);
                    toast.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
                    setValue('coverArt', null, { shouldValidate: true });
                    setValue('coverArtPreview', '', { shouldValidate: true });
                } finally {
                    setIsUploading(false);
                    setIsValidating(false);
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
        setValue('coverArtValidationStatus', undefined);
        setValue('coverArtValidationIssues', []);
        setValue('coverArtConsent', false);
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
                                    onClick={(e: React.MouseEvent) => {
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
                                        {((coverArt as any).size / 1024 / 1024).toFixed(2)} MB • {(coverArt as any).path ? 'Uploaded' : 'Validated'}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    <AnimatePresence>
                        {isUploading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/60 backdrop-blur-md"
                            >
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.9, opacity: 0 }}
                                    className="max-w-md w-full mx-auto space-y-6 p-10 rounded-3xl bg-card border border-primary/20 shadow-2xl"
                                >
                                    <div className="flex flex-col items-center gap-6 text-center">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                                            <Loader2 className="h-16 w-16 animate-spin text-primary relative" />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-bold tracking-tight">
                                                {isValidating ? 'Validating Cover Art' : 'Uploading Cover Art'}
                                            </h3>
                                            <p className="text-muted-foreground">
                                                {isValidating ? 'Our AI is checking your artwork against store standards...' : 'Sending your high-quality art to our secure servers...'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-sm font-medium">
                                            <span className="text-primary">
                                                {isValidating ? 'AI Analysis' : 'Upload Progress'}
                                            </span>
                                            {!isValidating && <span className="text-primary">{Math.round(uploadProgress)}%</span>}
                                        </div>
                                        {!isValidating && (
                                            <div className="w-full h-3 bg-primary/10 rounded-full overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-primary"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${uploadProgress}%` }}
                                                    transition={{ duration: 0.3 }}
                                                />
                                            </div>
                                        )}
                                        {isValidating && (
                                            <div className="w-full h-3 bg-primary/10 rounded-full overflow-hidden relative">
                                                <motion.div
                                                    className="absolute inset-y-0 bg-primary/40 w-1/3"
                                                    animate={{
                                                        left: ['-100%', '200%'],
                                                    }}
                                                    transition={{
                                                        repeat: Infinity,
                                                        duration: 1.5,
                                                        ease: "linear"
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-xs text-center text-muted-foreground animate-pulse">
                                        Please do not close this window
                                    </p>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {errors.coverArt && (
                    <p className="text-sm text-red-500 mt-4 flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                        <Info className="h-4 w-4" />
                        {String(errors.coverArt.message)}
                    </p>
                )}

                {/* OCR Warnings and Consent Section */}
                {hasValidated && (watch('coverArtValidationStatus') === 'rejected' || watch('coverArtValidationStatus') === 'warned' || watch('coverArtValidationStatus') === 'warning' || validationErrors.length > 0) && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 p-6 rounded-3xl border border-amber-500/30 bg-amber-500/5 space-y-4"
                    >
                        <div className="flex items-center gap-3 text-amber-500">
                            <AlertCircle className="h-6 w-6" />
                            <h3 className="text-xl font-bold">Validation Warnings</h3>
                        </div>

                        <ul className="space-y-2">
                            {(watch('coverArtValidationIssues') || validationErrors).map((issue: any, idx: number) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-amber-200/80">
                                    <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                                    <span>{issue.message}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="pt-4 border-t border-amber-500/20">
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <div className="relative flex items-center mt-1">
                                    <input
                                        type="checkbox"
                                        className="peer h-5 w-5 rounded border-amber-500/50 bg-transparent text-amber-500 focus:ring-amber-500 cursor-pointer appearance-none border-2 checked:bg-amber-500"
                                        checked={watch('coverArtConsent')}
                                        onChange={(e) => setValue('coverArtConsent', e.target.checked, { shouldValidate: true })}
                                    />
                                    <CheckCircle2 className="absolute h-5 w-5 text-white scale-0 peer-checked:scale-100 transition-transform pointer-events-none p-0.5" />
                                </div>
                                <span className="text-base font-medium text-amber-200/90 group-hover:text-amber-100 transition-colors">
                                    Are you sure you want to continue with these warnings?
                                </span>
                            </label>
                            {errors.coverArtConsent && (
                                <p className="text-xs text-red-500 mt-2 ml-8 font-medium italic">
                                    You must check this box to proceed to the next step.
                                </p>
                            )}
                        </div>
                    </motion.div>
                )}

                <p className="text-sm text-muted-foreground text-center pt-4">
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
                        {requirements.map((req: any, i: number) => {
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

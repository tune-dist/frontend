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
import { Tooltip } from '@/components/ui/tooltip'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
    getCoverArtMaxSizeMB,
    validateCoverArtFile,
    validateCoverArtDimensions,
    loadCoverArtImage,
    validateCoverArt,
    isExistingUnchangedCoverArt,
    COVER_ART_MIN_DIMENSION_PX,
    COVER_ART_MAX_DIMENSION_PX,
} from './cover-art-file-validation'
import { getErrorMessage } from '@/lib/get-error-message'

interface CoverArtStepProps {
    formData?: UploadFormData
    setFormData?: (data: UploadFormData) => void
    fieldRules?: Record<string, any>
}

type RequirementStatus = 'pending' | 'success' | 'error';

export default function CoverArtStep({ formData: propFormData, setFormData: propSetFormData, fieldRules = {} }: CoverArtStepProps) {
    const { setValue, watch, formState: { errors }, getValues, setError, clearErrors } = useFormContext<UploadFormData>()
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [isValidating, setIsValidating] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<number>(1);

    const validationStatus = watch('coverArtValidationStatus');
    const validationIssues = watch('coverArtValidationIssues') || [];
    const coverArtChanged = watch('coverArtChanged');
    const coverArtPreview = watch('coverArtPreview')
    const coverArt = watch('coverArt')
    const existingCoverPath = (coverArt as { path?: string } | null)?.path
    const isExistingS3Cover = Boolean(existingCoverPath && coverArtPreview)
    const skipAiValidation = isExistingUnchangedCoverArt(coverArt, coverArtChanged);
    const hasValidated = skipAiValidation || !!validationStatus;

    const buildValidationMetadata = (formData: UploadFormData) => {
        const featuredArtists = (formData.artists || []).map((artist) => artist.name);
        if (formData.featuringArtist) {
            featuredArtists.push(formData.featuringArtist);
        }

        return {
            artistName: formData.artistName,
            trackTitle: formData.title,
            featuredArtists,
            isExplicit: formData.isExplicit,
            releaseYear: formData.releaseDate
                ? new Date(formData.releaseDate).getFullYear().toString()
                : undefined,
            recordLabel: formData.labelName,
        };
    };

    const applyValidationResult = (validationResult: Awaited<ReturnType<typeof validateCoverArt>>) => {
        setValue('coverArtValidationStatus', validationResult.status);
        setValue(
            'coverArtValidationIssues',
            validationResult.issues || validationResult.errors || [],
        );
        setValue('coverArtConsent', false);
        setValue('coverArtChanged', false);

        if (validationResult.status === 'approved') {
            toast.success('Cover art validated successfully');
        }
    };
    const requirements = useMemo(() => [
        {
            id: 'resolution',
            label: 'Resolution (1500×1500 to 6000×6000 px)',
            codes: ['LOW_RESOLUTION', 'HIGH_RESOLUTION', 'CANNOT_READ_DIMENSIONS']
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
            codes: ['ARTIST_NAME_MISMATCH', 'TRACK_TITLE_MISMATCH', 'POTENTIAL_MISLEADING_ARTIST', 'MISLEADING_VERSION_TEXT', 'ARTIST_PARTIAL_MATCH', 'TITLE_PARTIAL_MATCH', 'ARTIST_MISSING', 'TITLE_MISSING', 'VERSION_MISMATCH']
        },
        {
            id: 'collab',
            label: 'Collaborations (Must match Metadata)',
            codes: ['POTENTIAL_MISLEADING_COLLAB', 'MISSING_FEATURED_ARTIST_METADATA']
        },
        {
            id: 'content',
            label: 'Prohibited Content & Social Handles',
            codes: ['BANNED_CONTENT', 'PROHIBITED_VISUAL_CONTENT', 'SUGGESTIVE_VISUAL_CONTENT', 'SOCIAL_MEDIA_HANDLES', 'SOCIAL_HANDLE', 'DISALLOWED_TEXT', 'BLOCKED_TEXT', 'URL_DETECTED', 'DISALLOWED_YEAR', 'YEAR_DETECTED', 'EXPLICIT_CONTENT_MISMATCH', 'EXPLICIT_MISMATCH', 'DISALLOWED_LABEL_NAME']
        },
        {
            id: 'quality',
            label: 'Studio Quality (No Blur or Noise)',
            codes: ['BLURRED_IMAGE', 'INVALID_IMAGE_FILE']
        }
    ], []);

    const getStatus = (reqCodes: string[]): RequirementStatus => {
        if (!hasValidated) return 'pending';
        const hasError = validationIssues.some((err: any) => reqCodes.includes(err.code));
        return hasError ? 'error' : 'success';
    };

    const coverArtRules = fieldRules.coverArt;
    const maxCoverArtSizeMB = getCoverArtMaxSizeMB(coverArtRules);
    const allowedCoverArtTypes =
        coverArtRules?.allowedFileTypes?.map((t: string) => t.toUpperCase()).join(", ") ??
        "JPG, PNG";

    const handleCoverArtChange = async (file: File) => {
        if (isUploading) {
            toast.error('An upload is already in progress');
            return;
        }
        setValue('coverArtValidationStatus', undefined);
        setValue('coverArtValidationIssues', []);
        setValue('coverArtChanged', true);

        const fileValidation = validateCoverArtFile(file, coverArtRules);
        if (!fileValidation.valid) {
            toast.error(fileValidation.message);
            setError('coverArt', { type: 'manual', message: fileValidation.message });
            setValue('coverArt', null, { shouldValidate: true });
            setValue('coverArtPreview', '', { shouldValidate: true });
            return;
        }

        let imageData: { width: number; height: number; previewDataUrl: string };
        try {
            imageData = await loadCoverArtImage(file);
        } catch (error) {
            const message = getErrorMessage(
                error,
                'Failed to load image. If you are using a phone, please ensure it is a standard JPG or PNG file.',
            );
            toast.error(message);
            setError('coverArt', { type: 'manual', message });
            setValue('coverArt', null, { shouldValidate: true });
            setValue('coverArtPreview', '', { shouldValidate: true });
            return;
        }

        const dimensionValidation = validateCoverArtDimensions(
            imageData.width,
            imageData.height,
        );
        if (!dimensionValidation.valid) {
            toast.error(dimensionValidation.message);
            setError('coverArt', { type: 'manual', message: dimensionValidation.message });
            setValue('coverArt', null, { shouldValidate: true });
            setValue('coverArtPreview', '', { shouldValidate: true });
            return;
        }

        clearErrors('coverArt');

        const formData = watch();

        try {
            const validationMetadata = buildValidationMetadata(formData);
            setIsUploading(true);
            setIsValidating(true);
            setUploadProgress(0);

            const validationResult = await validateCoverArt(file, validationMetadata);
            applyValidationResult(validationResult);

            setValue('coverArtPreview', imageData.previewDataUrl, { shouldValidate: true });
            setValue('coverArt', {
                file: file,
                fileName: file.name,
                size: file.size,
                dimensions: {
                    width: imageData.width,
                    height: imageData.height,
                },
                format: file.type.split('/')[1] || 'jpg',
            } as any, { shouldValidate: true });
        } catch (error) {
            console.error('[CoverArt] Upload/Validation failed:', error);
            const message = getErrorMessage(
                error,
                'Failed to validate cover art. Please try again.',
            );
            setError('coverArt', { type: 'server', message });
            setValue('coverArt', null, { shouldValidate: true });
            setValue('coverArtPreview', '', { shouldValidate: true });
        } finally {
            setIsUploading(false);
            setIsValidating(false);
        }
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
        setValue('coverArtChanged', false);
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Upload Column */}
            <div className="lg:col-span-2 space-y-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 justify-between">
                        <h2 className="text-2xl font-bold tracking-tight">Upload Cover Art</h2>
                        <Tooltip content="Avoid using social media handles, website URLs, or pricing information on your cover art. Stores will reject it.">
                            <div className="p-1.5 rounded-full bg-primary/10 text-primary cursor-help hover:bg-primary/20 transition-colors mt-1">
                                <Lightbulb className="h-5 w-5" />
                            </div>
                        </Tooltip>
                    </div>
                    <p className="text-muted-foreground text-md">
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
                                    <h3 className="text-xl font-semibold">Drag and drop your art here</h3>
                                    <p className="text-muted-foreground">or browse from your computer</p>
                                </div>
                                <Button
                                    type="button"
                                    className="rounded-full px-8 py-6 bg-primary/20 hover:bg-primary/30 text-primary border-0 text-base font-medium"
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
                            {isExistingS3Cover && (
                                <div className="flex justify-center">
                                    <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                                        Saved cover art
                                    </span>
                                </div>
                            )}
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
                                    <p className="text-lg font-semibold truncate max-w-md">
                                        {(coverArt as { fileName?: string }).fileName ||
                                            `${getValues('title') || 'cover-art'}.jpg`}
                                    </p>
                                    <p className="text-muted-foreground">
                                        {((coverArt as any).size / 1024 / 1024).toFixed(2)} MB •{' '}
                                        {(coverArt as any).path ? 'Saved on server' : 'Validated'}
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
                {(watch('coverArtValidationStatus') === 'rejected' || watch('coverArtValidationStatus') === 'warned' || watch('coverArtValidationStatus') === 'warning') && (watch('coverArtValidationIssues') || []).length > 0 && (
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
                            {validationIssues.map((issue: any, idx: number) => (
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
                    Supported formats: {allowedCoverArtTypes}. Dimensions: {COVER_ART_MIN_DIMENSION_PX}×{COVER_ART_MIN_DIMENSION_PX} to {COVER_ART_MAX_DIMENSION_PX}×{COVER_ART_MAX_DIMENSION_PX}px (square). Max size: {maxCoverArtSizeMB}MB.
                </p>
            </div>

            {/* Sidebar Column */}
            <div className="space-y-6">
                {/* Requirements Card */}
                <div className="p-4 rounded-xl border border-primary/20 bg-primary/10 backdrop-blur-sm space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/20 text-primary">
                            <ClipboardCheck className="h-4 w-4" />
                        </div>
                        <h3 className="text-lg font-bold tracking-tight uppercase">Art Requirements</h3>
                    </div>

                    <ul className="space-y-5">
                        {requirements.map((req: any, i: number) => {
                            const status = getStatus(req.codes);
                            return (
                                <li key={i} className="flex items-start gap-2 transition-all duration-300">
                                    <div className="mt-1 flex-shrink-0">
                                        {status === 'pending' && (
                                            <div className="h-5 w-5 rounded-full border-2 border-primary/40 flex items-center justify-center">
                                                <div className="w-2 h-2 rounded-full bg-primary/30" />
                                            </div>
                                        )}
                                        {status === 'success' && (
                                            <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center text-white scale-110 shadow-lg shadow-green-500/20">
                                                <CheckCircle2 className="h-3 w-3 stroke-[3px]" />
                                            </div>
                                        )}
                                        {status === 'error' && (
                                            <div className="h-5 w-5 rounded-full bg-red-500 flex items-center justify-center text-white scale-110 shadow-lg shadow-red-500/20">
                                                <XCircle className="h-3 w-3 stroke-[3px]" />
                                            </div>
                                        )}
                                    </div>
                                    <span className={`text-xs font-medium leading-tight transition-colors duration-300 ${status === 'error' ? 'text-red-400' :
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


                {/* Templates Button & Modal */}
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="w-full rounded-xl py-6 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 font-bold uppercase tracking-wider transition-all hover:scale-[1.02] hidden">
                            <ImageIcon className="mr-2 h-5 w-5" />
                            Cover Art Templates
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-6xl w-[95vw] h-[650px] bg-[#0a0a0a] border-border/50 text-foreground p-0 overflow-hidden flex flex-col">
                        <div className="flex flex-col lg:flex-row h-full w-full">

                            {/* 30% Left Column - Editor */}
                            <div className="w-full lg:w-[30%] bg-black/40 border-r border-border/50 p-6 flex flex-col gap-6 overflow-y-auto">
                                <div className="space-y-1">
                                    <h3 className="text-lg font-bold">Customize Art</h3>
                                    <p className="text-xs text-muted-foreground">Add your album and artist details to the template.</p>
                                </div>

                                <div className="relative aspect-square rounded-xl overflow-hidden border border-border/30 shadow-2xl bg-muted">
                                    <img
                                        src={`/assets/images/cover-art-thumb/${selectedTemplate}.jpg`}
                                        alt="Selected Template"
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Overlay Text Preview */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-between py-10 px-4 text-center">
                                        <h2 className="text-2xl font-black text-white drop-shadow-md uppercase tracking-widest opacity-90">Album Name</h2>
                                        <h3 className="text-lg font-bold text-white/80 drop-shadow-md uppercase tracking-wider">Artist Name</h3>
                                    </div>
                                </div>

                                <div className="space-y-4 flex-1">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Release Title *</label>
                                        <input
                                            type="text"
                                            className="w-full h-11 bg-background/50 border border-border rounded-xl px-4 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                                            placeholder="Album Name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Main Artist Name *</label>
                                        <input
                                            type="text"
                                            className="w-full h-11 bg-background/50 border border-border rounded-xl px-4 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                                            placeholder="Artist Name"
                                        />
                                    </div>
                                </div>

                                <Button className="w-full py-6 rounded-xl font-bold uppercase tracking-widest bg-primary text-white hover:bg-primary/90 mt-auto shadow-lg shadow-primary/20">
                                    Save and Continue
                                </Button>
                            </div>

                            {/* 70% Right Column - Grid */}
                            <div className="w-full lg:w-[70%] p-6 flex flex-col h-full">
                                <DialogHeader className="mb-6 shrink-0 text-left">
                                    <DialogTitle className="text-xl md:text-2xl font-bold tracking-tight">Or Customize One of Our Cover Art Templates:</DialogTitle>
                                </DialogHeader>

                                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pb-6 pr-2 custom-scrollbar">
                                    {Array.from({ length: 12 }).map((_, i) => (
                                        <div
                                            key={i}
                                            onClick={() => setSelectedTemplate(i + 1)}
                                            className={`relative aspect-square rounded-xl overflow-hidden group cursor-pointer border-2 transition-all duration-300 ${selectedTemplate === i + 1
                                                ? 'border-primary ring-4 ring-primary/20 scale-[0.98]'
                                                : 'border-transparent hover:border-primary/50'
                                                }`}
                                        >
                                            <img
                                                src={`/assets/images/cover-art-thumb/${i + 1}.jpg`}
                                                alt={`Cover Art Template ${i + 1}`}
                                                loading="lazy"
                                                className={`w-full h-full object-cover transition-transform duration-500 ${selectedTemplate !== i + 1 ? 'group-hover:scale-110' : ''}`}
                                            />
                                            {selectedTemplate === i + 1 && (
                                                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center backdrop-blur-[1px]">
                                                    <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg">
                                                        <CheckCircle2 className="h-5 w-5" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </DialogContent>
                </Dialog>

            </div>
        </div>
    )
}

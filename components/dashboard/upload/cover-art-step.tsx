import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Image as ImageIcon, Loader2, UploadCloud, ClipboardCheck, Lightbulb, Circle } from 'lucide-react'
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
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file (JPG, PNG, etc.)')
            return
        }

        if (file.size > 20 * 1024 * 1024) { // Updated to 20MB as per requirement in image
            toast.error('File size must be less than 20MB')
            return
        }

        const reader = new FileReader()
        reader.onloadend = async () => {
            const img = new Image()
            img.onerror = () => {
                toast.error('Failed to load image. Please ensure it is a standard JPG or PNG file.');
                setIsUploading(false);
            }
            img.onload = async () => {
                if (img.width < 3000 || img.height < 3000) { // Updated to 3000px as per requirement
                    toast.error('Minimum resolution is 3000 x 3000 pixels')
                    return
                }

                if (Math.abs(img.width - img.height) > 10) { // Check for square aspect ratio
                    toast.error('Image must have a square aspect ratio (1:1)')
                    return
                }

                setValue('coverArtPreview', reader.result as string, { shouldValidate: true })

                const COVER_CHUNK_THRESHOLD = 5 * 1024 * 1024;
                setIsUploading(true);
                setUploadProgress(0);

                try {
                    let result;
                    if (file.size > COVER_CHUNK_THRESHOLD) {
                        result = await uploadFileInChunks(file, '', (progress) => setUploadProgress(progress));
                    } else {
                        result = await uploadFileDirectly(file, (progress) => setUploadProgress(progress));
                    }

                    if (!result || !result.path) throw new Error('Upload failed');

                    setValue('coverArt', {
                        file: file,
                        path: result.path,
                        fileName: file.name,
                        size: file.size
                    } as any, { shouldValidate: true });

                    toast.success('Cover art uploaded successfully');
                } catch (error) {
                    toast.error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
        if (file) handleCoverArtChange(file)
    }

    const handleCoverArtClick = () => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'image/*'
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0]
            if (file) handleCoverArtChange(file)
        }
        input.click()
    }

    const handleRemove = () => {
        setValue('coverArt', null, { shouldValidate: true })
        setValue('coverArtPreview', '', { shouldValidate: true })
    }

    const requirements = [
        '3000 x 3000 pixels minimum resolution',
        'Square aspect ratio (1:1)',
        'RGB Color space (CMYK not supported)',
        'Must match artist name & title perfectly',
        'No blurred or pixelated images'
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <h3 className="text-2xl font-bold">Cover Art</h3>
                <p className="text-muted-foreground">Add eye-catching cover art for your release</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
                {/* Left: Upload Area */}
                <div className="lg:col-span-7 xl:col-span-8">
                    {!coverArtPreview ? (
                        <div
                            className={`relative h-[450px] rounded-3xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-8 bg-card/10 group overflow-hidden ${errors.coverArt ? 'border-red-500 bg-red-500/5' : 'border-primary/30 hover:border-primary/50'}`}
                            onClick={handleCoverArtClick}
                            onDrop={handleCoverArtDrop}
                            onDragOver={(e) => e.preventDefault()}
                        >
                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="relative flex flex-col items-center text-center gap-6">
                                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <UploadCloud className="h-10 w-10 text-primary" />
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-2xl font-bold">Drag and drop your art here</h4>
                                    <p className="text-muted-foreground">or browse from your computer</p>
                                </div>

                                <Button size="lg" className="rounded-full px-8 bg-primary/10 text-primary hover:bg-primary hover:text-white border-none transition-all duration-300">
                                    Browse Files
                                </Button>
                            </div>

                            {errors.coverArt && (
                                <p className="absolute bottom-6 text-sm text-red-500">{String(errors.coverArt.message)}</p>
                            )}
                        </div>
                    ) : (
                        <div className="relative h-[450px] rounded-3xl overflow-hidden border border-border bg-card/20 flex items-center justify-center group">
                            <img
                                src={coverArtPreview}
                                alt="Cover preview"
                                className="h-full w-full object-contain"
                            />

                            {/* Overlay actions on hover */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-4 backdrop-blur-sm">
                                {isUploading ? (
                                    <div className="flex flex-col items-center gap-3 w-full px-12">
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                            <span className="text-lg font-medium text-white">Uploading... {Math.round(uploadProgress)}%</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex gap-4">
                                        <Button onClick={handleCoverArtClick} className="rounded-full px-6">Change Image</Button>
                                        <Button onClick={handleRemove} variant="destructive" className="rounded-full px-6">Remove</Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    <p className="mt-4 text-center text-sm text-muted-foreground font-medium">
                        Supported formats: JPG, PNG. Max size: 20MB.
                    </p>
                </div>

                {/* Right: Requirements & Tips */}
                <div className="lg:col-span-5 xl:col-span-4 space-y-6">
                    {/* Art Requirements Card */}
                    <div className="rounded-3xl border border-border/50 bg-card/40 p-8 space-y-6">
                        <div className="flex items-center gap-3 text-primary">
                            <ClipboardCheck className="h-6 w-6" />
                            <h4 className="text-lg font-bold">Art Requirements</h4>
                        </div>

                        <ul className="space-y-4">
                            {requirements.map((req, i) => (
                                <li key={i} className="flex items-start gap-3 group">
                                    <div className="mt-1 flex-shrink-0">
                                        <Circle className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                                    </div>
                                    <span className="text-muted-foreground text-sm leading-relaxed group-hover:text-foreground transition-colors">{req}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Pro Tip Card */}
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-primary/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
                        <div className="relative rounded-3xl border-l-[3px] border-primary bg-primary/5 p-8 space-y-3">
                            <div className="flex items-center gap-3 text-primary font-bold">
                                <Lightbulb className="h-5 w-5 fill-primary/20" />
                                <span>Pro Tip</span>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Avoid using social media handles, website URLs, or pricing information on your cover art. Stores will reject it.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}


import { useState } from 'react'
import { validateAudioOnBackend } from '@/lib/upload/chunk-uploader'
import Cookies from 'js-cookie'
import { config } from '@/lib/config'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Upload, Music, X, Loader2, AlertCircle, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { UploadFormData, AudioFile, Track } from './types'
import { useFormContext } from 'react-hook-form'
import { motion } from 'framer-motion'

interface AudioFileStepProps {
    formData?: UploadFormData
    setFormData?: (data: UploadFormData) => void
}

export default function AudioFileStep({ formData: propFormData, setFormData: propSetFormData }: AudioFileStepProps) {
    const { setValue, watch, getValues, formState: { errors } } = useFormContext<UploadFormData>()
    const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
    const [isUploading, setIsUploading] = useState(false)
    const [activeFileId, setActiveFileId] = useState<string | null>(null)

    // console.log('values', getValues())
    const format = watch('format')
    const audioFile = watch('audioFile')
    const audioFileName = getValues('title')
    console.log(audioFileName, 'audioFileName')
    const audioFiles = watch('audioFiles') || []
    const tracks = watch('tracks') || []

    const parseWavHeader = async (file: File): Promise<{ sampleRate: number, bitDepth: number }> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const buffer = e.target?.result as ArrayBuffer;
                if (!buffer) return reject(new Error('Failed to read file'));

                const view = new DataView(buffer);

                // Check RIFF signature
                const riff = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3));
                if (riff !== 'RIFF') return reject(new Error('Invalid audio file format (Header missing RIFF)'));

                // Check WAVE signature
                const wave = String.fromCharCode(view.getUint8(8), view.getUint8(9), view.getUint8(10), view.getUint8(11));
                if (wave !== 'WAVE') return reject(new Error('Invalid audio file format (Header missing WAVE)'));

                // Read Sample Rate (offset 24, 32-bit little-endian)
                const sampleRate = view.getUint32(24, true);

                // Read Bits Per Sample (offset 34, 16-bit little-endian)
                const bitDepth = view.getUint16(34, true);

                resolve({ sampleRate, bitDepth });
            };
            reader.onerror = () => reject(new Error('Error reading file header'));
            reader.readAsArrayBuffer(file.slice(0, 44));
        });
    }

    const handleAudioFileChange = async (incomingFiles: File | FileList) => {
        const files = incomingFiles instanceof FileList ? Array.from(incomingFiles) : [incomingFiles]

        if (files.length === 0) return

        setIsUploading(true)

        for (const file of files) {
            // Only accept WAV files for all formats
            if (!file.type.includes('wav') && !file.name.toLowerCase().endsWith('.wav')) {
                toast.error(`File rejected: ${file.name}. Only WAV files are accepted.`)
                continue
            }

            if (file.size > 500 * 1024 * 1024) {
                toast.error(`File rejected: ${file.name}. Size must be less than 500MB.`)
                continue
            }

            // Validate WAV header
            try {
                const parsingToastId = toast.loading(`Checking audio format for ${file.name}...`)
                const { sampleRate, bitDepth } = await parseWavHeader(file);
                toast.dismiss(parsingToastId)

                if (sampleRate !== 44100) {
                    toast.error(`Invalid Sample Rate for ${file.name}: ${sampleRate}Hz. File must be 44,100Hz.`)
                    continue
                }
                if (bitDepth !== 16) {
                    toast.error(`Invalid Bit Depth for ${file.name}: ${bitDepth}-bit. File must be 16-bit.`)
                    continue
                }
            } catch (error) {
                console.error(error)
                toast.error(`Failed to validate ${file.name}. Please ensure it is a valid WAV.`)
                continue
            }

            const fileId = crypto.randomUUID()
            setActiveFileId(fileId)
            setUploadProgress(prev => ({ ...prev, [fileId]: 0 }))

            try {
                // Start Validation-only Backend Call
                const token = Cookies.get(config.tokenKey) || ''
                const result = await validateAudioOnBackend(
                    file,
                    token,
                    format === 'single' ? getValues('title') : undefined,
                    watch('audioConsent')
                );

                if (result.status === 'duplicate_warning') {
                    setValue('audioDuplicateDetected', true);
                    setValue('audioWarningMessage', result.message);
                    toast.error(`Duplicate audio detected: ${file.name}. Please review the warning below.`, { duration: 6000 });
                }

                // Upload complete, update form
                if (format === 'single' || !format) {
                    setValue('audioFile', {
                        file: file,
                        fileName: file.name,
                        size: file.size,
                        path: '',
                        duration: result.metaData?.duration,
                        resolution: result.metaData?.resolution,
                        hash: result.metaData?.hash,
                        fingerprint: result.metaData?.fingerprint
                    }, { shouldValidate: true })
                    setValue('audioFileName', audioFileName, { shouldValidate: true })
                    break
                } else {
                    const currentAudioFiles = getValues('audioFiles') || []
                    const currentTracks = getValues('tracks') || []

                    const newAudioFile: AudioFile = {
                        id: fileId,
                        file: file,
                        fileName: file.name,
                        size: file.size,
                        path: '',
                        duration: result.metaData?.duration,
                        resolution: result.metaData?.resolution,
                        hash: result.metaData?.hash,
                        fingerprint: result.metaData?.fingerprint
                    }
                    setValue('audioFiles', [...currentAudioFiles, newAudioFile], { shouldValidate: true })

                    const newTrack: Track = {
                        id: crypto.randomUUID(),
                        title: "", // Empty title as requested
                        audioFileId: fileId,
                        writers: [],
                        composers: [],
                        mood: "",
                    }
                    setValue('tracks', [...currentTracks, newTrack], { shouldValidate: true })
                }

                toast.success(`Validation complete: ${file.name}`)

            } catch (error: any) {
                console.error(error)
                toast.error(`Validation failed for ${file.name}: ${error.message || 'Unknown error'}`)
            } finally {
                setActiveFileId(null)
                setUploadProgress(prev => {
                    const newProgress = { ...prev };
                    delete newProgress[fileId];
                    return newProgress;
                })
            }
        }

        setIsUploading(false)
    }

    const handleAudioFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        const files = e.dataTransfer.files
        if (files && files.length > 0) {
            handleAudioFileChange(files)
        }
    }

    const handleAudioFileDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
    }

    const handleAudioFileClick = () => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'audio/wav,.wav'
        if (format !== 'single') {
            input.multiple = true
        }
        input.onchange = (e) => {
            const files = (e.target as HTMLInputElement).files
            if (files && files.length > 0) {
                handleAudioFileChange(files)
            }
        }
        input.click()
    }

    const handleRemoveAudio = () => {
        setValue('audioFile', null, { shouldValidate: true })
        setValue('audioFileName', '', { shouldValidate: true })
        setValue('audioDuplicateDetected', false);
        setValue('audioWarningMessage', '');
        setValue('audioConsent', false);
    }

    const handleRemoveTrack = (index: number) => {
        // Remove both the audio file and track metadata
        const trackToRemove = tracks[index]
        const updatedTracks = tracks.filter((_, i) => i !== index)
        const updatedAudioFiles = audioFiles.filter((af: AudioFile) => af.id !== trackToRemove.audioFileId)

        setValue('tracks', updatedTracks, { shouldValidate: true })
        setValue('audioFiles', updatedAudioFiles, { shouldValidate: true })

        // Clear detection if all files removed (basic implementation)
        if (updatedAudioFiles.length === 0 && (format === 'ep' || format === 'album')) {
            setValue('audioDuplicateDetected', false);
            setValue('audioWarningMessage', '');
            setValue('audioConsent', false);
        }
    }

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold">Audio File Upload</h3>
            <p className="text-muted-foreground">Upload your high-quality audio file</p>

            <div className="mt-6">
                {/* Audio File Upload */}
                <div className="space-y-3 pt-6 border-t border-border">
                    <h4 className="text-base font-semibold">
                        Upload your audio file <span className="text-muted-foreground font-normal">(WAV only)</span>
                    </h4>
                    {/* <p className="text-sm text-primary">
                        <a href="#" className="underline">Already have an ISRC code?</a>
                    </p> */}

                    {/* Single Upload Logic */}
                    {format === 'single' ? (
                        <>
                            {!audioFile ? (
                                <div
                                    className={`border-2 border-dashed rounded-lg p-12 text-center hover:border-primary/50 transition-colors cursor-pointer ${errors.audioFile ? 'border-red-500' : 'border-border'
                                        }`}
                                    onClick={handleAudioFileClick}
                                    onDrop={handleAudioFileDrop}
                                    onDragOver={handleAudioFileDragOver}
                                >
                                    {isUploading && activeFileId ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                                <span className="text-sm text-primary">
                                                    Validating...
                                                </span>
                                            </div>
                                            <div className="w-full max-w-[200px] h-1 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary transition-all duration-300 ease-in-out"
                                                    style={{ width: `${uploadProgress[activeFileId] || 0}%` }}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                            <p className="text-base font-medium mb-1">Select an audio file</p>
                                            <p className="text-sm text-muted-foreground">
                                                Or drag audio file here to upload
                                            </p>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="p-4 rounded-lg border border-border bg-black">
                                        <div className="flex items-center gap-3">
                                            <Music className="h-10 w-10 text-primary" />
                                            <div className="flex-1">
                                                <p className="font-medium">{audioFileName}</p>
                                                {audioFile && (
                                                    <div className="space-y-1">
                                                        <p className="text-sm text-muted-foreground">
                                                            {((audioFile as any).size / 1024 / 1024).toFixed(2)} MB
                                                        </p>
                                                        {((audioFile as any).path) && (
                                                            <p className="text-xs text-green-600 flex items-center gap-1">
                                                                ✓ Validated
                                                            </p>
                                                        )}
                                                        {uploadProgress[(audioFile as any).id] !== undefined && (
                                                            <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-primary transition-all duration-300"
                                                                    style={{ width: `${uploadProgress[(audioFile as any).id]}%` }}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleRemoveAudio}
                                                type="button"
                                                className="text-red-500 hover:text-red-500 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={handleAudioFileClick}
                                        type="button"
                                        className="w-full bg-primary text-white hover:bg-primary/80"
                                    >
                                        Change File
                                    </Button>
                                </div>
                            )}
                            {errors.audioFile && <p className="text-xs text-red-500 mt-2">{String(errors.audioFile.message)}</p>}
                        </>
                    ) : (
                        // Multi-track Mode (EP/Album)
                        <div className="space-y-4">
                            {/* Tracks List */}
                            {tracks.length > 0 && (
                                <div className="space-y-2">
                                    {tracks.map((track: Track, index: number) => {
                                        const audioFile = audioFiles.find((af: AudioFile) => af.id === track.audioFileId)
                                        return (
                                            <div
                                                key={track.id}
                                                className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/50"
                                            >
                                                <Music className="h-8 w-8 text-primary" />
                                                <div className="flex-1">
                                                    <p className="font-medium">{index + 1}. {track.title || 'Untitled'}</p>
                                                    <div className="space-y-1">
                                                        <p className="text-sm text-muted-foreground">
                                                            {audioFileName}.{audioFile?.fileName.split('.').pop()} • {audioFile?.size ? ((audioFile.size / 1024 / 1024).toFixed(2) + ' MB') : ''}
                                                        </p>
                                                        {uploadProgress[audioFile?.id || ''] !== undefined && (
                                                            <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-primary transition-all duration-300"
                                                                    style={{ width: `${uploadProgress[audioFile?.id || '']}%` }}
                                                                />
                                                            </div>
                                                        )}
                                                        {audioFile?.path && (
                                                            <p className="text-xs text-green-600">✓ Validated</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleRemoveTrack(index)}
                                                    type="button"
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}

                            {/* Upload Area */}
                            <div
                                className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                                onClick={handleAudioFileClick}
                                onDrop={handleAudioFileDrop}
                                onDragOver={handleAudioFileDragOver}
                            >
                                <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                                {isUploading && activeFileId ? (
                                    <div className="flex flex-col items-center gap-2 mb-1">
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                            <span className="text-base font-medium text-primary">
                                                Validating...
                                            </span>
                                        </div>
                                        <div className="w-full max-w-[200px] h-1 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary transition-all duration-300 ease-in-out"
                                                style={{ width: `${uploadProgress[activeFileId] || 0}%` }}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-base font-medium mb-1">Add Track {tracks.length + 1}</p>
                                )}
                                <p className="text-sm text-muted-foreground">
                                    Click to select or drag audio file here
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Duplicate Audio Warning and Consent Section */}
                {watch('audioDuplicateDetected') && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-4 rounded-xl border-yellow-500/20 bg-yellow-500/5 space-y-3"
                    >
                        <div className="flex items-center gap-2 text-yellow-500">
                            <AlertCircle className="h-5 w-5" />
                            <h3 className="text-base font-bold">Duplicate Audio Detected</h3>
                        </div>

                        <p className="text-yellow-200/70 text-xs">
                            {watch('audioWarningMessage') || "This audio file has already been uploaded to our database."}
                        </p>

                        <div className="pt-3 border-t border-yellow-500/10">
                            <label className="flex items-start gap-2.5 cursor-pointer group">
                                <div className="relative flex items-center mt-0.5">
                                    <input
                                        type="checkbox"
                                        className="peer h-4 w-4 rounded border-yellow-500/40 bg-transparent text-yellow-500 focus:ring-yellow-500 cursor-pointer appearance-none border-2 checked:bg-yellow-500"
                                        checked={watch('audioConsent')}
                                        onChange={(e) => {
                                            setValue('audioConsent', e.target.checked, { shouldValidate: true });
                                        }}
                                    />
                                    <Check className="absolute h-4 w-4 text-white scale-0 peer-checked:scale-100 transition-transform pointer-events-none p-0.5" />
                                </div>
                                <span className="text-sm font-medium text-yellow-200/80 group-hover:text-yellow-100 transition-colors">
                                    This audio is already stored in the database and would you like to continue?
                                </span>
                            </label>
                            {errors.audioConsent && (
                                <p className="text-[10px] text-red-500 mt-1.5 ml-7 font-medium italic">
                                    You must check this box to proceed with a duplicate file.
                                </p>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* Tips */}
                <div className="mt-4 space-y-2">
                    <div className="p-2.5 px-3 bg-blue-500/5 border border-blue-500/10 rounded-lg">
                        <p className="text-[12px] text-blue-400/80 leading-snug">
                            <strong className="text-blue-400">Tip:</strong> Upload high-quality WAV files. We'll automatically convert to the formats required by each platform.
                        </p>
                    </div>
                    <div className="p-2.5 px-3 bg-yellow-500/5 border border-yellow-500/10 rounded-lg">
                        <p className="text-[12px] text-yellow-400/80 leading-snug">
                            <strong className="text-yellow-400">Note:</strong> Audio files may take a few moments to process after upload.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

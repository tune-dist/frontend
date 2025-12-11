'use client'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Upload, Music, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { UploadFormData, AudioFile, Track } from './types'
import { useFormContext } from 'react-hook-form'

interface AudioFileStepProps {
    formData?: UploadFormData
    setFormData?: (data: UploadFormData) => void
}

export default function AudioFileStep({ formData: propFormData, setFormData: propSetFormData }: AudioFileStepProps) {
    const { setValue, watch, formState: { errors } } = useFormContext<UploadFormData>()

    const format = watch('format')
    const audioFile = watch('audioFile')
    const audioFileName = watch('audioFileName')
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

    const handleAudioFileChange = async (file: File) => {
        // Only accept WAV files for all formats
        if (!file.type.includes('wav') && !file.name.toLowerCase().endsWith('.wav')) {
            toast.error('Only WAV files are accepted')
            return
        }

        if (file.size > 500 * 1024 * 1024) {
            toast.error('File size must be less than 500MB')
            return
        }

        try {
            const { sampleRate, bitDepth } = await parseWavHeader(file);

            if (sampleRate !== 44100) {
                toast.error(`Invalid Sample Rate: ${sampleRate}Hz. File must be 44,100Hz.`)
                return
            }

            if (bitDepth !== 16) {
                toast.error(`Invalid Bit Depth: ${bitDepth}-bit. File must be 16-bit.`)
                return
            }

        } catch (error) {
            console.error(error)
            toast.error('Failed to validate audio file format. Please ensure it is a valid WAV.')
            return
        }

        if (format === 'single' || !format) {
            // Single Mode - store in single audioFile field
            setValue('audioFile', file, { shouldValidate: true })
            setValue('audioFileName', file.name, { shouldValidate: true })
        } else {
            // Multi-track Mode - store file in audioFiles[] and create track metadata in tracks[]
            const fileId = crypto.randomUUID()

            // Store audio file
            const newAudioFile: AudioFile = {
                id: fileId,
                file: file,
                fileName: file.name,
                size: file.size
            }
            setValue('audioFiles', [...audioFiles, newAudioFile], { shouldValidate: true })

            // Create track metadata (separate from audio file)
            const newTrack: Track = {
                id: crypto.randomUUID(),
                title: file.name.replace(/\.[^/.]+$/, ""), // Default title from filename
                audioFileId: fileId, // Reference to the audio file
            }
            setValue('tracks', [...tracks, newTrack], { shouldValidate: true })
        }
        toast.success(`Track added: ${file.name}`)
    }

    const handleAudioFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        const file = e.dataTransfer.files[0]
        if (file) {
            handleAudioFileChange(file)
        }
    }

    const handleAudioFileDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
    }

    const handleAudioFileClick = () => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'audio/wav,.wav'
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0]
            if (file) {
                handleAudioFileChange(file)
            }
        }
        input.click()
    }

    const handleRemoveAudio = () => {
        setValue('audioFile', null, { shouldValidate: true })
        setValue('audioFileName', '', { shouldValidate: true })
    }

    const handleRemoveTrack = (index: number) => {
        // Remove both the audio file and track metadata
        const trackToRemove = tracks[index]
        const updatedTracks = tracks.filter((_, i) => i !== index)
        const updatedAudioFiles = audioFiles.filter((af: AudioFile) => af.id !== trackToRemove.audioFileId)

        setValue('tracks', updatedTracks, { shouldValidate: true })
        setValue('audioFiles', updatedAudioFiles, { shouldValidate: true })
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
                    <p className="text-sm text-primary">
                        <a href="#" className="underline">Already have an ISRC code?</a>
                    </p>

                    {/* Single Upload Logic */}
                    {format === 'single' ? (
                        <>
                            {!audioFileName ? (
                                <div
                                    className={`border-2 border-dashed rounded-lg p-12 text-center hover:border-primary/50 transition-colors cursor-pointer ${errors.audioFile ? 'border-red-500' : 'border-border'
                                        }`}
                                    onClick={handleAudioFileClick}
                                    onDrop={handleAudioFileDrop}
                                    onDragOver={handleAudioFileDragOver}
                                >
                                    <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <p className="text-base font-medium mb-1">Select an audio file</p>
                                    <p className="text-sm text-muted-foreground">
                                        Or drag audio file here to upload
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="p-4 rounded-lg border border-border bg-muted/20">
                                        <div className="flex items-center gap-3">
                                            <Music className="h-10 w-10 text-primary" />
                                            <div className="flex-1">
                                                <p className="font-medium">{audioFileName}</p>
                                                {audioFile && (
                                                    <p className="text-sm text-muted-foreground">
                                                        {((audioFile as File).size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                )}
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleRemoveAudio}
                                                type="button"
                                                className="text-destructive hover:text-destructive"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={handleAudioFileClick}
                                        type="button"
                                        className="w-full"
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
                                                    <p className="text-sm text-muted-foreground">
                                                        {audioFile?.fileName} • {audioFile?.size ? ((audioFile.size / 1024 / 1024).toFixed(2) + ' MB') : ''}
                                                    </p>
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
                                <p className="text-base font-medium mb-1">Add Track {tracks.length + 1}</p>
                                <p className="text-sm text-muted-foreground">
                                    Click to select or drag audio file here
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Tips */}
                <div className="mt-6 space-y-3">
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <p className="text-sm text-blue-600 dark:text-blue-500">
                            <strong>Tip:</strong> Upload high-quality WAV files. We'll automatically convert to the formats required by each platform.
                        </p>
                    </div>
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                        <p className="text-sm text-amber-600 dark:text-amber-500">
                            <strong>Note:</strong> Audio files may take a few moments to process after upload. Maximum file size is 500MB.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

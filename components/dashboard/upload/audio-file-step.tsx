'use client'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Upload, Music } from 'lucide-react'
import toast from 'react-hot-toast'
import { UploadFormData } from './types'

interface AudioFileStepProps {
    formData: UploadFormData
    setFormData: (data: UploadFormData) => void
}

export default function AudioFileStep({ formData, setFormData }: AudioFileStepProps) {

    const handleAudioFileChange = (file: File) => {
        const validFormats = ['audio/wav', 'audio/mpeg', 'audio/mp4', 'audio/flac', 'audio/aiff', 'audio/x-ms-wma', 'audio/x-m4a']

        if (!validFormats.some(format => file.type.includes(format.split('/')[1]))) {
            toast.error('Please upload a valid audio file (WAV, MP3, M4A, FLAC, AIFF, WMA)')
            return
        }

        if (file.size > 500 * 1024 * 1024) {
            toast.error('File size must be less than 500MB')
            return
        }

        setFormData({
            ...formData,
            audioFile: file,
            audioFileName: file.name
        })
        toast.success('Audio file selected')
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
        input.accept = 'audio/*,.wav,.mp3,.m4a,.flac,.aiff,.wma'
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0]
            if (file) {
                handleAudioFileChange(file)
            }
        }
        input.click()
    }

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold">Audio File Upload</h3>
            <p className="text-muted-foreground">Upload your high-quality audio file</p>

            <div className="mt-6">
                {/* Audio File Upload */}
                <div className="space-y-3 pt-6 border-t border-border">
                    <h4 className="text-base font-semibold">Upload your audio file <span className="text-muted-foreground font-normal">(WAV, MP3, M4A, FLAC, AIFF, WMA)</span></h4>
                    <p className="text-sm text-primary">
                        <a href="#" className="underline">Already have an ISRC code?</a>
                    </p>

                    {!formData.audioFileName ? (
                        <div
                            className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary/50 transition-colors cursor-pointer"
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
                                        <p className="font-medium">{formData.audioFileName}</p>
                                        {formData.audioFile && (
                                            <p className="text-sm text-muted-foreground">
                                                {(formData.audioFile.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-center gap-3">
                                <Button
                                    variant="outline"
                                    onClick={handleAudioFileClick}
                                    type="button"
                                >
                                    Change Audio
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setFormData({ ...formData, audioFile: null, audioFileName: '' })}
                                    type="button"
                                    className="text-destructive hover:text-destructive"
                                >
                                    Remove
                                </Button>
                            </div>
                        </div>
                    )}

                    <p className="text-sm text-primary">
                        <a href="#" className="underline inline-flex items-center gap-1">
                            Master your track with Mixea <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded">?</span>
                        </a>
                    </p>
                </div>

                <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <p className="text-sm text-yellow-600 dark:text-yellow-500">
                        <strong>Note:</strong> Upload endpoints are not yet implemented in the backend.
                        This feature will be available once the backend upload module is completed.
                    </p>
                </div>
            </div>
            {/* <div className="space-y-3 pt-6 border-t border-border">
                <h4 className="text-base font-semibold">Dolby Atmos/Spatial audio</h4>
                <p className="text-sm text-muted-foreground">
                    Apple, Tidal and Amazon{' '}
                    <a href="#" className="text-primary underline">Tell me more...</a>
                </p>

                <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <input
                            type="radio"
                            id="noDolbyAtmos"
                            name="dolbyAtmos"
                            value="no"
                            checked={formData.dolbyAtmos === 'no'}
                            onChange={(e) => setFormData({ ...formData, dolbyAtmos: e.target.value })}
                            className="h-4 w-4"
                        />
                        <Label htmlFor="noDolbyAtmos" className="font-normal cursor-pointer">
                            No
                        </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            type="radio"
                            id="yesDolbyAtmos"
                            name="dolbyAtmos"
                            value="yes"
                            checked={formData.dolbyAtmos === 'yes'}
                            onChange={(e) => setFormData({ ...formData, dolbyAtmos: e.target.value })}
                            className="h-4 w-4"
                        />
                        <Label htmlFor="yesDolbyAtmos" className="font-normal cursor-pointer">
                            Yes, I have a version mixed with Atmos I'd like to upload in addition...
                        </Label>
                    </div>
                </div>
            </div> */}
        </div>
    )
}

import { UploadFormData, MandatoryChecks, AudioFile, Track } from './types'
import { useFormContext } from 'react-hook-form'
import { Music, CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { toast } from 'react-hot-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

interface ReviewStepProps {
    formData: UploadFormData
    mandatoryChecks: MandatoryChecks
    setMandatoryChecks: (checks: MandatoryChecks) => void
}

export default function ReviewStep({ formData, mandatoryChecks, setMandatoryChecks }: ReviewStepProps) {
    const { setValue, watch } = useFormContext<UploadFormData>()
    const tracks = watch('tracks') || []
    const audioFiles = watch('audioFiles') || []
    const format = watch('format')

    const [selectedTrackId, setSelectedTrackId] = useState<string | null>(tracks.length > 0 ? tracks[0].id : null)

    const hasIrregularCapitalization = (text: string) => {
        if (!text) return false
        return /[a-z][A-Z]/.test(text) || (text === text.toUpperCase() && text.length > 3)
    }

    const needsCapitalizationCheck = hasIrregularCapitalization(formData.title) || hasIrregularCapitalization(formData.artistName)

    const handleLinkAudio = (trackId: string, audioId: string) => {
        const updatedTracks = tracks.map(t => {
            if (t.id === trackId) {
                return { ...t, audioFileId: audioId }
            }
            return t
        })
        setValue('tracks', updatedTracks, { shouldValidate: true })
        if (audioId) {
            toast.success('Audio assigned to track')
        } else {
            toast.success('Audio unassigned')
        }
    }

    // Get list of audio IDs already assigned to other tracks
    const getAssignedAudioIds = (currentTrackId: string) => {
        return tracks
            .filter(t => t.id !== currentTrackId && t.audioFileId)
            .map(t => t.audioFileId);
    }

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold">Review & Submit</h3>
            <p className="text-muted-foreground">Finalize your release by assigning music to each track and confirming details.</p>

            {/* Track Assignment Section for Albums/EPs */}
            {format !== 'single' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold flex items-center gap-2">
                            <Music className="h-4 w-4 text-primary" />
                            Track Audio Assignment
                        </Label>
                        <p className="text-xs text-muted-foreground">Assign an uploaded file to each track</p>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        {tracks.map((track, idx) => {
                            const assignedIds = getAssignedAudioIds(track.id);
                            const availableFiles = audioFiles.filter(af => !assignedIds.includes(af.id));
                            const linkedFile = audioFiles.find(af => af.id === track.audioFileId);

                            return (
                                <div
                                    key={track.id}
                                    className={cn(
                                        "p-4 rounded-xl border border-border bg-card/50 transition-all",
                                        !track.audioFileId ? "border-amber-500/30 bg-amber-500/5" : "border-border"
                                    )}
                                >
                                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center font-bold text-xs shrink-0">
                                                {idx + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-sm truncate">{track.title || "Untitled Track"}</p>
                                                <p className="text-xs text-muted-foreground truncate">{track.artistName}</p>
                                            </div>
                                        </div>

                                        <div className="w-full md:w-72 shrink-0">
                                            <select
                                                value={track.audioFileId || ""}
                                                onChange={(e) => handleLinkAudio(track.id, e.target.value)}
                                                className={cn(
                                                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                                    !track.audioFileId ? "border-amber-500" : "border-input"
                                                )}
                                            >
                                                <option value="">Select Audio File...</option>
                                                {/* If a file is assigned to THIS track, it should show up even if it's "assigned" */}
                                                {audioFiles.map((file) => {
                                                    const isUsedByOther = assignedIds.includes(file.id);
                                                    if (isUsedByOther) return null;

                                                    return (
                                                        <option key={file.id} value={file.id}>
                                                            {file.fileName} ({(file.size && (file.size / 1024 / 1024).toFixed(2)) + ' MB'})
                                                        </option>
                                                    )
                                                })}
                                            </select>
                                            {!track.audioFileId && (
                                                <p className="text-[10px] text-amber-600 mt-1 font-medium animate-pulse flex items-center gap-1">
                                                    <AlertCircle className="h-2.5 w-2.5" />
                                                    Required
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            <div className="space-y-4 pt-6 border-t">
                {/* Release Summary Card */}
                <Card className="bg-[#1a1c23] border-border/50">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div className="space-y-1">
                            <span className="text-xs text-muted-foreground uppercase tracking-tight">Main Title</span>
                            <p className="font-semibold text-base">{formData.title || 'Not set'}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs text-muted-foreground uppercase tracking-tight">Artist Name</span>
                            <p className="font-semibold text-base">{formData.artistName || 'Not set'}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs text-muted-foreground uppercase tracking-tight">Release Type</span>
                            <p className="font-semibold text-base capitalize">{formData.format}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Final Mandatory Checks */}
                <div className="bg-card border border-border rounded-xl p-6 space-y-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        Legal Confirmations
                    </h3>

                    {/* Capitalization Warning */}
                    {needsCapitalizationCheck && (
                        <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-3">
                            <div className="flex items-center gap-2 text-amber-500">
                                <AlertCircle className="h-4 w-4" />
                                <p className="text-sm font-bold">Non-Standard Capitalization</p>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                We detected unusual capitalization. Ensure it's correct as per store guidelines.
                            </p>
                            <div className="flex items-start space-x-3 pt-1">
                                <input
                                    type="checkbox"
                                    id="capitalizationConfirmation"
                                    checked={mandatoryChecks.capitalizationConfirmation}
                                    onChange={(e) => setMandatoryChecks({ ...mandatoryChecks, capitalizationConfirmation: e.target.checked })}
                                    className="h-4 w-4 mt-1 rounded border-input text-primary focus:ring-2 focus:ring-primary cursor-pointer"
                                />
                                <Label htmlFor="capitalizationConfirmation" className="text-xs leading-relaxed cursor-pointer font-medium">
                                    I confirm that the capitalization is intentional and strictly correct.
                                </Label>
                            </div>
                        </div>
                    )}


                    <div className="space-y-4">
                        {[
                            { id: 'promoServices', text: 'KratoLib is a music distributor, not a promotion service. I am responsible for marketing.' },
                            { id: 'ownershipConfirmation', text: 'I confirm that the cover art and audio files uploaded for this release are owned by me.' },
                            { id: 'rightsAuthorization', text: 'I control all rights to this music (recording, composition, lyrics, and artwork).' },
                            { id: 'nameUsage', text: 'I will not use another artist\'s name or a famous band name without permission.' },
                            { id: 'termsAgreement', text: 'I have read and agree to the Terms of Service and Privacy Policy.' }
                        ].map((check) => (
                            <div key={check.id} className="flex items-start space-x-3 p-2 hover:bg-muted/20 rounded-lg transition-colors group">
                                <input
                                    type="checkbox"
                                    id={check.id}
                                    checked={(mandatoryChecks as any)[check.id]}
                                    onChange={(e) => setMandatoryChecks({ ...mandatoryChecks, [check.id]: e.target.checked })}
                                    className="h-4 w-4 mt-1 rounded border-input text-primary focus:ring-2 focus:ring-primary cursor-pointer"
                                />
                                <Label htmlFor={check.id} className="text-sm leading-relaxed cursor-pointer group-hover:text-foreground transition-colors">
                                    {check.text}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

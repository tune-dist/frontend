import { UploadFormData, MandatoryChecks, AudioFile, Track } from './types'
import { useFormContext } from 'react-hook-form'
import { Music, CheckCircle2, ChevronRight, AlertCircle, Eye, X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { toast } from 'react-hot-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { isReleaseNoLyrics, isTrackNoLyrics } from './genre-language'

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
    const coverArtPreview = watch('coverArtPreview')
    const rootWriters = watch('writers') || []
    const rootComposers = watch('composers') || []
    const primaryGenre = watch('primaryGenre')
    const instrumental = watch('instrumental')
    const language = watch('language')
    const releaseNoLyrics = isReleaseNoLyrics({
        primaryGenre,
        language,
        instrumental,
    })

    const [selectedTrackId, setSelectedTrackId] = useState<string | null>(tracks.length > 0 ? tracks[0].id : null)
    const [showCoverArt, setShowCoverArt] = useState(false)

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

    const getAssignedAudioIds = (currentTrackId: string) => {
        return tracks
            .filter(t => t.id !== currentTrackId && t.audioFileId)
            .map(t => t.audioFileId);
    }

    return (
        <>
            <div className="space-y-6">
                <h3 className="text-xl font-semibold">Review &amp; Submit</h3>
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
                                const trackNoLyrics = isTrackNoLyrics(track, {
                                    primaryGenre,
                                    language,
                                    instrumental,
                                });

                                return (
                                    <div
                                        key={track.id}
                                        className={cn(
                                            "p-4 rounded-xl border border-border bg-card/50 transition-all",
                                            !track.audioFileId ? "border-amber-500/30 bg-amber-500/5" : "border-border"
                                        )}
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                                            {/* Track Info */}
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center font-bold text-xs shrink-0">
                                                    {idx + 1}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-sm truncate">{track.title || "Untitled Track"}</p>
                                                    <p className="text-xs text-muted-foreground truncate">{track.artistName}</p>
                                                </div>
                                            </div>

                                            {/* Writer / Lyricist */}
                                            {!trackNoLyrics && (
                                            <div className="w-36 shrink-0">
                                                {track.writers?.filter(w => w?.trim()).length ? (
                                                    <p className="text-sm font-semibold text-primary truncate">
                                                        {track.writers.filter(w => w?.trim()).join(', ')}
                                                    </p>
                                                ) : (
                                                    <p className="text-xs text-white/20 italic">No lyricist</p>
                                                )}
                                                <p className="text-[10px] text-white uppercase tracking-wider mt-0.5">Lyricist</p>
                                            </div>
                                            )}

                                            {/* Composer */}
                                            <div className="w-36 shrink-0">
                                                {track.composers?.filter(c => c?.trim()).length ? (
                                                    <p className="text-sm font-semibold text-primary truncate">
                                                        {track.composers.filter(c => c?.trim()).join(', ')}
                                                    </p>
                                                ) : (
                                                    <p className="text-xs text-white/20 italic">No composer</p>
                                                )}
                                                <p className="text-[10px] text-white uppercase tracking-wider mt-0.5">Composer</p>
                                            </div>

                                            {/* Audio File Selector */}
                                            <div className="w-full md:w-64 shrink-0">
                                                <select
                                                    value={track.audioFileId || ""}
                                                    onChange={(e) => handleLinkAudio(track.id, e.target.value)}
                                                    className={cn(
                                                        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                                        !track.audioFileId ? "border-amber-500" : "border-input"
                                                    )}
                                                >
                                                    <option value="">Select Audio File...</option>
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

                {/* Summary + Legal */}
                <div className="space-y-4 pt-6 border-t">
                    {/* Release Summary Card */}
                    <Card className="bg-[#1a1c23] border-border/50">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-5 gap-6 text-sm">
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
                            {/* Cover Art - Column 4 */}
                            <div className="space-y-1">
                                <span className="text-xs text-muted-foreground uppercase tracking-tight">Cover Art</span>
                                {coverArtPreview ? (
                                    <div className="relative group w-20 h-20 mt-1">
                                        <img
                                            src={coverArtPreview}
                                            alt="Cover Art"
                                            className="w-20 h-20 rounded-xl object-cover border border-white/10 shadow-2xl"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCoverArt(true)}
                                            className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                                        >
                                            <Eye className="h-5 w-5 text-white" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="w-20 h-20 rounded-xl bg-white/5 border border-dashed border-white/10 flex items-center justify-center">
                                        <p className="text-[10px] text-amber-500 font-medium text-center p-1">No Art</p>
                                    </div>
                                )}
                            </div>

                            {/* Vibe / Empty - Column 5 */}
                            <div className="space-y-1">
                                {format === 'single' ? (
                                    <>
                                        <span className="text-xs text-muted-foreground uppercase tracking-tight">Vibe</span>
                                        <p className="font-semibold text-base">{formData.mood || 'Not set'}</p>
                                    </>
                                ) : (
                                    <div className="h-full" />
                                )}
                            </div>

                            {/* Lyricist — singles with lyrics only */}
                            {format === 'single' && !releaseNoLyrics && (
                                <div className="space-y-1 sm:col-span-2">
                                    <span className="text-xs text-muted-foreground uppercase tracking-tight">Lyricist</span>
                                    {rootWriters.filter((w) => w?.trim()).length > 0 ? (
                                        <p className="font-medium text-sm text-primary">{rootWriters.filter((w) => w?.trim()).join(', ')}</p>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">—</p>
                                    )}
                                </div>
                            )}
                            {/* Composers — always for singles */}
                            {format === 'single' && (
                                <>
                                    <div className="space-y-1 sm:col-span-2">
                                        <span className="text-xs text-muted-foreground uppercase tracking-tight">Composers</span>
                                        {rootComposers.filter((c) => c?.trim()).length > 0 ? (
                                            <p className="font-medium text-sm text-primary">{rootComposers.filter((c) => c?.trim()).join(', ')}</p>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">—</p>
                                        )}
                                    </div>
                                    <div className="sm:col-span-1" />
                                </>
                            )}
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
                                    We detected unusual capitalization. Ensure it&apos;s correct as per store guidelines.
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
                                { id: 'nameUsage', text: "I will not use another artist's name or a famous band name without permission." },
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

            {/* Cover Art Lightbox */}
            {showCoverArt && coverArtPreview && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
                    onClick={() => setShowCoverArt(false)}
                >
                    <div
                        className="relative max-w-[90vw] max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setShowCoverArt(false)}
                            className="absolute -top-4 -right-4 z-10 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white backdrop-blur-sm transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                        <img
                            src={coverArtPreview}
                            alt="Cover Art Full Preview"
                            className="max-w-[80vw] max-h-[80vh] rounded-2xl object-contain shadow-2xl border border-white/10"
                        />
                        <p className="text-center text-xs text-white/40 mt-3">Click outside to close</p>
                    </div>
                </div>
            )}
        </>
    )
}

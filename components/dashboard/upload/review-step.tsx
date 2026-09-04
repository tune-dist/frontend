import { UploadFormData, MandatoryChecks } from './types'
import { useFormContext } from 'react-hook-form'
import {
    Music,
    AlertCircle,
    Eye,
    X,
    Calendar,
    User,
    Globe,
    Disc,
    FileAudio,
    Disc3,
    Flag,
    Clock,
    Users,
    Mic2,
    Layers,
} from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { isReleaseNoLyrics } from './genre-language'
import {
    getRequiredMandatoryCheckKeys,
    needsCapitalizationConfirmation,
} from '@/lib/upload/mandatory-checks-validation'
import { toPlatformRef } from '@/lib/releases/platform-ref.util'

interface ReviewStepProps {
    formData: UploadFormData
    mandatoryChecks: MandatoryChecks
    setMandatoryChecks: (checks: MandatoryChecks) => void
    showMandatoryCheckErrors?: boolean
    legalConfirmationsLocked?: boolean
}

function formatDisplayDate(value?: string | null): string | null {
    if (!value) return null
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString()
}

function joinNonEmpty(items?: string[]): string | null {
    const filtered = items?.map((item) => item?.trim()).filter(Boolean) ?? []
    return filtered.length > 0 ? filtered.join(', ') : null
}

function profileUrl(value: unknown): string | undefined {
    return toPlatformRef(value)?.url
}

function instagramUrl(profile: unknown, profileUrlField?: string | null): string | undefined {
    if (profile === 'yes') return profileUrlField?.trim() || undefined
    return profileUrl(profile)
}

function facebookUrl(profile: unknown, profileUrlField?: string | null): string | undefined {
    if (profile === 'yes') return profileUrlField?.trim() || undefined
    return profileUrl(profile)
}

function InfoCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
    return (
        <div className="bg-[#0A0A0B] border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center group hover:bg-white/[0.02] transition-colors relative overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                {icon}
            </div>
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">{label}</span>
            <span className="text-sm font-bold text-white/90 truncate w-full px-1">{value}</span>
        </div>
    )
}

function DetailSection({ title, children }: { title: string; children: ReactNode }) {
    return (
        <div className="space-y-3">
            <h5 className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{title}</h5>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {children}
            </div>
        </div>
    )
}

function buildInfoCard(
    icon: ReactNode,
    label: string,
    value?: string | null,
): { icon: ReactNode; label: string; value: string } | null {
    const trimmed = value?.trim()
    if (!trimmed) return null
    return { icon, label, value: trimmed }
}

export default function ReviewStep({
    formData,
    mandatoryChecks,
    setMandatoryChecks,
    showMandatoryCheckErrors = false,
    legalConfirmationsLocked = false,
}: ReviewStepProps) {
    const { watch } = useFormContext<UploadFormData>()
    const tracks = watch('tracks') || []
    const audioFiles = watch('audioFiles') || []
    const format = watch('format')
    const coverArtPreview = watch('coverArtPreview')
    const rootWriters = watch('writers') || []
    const rootComposers = watch('composers') || []
    const primaryGenre = watch('primaryGenre')
    const secondaryGenre = watch('secondaryGenre')
    const instrumental = watch('instrumental')
    const language = watch('language')
    const artists = watch('artists') || []
    const releaseNoLyrics = isReleaseNoLyrics({
        primaryGenre,
        language,
        instrumental,
    })

    const [showCoverArt, setShowCoverArt] = useState(false)

    const needsCapitalizationCheck = needsCapitalizationConfirmation(
        formData.title,
        formData.artistName,
    )
    const requiredCheckKeys = getRequiredMandatoryCheckKeys(formData.title, formData.artistName)

    const isCheckMissing = (id: keyof MandatoryChecks) =>
        showMandatoryCheckErrors && requiredCheckKeys.includes(id as any) && !mandatoryChecks[id]

    const writersDisplay =
        !releaseNoLyrics && rootWriters.filter((w) => w?.trim()).length
            ? rootWriters.filter((w) => w?.trim()).join(', ')
            : null
    const composersDisplay = joinNonEmpty(rootComposers) ||
        joinNonEmpty(tracks.flatMap((track) => track.composers ?? []))
    const featuredDisplay = joinNonEmpty(
        format === 'single'
            ? formData.featuringArtist ? [formData.featuringArtist] : []
            : tracks.flatMap((t) => t.featuringArtist ? [t.featuringArtist] : [])
    )
    const versionDisplay = formData.version?.trim() || null
    const moodDisplay =
        format === 'single'
            ? formData.mood?.trim() || null
            : joinNonEmpty(tracks.map((t) => t.mood ?? ''))

    const allArtists = [
        {
            name: formData.artistName,
            spotifyProfile: formData.spotifyProfile,
            appleMusicProfile: formData.appleMusicProfile,
            youtubeMusicProfile: formData.youtubeMusicProfile,
            instagramProfile: instagramUrl(formData.instagramProfile, formData.instagramProfileUrl),
            facebookProfile: facebookUrl(formData.facebookProfile, formData.facebookProfileUrl),
        },
        ...artists.filter((a) => a.name?.trim()).map((a) => ({
            name: a.name,
            spotifyProfile: a.spotifyProfile,
            appleMusicProfile: a.appleMusicProfile,
            youtubeMusicProfile: a.youtubeMusicProfile,
            instagramProfile: typeof a.instagramProfile === 'string' && a.instagramProfile !== 'yes' && a.instagramProfile !== 'no'
                ? a.instagramProfile
                : undefined,
            facebookProfile: typeof a.facebookProfile === 'string' && a.facebookProfile !== 'yes' && a.facebookProfile !== 'no'
                ? a.facebookProfile
                : undefined,
        })),
    ]

    const releaseInfoCards = [
        buildInfoCard(<Calendar className="h-4 w-4" />, 'Release Date', formatDisplayDate(formData.releaseDate)),
        buildInfoCard(<Disc3 className="h-4 w-4" />, 'Label', formData.labelName),
        buildInfoCard(<Layers className="h-4 w-4" />, 'Version', versionDisplay),
        buildInfoCard(<Globe className="h-4 w-4" />, 'Language', language),
        buildInfoCard(<Clock className="h-4 w-4" />, 'Recording Year', formData.recordingYear ? String(formData.recordingYear) : null),
    ].filter(Boolean) as { icon: ReactNode; label: string; value: string }[]

    const musicInfoCards = [
        buildInfoCard(<Music className="h-4 w-4" />, 'Genre', primaryGenre),
        buildInfoCard(<Music className="h-4 w-4" />, 'Sub-genre', secondaryGenre),
        ...(format !== 'single' ? [buildInfoCard(<Music className="h-4 w-4" />, 'Mood', moodDisplay)] : []),
        buildInfoCard(<Flag className="h-4 w-4" />, 'Explicit', formData.isExplicit ? 'Yes' : 'No'),
        buildInfoCard(<Users className="h-4 w-4" />, 'Featured', featuredDisplay),
    ].filter(Boolean) as { icon: ReactNode; label: string; value: string }[]

    const creditsInfoCards = [
        writersDisplay ? buildInfoCard(<User className="h-4 w-4" />, 'Lyricist', writersDisplay) : null,
        composersDisplay ? buildInfoCard(<Mic2 className="h-4 w-4" />, 'Composer', composersDisplay) : null,
        buildInfoCard(<Disc className="h-4 w-4" />, 'UPC', formData.upc),
        buildInfoCard(<FileAudio className="h-4 w-4" />, 'ISRC', formData.isrc),
    ].filter(Boolean) as { icon: ReactNode; label: string; value: string }[]

    const pLine = formData.producers?.[0]?.trim() || formData.labelName || null

    const getArtistLinks = (artist: (typeof allArtists)[number]) =>
        [
            { label: 'Spotify', value: profileUrl(artist.spotifyProfile) },
            { label: 'Apple Music', value: profileUrl(artist.appleMusicProfile) },
            { label: 'YouTube Music', value: profileUrl(artist.youtubeMusicProfile) },
            ...(artist.instagramProfile ? [{ label: 'Instagram', value: artist.instagramProfile }] : []),
            ...(artist.facebookProfile ? [{ label: 'Facebook', value: artist.facebookProfile }] : []),
        ].filter((link) => link.value?.trim())

    const artistsForDisplay = allArtists.filter((artist, idx) => {
        if (!artist.name?.trim()) return false
        const links = getArtistLinks(artist)
        return idx > 0 || links.length > 0
    })

    return (
        <>
            <div className="space-y-6">
                <h3 className="text-xl font-semibold">Review &amp; Submit</h3>
                <p className="text-muted-foreground">Review all release details before submitting.</p>

                {/* Summary — always at top, cover art flush right */}
                <Card className="bg-[#1a1c23] border-border/50 overflow-hidden p-0">
                    <div className="flex">
                        <div className="flex-1 p-6 min-w-0">
                            <h4 className="text-lg font-semibold mb-5">Summary</h4>
                            <div className={cn(
                                "grid gap-x-6 gap-y-4",
                                format === 'single' ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-3",
                            )}>
                                <div className="space-y-1 min-w-0">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Main Title</span>
                                    <p className="font-semibold text-base text-white truncate">{formData.title || 'Not set'}</p>
                                </div>
                                <div className="space-y-1 min-w-0">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Artist Name</span>
                                    <p className="font-semibold text-base text-white truncate">{formData.artistName || 'Not set'}</p>
                                </div>
                                <div className="space-y-1 min-w-0">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Release Type</span>
                                    <p className="font-semibold text-base text-white capitalize">{format}</p>
                                </div>
                                {format === 'single' && (
                                    <div className="space-y-1 min-w-0">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Vibe</span>
                                        <p className="font-semibold text-base text-white truncate">{formData.mood || 'Not set'}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="relative aspect-square w-36 sm:w-44 md:w-52 shrink-0 border-l border-border/50">
                            {coverArtPreview ? (
                                <button
                                    type="button"
                                    onClick={() => setShowCoverArt(true)}
                                    className="group absolute inset-0 w-full h-full"
                                >
                                    <img
                                        src={coverArtPreview}
                                        alt="Cover Art"
                                        className="w-full h-full object-cover"
                                    />
                                    <span className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Eye className="h-6 w-6 text-white" />
                                    </span>
                                </button>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/[0.03]">
                                    <Music className="h-8 w-8 text-white/20 mb-2" />
                                    <span className="text-[10px] text-amber-500 font-medium">No Art</span>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Tracklist — full width, scrollable (albums/EPs) */}
                {format !== 'single' && (
                    <Card className="bg-[#1a1c23] border-border/50 overflow-hidden">
                        <CardHeader className="pb-3 border-b border-border/50">
                            <div className="flex items-center justify-between gap-4">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <FileAudio className="h-4 w-4 text-primary" />
                                    Tracklist
                                </CardTitle>
                                <p className="text-xs text-muted-foreground shrink-0">
                                    {tracks.length} track(s)
                                </p>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 min-h-0">
                            <div
                                className="max-h-[320px] overflow-y-auto overscroll-contain p-4 space-y-3 scrollbar-thin"
                                data-lenis-prevent="true"
                            >
                                {tracks.length > 0 ? (
                                    tracks.map((track, idx) => {
                                        const assignedAudio = audioFiles.find((af) => af.id === track.audioFileId)
                                        const audioLabel = assignedAudio
                                            ? `${assignedAudio.fileName}${assignedAudio.size ? ` (${(assignedAudio.size / 1024 / 1024).toFixed(2)} MB)` : ''}`
                                            : null
                                        const trackWriters = joinNonEmpty(track.writers)
                                        const trackComposers = joinNonEmpty(track.composers)
                                        const trackMeta = [
                                            track.language ? `Language: ${track.language}` : null,
                                            track.primaryGenre ? `Genre: ${track.primaryGenre}` : null,
                                            track.secondaryGenre ? `Sub-genre: ${track.secondaryGenre}` : null,
                                            track.mood ? `Mood: ${track.mood}` : null,
                                            track.isInstrumental === 'yes' ? 'Instrumental' : null,
                                            track.featuringArtist ? `Feat. ${track.featuringArtist}` : null,
                                            trackWriters ? `Lyricist: ${trackWriters}` : null,
                                            trackComposers ? `Composer: ${trackComposers}` : null,
                                            track.previewClipStartTime ? `Preview: ${track.previewClipStartTime}s` : null,
                                        ].filter(Boolean)

                                        return (
                                            <div
                                                key={track.id}
                                                className={cn(
                                                    "p-4 rounded-xl border bg-card/50 space-y-3",
                                                    !track.audioFileId ? "border-amber-500/30 bg-amber-500/5" : "border-border",
                                                )}
                                            >
                                                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                                        <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center font-bold text-xs shrink-0">
                                                            {idx + 1}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="font-semibold text-sm text-white flex items-center gap-2">
                                                                {track.title || 'Untitled Track'}
                                                                {track.isExplicit && (
                                                                    <span className="px-1.5 py-0.5 rounded bg-white/10 text-white/60 text-[9px] font-black tracking-widest leading-none">E</span>
                                                                )}
                                                            </p>
                                                            {track.artistName &&
                                                                track.artistName.trim() !== formData.artistName?.trim() && (
                                                                <p className="text-xs text-muted-foreground truncate mt-0.5">{track.artistName}</p>
                                                            )}
                                                            {trackMeta.length > 0 && (
                                                                <div className="flex flex-wrap gap-1.5 mt-2">
                                                                    {trackMeta.map((meta, metaIdx) => (
                                                                        <span
                                                                            key={metaIdx}
                                                                            className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/5 text-white/50 border border-white/5"
                                                                        >
                                                                            {meta}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="w-full lg:w-72 shrink-0">
                                                        {audioLabel ? (
                                                            <p className="text-sm text-white/80 truncate px-3 py-2 rounded-md border border-border/50 bg-background/50">
                                                                {audioLabel}
                                                            </p>
                                                        ) : (
                                                            <p className="text-sm text-amber-500 flex items-center gap-1 px-3 py-2">
                                                                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                                                No audio file
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })
                                ) : (
                                    <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-muted-foreground">
                                        No tracks in this release
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Full Release Summary */}
                <div className="space-y-8 pt-6 border-t">
                    {/* Grouped metadata */}
                    {(format !== 'single' || releaseInfoCards.length > 0 || musicInfoCards.length > 0 || creditsInfoCards.length > 0) && (
                        <div className="space-y-6">
                            {releaseInfoCards.length > 0 && (
                                <DetailSection title="Release Details">
                                    {releaseInfoCards.map((item, idx) => (
                                        <InfoCard key={`release-${idx}`} icon={item.icon} label={item.label} value={item.value} />
                                    ))}
                                </DetailSection>
                            )}
                            {musicInfoCards.length > 0 && (
                                <DetailSection title="Music &amp; Genre">
                                    {musicInfoCards.map((item, idx) => (
                                        <InfoCard key={`music-${idx}`} icon={item.icon} label={item.label} value={item.value} />
                                    ))}
                                </DetailSection>
                            )}
                            {creditsInfoCards.length > 0 && (
                                <DetailSection title="Credits &amp; Identifiers">
                                    {creditsInfoCards.map((item, idx) => (
                                        <InfoCard key={`credits-${idx}`} icon={item.icon} label={item.label} value={item.value} />
                                    ))}
                                </DetailSection>
                            )}
                        </div>
                    )}

                    <div className="space-y-6">
                        {artistsForDisplay.length > 0 && (
                                <div className="bg-[#0A0A0B] border border-white/5 rounded-[32px] p-6 space-y-5 shadow-xl shadow-black/20">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <Users className="h-5 w-5 text-primary" /> Artists &amp; Profiles
                                    </h3>
                                    <div className="space-y-3">
                                        {artistsForDisplay.map((artist, artistIdx) => {
                                                const artistLinks = getArtistLinks(artist)

                                                return (
                                                    <div
                                                        key={`${artist.name}-${artistIdx}`}
                                                        className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 space-y-2"
                                                    >
                                                        <p className="text-sm font-bold text-white">{artist.name}</p>
                                                        {artistLinks.length > 0 && (
                                                            <div className="flex flex-wrap gap-2 text-[11px]">
                                                                {artistLinks.map((link) => (
                                                                    <a
                                                                        key={link.label}
                                                                        href={link.value}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="px-2.5 py-1 rounded-full bg-white/5 text-white/60 hover:text-primary transition-colors"
                                                                    >
                                                                        {link.label}
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                    </div>
                                </div>
                            )}

                            <div className="bg-[#0A0A0B] border border-white/5 rounded-[32px] p-6 space-y-6 shadow-xl shadow-black/20">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Globe className="h-5 w-5 text-primary" /> Distribution
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3">
                                            Copyrights
                                        </h4>
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3 bg-white/[0.02] p-3 rounded-2xl border border-white/5">
                                                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                                    <span className="text-[10px] font-bold text-white">C</span>
                                                </div>
                                                <p className="text-sm text-white/80 font-medium leading-relaxed">
                                                    {formData.copyright?.trim() || 'N/A'}
                                                </p>
                                            </div>
                                            <div className="flex items-start gap-3 bg-white/[0.02] p-3 rounded-2xl border border-white/5">
                                                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                                    <span className="text-[10px] font-bold text-white">P</span>
                                                </div>
                                                <p className="text-sm text-white/80 font-medium leading-relaxed">
                                                    {pLine || 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                {/* Legal Confirmations */}
                <div
                    id="legal-confirmations"
                    className={cn(
                        "bg-card border rounded-xl p-6 space-y-6",
                        showMandatoryCheckErrors &&
                            requiredCheckKeys.some((key) => !mandatoryChecks[key])
                            ? "border-red-500/50"
                            : "border-border",
                    )}
                >
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        Legal Confirmations
                    </h3>
                    {legalConfirmationsLocked && (
                        <p className="text-sm text-muted-foreground">
                            These confirmations were accepted when this release was submitted and cannot be changed during edit.
                        </p>
                    )}
                    {showMandatoryCheckErrors &&
                        requiredCheckKeys.some((key) => !mandatoryChecks[key]) && (
                        <p className="text-sm text-red-500">
                            Please accept all required confirmations before submitting.
                        </p>
                    )}

                    {needsCapitalizationCheck && (
                        <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-3">
                            <div className="flex items-center gap-2 text-amber-500">
                                <AlertCircle className="h-4 w-4" />
                                <p className="text-sm font-bold">Non-Standard Capitalization</p>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                We detected unusual capitalization. Ensure it&apos;s correct as per store guidelines.
                            </p>
                            <div className={cn(
                                "flex items-start space-x-3 pt-1",
                                isCheckMissing("capitalizationConfirmation") && "rounded-lg border border-red-500/40 bg-red-500/5 p-2",
                            )}>
                                <input
                                    type="checkbox"
                                    id="capitalizationConfirmation"
                                    checked={mandatoryChecks.capitalizationConfirmation}
                                    disabled={legalConfirmationsLocked}
                                    onChange={(e) => setMandatoryChecks({ ...mandatoryChecks, capitalizationConfirmation: e.target.checked })}
                                    className={cn(
                                        "h-4 w-4 mt-1 rounded border-input text-primary focus:ring-2 focus:ring-primary",
                                        legalConfirmationsLocked
                                            ? "cursor-not-allowed opacity-70"
                                            : "cursor-pointer",
                                    )}
                                />
                                <Label
                                    htmlFor="capitalizationConfirmation"
                                    className={cn(
                                        "text-xs leading-relaxed font-medium",
                                        legalConfirmationsLocked
                                            ? "cursor-not-allowed text-muted-foreground"
                                            : "cursor-pointer",
                                    )}
                                >
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
                            <div
                                key={check.id}
                                className={cn(
                                    "flex items-start space-x-3 p-2 hover:bg-muted/20 rounded-lg transition-colors group",
                                    isCheckMissing(check.id as keyof MandatoryChecks) &&
                                        "border border-red-500/40 bg-red-500/5",
                                )}
                            >
                                <input
                                    type="checkbox"
                                    id={check.id}
                                    checked={(mandatoryChecks as any)[check.id]}
                                    disabled={legalConfirmationsLocked}
                                    onChange={(e) => setMandatoryChecks({ ...mandatoryChecks, [check.id]: e.target.checked })}
                                    className={cn(
                                        "h-4 w-4 mt-1 rounded border-input text-primary focus:ring-2 focus:ring-primary",
                                        legalConfirmationsLocked
                                            ? "cursor-not-allowed opacity-70"
                                            : "cursor-pointer",
                                    )}
                                />
                                <Label
                                    htmlFor={check.id}
                                    className={cn(
                                        "text-sm leading-relaxed transition-colors",
                                        legalConfirmationsLocked
                                            ? "cursor-not-allowed text-muted-foreground"
                                            : "cursor-pointer group-hover:text-foreground",
                                    )}
                                >
                                    {check.text}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

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

'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Track, PlatformProfileFormValue } from './upload-form.schema'
import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Music, X, Loader2, Plus, Info, UserCheck } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip } from '@/components/ui/tooltip'
import { getGenres, getSubGenresByGenreId, type Genre, type SubGenre } from '@/lib/api/genres'
import { useAuth } from '@/contexts/AuthContext'
import { resolveEffectivePlanKey, isEffectiveFreePlan } from '@/lib/plan-access'
import { getPlanLimits } from '@/lib/api/plans'
import { toast } from 'react-hot-toast'
import WaveformTrimmer from './waveform-trimmer'
import { getCrbtIneligibilityMessage, isTrackEligibleForCrbt } from './crbt-validation'
import { useResolvedCrbtPlayback } from '@/lib/upload/audio-playback'
import { getLegalPersonNameError, LEGAL_PERSON_NAME_COMPOSER_HINT, LEGAL_PERSON_NAME_HINT } from '@/lib/validation/legal-person-name'
import {
    INSTRUMENTAL_LANGUAGE,
    filterGenresForInstrumentalChoice,
    isInstrumentalPrimaryGenre,
    isInstrumentalRelease,
    isInstrumentalSelection,
    LANGUAGE_OPTIONS,
    resolveInstrumentalPrimaryGenre,
    resolveLanguage,
} from './genre-language'
import { searchArtistProfiles, emptySearchResults } from '@/lib/integrations/artist-search.util'
import { rosterArtistName } from '@/lib/integrations/artist-form-state.util'
import { toTitleCase } from '@/lib/validation/title-case'
import { IsrcCodeSection, type IsrcMode } from './isrc-code-section'
import { cn } from '@/lib/class-names'
import type { TrackMainArtistFormValue } from '@/lib/releases/track-main-artists.util'
import {
    seedTrackMainArtistsForModal,
} from '@/lib/releases/track-main-artists.util'
import TrackMainArtistsEditor from './track-main-artists-editor'

function profileValueToInputString(value: unknown): string {
    if (value == null) return ''
    if (typeof value === 'string') return value
    if (typeof value === 'object') {
        const record = value as Record<string, unknown>
        if (typeof record.url === 'string') return record.url
        if (typeof record.id === 'string' && record.id.startsWith('http')) return record.id
    }
    return ''
}

interface TrackEditModalProps {
    isOpen: boolean
    onClose: () => void
    track: Track | null
    trackIndex: number | null
    onSave: (updatedTrack: Track, writers: string[], composers: string[]) => void
    usedArtists?: any[]
    allTracks?: Track[]
    mainArtistName?: string
    featuringArtists?: Array<{ name: string }>
    mainArtistProfiles?: {
        spotify?: any
        apple?: any
        instagram?: string
        facebook?: string
    }
    fieldRules?: Record<string, any>
    audioFiles?: any[]
    /** Release-level Primary Artists (copied for Track Main Artist defaults). */
    releasePrimaryArtists?: TrackMainArtistFormValue[]
}

export default function TrackEditModal({ isOpen, onClose, track, trackIndex, onSave, usedArtists = [], allTracks = [], mainArtistName = '', featuringArtists = [], mainArtistProfiles = {}, fieldRules = {}, audioFiles = [], releasePrimaryArtists = [] }: TrackEditModalProps) {
    const { user } = useAuth()
    const [planLimits, setPlanLimits] = useState({ artistLimit: 1, allowConcurrent: false, allowedFormats: ['single'] })

    // Fetch plan limits on mount
    useEffect(() => {
        const fetchPlanLimits = async () => {
            if (!user?.plan) return
            try {
                const limits = await getPlanLimits(user.plan)
                setPlanLimits(limits)
            } catch (error) {
                console.error('Failed to fetch plan limits:', error)
            }
        }
        fetchPlanLimits()
    }, [user?.plan])

    // Calculate total allowed artists
    const totalAllowedArtists =
        user?.effectiveLimits?.maxArtists ??
        planLimits.artistLimit + (user?.extraArtistSlots || 0);

    // Local state for track metadata fields
    const [trackTitle, setTrackTitle] = useState(track?.title || '')
    const [language, setLanguage] = useState(track?.language || '')
    const [isrc, setIsrc] = useState(track?.isrc || '')
    const [isrcError, setIsrcError] = useState('')
    const [isrcMode, setIsrcMode] = useState<IsrcMode>(() => (track?.isrc ? 'existing' : 'generate'))
    const [primaryGenre, setPrimaryGenre] = useState(track?.primaryGenre || '')
    const [secondaryGenre, setSecondaryGenre] = useState(track?.secondaryGenre || '')
    const [previewClipStartTime, setPreviewClipStartTime] = useState(track?.previewClipStartTime || '')
    const [version, setVersion] = useState<string>(track?.version || '')
    const [isExplicit, setIsExplicit] = useState<boolean>(track?.isExplicit || false)
    const [instrumental, setInstrumental] = useState<string>(track?.isInstrumental || 'no')
    const [modalFeaturingArtist, setModalFeaturingArtist] = useState(track?.featuringArtist || '')
    const [mood, setMood] = useState(track?.mood || '')

    const linkedAudioFile = useMemo(
        () => audioFiles.find((af) => af.id === track?.audioFileId),
        [audioFiles, track?.audioFileId],
    )
    const {
        hasAudio: hasCrbtAudio,
        playbackSource,
        isResolving: isResolvingCrbtAudio,
        resolveError: crbtAudioError,
        trackDurationSec,
    } = useResolvedCrbtPlayback(linkedAudioFile, audioFiles, track ? [track] : [])
    const isCrbtEligible = isTrackEligibleForCrbt(trackDurationSec)

    const areFeaturedArtistsAllowed = (fieldRules || {}).featuredArtists?.allow !== false

    // Local state for modal editing
    const [modalArtistSearch, setModalArtistSearch] = useState(track?.artistName || '')
    const [modalTrackMainArtists, setModalTrackMainArtists] = useState<
        TrackMainArtistFormValue[]
    >([])
    const [trackMainArtistDraft, setTrackMainArtistDraft] = useState('')
    const [showTrackMainArtistAdd, setShowTrackMainArtistAdd] = useState(false)
    const [isSearching, setIsSearching] = useState(false)
    const [creatingNewArtist, setCreatingNewArtist] = useState(false)
    const [hasSearched, setHasSearched] = useState(false)
    const [searchResults, setSearchResults] = useState(emptySearchResults())
    const searchTimeout = useRef<NodeJS.Timeout>()

    const [modalWriters, setModalWriters] = useState<string[]>(
        track?.writers || ['']
    )
    const [writerErrors, setWriterErrors] = useState<string[]>([])
    const [modalComposers, setModalComposers] = useState<string[]>(
        track?.composers || ['']
    )
    const [composerErrors, setComposerErrors] = useState<string[]>([])

    const [modalSpotifyProfile, setModalSpotifyProfile] = useState<PlatformProfileFormValue>(
        track?.spotifyProfile || '',
    )
    const [modalAppleMusicProfile, setModalAppleMusicProfile] = useState<PlatformProfileFormValue>(
        track?.appleMusicProfile || '',
    )
    const [instagramStatus, setInstagramStatus] = useState(track?.instagramProfile ? 'yes' : 'no')
    const [facebookStatus, setFacebookStatus] = useState(track?.facebookProfile ? 'yes' : 'no')
    const [instagramUrl, setInstagramUrl] = useState(() =>
        profileValueToInputString(track?.instagramProfile),
    )
    const [facebookUrl, setFacebookUrl] = useState(() =>
        profileValueToInputString(track?.facebookProfile),
    )

    // Genres state
    const [genres, setGenres] = useState<Genre[]>([])
    const [genresLoading, setGenresLoading] = useState(true)
    const [subGenres, setSubGenres] = useState<SubGenre[]>([])
    const [subGenresLoading, setSubGenresLoading] = useState(false)
    const subGenreCacheRef = useRef<Map<string, SubGenre[]>>(new Map())
    const subGenreRequestRef = useRef(0)

    // Fetch genres on mount
    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const fetchedGenres = await getGenres()
                setGenres(fetchedGenres)
            } catch (error) {
                console.error('Failed to fetch genres:', error)
            } finally {
                setGenresLoading(false)
            }
        }
        fetchGenres()
    }, [])

    const loadSubGenres = useCallback(
        async (genreName: string) => {
            if (!genreName) {
                setSubGenres([])
                return
            }

            if (genresLoading) return

            const selectedGenre = genres.find((g) => g.name === genreName)
            if (!selectedGenre) return

            const cacheKey = selectedGenre._id
            const cached = subGenreCacheRef.current.get(cacheKey)
            if (cached) {
                setSubGenres(cached)
                return
            }

            const requestId = ++subGenreRequestRef.current
            setSubGenresLoading(true)
            try {
                const fetchedSubGenres = await getSubGenresByGenreId(selectedGenre._id)
                if (requestId !== subGenreRequestRef.current) return

                subGenreCacheRef.current.set(cacheKey, fetchedSubGenres)
                setSubGenres(fetchedSubGenres)
            } catch (error) {
                if (requestId !== subGenreRequestRef.current) return
                console.error('Failed to fetch sub-genres:', error)
                setSubGenres([])
            } finally {
                if (requestId === subGenreRequestRef.current) {
                    setSubGenresLoading(false)
                }
            }
        },
        [genres, genresLoading],
    )

    useEffect(() => {
        void loadSubGenres(primaryGenre)
    }, [primaryGenre, genresLoading, loadSubGenres])

    const isNoLyricsTrack = isInstrumentalRelease(primaryGenre, instrumental)
    const availableGenres = useMemo(
        () => filterGenresForInstrumentalChoice(genres, instrumental),
        [genres, instrumental],
    )
    const languageOptions = isNoLyricsTrack
        ? [INSTRUMENTAL_LANGUAGE]
        : LANGUAGE_OPTIONS.filter((lang) => lang !== INSTRUMENTAL_LANGUAGE)

    const handleInstrumentalChange = useCallback((value: 'yes' | 'no') => {
        setInstrumental(value)

        if (value === 'yes') {
            setLanguage(INSTRUMENTAL_LANGUAGE)
            const instrumentalGenre = resolveInstrumentalPrimaryGenre(genres)
            if (instrumentalGenre) {
                setPrimaryGenre(instrumentalGenre)
                setSecondaryGenre('')
            } else if (primaryGenre && !isInstrumentalPrimaryGenre(primaryGenre)) {
                setPrimaryGenre('')
                setSecondaryGenre('')
            }
            return
        }

        if (language === INSTRUMENTAL_LANGUAGE) {
            setLanguage('')
        }
        if (primaryGenre && isInstrumentalPrimaryGenre(primaryGenre)) {
            setPrimaryGenre('')
            setSecondaryGenre('')
        }
    }, [genres, language, primaryGenre])

    useEffect(() => {
        if (isInstrumentalPrimaryGenre(primaryGenre)) {
            setInstrumental('yes')
            setLanguage(INSTRUMENTAL_LANGUAGE)
        }
    }, [primaryGenre])

    useEffect(() => {
        if (isInstrumentalSelection(instrumental)) {
            setLanguage(INSTRUMENTAL_LANGUAGE)
        }
    }, [instrumental])

    useEffect(() => {
        if (
            !isInstrumentalSelection(instrumental) ||
            genresLoading ||
            genres.length === 0
        ) {
            return
        }

        const instrumentalGenre = resolveInstrumentalPrimaryGenre(genres)
        if (!instrumentalGenre) return

        if (!primaryGenre || !isInstrumentalPrimaryGenre(primaryGenre)) {
            setPrimaryGenre(instrumentalGenre)
            setSecondaryGenre('')
        }
    }, [instrumental, genres, genresLoading, primaryGenre])

    useEffect(() => {
        if (isNoLyricsTrack) {
            setModalWriters([])
            setWriterErrors([])
            setIsExplicit(false)
        }
    }, [isNoLyricsTrack])

    useEffect(() => {
        if (!isCrbtEligible && previewClipStartTime) {
            setPreviewClipStartTime('')
        }
    }, [isCrbtEligible, previewClipStartTime])

    // Update state when track changes (switching between different tracks)
    useEffect(() => {
        if (track) {
            setTrackTitle(track.title || '')
            setLanguage(track.language || '')
            setIsrc(track.isrc || '')
            setIsrcMode(track.isrc ? 'existing' : 'generate')
            setPrimaryGenre(track.primaryGenre || '')
            setSecondaryGenre(track.secondaryGenre || '')
            setPreviewClipStartTime(track.previewClipStartTime || '')
            setVersion(track.version || '')
            setIsExplicit(track.isExplicit || false)
            setInstrumental(track.isInstrumental || 'no')
            setModalFeaturingArtist(track.featuringArtist || '')
            setMood(track.mood || '')

            // Seed Track Main Artists without wiping existing single-artist tracks.
            setModalTrackMainArtists(
                seedTrackMainArtistsForModal(track, releasePrimaryArtists),
            )
            setTrackMainArtistDraft('')
            setShowTrackMainArtistAdd(false)

            // If restricted plan, force mainArtistName AND profiles
            if (totalAllowedArtists === 1 && mainArtistName) {
                setModalArtistSearch(mainArtistName)

                // Sync Profiles from Main Artist
                if (mainArtistProfiles) {
                    setModalSpotifyProfile(mainArtistProfiles.spotify?.id || mainArtistProfiles.spotify || '')
                    setModalAppleMusicProfile(mainArtistProfiles.apple?.id || mainArtistProfiles.apple || '')

                    // Socials Logic (Main Artist)
                    let instaUrl = ''
                    let fbUrl = ''

                    if (mainArtistProfiles.instagram) {
                        if (mainArtistProfiles.instagram.startsWith('http')) {
                            setInstagramStatus('yes');
                            instaUrl = mainArtistProfiles.instagram;
                        } else if (mainArtistProfiles.instagram === 'yes') {
                            setInstagramStatus('yes');
                        } else {
                            setInstagramStatus('no');
                        }
                    } else {
                        setInstagramStatus('no')
                    }
                    setInstagramUrl(instaUrl)

                    if (mainArtistProfiles.facebook) {
                        if (mainArtistProfiles.facebook.startsWith('http')) {
                            setFacebookStatus('yes');
                            fbUrl = mainArtistProfiles.facebook;
                        } else if (mainArtistProfiles.facebook === 'yes') {
                            setFacebookStatus('yes');
                        } else {
                            setFacebookStatus('no');
                        }
                    } else {
                        setFacebookStatus('no')
                    }
                    setFacebookUrl(fbUrl)
                }

            } else {
                setModalArtistSearch(track.artistName || '')
                setModalSpotifyProfile(track.spotifyProfile || '')
                setModalAppleMusicProfile(track.appleMusicProfile || '')

                setInstagramStatus(profileValueToInputString(track.instagramProfile) ? 'yes' : 'no')
                setFacebookStatus(profileValueToInputString(track.facebookProfile) ? 'yes' : 'no')
                setInstagramUrl(profileValueToInputString(track.instagramProfile))
                setFacebookUrl(profileValueToInputString(track.facebookProfile))

                // Check if artist name is new (not in usedArtists)
                const isNew = track.artistName ? !usedArtists.some(a => (typeof a === 'string' ? a : a.name) === track.artistName) : false
                setCreatingNewArtist(isNew)
            }

            setModalWriters(track.writers && track.writers.length > 0 ? track.writers : [''])
            setWriterErrors([])
            setModalComposers(track.composers && track.composers.length > 0 ? track.composers : [''])
            setComposerErrors([])

            setSearchResults(emptySearchResults())
            setHasSearched(false)
        } else if (isOpen) {
            // New track or empty state — default Track Main Artists from release primaries.
            setModalTrackMainArtists(
                releasePrimaryArtists.map((artist) => ({ ...artist })),
            )
            setTrackMainArtistDraft('')
            setShowTrackMainArtistAdd(false)

            if (totalAllowedArtists === 1) {
                // Determine the correct name to use:
                // 1. mainArtistName prop (passed from parent)
                // 2. user.fullName (fallback if prop missing, though prop should be there)
                const nameToUse = mainArtistName || user?.fullName || '';

                if (nameToUse) {
                    setModalArtistSearch(nameToUse);
                    // Trigger search automatically if we have a name
                    handleModalArtistSearch(nameToUse);

                    // Pre-fill profiles from main artist if provided
                    if (mainArtistProfiles) {
                        if (mainArtistProfiles.spotify) setModalSpotifyProfile(mainArtistProfiles.spotify.id || mainArtistProfiles.spotify);
                        if (mainArtistProfiles.apple) setModalAppleMusicProfile(mainArtistProfiles.apple.id || mainArtistProfiles.apple);

                        // Handle Socials
                        if (mainArtistProfiles.instagram) {
                            if (mainArtistProfiles.instagram.startsWith('http')) {
                                setInstagramStatus('yes');
                                setInstagramUrl(mainArtistProfiles.instagram);
                            } else if (mainArtistProfiles.instagram === 'yes') {
                                setInstagramStatus('yes');
                            }
                        }

                        if (mainArtistProfiles.facebook) {
                            if (mainArtistProfiles.facebook.startsWith('http')) {
                                setFacebookStatus('yes');
                                setFacebookUrl(mainArtistProfiles.facebook);
                            } else if (mainArtistProfiles.facebook === 'yes') {
                                setFacebookStatus('yes');
                            }
                        }
                    }
                }
            } else if (user?.fullName && totalAllowedArtists === 1) {
                // Redundant check given above, but keeping logic structure similar to original intention
                // if specifically needing user fallback
                const name = user.fullName
                setModalArtistSearch(name)
                handleModalArtistSearch(name)
            }
        }
    }, [track, trackIndex, isOpen, user, totalAllowedArtists, mainArtistName, mainArtistProfiles, releasePrimaryArtists])

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.setProperty('overflow', 'hidden', 'important')
            document.documentElement.style.setProperty('overflow', 'hidden', 'important')
        } else {
            document.body.style.overflow = ''
            document.documentElement.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
            document.documentElement.style.overflow = ''
        }
    }, [isOpen])


    const handleModalArtistSearch = async (name: string) => {
        setModalArtistSearch(name)

        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current)
        }

        if (name.length > 2) {
            setIsSearching(true)
            searchTimeout.current = setTimeout(async () => {
                try {
                    const results = await searchArtistProfiles(name, {
                        spotifyLimit: 5,
                        appleLimit: 5,
                        cosmosLimit: 10,
                    })
                    setSearchResults(results)
                } catch (error) {
                    console.error('Search error:', error)
                    setSearchResults(emptySearchResults())
                } finally {
                    setIsSearching(false)
                    setHasSearched(true)
                }
            }, 500)
        } else {
            setSearchResults(emptySearchResults())
            setIsSearching(false)
            setHasSearched(false)
        }
    }

    const handleIsrcModeChange = (mode: IsrcMode) => {
        setIsrcMode(mode)
        if (mode === 'generate') {
            setIsrc('')
            setIsrcError('')
            return
        }
        if (!isrc) {
            setIsrc(process.env.NEXT_PUBLIC_DEFAULT_ISRC || '')
        }
    }

    const handleISRCChange = (value: string) => {
        setIsrc(value)

        // Only validate if there's a value
        if (value.trim() === '') {
            setIsrcError('')
            return
        }

        // ISRC Format: XX-XXX-XX-XXXXX
        // Allow alphanumeric in all segments
        const isrcPattern = /^[A-Z0-9]{2}-[A-Z0-9]{3}-[A-Z0-9]{2}-[A-Z0-9]{5}$/i

        if (!isrcPattern.test(value)) {
            setIsrcError('ISRC must be in format: XX-XXX-XX-XXXXX (e.g., US-ABC-12-34567)')
        } else {
            setIsrcError('')
        }
    }

    const validateWriterName = (name: string): string => {
        return getLegalPersonNameError(name, true) ?? ''
    }

    const validateComposerName = (name: string): string => {
        return getLegalPersonNameError(name, false) ?? ''
    }

    const handleSave = () => {
        if (track && trackIndex !== null) {
            // Validate required fields
            if (!trackTitle.trim()) {
                toast.error("Track title is required")
                return
            }

            if (!modalTrackMainArtists.some((a) => a.name?.trim())) {
                toast.error("At least one Track Main Artist is required")
                return
            }

            if (!primaryGenre) {
                toast.error("Primary genre is required")
                return
            }

            if (!secondaryGenre) {
                toast.error("Sub-genre is required")
                return
            }

            if (!mood) {
                toast.error("Vibe is required")
                return
            }

            // Check for ISRC validation error
            if (isrcError) {
                toast.error("Please fix ISRC error before saving")
                return
            }

            if (previewClipStartTime && !isCrbtEligible) {
                toast.error(getCrbtIneligibilityMessage(trackDurationSec))
                return
            }

            // Featured Artist validation
            if ((fieldRules as any).featuredArtists?.required && !modalFeaturingArtist?.trim()) {
                toast.error('Featuring artist is required')
                return
            }

            const filteredWriters = modalWriters.filter(w => w?.trim())
            const filteredComposers = modalComposers.filter(c => c?.trim())
            const isNoLyricsTrack = isInstrumentalRelease(primaryGenre, instrumental)

            // Validate Writers (lyric tracks only)
            if (!isNoLyricsTrack) {
            if (filteredWriters.length === 0) {
                toast.error("At least one writer is required")
                return
            }

            for (const sw of filteredWriters) {
                const writerError = getLegalPersonNameError(sw.trim(), true)
                if (writerError) {
                    toast.error(`Invalid Writer name: "${sw}". ${writerError}`)
                    return
                }
            }
            }

            // Validate Composers (if provided, must be valid)
            for (const comp of filteredComposers) {
                const composerError = getLegalPersonNameError(comp.trim(), false)
                if (composerError) {
                    toast.error(`Invalid Composer name: "${comp}". ${composerError}`)
                    return
                }
            }

            // Validate Artist Limit
            if (totalAllowedArtists < Infinity) {
                // Collect ALL artists in this release:
                // 1. Main artist from basic info
                // 2. Featuring artists from basic info
                // 3. Artists from other tracks (excluding current track being edited)
                // 4. The new artist for this track

                const releaseArtists: string[] = [];

                // Add main artist from basic info
                if (mainArtistName?.trim()) {
                    releaseArtists.push(mainArtistName.trim());
                }

                // Add featuring artists from basic info
                if (featuringArtists && featuringArtists.length > 0) {
                    featuringArtists.forEach(artist => {
                        if (artist.name?.trim()) {
                            releaseArtists.push(artist.name.trim());
                        }
                    });
                }

                // Add artists from other tracks
                const otherTracksArtists = allTracks
                    .filter((_, idx) => idx !== trackIndex)
                    .map(t => t.artistName)
                    .filter((name): name is string => typeof name === 'string' && name.trim().length > 0);

                releaseArtists.push(...otherTracksArtists);

                // Add track main artists for this track
                for (const artist of modalTrackMainArtists) {
                    if (artist.name?.trim()) {
                        releaseArtists.push(artist.name.trim())
                    }
                }

                // Get unique artists in this release
                const uniqueArtistsInRelease = new Set(releaseArtists);

                // Count how many NEW artists this would introduce
                let newArtistsCount = 0;
                const usedArtistNames = usedArtists.map(a =>
                    typeof a === 'string' ? a.toLowerCase().trim() : a.name?.toLowerCase().trim()
                ).filter(Boolean);

                for (const artist of Array.from(uniqueArtistsInRelease)) {
                    if (!usedArtistNames.includes(artist.toLowerCase().trim())) {
                        newArtistsCount++;
                    }
                }

                // Check if total would exceed limit
                const totalUsedCount = usedArtists.length;
                if ((totalUsedCount + newArtistsCount) > totalAllowedArtists) {
                    const planKey = resolveEffectivePlanKey(user);
                    const planName = planKey === 'creator_plus' ? 'Creator+' : planKey.charAt(0).toUpperCase() + planKey.slice(1);
                    toast.error(`You have reached your artist limit (${totalAllowedArtists}) for the ${planName} plan.`);
                    return;
                }
            }

            const normalizedTrackTitle = toTitleCase(trackTitle)
            const savedMains = modalTrackMainArtists
                .filter((a) => a.name?.trim())
                .map((artist) => ({ ...artist, name: artist.name.trim() }))
            const primary = savedMains[0]

            const updatedTrack: Track = {
                ...track,
                title: normalizedTrackTitle,
                // Legacy single field stays in sync with the first Track Main Artist.
                artistName: primary?.name || '',
                trackMainArtists: savedMains,
                language: (() => {
                    const lang = resolveLanguage(primaryGenre, language, instrumental)
                    return lang
                        ? lang.charAt(0).toUpperCase() + lang.slice(1).toLowerCase()
                        : ''
                })(),
                isrc,
                primaryGenre,
                secondaryGenre,
                previewClipStartTime: isCrbtEligible ? previewClipStartTime : '',
                version,
                spotifyProfile: primary?.spotifyProfile,
                appleMusicProfile: primary?.appleMusicProfile,
                youtubeMusicProfile: primary?.youtubeMusicProfile || '',
                instagramProfile: primary?.instagramProfile || '',
                facebookProfile: primary?.facebookProfile || '',
                isExplicit: isNoLyricsTrack ? false : isExplicit,
                isInstrumental: isNoLyricsTrack ? 'yes' : instrumental,
                featuringArtist: modalFeaturingArtist,
                mood: mood,
            }
            onSave(updatedTrack, isNoLyricsTrack ? [] : filteredWriters, filteredComposers)
            onClose()
        }
    }

    if (!isOpen || !track || trackIndex === null) return null

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[999] p-4 backdrop-blur-sm">
            <div className="bg-[#1a1c23] border border-border/50 shadow-2xl rounded-xl max-w-4xl w-full my-8 p-6 animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Edit Track Metadata</h3>
                    <Button variant="ghost" size="sm" onClick={onClose} type="button">
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 overscroll-contain" data-lenis-prevent="true">
                    <p className="text-sm text-muted-foreground">Configure metadata for this track</p>

                    {/* Track Title */}
                    <div className="space-y-2">
                        <Label htmlFor="track-title">Track Title <span className="text-red-500">*</span></Label>
                        <Input
                            id="track-title"
                            placeholder="Enter track title"
                            value={trackTitle}
                            onChange={(e) => setTrackTitle(e.target.value)}
                            onBlur={() => {
                                const normalized = toTitleCase(trackTitle)
                                if (normalized !== trackTitle) {
                                    setTrackTitle(normalized)
                                }
                            }}
                        />
                    </div>

                    {/* Version/Subtitle */}
                    <div className="space-y-2">
                        <Label htmlFor="track-version">Version/Subtitle</Label>
                        <Input
                            id="track-version"
                            placeholder="Enter version/subtitle (e.g., Extended Mix, Remix, etc.)"
                            value={version}
                            onChange={(e) => setVersion(e.target.value)}
                        />
                    </div>

                    {/* Track Main Artists — multi-artist COSMOS track_main_artist */}
                    <TrackMainArtistsEditor
                        artists={modalTrackMainArtists}
                        onChange={setModalTrackMainArtists}
                        releasePrimaryArtists={releasePrimaryArtists}
                        usedArtists={usedArtists}
                        artistLimit={totalAllowedArtists}
                    />

                    {/* Instrumental — first so genre & language follow this choice */}
                    <div className="space-y-3 pt-4 border-t border-border">
                        <Label className="text-lg font-semibold">Is Instrumental?</Label>
                        <p className="text-sm text-muted-foreground">
                            Choose first — genre and language options below will update based on your answer.
                        </p>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <label
                                htmlFor="track-instrumental-no"
                                className={cn(
                                    "flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors",
                                    instrumental === 'no'
                                        ? "border-primary bg-primary/5"
                                        : "border-border hover:bg-accent/50",
                                )}
                            >
                                <input
                                    type="radio"
                                    id="track-instrumental-no"
                                    name="track-instrumental"
                                    value="no"
                                    checked={instrumental === 'no'}
                                    onChange={() => handleInstrumentalChange('no')}
                                    className="h-4 w-4 border-primary text-primary focus:ring-primary"
                                />
                                <span className="text-sm font-medium">
                                    This song contains lyrics
                                </span>
                            </label>

                            <label
                                htmlFor="track-instrumental-yes"
                                className={cn(
                                    "flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors",
                                    instrumental === 'yes'
                                        ? "border-primary bg-primary/5"
                                        : "border-border hover:bg-accent/50",
                                )}
                            >
                                <input
                                    type="radio"
                                    id="track-instrumental-yes"
                                    name="track-instrumental"
                                    value="yes"
                                    checked={instrumental === 'yes'}
                                    onChange={() => handleInstrumentalChange('yes')}
                                    className="h-4 w-4 border-primary text-primary focus:ring-primary"
                                />
                                <span className="text-sm font-medium">
                                    This song is instrumental and contains no lyrics
                                </span>
                            </label>
                        </div>
                    </div>

                    <IsrcCodeSection
                        idPrefix="track-isrc"
                        mode={isrcMode}
                        onModeChange={handleIsrcModeChange}
                        value={isrc}
                        onChange={handleISRCChange}
                        error={isrcError}
                        isFreePlan={isEffectiveFreePlan(user)}
                        onFreePlanAttempt={() =>
                            toast.error('Upgrade to paid plan to use custom ISRC', { id: 'isrc-warning' })
                        }
                    />

                    {/* Primary Genre */}
                    <div className="space-y-2">
                        <Label htmlFor="track-genre">Primary Genre <span className="text-red-500">*</span></Label>
                        <select
                            id="track-genre"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={primaryGenre}
                            onChange={(e) => {
                                setPrimaryGenre(e.target.value)
                                setSecondaryGenre('')
                            }}
                        >
                            <option value="">Select a genre</option>
                            {genresLoading ? (
                                <option disabled>Loading genres...</option>
                            ) : (
                                availableGenres.map((genre) => (
                                    <option key={genre._id} value={genre.name}>
                                        {genre.name}
                                    </option>
                                ))
                            )}
                        </select>
                    </div>

                    {/* Secondary Genre (Sub-genre) */}
                    <div className="space-y-2">
                        <Label htmlFor="track-genre-2">Sub-genre <span className="text-red-500">*</span></Label>
                        <select
                            id="track-genre-2"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={secondaryGenre}
                            onChange={(e) => setSecondaryGenre(e.target.value)}
                            disabled={
                                !primaryGenre ||
                                (subGenresLoading && subGenres.length === 0)
                            }
                        >
                            <option value="">
                                {!primaryGenre
                                    ? "Select a genre first"
                                    : subGenresLoading && subGenres.length === 0
                                        ? "Loading sub-genres..."
                                        : "Select a sub-genre"}
                            </option>
                            {subGenres.map((subGenre) => (
                                <option key={subGenre._id} value={subGenre.name}>
                                    {subGenre.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Mood */}
                    <div className="space-y-2">
                        <Label htmlFor="track-mood">Vibe <span className="text-red-500">*</span></Label>
                        <select
                            id="track-mood"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={mood}
                            onChange={(e) => setMood(e.target.value)}
                        >
                            <option value="">Select a mood</option>
                            <option value="Romantic">Romantic</option>
                            <option value="Happy">Happy</option>
                            <option value="Sad">Sad</option>
                            <option value="Dance">Dance</option>
                            <option value="Bhangra">Bhangra</option>
                            <option value="Patriotic">Patriotic</option>
                            <option value="Nostalgic">Nostalgic</option>
                            <option value="Inspirational">Inspirational</option>
                            <option value="Enthusiastic">Enthusiastic</option>
                            <option value="Optimistic">Optimistic</option>
                            <option value="Passion">Passion</option>
                            <option value="Pessimistic">Pessimistic</option>
                            <option value="Spiritual">Spiritual</option>
                            <option value="Peppy">Peppy</option>
                            <option value="Philosophical">Philosophical</option>
                            <option value="Mellow">Mellow</option>
                            <option value="Calm">Calm</option>
                        </select>
                    </div>

                    {/* Language */}
                    <div className="space-y-4 pt-6 border-t border-border">
                        <div className="space-y-3">
                            <Label htmlFor="track-language" className="text-lg font-semibold">
                                Language <span className="text-red-500">*</span>
                            </Label>
                            <select
                                id="track-language"
                                className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${isNoLyricsTrack ? 'opacity-80 cursor-not-allowed' : ''}`}
                                value={isNoLyricsTrack ? INSTRUMENTAL_LANGUAGE : language}
                                disabled={isNoLyricsTrack}
                                onChange={(e) => {
                                    if (!isNoLyricsTrack) {
                                        setLanguage(e.target.value)
                                    }
                                }}
                            >
                                <option value="">
                                    {isNoLyricsTrack ? INSTRUMENTAL_LANGUAGE : 'Select a language'}
                                </option>
                                {languageOptions.map((lang) => (
                                    <option key={lang} value={lang}>
                                        {lang}
                                    </option>
                                ))}
                            </select>
                            {isNoLyricsTrack && (
                                <p className="text-xs text-muted-foreground">
                                    Language is set to Instrumental for tracks without lyrics.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Writers - Hidden when instrumental is yes */}
                    {!isNoLyricsTrack && (
                        <div className="space-y-3 pt-4 border-t">
                            <div>
                                <Label className="text-lg font-semibold">Writer/Author <span className="text-red-500">*</span></Label>
                                <p className="text-xs text-muted-foreground mt-1">Real names, not stage names. {LEGAL_PERSON_NAME_HINT}</p>
                            </div>
                            {modalWriters.map((writer, idx) => (
                                <div key={idx} className="space-y-2 p-3 rounded-lg border border-border bg-accent/5">
                                    <Input
                                        placeholder="Legal full name *"
                                        value={writer}
                                        onChange={(e) => {
                                            const updated = [...modalWriters]
                                            updated[idx] = e.target.value
                                            setModalWriters(updated)
                                            // Validate immediately
                                            const errors = [...writerErrors]
                                            errors[idx] = validateWriterName(e.target.value)
                                            setWriterErrors(errors)
                                        }}
                                        className={writerErrors[idx] ? 'border-red-500' : ''}
                                    />
                                    {writerErrors[idx] && (
                                        <p className="text-xs text-red-500 mt-1">
                                            {writerErrors[idx]}
                                        </p>
                                    )}
                                    {modalWriters.length > 1 && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setModalWriters(modalWriters.filter((_, i) => i !== idx))
                                                setWriterErrors(writerErrors.filter((_, i) => i !== idx))
                                            }}
                                            className="text-destructive hover:text-destructive"
                                            type="button"
                                        >
                                            Remove writer
                                        </Button>
                                    )}
                                </div>
                            ))}
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setModalWriters([...modalWriters, ''])
                                    setWriterErrors([...writerErrors, ''])
                                }}
                                className="text-primary hover:text-primary"
                                type="button"
                            >
                                + Add another writer
                            </Button>
                        </div>
                    )}

                    {/* Composers */}
                    <div className="space-y-3 pt-4 border-t">
                        <div>
                            <Label className="text-lg font-semibold">Composer</Label>
                            <p className="text-xs text-muted-foreground mt-1">Real names, not stage names. {LEGAL_PERSON_NAME_COMPOSER_HINT}</p>
                        </div>
                        {modalComposers.map((composer, idx) => (
                            <div key={idx} className="space-y-2 p-3 rounded-lg border border-border bg-accent/5">
                                <Input
                                    placeholder="Legal full name"
                                    value={composer}
                                    onChange={(e) => {
                                        const updated = [...modalComposers]
                                        updated[idx] = e.target.value
                                        setModalComposers(updated)
                                        // Validate immediately
                                        const errors = [...composerErrors]
                                        errors[idx] = validateComposerName(e.target.value)
                                        setComposerErrors(errors)
                                    }}
                                    className={composerErrors[idx] ? 'border-red-500' : ''}
                                />
                                {composerErrors[idx] && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {composerErrors[idx]}
                                    </p>
                                )}
                                {modalComposers.length > 1 && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setModalComposers(modalComposers.filter((_, i) => i !== idx))
                                            setComposerErrors(composerErrors.filter((_, i) => i !== idx))
                                        }}
                                        className="text-destructive hover:text-destructive"
                                        type="button"
                                    >
                                        Remove Composer
                                    </Button>
                                )}
                            </div>
                        ))}
                        <Button
                            variant="outline"
                            onClick={() => {
                                setModalComposers([...modalComposers, ''])
                                setComposerErrors([...composerErrors, ''])
                            }}
                            className="text-primary hover:text-primary"
                            type="button"
                        >
                            + Add Composer
                        </Button>
                    </div>


                    {/* Featuring Artist - Always show, but disable and show message if not allowed by plan */}
                    <div className="space-y-2 py-4 border-t">
                        <Label htmlFor="modalFeaturingArtist" className="text-lg font-semibold">
                            Featuring Artist{(fieldRules || {}).featuredArtists?.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <Input
                            id="modalFeaturingArtist"
                            placeholder="Enter Featuring Artist"
                            value={modalFeaturingArtist}
                            onChange={(e) => setModalFeaturingArtist(e.target.value)}
                            disabled={!areFeaturedArtistsAllowed}
                        />
                        {!areFeaturedArtistsAllowed && (
                            <div className="flex items-start gap-2 p-2 bg-muted/50 rounded-md text-xs text-muted-foreground">
                                <Info className="h-3 w-3 mt-0.5" />
                                <span>Upgrade to Creator+ or higher to add featuring artists.</span>
                            </div>
                        )}
                    </div>

                    {!isNoLyricsTrack && (
                    <div className="space-y-3 pt-4 border-t">
                        <Label className="text-lg font-semibold flex items-center gap-2">
                            Explicit Content
                            <span className="inline-flex items-center justify-center bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-red-200 dark:border-red-800">
                                18+
                            </span>
                        </Label>

                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    id="track-explicit-no"
                                    name="track-explicit"
                                    checked={!isExplicit}
                                    onChange={() => setIsExplicit(false)}
                                    className="h-4 w-4"
                                />
                                <Label htmlFor="track-explicit-no" className="font-normal cursor-pointer">
                                    No - Clean content
                                </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    id="track-explicit-yes"
                                    name="track-explicit"
                                    checked={isExplicit}
                                    onChange={() => setIsExplicit(true)}
                                    className="h-4 w-4"
                                />
                                <Label htmlFor="track-explicit-yes" className="font-normal cursor-pointer">
                                    Yes - Contains explicit content
                                </Label>
                            </div>
                        </div>
                    </div>
                    )}



                    {/* Preview Clip Start Time */}
                    <div className="space-y-3 pt-6 border-t border-border">
                        <Label className="text-lg font-semibold">
                            Song Highlight Start Time{" "}
                            <span className="text-muted-foreground font-normal">
                                (Caller Tune (CRBT), TikTok, Apple Music, iTunes & YouTube Shorts)
                            </span>
                        </Label>

                        <div className="mt-4">
                            {!hasCrbtAudio ? (
                                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
                                    <p className="text-sm text-amber-200/90">
                                        Upload or load the audio file first to choose a song highlight clip.
                                    </p>
                                </div>
                            ) : isResolvingCrbtAudio ? (
                                <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-8 text-center">
                                    <p className="text-sm text-muted-foreground">
                                        Loading audio waveform...
                                    </p>
                                </div>
                            ) : crbtAudioError ? (
                                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5">
                                    <p className="text-sm text-red-200/90">{crbtAudioError}</p>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Go back to the Audio step and confirm the file is validated, then return here.
                                    </p>
                                </div>
                            ) : playbackSource ? (
                                <WaveformTrimmer
                                    audioFile={playbackSource}
                                    trackDurationSec={trackDurationSec}
                                    initialStartTime={previewClipStartTime}
                                    onTimeChange={(time) => setPreviewClipStartTime(time)}
                                />
                            ) : null}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t mt-6">
                    <Button variant="outline" onClick={onClose} type="button">
                        Cancel
                    </Button>
                    <Button onClick={handleSave} type="button">
                        Save Changes
                    </Button>
                </div>
            </div>
        </div>
    )
}

'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Track, Songwriter } from './types'
import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Music, X, Loader2, Plus, Info, UserCheck } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getGenres, getSubGenresByGenreId, type Genre, type SubGenre } from '@/lib/api/genres'
import { useAuth } from '@/contexts/AuthContext'
import { getPlanLimits } from '@/lib/api/plans'
import { toast } from 'react-hot-toast'
import WaveformTrimmer from './WaveformTrimmer'
import { getCrbtIneligibilityMessage, isTrackEligibleForCrbt } from './crbt-validation'
import { getLegalPersonNameError, LEGAL_PERSON_NAME_HINT } from '@/lib/validation/legal-person-name'
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
        youtube?: any
        instagram?: string
        facebook?: string
    }
    fieldRules?: Record<string, any>
    audioFiles?: any[]
}

export default function TrackEditModal({ isOpen, onClose, track, trackIndex, onSave, usedArtists = [], allTracks = [], mainArtistName = '', featuringArtists = [], mainArtistProfiles = {}, fieldRules = {}, audioFiles = [] }: TrackEditModalProps) {
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
    const totalAllowedArtists = planLimits.artistLimit + (user?.extraArtistSlots || 0);

    // Local state for track metadata fields
    const [trackTitle, setTrackTitle] = useState(track?.title || '')
    const [language, setLanguage] = useState(track?.language || '')
    const [isrc, setIsrc] = useState(track?.isrc || '')
    const [isrcError, setIsrcError] = useState('')
    const [showIsrc, setShowIsrc] = useState(!!track?.isrc)
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
    const trackDurationSec =
        typeof linkedAudioFile?.duration === 'number' ? linkedAudioFile.duration : null
    const isCrbtEligible = isTrackEligibleForCrbt(trackDurationSec)

    const areFeaturedArtistsAllowed = (fieldRules || {}).featuredArtists?.allow !== false

    // Local state for modal editing
    const [modalArtistSearch, setModalArtistSearch] = useState(track?.artistName || '')
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

    const [modalSpotifyProfile, setModalSpotifyProfile] = useState(track?.spotifyProfile || '')
    const [modalAppleMusicProfile, setModalAppleMusicProfile] = useState(track?.appleMusicProfile || '')
    const [modalYoutubeProfile, setModalYoutubeProfile] = useState(track?.youtubeMusicProfile || '')
    const [instagramStatus, setInstagramStatus] = useState(track?.instagramProfile ? 'yes' : 'no')
    const [facebookStatus, setFacebookStatus] = useState(track?.facebookProfile ? 'yes' : 'no')
    const [instagramUrl, setInstagramUrl] = useState(track?.instagramProfile || '')
    const [facebookUrl, setFacebookUrl] = useState(track?.facebookProfile || '')

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
            setShowIsrc(!!track.isrc)
            setPrimaryGenre(track.primaryGenre || '')
            setSecondaryGenre(track.secondaryGenre || '')
            setPreviewClipStartTime(track.previewClipStartTime || '')
            setVersion(track.version || '')
            setIsExplicit(track.isExplicit || false)
            setInstrumental(track.isInstrumental || 'no')
            setModalFeaturingArtist(track.featuringArtist || '')
            setMood(track.mood || '')

            // If restricted plan, force mainArtistName AND profiles
            if (totalAllowedArtists === 1 && mainArtistName) {
                setModalArtistSearch(mainArtistName)

                // Sync Profiles from Main Artist
                if (mainArtistProfiles) {
                    setModalSpotifyProfile(mainArtistProfiles.spotify?.id || mainArtistProfiles.spotify || '')
                    setModalAppleMusicProfile(mainArtistProfiles.apple?.id || mainArtistProfiles.apple || '')
                    setModalYoutubeProfile(mainArtistProfiles.youtube?.id || mainArtistProfiles.youtube || '')

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
                setModalYoutubeProfile(track.youtubeMusicProfile || '')

                setInstagramStatus(track.instagramProfile ? 'yes' : 'no')
                setFacebookStatus(track.facebookProfile ? 'yes' : 'no')
                setInstagramUrl(track.instagramProfile || '')
                setFacebookUrl(track.facebookProfile || '')

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
            // New track or empty state
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
                        if (mainArtistProfiles.youtube) setModalYoutubeProfile(mainArtistProfiles.youtube.id || mainArtistProfiles.youtube);

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
    }, [track, trackIndex, isOpen, user, totalAllowedArtists, mainArtistName, mainArtistProfiles])

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
                        youtubeLimit: 5,
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

    const validateName = (name: string): string => {
        return getLegalPersonNameError(name) ?? ''
    }

    const handleSave = () => {
        if (track && trackIndex !== null) {
            // Validate required fields
            if (!trackTitle.trim()) {
                toast.error("Track title is required")
                return
            }

            if (!modalArtistSearch.trim()) {
                toast.error("Artist name is required")
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
                const writerError = getLegalPersonNameError(sw.trim())
                if (writerError) {
                    toast.error(`Invalid Writer name: "${sw}". ${writerError}`)
                    return
                }
            }
            }

            // Validate Composers (if provided, must be valid)
            for (const comp of filteredComposers) {
                const composerError = getLegalPersonNameError(comp.trim())
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

                // Add the new artist name for this track
                if (modalArtistSearch.trim()) {
                    releaseArtists.push(modalArtistSearch.trim());
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
                    const planKey = (user?.plan as string) || 'free';
                    const planName = planKey === 'creator_plus' ? 'Creator+' : planKey.charAt(0).toUpperCase() + planKey.slice(1);
                    toast.error(`You have reached your artist limit (${totalAllowedArtists}) for the ${planName} plan.`);
                    return;
                }
            }

            const updatedTrack: Track = {
                ...track,
                title: trackTitle,
                artistName: modalArtistSearch,
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
                spotifyProfile: modalSpotifyProfile,
                appleMusicProfile: modalAppleMusicProfile,
                youtubeMusicProfile: modalYoutubeProfile,
                instagramProfile: instagramUrl,
                facebookProfile: facebookUrl,
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

                    {/* Artist Name with Rich Search UI */}
                    {/* Artist Selection Section - Styled like BasicInfoStep */}
                    <div className="space-y-4 rounded-lg border-2 border-border p-4 bg-card/30">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Track Artist</Label>
                            {/* If an artist is selected and we want to change it */}
                            {(!!modalSpotifyProfile || !!modalAppleMusicProfile || !!modalYoutubeProfile) && planLimits.artistLimit !== 1 && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        handleModalArtistSearch('')
                                        setModalSpotifyProfile('')
                                        setModalAppleMusicProfile('')
                                        setModalYoutubeProfile('')
                                        setInstagramStatus('no')
                                        setFacebookStatus('no')
                                        setInstagramUrl('')
                                        setFacebookUrl('')
                                    }}
                                    className="text-xs text-primary hover:text-primary/80 font-medium"
                                >
                                    Change Artist
                                </button>
                            )}
                        </div>

                        <div className="relative space-y-2">
                            {/* Select from Roster */}
                            {usedArtists.length > 0 && !(!!modalSpotifyProfile || !!modalAppleMusicProfile || !!modalYoutubeProfile) && (
                                <Select
                                    value={usedArtists.find(a => (typeof a === 'string' ? a : a.name) === modalArtistSearch) ? modalArtistSearch : (creatingNewArtist ? 'new' : '')}
                                    onValueChange={(val) => {
                                        if (val === 'new') {
                                            handleModalArtistSearch('')
                                            setModalSpotifyProfile('')
                                            setModalAppleMusicProfile('')
                                            setModalYoutubeProfile('')
                                            setCreatingNewArtist(true)
                                        } else {
                                            const selectedArtist = usedArtists.find(a => (typeof a === 'string' ? a : a.name) === val)
                                            if (selectedArtist) {
                                                const name = typeof selectedArtist === 'string' ? selectedArtist : selectedArtist.name
                                                handleModalArtistSearch(name)
                                                setCreatingNewArtist(false)

                                                if (typeof selectedArtist === 'object') {
                                                    if (selectedArtist.spotifyProfile) setModalSpotifyProfile(selectedArtist.spotifyProfile)
                                                    if (selectedArtist.appleMusicProfile) setModalAppleMusicProfile(selectedArtist.appleMusicProfile)
                                                    if (selectedArtist.youtubeMusicProfile) setModalYoutubeProfile(selectedArtist.youtubeMusicProfile)

                                                    if (selectedArtist.instagramProfile) {
                                                        if (typeof selectedArtist.instagramProfile === 'string' && selectedArtist.instagramProfile.startsWith('http')) {
                                                            setInstagramStatus('yes')
                                                            setInstagramUrl(selectedArtist.instagramProfile)
                                                        } else {
                                                            setInstagramStatus(selectedArtist.instagramProfile)
                                                        }
                                                    }
                                                    if (selectedArtist.facebookProfile) {
                                                        if (typeof selectedArtist.facebookProfile === 'string' && selectedArtist.facebookProfile.startsWith('http')) {
                                                            setFacebookStatus('yes')
                                                            setFacebookUrl(selectedArtist.facebookProfile)
                                                        } else {
                                                            setFacebookStatus(selectedArtist.facebookProfile)
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }}
                                    disabled={planLimits.artistLimit === 1}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select an artist" />
                                    </SelectTrigger>
                                    <SelectContent className="z-[999]">
                                        {usedArtists.map((artist, i) => {
                                            const name = typeof artist === 'string' ? artist : artist.name
                                            return (
                                                <SelectItem key={i} value={name}>
                                                    <div className="flex items-center gap-2">
                                                        <UserCheck className="h-4 w-4 text-primary" />
                                                        <span>{name}</span>
                                                    </div>
                                                </SelectItem>
                                            )
                                        })}
                                        <SelectItem value="new">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Plus className="h-4 w-4" />
                                                <span>Create New Artist</span>
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            )}

                            {/* Manual Search Input (only if no roster selection or creating new) */}
                            {(!usedArtists.length || creatingNewArtist || (modalArtistSearch !== '' && !usedArtists.some(a => (typeof a === 'string' ? a : a.name) === modalArtistSearch)) || (!!modalSpotifyProfile || !!modalAppleMusicProfile || !!modalYoutubeProfile)) && (
                                <div className="relative">
                                    <Input
                                        id="track-artist"
                                        placeholder="Search for artist..."
                                        value={modalArtistSearch}
                                        onChange={(e) => handleModalArtistSearch(e.target.value)}
                                        className={`${isSearching ? 'pr-10' : ''} ${(planLimits.artistLimit === 1 || !!modalSpotifyProfile || !!modalAppleMusicProfile || !!modalYoutubeProfile) ? 'bg-muted text-muted-foreground cursor-not-allowed pr-10' : ''}`}
                                        readOnly={planLimits.artistLimit === 1 || !!modalSpotifyProfile || !!modalAppleMusicProfile || !!modalYoutubeProfile}
                                    />
                                    {isSearching && !(!!modalSpotifyProfile || !!modalAppleMusicProfile || !!modalYoutubeProfile) && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Legacy artist-not-found message */}
                        {hasSearched && !isSearching &&
                            searchResults.spotify.length === 0 &&
                            searchResults.apple.length === 0 &&
                            searchResults.youtube.length === 0 &&
                            modalArtistSearch.length > 2 && (
                                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
                                    <p className="text-sm text-yellow-600 dark:text-yellow-400">
                                        Artist not found. Please upload music via a distributor to create a Spotify profile
                                    </p>
                                </div>
                            )}

                        {/* Legacy platform search UI — disabled while testing COSMOS-only flow */}
                        {modalArtistSearch && modalArtistSearch.length > 2 && !isSearching && (searchResults.spotify.length > 0 || searchResults.apple.length > 0 || searchResults.youtube.length > 0 || modalSpotifyProfile || modalAppleMusicProfile || modalYoutubeProfile) && (
                            <div className="space-y-6 pt-4 border-t border-border/50">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-semibold text-sm text-foreground">
                                        We found this artist on other platforms. Is this you?
                                    </h4>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Spotify Results */}
                                    {(searchResults.spotify.length > 0 || modalSpotifyProfile) && (
                                        <div className="space-y-3 flex flex-col h-full">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <svg className="h-5 w-5 text-[#1DB954] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                                                    </svg>
                                                    <span className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">Spotify</span>
                                                </div>
                                            </div>

                                            {!modalSpotifyProfile ? (
                                                <>
                                                    {searchResults.spotify.map((artist: any) => (
                                                        <div
                                                            key={artist.id}
                                                            className="flex items-center gap-3 p-3 rounded-md bg-background hover:bg-accent transition-colors cursor-pointer"
                                                            onClick={() => setModalSpotifyProfile(artist.id)}
                                                        >
                                                            <div className="h-4 w-4 rounded-full border border-primary flex items-center justify-center">
                                                                <div className="h-2 w-2 rounded-full hidden" />
                                                            </div>
                                                            {artist.image ? (
                                                                <img src={artist.image} alt={artist.name} className="h-10 w-10 rounded-full object-cover" />
                                                            ) : (
                                                                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                                                    <Music className="h-5 w-5 text-muted-foreground" />
                                                                </div>
                                                            )}
                                                            <div className="flex-1">
                                                                <p className="font-medium text-foreground">{artist.name}</p>
                                                                <p className="text-sm text-muted-foreground">{(artist.followers || 0).toLocaleString()} followers</p>
                                                            </div>
                                                        </div>
                                                    ))}

                                                    <div className="space-y-2 mt-4">
                                                        <div
                                                            className="flex items-center gap-3 p-3 rounded-md hover:bg-accent cursor-pointer transition-colors"
                                                            onClick={() => setModalSpotifyProfile('new')}
                                                        >
                                                            <div className="h-10 w-10 rounded-full border border-dashed border-primary flex items-center justify-center bg-primary/5">
                                                                <Plus className="h-5 w-5 text-primary" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="font-medium text-foreground">Create New Profile</p>
                                                                <p className="text-sm text-muted-foreground">Create a new Spotify profile for <strong>{modalArtistSearch}</strong></p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="bg-primary/10 border border-primary rounded-md p-3">
                                                    {modalSpotifyProfile === 'new' ? (
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-full border border-dashed border-primary flex items-center justify-center bg-primary/5">
                                                                <Plus className="h-5 w-5 text-primary" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="font-medium text-primary">New Spotify Profile</p>
                                                                <p className="text-sm text-muted-foreground">Creating a new profile for {modalArtistSearch}</p>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">Selected</span>
                                                                {!['free', 'solo'].includes(user?.plan || '') && (
                                                                    <button
                                                                        onClick={() => setModalSpotifyProfile('')}
                                                                        className="h-7 px-1.5 text-[10px] text-muted-foreground hover:text-red-500 font-medium"
                                                                        type="button"
                                                                    >
                                                                        Change
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        (() => {
                                                            // Resolve the selected profile object or string
                                                            let selected: any = null;

                                                            if (typeof modalSpotifyProfile === 'object' && modalSpotifyProfile !== null) {
                                                                selected = modalSpotifyProfile;
                                                            }

                                                            if (!selected && typeof modalSpotifyProfile === 'string' && modalSpotifyProfile.length > 0 && modalSpotifyProfile !== 'new') {
                                                                selected = searchResults.spotify.find(a => a.id === modalSpotifyProfile || a.externalUrl === modalSpotifyProfile);

                                                                if (!selected && modalArtistSearch === mainArtistName && mainArtistProfiles?.spotify) {
                                                                    if (typeof mainArtistProfiles.spotify === 'object' && (mainArtistProfiles.spotify.id === modalSpotifyProfile || mainArtistProfiles.spotify.url === modalSpotifyProfile || mainArtistProfiles.spotify.externalUrl === modalSpotifyProfile)) {
                                                                        selected = mainArtistProfiles.spotify;
                                                                    }
                                                                }

                                                                if (!selected && usedArtists && usedArtists.length > 0) {
                                                                    const ua = usedArtists.find(a => (typeof a === 'string' ? a : a.name) === modalArtistSearch);
                                                                    if (ua && typeof ua === 'object' && typeof ua.spotifyProfile === 'object' && ua.spotifyProfile !== null) {
                                                                        if (ua.spotifyProfile.id === modalSpotifyProfile || ua.spotifyProfile.url === modalSpotifyProfile || ua.spotifyProfile.externalUrl === modalSpotifyProfile) {
                                                                            selected = ua.spotifyProfile;
                                                                        }
                                                                    }
                                                                }

                                                                if (!selected) {
                                                                    selected = modalSpotifyProfile;
                                                                }
                                                            }

                                                            if (!selected) return null;

                                                            // String/URL Case
                                                            if (typeof selected === 'string') {
                                                                return (
                                                                    <div className="flex items-center gap-3">
                                                                        <a
                                                                            href={selected.startsWith('http') ? selected : undefined}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity"
                                                                            style={{ cursor: selected.startsWith('http') ? 'pointer' : 'default' }}
                                                                        >
                                                                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                                                                                <svg className="h-5 w-5 text-[#1DB954]" viewBox="0 0 24 24" fill="currentColor">
                                                                                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                                                                                </svg>
                                                                            </div>
                                                                            <div className="flex-1 min-w-0">
                                                                                <p className="font-medium text-primary hover:underline">{modalArtistSearch || 'Profile Linked'}</p>
                                                                                <p className="text-sm text-muted-foreground truncate" title={selected}>Profile Linked: {selected}</p>
                                                                            </div>
                                                                        </a>
                                                                        <div className="flex items-center gap-1 shrink-0">
                                                                            <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">Selected</span>
                                                                            {!['free', 'solo'].includes(user?.plan || '') && (
                                                                                <button
                                                                                    onClick={() => setModalSpotifyProfile('')}
                                                                                    className="h-7 px-1.5 text-[10px] text-muted-foreground hover:text-red-500 font-medium"
                                                                                    type="button"
                                                                                >
                                                                                    Change
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )
                                                            }

                                                            // Object Case
                                                            const profileUrl = selected.externalUrl || selected.url || selected.channelUrl;
                                                            return (
                                                                <div className="flex items-center gap-3">
                                                                    <a
                                                                        href={profileUrl || undefined}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity"
                                                                        style={{ cursor: profileUrl ? 'pointer' : 'default' }}
                                                                    >
                                                                        {selected.image ? (
                                                                            <img src={selected.image} alt={selected.name} className="h-10 w-10 rounded-full object-cover shrink-0" />
                                                                        ) : (
                                                                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                                                                                <Music className="h-5 w-5 text-muted-foreground" />
                                                                            </div>
                                                                        )}
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className={`font-medium text-primary ${profileUrl ? 'hover:underline' : ''} truncate`}>{selected.name}</p>
                                                                            <p className="text-sm text-muted-foreground truncate">{(selected.followers || 0).toLocaleString()} followers</p>
                                                                        </div>
                                                                    </a>
                                                                    <div className="flex items-center gap-1 shrink-0">
                                                                        <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">Selected</span>
                                                                        {!['free', 'solo'].includes(user?.plan || '') && (
                                                                            <button
                                                                                onClick={() => setModalSpotifyProfile('')}
                                                                                className="h-7 px-1.5 text-[10px] text-muted-foreground hover:text-red-500 font-medium"
                                                                                type="button"
                                                                            >
                                                                                Change
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )
                                                        })()
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Apple Music Section */}
                                    {(searchResults.apple.length > 0 || modalAppleMusicProfile) && (
                                        <div className="space-y-3 flex flex-col h-full">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <svg className="h-5 w-5 text-[#FA243C] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm3.227 15.653c-.347.187-.773.053-.96-.293l-1.36-2.587c-.187-.347-.053-.773.293-.96l.16-.08c.347-.187.773-.053.96.293l1.36 2.587c.187.347.053.773-.293.96l-.16.08zm-1.893-1.013c-.347.187-.773.053-.96-.293l-1.36-2.587c-.187-.347-.053-.773.293-.96l.16-.08c.347-.187.773-.053.96.293l1.36 2.587c.187.347.053.773-.293.96l-.16.08zm-1.893-1.013c-.347.187-.773.053-.96-.293l-1.36-2.587c-.187-.347-.053-.773.293-.96l.16-.08c.347-.187.773-.053.96.293l1.36 2.587c.187.347.053.773-.293.96l-.16.08z" />
                                                    </svg>
                                                    <span className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">Apple Music</span>
                                                </div>
                                            </div>

                                            {!modalAppleMusicProfile ? (
                                                <>
                                                    {searchResults.apple.map((artist: any) => (
                                                        <div
                                                            key={artist.id}
                                                            className="flex items-center gap-3 p-3 rounded-md bg-background hover:bg-accent transition-colors cursor-pointer"
                                                            onClick={() => setModalAppleMusicProfile(artist.id)}
                                                        >
                                                            <div className="h-4 w-4 rounded-full border border-primary flex items-center justify-center">
                                                                <div className="h-2 w-2 rounded-full hidden" />
                                                            </div>
                                                            {artist.image ? (
                                                                <img src={artist.image} alt={artist.name} className="h-10 w-10 rounded-full object-cover" />
                                                            ) : (
                                                                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                                                    <Music className="h-5 w-5 text-muted-foreground" />
                                                                </div>
                                                            )}
                                                            <div className="flex-1">
                                                                <p className="font-medium text-foreground">{artist.name}</p>
                                                                <p className="text-sm text-muted-foreground">{artist.track || 'Apple Music Artist'}</p>
                                                            </div>
                                                        </div>
                                                    ))}

                                                    <div className="space-y-2 mt-4">
                                                        <div
                                                            className="flex items-center gap-3 p-3 rounded-md hover:bg-accent cursor-pointer transition-colors"
                                                            onClick={() => setModalAppleMusicProfile('new')}
                                                        >
                                                            <div className="h-10 w-10 rounded-full border border-dashed border-primary flex items-center justify-center bg-primary/5">
                                                                <Plus className="h-5 w-5 text-primary" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="font-medium text-foreground">Create New Profile</p>
                                                                <p className="text-sm text-muted-foreground">Create a new Apple Music profile for <strong>{modalArtistSearch}</strong></p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="bg-primary/10 border border-primary rounded-md p-3">
                                                    {modalAppleMusicProfile === 'new' ? (
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-full border border-dashed border-primary flex items-center justify-center bg-primary/5">
                                                                <Plus className="h-5 w-5 text-primary" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="font-medium text-primary">New Apple Music Profile</p>
                                                                <p className="text-sm text-muted-foreground">Creating a new profile for {modalArtistSearch}</p>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">Selected</span>
                                                                {!['free', 'solo'].includes(user?.plan || '') && (
                                                                    <button
                                                                        onClick={() => setModalAppleMusicProfile('')}
                                                                        className="h-7 px-1.5 text-[10px] text-muted-foreground hover:text-red-500 font-medium"
                                                                        type="button"
                                                                    >
                                                                        Change
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        (() => {
                                                            let selected: any = null;

                                                            if (typeof modalAppleMusicProfile === 'object' && modalAppleMusicProfile !== null) {
                                                                selected = modalAppleMusicProfile;
                                                            }

                                                            if (!selected && typeof modalAppleMusicProfile === 'string' && modalAppleMusicProfile.length > 0 && modalAppleMusicProfile !== 'new') {
                                                                selected = searchResults.apple.find(a => a.id === modalAppleMusicProfile || a.url === modalAppleMusicProfile);

                                                                if (!selected && modalArtistSearch === mainArtistName && mainArtistProfiles?.apple) {
                                                                    if (typeof mainArtistProfiles.apple === 'object' && (mainArtistProfiles.apple.id === modalAppleMusicProfile || mainArtistProfiles.apple.url === modalAppleMusicProfile)) {
                                                                        selected = mainArtistProfiles.apple;
                                                                    }
                                                                }

                                                                if (!selected && usedArtists && usedArtists.length > 0) {
                                                                    const ua = usedArtists.find(a => (typeof a === 'string' ? a : a.name) === modalArtistSearch);
                                                                    if (ua && typeof ua === 'object' && typeof ua.appleMusicProfile === 'object' && ua.appleMusicProfile !== null) {
                                                                        if (ua.appleMusicProfile.id === modalAppleMusicProfile || ua.appleMusicProfile.url === modalAppleMusicProfile) {
                                                                            selected = ua.appleMusicProfile;
                                                                        }
                                                                    }
                                                                }

                                                                if (!selected) {
                                                                    selected = modalAppleMusicProfile;
                                                                }
                                                            }

                                                            if (!selected) return null;

                                                            if (typeof selected === 'string') {
                                                                return (
                                                                    <div className="flex items-center gap-3">
                                                                        <a
                                                                            href={selected.startsWith('http') ? selected : undefined}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity"
                                                                            style={{ cursor: selected.startsWith('http') ? 'pointer' : 'default' }}
                                                                        >
                                                                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                                                                                <svg className="h-5 w-5 text-[#FA243C]" viewBox="0 0 24 24" fill="currentColor">
                                                                                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm3.227 15.653c-.347.187-.773.053-.96-.293l-1.36-2.587c-.187-.347-.053-.773.293-.96l.16-.08c.347-.187.773-.053.96.293l1.36 2.587c.187.347.053.773-.293.96l-.16.08zm-1.893-1.013c-.347.187-.773.053-.96-.293l-1.36-2.587c-.187-.347-.053-.773.293-.96l.16-.08c.347-.187.773-.053.96.293l1.36 2.587c.187.347.053.773-.293.96l-.16.08zm-1.893-1.013c-.347.187-.773.053-.96-.293l-1.36-2.587c-.187-.347-.053-.773.293-.96l.16-.08c.347-.187.773-.053.96.293l1.36 2.587c.187.347.053.773-.293.96l-.16.08z" />
                                                                                </svg>
                                                                            </div>
                                                                            <div className="flex-1 min-w-0">
                                                                                <p className="font-medium text-primary hover:underline">{modalArtistSearch || 'Profile Linked'}</p>
                                                                                <p className="text-sm text-muted-foreground truncate" title={selected}>Profile Linked: {selected}</p>
                                                                            </div>
                                                                        </a>
                                                                        <div className="flex items-center gap-1 shrink-0">
                                                                            <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">Selected</span>
                                                                            {!['free', 'solo'].includes(user?.plan || '') && (
                                                                                <button
                                                                                    onClick={() => setModalAppleMusicProfile('')}
                                                                                    className="h-7 px-1.5 text-[10px] text-muted-foreground hover:text-red-500 font-medium"
                                                                                    type="button"
                                                                                >
                                                                                    Change
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )
                                                            }

                                                            const profileUrl = selected.externalUrl || selected.url || selected.channelUrl;
                                                            return (
                                                                <div className="flex items-center gap-3">
                                                                    <a
                                                                        href={profileUrl || undefined}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity"
                                                                        style={{ cursor: profileUrl ? 'pointer' : 'default' }}
                                                                    >
                                                                        {selected.image ? (
                                                                            <img src={selected.image} alt={selected.name} className="h-10 w-10 rounded-full object-cover shrink-0" />
                                                                        ) : (
                                                                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                                                                                <Music className="h-5 w-5 text-muted-foreground" />
                                                                            </div>
                                                                        )}
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className={`font-medium text-primary ${profileUrl ? 'hover:underline' : ''} truncate`}>{selected.name}</p>
                                                                            <p className="text-sm text-muted-foreground truncate">{selected.track || 'Apple Music Artist'}</p>
                                                                        </div>
                                                                    </a>
                                                                    <div className="flex items-center gap-1 shrink-0">
                                                                        <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">Selected</span>
                                                                        {!['free', 'solo'].includes(user?.plan || '') && (
                                                                            <button
                                                                                onClick={() => setModalAppleMusicProfile('')}
                                                                                className="h-7 px-1.5 text-[10px] text-muted-foreground hover:text-red-500 font-medium"
                                                                                type="button"
                                                                            >
                                                                                Change
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )
                                                        })()
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* YouTube Section */}
                                    {(searchResults.youtube.length > 0 || modalYoutubeProfile) && (
                                        <div className="space-y-3 flex flex-col h-full">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <svg className="h-5 w-5 text-[#FF0000] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                                    </svg>
                                                    <span className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">YouTube Music</span>
                                                </div>
                                            </div>

                                            {!modalYoutubeProfile ? (
                                                <>
                                                    {searchResults.youtube.map((profile: any) => (
                                                        <div
                                                            key={profile.id}
                                                            className="flex items-center gap-3 p-3 rounded-md bg-background hover:bg-accent transition-colors cursor-pointer"
                                                            onClick={() => setModalYoutubeProfile(profile.id)}
                                                        >
                                                            <div className="h-4 w-4 rounded-full border border-primary flex items-center justify-center">
                                                                <div className="h-2 w-2 rounded-full hidden" />
                                                            </div>
                                                            {profile.image ? (
                                                                <img src={profile.image} alt={profile.name} className="h-10 w-10 rounded-full object-cover" />
                                                            ) : (
                                                                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                                                    <Music className="h-5 w-5 text-muted-foreground" />
                                                                </div>
                                                            )}
                                                            <div className="flex-1">
                                                                <p className="font-medium text-foreground">{profile.name}</p>
                                                                <p className="text-sm text-muted-foreground">{profile.track || 'YouTube Channel'}</p>
                                                            </div>
                                                        </div>
                                                    ))}

                                                    <div className="space-y-2 mt-4">
                                                        <div
                                                            className="flex items-center gap-3 p-3 rounded-md hover:bg-accent cursor-pointer transition-colors"
                                                            onClick={() => setModalYoutubeProfile('new')}
                                                        >
                                                            <div className="h-10 w-10 rounded-full border border-dashed border-primary flex items-center justify-center bg-primary/5">
                                                                <Plus className="h-5 w-5 text-primary" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="font-medium text-foreground">Create New Channel</p>
                                                                <p className="text-sm text-muted-foreground">Create a new YouTube Music channel for <strong>{modalArtistSearch}</strong></p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="bg-primary/10 border border-primary rounded-md p-3">
                                                    {modalYoutubeProfile === 'new' ? (
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-full border border-dashed border-primary flex items-center justify-center bg-primary/5">
                                                                <Plus className="h-5 w-5 text-primary" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="font-medium text-primary">New YouTube Channel</p>
                                                                <p className="text-sm text-muted-foreground">Creating a new channel for {modalArtistSearch}</p>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">Selected</span>
                                                                {!['free', 'solo'].includes(user?.plan || '') && (
                                                                    <button
                                                                        onClick={() => setModalYoutubeProfile('')}
                                                                        className="h-7 px-1.5 text-[10px] text-muted-foreground hover:text-red-500 font-medium"
                                                                        type="button"
                                                                    >
                                                                        Change
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        (() => {
                                                            let selected: any = null;

                                                            if (typeof modalYoutubeProfile === 'object' && modalYoutubeProfile !== null) {
                                                                selected = modalYoutubeProfile;
                                                            }

                                                            if (!selected && typeof modalYoutubeProfile === 'string' && modalYoutubeProfile.length > 0 && modalYoutubeProfile !== 'new') {
                                                                selected = searchResults.youtube.find(a => a.id === modalYoutubeProfile || a.channelUrl === modalYoutubeProfile || a.url === modalYoutubeProfile);

                                                                if (!selected && modalArtistSearch === mainArtistName && mainArtistProfiles?.youtube) {
                                                                    if (typeof mainArtistProfiles.youtube === 'object' && (mainArtistProfiles.youtube.id === modalYoutubeProfile || mainArtistProfiles.youtube.url === modalYoutubeProfile || mainArtistProfiles.youtube.externalUrl === modalYoutubeProfile || mainArtistProfiles.youtube.channelUrl === modalYoutubeProfile)) {
                                                                        selected = mainArtistProfiles.youtube;
                                                                    }
                                                                }

                                                                if (!selected && usedArtists && usedArtists.length > 0) {
                                                                    const ua = usedArtists.find(a => (typeof a === 'string' ? a : a.name) === modalArtistSearch);
                                                                    if (ua && typeof ua === 'object' && typeof ua.youtubeMusicProfile === 'object' && ua.youtubeMusicProfile !== null) {
                                                                        if (ua.youtubeMusicProfile.id === modalYoutubeProfile || ua.youtubeMusicProfile.url === modalYoutubeProfile || ua.youtubeMusicProfile.channelUrl === modalYoutubeProfile) {
                                                                            selected = ua.youtubeMusicProfile;
                                                                        }
                                                                    }
                                                                }

                                                                if (!selected) {
                                                                    selected = modalYoutubeProfile;
                                                                }
                                                            }

                                                            if (!selected) return null;

                                                            if (typeof selected === 'string') {
                                                                return (
                                                                    <div className="flex items-center gap-3">
                                                                        <a
                                                                            href={selected.startsWith('http') ? selected : undefined}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity"
                                                                            style={{ cursor: selected.startsWith('http') ? 'pointer' : 'default' }}
                                                                        >
                                                                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                                                                                <svg className="h-5 w-5 text-[#FF0000]" viewBox="0 0 24 24" fill="currentColor">
                                                                                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                                                                                </svg>
                                                                            </div>
                                                                            <div className="flex-1 min-w-0">
                                                                                <p className="font-medium text-primary hover:underline">{modalArtistSearch || 'Profile Linked'}</p>
                                                                                <p className="text-sm text-muted-foreground truncate" title={selected}>Profile Linked: {selected}</p>
                                                                            </div>
                                                                        </a>
                                                                        <div className="flex items-center gap-1 shrink-0">
                                                                            <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">Selected</span>
                                                                            {!['free', 'solo'].includes(user?.plan || '') && (
                                                                                <button
                                                                                    onClick={() => setModalYoutubeProfile('')}
                                                                                    className="h-7 px-1.5 text-[10px] text-muted-foreground hover:text-red-500 font-medium"
                                                                                    type="button"
                                                                                >
                                                                                    Change
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )
                                                            }

                                                            const profileUrl = selected.externalUrl || selected.url || selected.channelUrl;
                                                            return (
                                                                <div className="flex items-center gap-3">
                                                                    <a
                                                                        href={profileUrl || undefined}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity"
                                                                        style={{ cursor: profileUrl ? 'pointer' : 'default' }}
                                                                    >
                                                                        {selected.image ? (
                                                                            <img src={selected.image} alt={selected.name} className="h-10 w-10 rounded-full object-cover shrink-0" />
                                                                        ) : (
                                                                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                                                                                <Music className="h-5 w-5 text-muted-foreground" />
                                                                            </div>
                                                                        )}
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className={`font-medium text-primary ${profileUrl ? 'hover:underline' : ''} truncate`}>{selected.name}</p>
                                                                            <p className="text-sm text-muted-foreground truncate">{selected.track || 'YouTube Channel'}</p>
                                                                        </div>
                                                                    </a>
                                                                    <div className="flex items-center gap-1 shrink-0">
                                                                        <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">Selected</span>
                                                                        {!['free', 'solo'].includes(user?.plan || '') && (
                                                                            <button
                                                                                onClick={() => setModalYoutubeProfile('')}
                                                                                className="h-7 px-1.5 text-[10px] text-muted-foreground hover:text-red-500 font-medium"
                                                                                type="button"
                                                                            >
                                                                                Change
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )
                                                        })()
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        {/* Social Profiles Grid - Styled like BasicInfoStep */}
                        <div className="pt-4 border-t border-border/50">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Instagram */}
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium flex items-center gap-2">
                                        <span className="text-[#E4405F] font-bold">Instagram</span>
                                        <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
                                    </Label>
                                    <Input
                                        placeholder="https://instagram.com/..."
                                        value={instagramUrl}
                                        onChange={(e) => setInstagramUrl(e.target.value)}
                                        className="text-sm"
                                    />
                                </div>

                                {/* Facebook */}
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium flex items-center gap-2">
                                        <span className="text-[#1877F2] font-bold">Facebook</span>
                                        <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
                                    </Label>
                                    <Input
                                        placeholder="https://facebook.com/..."
                                        value={facebookUrl}
                                        onChange={(e) => setFacebookUrl(e.target.value)}
                                        className="text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Instrumental — first so genre & language follow this choice */}
                    <div className="space-y-3 pt-4 border-t border-border">
                        <Label className="text-lg font-semibold">Is Instrumental?</Label>
                        <p className="text-sm text-muted-foreground">
                            Choose first — genre and language options below will update based on your answer.
                        </p>

                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    id="track-instrumental-no"
                                    name="track-instrumental"
                                    value="no"
                                    checked={instrumental === 'no'}
                                    onChange={() => handleInstrumentalChange('no')}
                                    className="h-4 w-4"
                                />
                                <Label htmlFor="track-instrumental-no" className="font-normal cursor-pointer">
                                    This song contains lyrics
                                </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    id="track-instrumental-yes"
                                    name="track-instrumental"
                                    value="yes"
                                    checked={instrumental === 'yes'}
                                    onChange={() => handleInstrumentalChange('yes')}
                                    className="h-4 w-4"
                                />
                                <Label htmlFor="track-instrumental-yes" className="font-normal cursor-pointer">
                                    This song is instrumental and contains no lyrics
                                </Label>
                            </div>
                        </div>
                    </div>

                    {/* ISRC */}
                    <div className="space-y-4 pt-6 border-t border-border">
                        <div className="flex flex-col space-y-2">
                            <Label className="text-lg font-semibold">ISRC</Label>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="hasIsrc"
                                    checked={showIsrc}
                                    onChange={(e) => {
                                        const checked = e.target.checked
                                        setShowIsrc(checked)
                                        if (checked) {
                                            if (!isrc) {
                                                setIsrc(process.env.NEXT_PUBLIC_DEFAULT_ISRC || '')
                                            }
                                        } else {
                                            setIsrc('')
                                            setIsrcError('')
                                        }
                                    }}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <Label htmlFor="hasIsrc" className="font-normal cursor-pointer">
                                    I already have an ISRC code
                                </Label>
                            </div>
                        </div>

                        {showIsrc && (
                            <div className="space-y-2">
                                <Label htmlFor="track-isrc">ISRC Code</Label>
                                <Input
                                    id="track-isrc"
                                    placeholder="XX-XXX-XX-XXXXX"
                                    readOnly={user?.plan === 'free'}
                                    value={isrc}
                                    onChange={(e) => {
                                        handleISRCChange(e.target.value)
                                        if (user?.plan === 'free') {
                                            toast.error("Upgrade to paid plan to use custom ISRC", { id: "isrc-warning" })
                                        }
                                    }}
                                    className={isrcError ? 'border-red-500' : ''}
                                />
                                {user?.plan === 'free' && (
                                    <p className="text-xs text-amber-600 mt-1">
                                        Upgrade to a paid plan to use a custom ISRC code.
                                    </p>
                                )}
                                {isrcError && (
                                    <p className="text-xs text-red-500 mt-1">{isrcError}</p>
                                )}
                            </div>
                        )}
                    </div>

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
                                            errors[idx] = validateName(e.target.value)
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
                            <p className="text-xs text-muted-foreground mt-1">Real names, not stage names. {LEGAL_PERSON_NAME_HINT}</p>
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
                                        errors[idx] = validateName(e.target.value)
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
                            <WaveformTrimmer
                                audioFile={linkedAudioFile?.playbackUrl ?? linkedAudioFile?.file ?? null}
                                trackDurationSec={trackDurationSec}
                                initialStartTime={previewClipStartTime}
                                onTimeChange={(time) => setPreviewClipStartTime(time)}
                            />
                        </div>
                    </div>



                    <div className="flex justify-end gap-2 pt-4 border-t mt-6 sticky bottom-0 bg-[#1a1c23]">
                        <Button variant="outline" onClick={onClose} type="button">
                            Cancel
                        </Button>
                        <Button onClick={handleSave} type="button">
                            Save Changes
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

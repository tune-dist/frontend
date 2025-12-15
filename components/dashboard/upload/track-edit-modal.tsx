'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Track, Songwriter } from './types'
import { useState, useRef, useEffect } from 'react'
import { Music, X, Loader2 } from 'lucide-react'
import { getGenres, getSubGenresByGenreId, type Genre, type SubGenre } from '@/lib/api/genres'
import { useAuth } from '@/contexts/AuthContext'
import { getPlanLimits } from '@/lib/api/plans'
import { toast } from 'react-hot-toast'

interface TrackEditModalProps {
    isOpen: boolean
    onClose: () => void
    track: Track | null
    trackIndex: number | null
    onSave: (updatedTrack: Track, songwriters: Songwriter[], composers: Songwriter[]) => void
    usedArtists?: string[]
    allTracks?: Track[]
    mainArtistName?: string
    featuringArtists?: Array<{ name: string }>
}

export default function TrackEditModal({ isOpen, onClose, track, trackIndex, onSave, usedArtists = [], allTracks = [], mainArtistName = '', featuringArtists = [] }: TrackEditModalProps) {
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

    // Local state for track metadata fields
    const [trackTitle, setTrackTitle] = useState(track?.title || '')
    const [language, setLanguage] = useState(track?.language || '')
    const [isrc, setIsrc] = useState(track?.isrc || '')
    const [isrcError, setIsrcError] = useState('')
    const [showIsrc, setShowIsrc] = useState(!!track?.isrc)
    const [previouslyReleased, setPreviouslyReleased] = useState(track?.previouslyReleased || 'no')
    const [primaryGenre, setPrimaryGenre] = useState(track?.primaryGenre || '')
    const [secondaryGenre, setSecondaryGenre] = useState(track?.secondaryGenre || '')
    const [previewClipStartTime, setPreviewClipStartTime] = useState(track?.previewClipStartTime || '')

    // Local state for modal editing
    const [modalArtistSearch, setModalArtistSearch] = useState(track?.artistName || '')
    const [isSearching, setIsSearching] = useState(false)
    const [hasSearched, setHasSearched] = useState(false)
    const [searchResults, setSearchResults] = useState<{ spotify: any[]; apple: any[]; youtube: any[] }>({ spotify: [], apple: [], youtube: [] })
    const searchTimeout = useRef<NodeJS.Timeout>()

    const [modalSongwriters, setModalSongwriters] = useState<Songwriter[]>(
        track?.songwriters || [{ role: 'Music and lyrics', firstName: '', middleName: '', lastName: '' }]
    )
    const [songwriterErrors, setSongwriterErrors] = useState<string[]>([])
    const [modalComposers, setModalComposers] = useState<Songwriter[]>(
        track?.composers || [{ role: 'Composer', firstName: '', middleName: '', lastName: '' }]
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

    // Fetch sub-genres when primary genre changes
    useEffect(() => {
        const fetchSubGenres = async () => {
            if (!primaryGenre) {
                setSubGenres([])
                return
            }

            // Find the genre _id from the selected slug
            const selectedGenre = genres.find((g) => g.slug === primaryGenre)
            if (!selectedGenre) {
                setSubGenres([])
                return
            }

            setSubGenresLoading(true)
            try {
                const fetchedSubGenres = await getSubGenresByGenreId(selectedGenre._id)
                setSubGenres(fetchedSubGenres)
                // Clear secondary genre if it's not in the new sub-genres list
                if (
                    secondaryGenre &&
                    !fetchedSubGenres.some((sg) => sg.slug === secondaryGenre)
                ) {
                    setSecondaryGenre('')
                }
            } catch (error) {
                console.error('Failed to fetch sub-genres:', error)
                setSubGenres([])
            } finally {
                setSubGenresLoading(false)
            }
        }
        fetchSubGenres()
    }, [primaryGenre, genres, secondaryGenre])

    // Update state when track changes (switching between different tracks)
    useEffect(() => {
        if (track) {
            setTrackTitle(track.title || '')
            setLanguage(track.language || '')
            setIsrc(track.isrc || '')
            setShowIsrc(!!track.isrc)
            setPreviouslyReleased(track.previouslyReleased || 'no')
            setPrimaryGenre(track.primaryGenre || '')
            setSecondaryGenre(track.secondaryGenre || '')
            setPreviewClipStartTime(track.previewClipStartTime || '')
            setModalArtistSearch(track.artistName || '')
            setModalSongwriters(track.songwriters || [{ role: 'Music and lyrics', firstName: '', middleName: '', lastName: '' }])
            setSongwriterErrors([])
            setModalComposers(track.composers || [{ role: 'Composer', firstName: '', middleName: '', lastName: '' }])
            setComposerErrors([])
            setModalSpotifyProfile(track.spotifyProfile || '')
            setModalAppleMusicProfile(track.appleMusicProfile || '')
            setModalYoutubeProfile(track.youtubeMusicProfile || '')
            setInstagramStatus(track.instagramProfile ? 'yes' : 'no')
            setFacebookStatus(track.facebookProfile ? 'yes' : 'no')
            setInstagramUrl(track.instagramProfile || '')
            setFacebookUrl(track.facebookProfile || '')

            setSearchResults({ spotify: [], apple: [], youtube: [] })
            setHasSearched(false)
        } else if (isOpen && user?.fullName && planLimits.artistLimit === 1) {
            // New track or empty artist - prefill with user name ONLY if artistLimit is 1
            const name = user.fullName
            setModalArtistSearch(name)
            // Trigger search
            handleModalArtistSearch(name)
        }
    }, [track, trackIndex, isOpen, user, planLimits.artistLimit])


    const handleModalArtistSearch = async (name: string) => {
        setModalArtistSearch(name)

        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current)
        }

        if (name.length > 2) {
            setIsSearching(true)
            searchTimeout.current = setTimeout(async () => {
                try {
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
                    const [spotifyResponse, appleResponse, youtubeResponse] = await Promise.all([
                        fetch(`${apiUrl}/integrations/spotify/search?q=${encodeURIComponent(name)}&limit=5`).catch(() => null),
                        fetch(`${apiUrl}/integrations/apple/search?q=${encodeURIComponent(name)}&limit=5`).catch(() => null),
                        fetch(`${apiUrl}/integrations/youtube/search?q=${encodeURIComponent(name)}&limit=5`).catch(() => null)
                    ])

                    const spotifyArtists = spotifyResponse?.ok ? await spotifyResponse.json() : []
                    const appleArtists = appleResponse?.ok ? await appleResponse.json() : []
                    const youtubeChannels = youtubeResponse?.ok ? await youtubeResponse.json() : []

                    setSearchResults({
                        spotify: spotifyArtists,
                        apple: appleArtists,
                        youtube: youtubeChannels
                    })
                } catch (error) {
                    console.error('Search error:', error)
                    setSearchResults({ spotify: [], apple: [], youtube: [] })
                } finally {
                    setIsSearching(false)
                    setHasSearched(true)
                }
            }, 500)
        } else {
            setSearchResults({ spotify: [], apple: [], youtube: [] })
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
        if (!name.trim()) {
            return ''
        }
        // Strict validation: First Name (3+ letters) + Space + Last Name (3+ letters)
        const nameRegex = /^[a-zA-Z]{3,} [a-zA-Z]{3,}$/
        if (!nameRegex.test(name.trim())) {
            return 'Must be "Firstname Lastname" (letters only, min 3 chars each)'
        }
        return ''
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

            // Check for ISRC validation error
            if (isrcError) {
                toast.error("Please fix ISRC error before saving")
                return
            }

            // Strict Songwriter/Composer Validation Regex
            // First Name (3+ letters) + Space + Last Name (3+ letters)
            const nameRegex = /^[a-zA-Z]{3,} [a-zA-Z]{3,}$/

            // Validate Songwriters (at least one required)
            if (modalSongwriters.length === 0) {
                toast.error("At least one songwriter is required")
                return
            }

            for (const sw of modalSongwriters) {
                if (!sw.firstName?.trim()) {
                    toast.error("Songwriter name cannot be empty")
                    return
                }
                if (!nameRegex.test(sw.firstName.trim())) {
                    toast.error(`Invalid Songwriter name: "${sw.firstName}". Must be "Firstname Lastname" (letters only, min 3 chars each).`)
                    return
                }
            }

            // Validate Composers (if provided, must be valid)
            for (const comp of modalComposers) {
                if (comp.firstName?.trim() && !nameRegex.test(comp.firstName.trim())) {
                    toast.error(`Invalid Composer name: "${comp.firstName}". Must be "Firstname Lastname" (letters only, min 3 chars each).`)
                    return
                }
            }

            // Validate Artist Limit
            if (planLimits.artistLimit < Infinity) {
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
                for (const artist of Array.from(uniqueArtistsInRelease)) {
                    if (!usedArtists.includes(artist)) {
                        newArtistsCount++;
                    }
                }

                // Check if total would exceed limit
                const totalUsedCount = usedArtists.length;
                if ((totalUsedCount + newArtistsCount) > planLimits.artistLimit) {
                    const planKey = (user?.plan as string) || 'free';
                    const planName = planKey === 'creator_plus' ? 'Creator+' : planKey.charAt(0).toUpperCase() + planKey.slice(1);
                    toast.error(`You have reached your artist limit (${planLimits.artistLimit}) for the ${planName} plan.`);
                    return;
                }
            }

            const updatedTrack: Track = {
                ...track,
                title: trackTitle,
                artistName: modalArtistSearch,
                language,
                isrc,
                previouslyReleased,
                primaryGenre,
                secondaryGenre,
                previewClipStartTime,
                spotifyProfile: modalSpotifyProfile,
                appleMusicProfile: modalAppleMusicProfile,
                youtubeMusicProfile: modalYoutubeProfile,
                instagramProfile: instagramStatus === 'yes' ? instagramUrl : '',
                facebookProfile: facebookStatus === 'yes' ? facebookUrl : ''
            }
            onSave(updatedTrack, modalSongwriters, modalComposers)
            onClose()
        }
    }

    if (!isOpen || !track || trackIndex === null) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-background rounded-lg max-w-2xl w-full my-8 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Edit Track Metadata</h3>
                    <Button variant="ghost" size="sm" onClick={onClose} type="button">
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
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

                    {/* Artist Name with Rich Search UI */}
                    <div className="space-y-2">
                        <Label htmlFor="track-artist">Artist Name</Label>
                        <div className="relative">
                            <Input
                                id="track-artist"
                                placeholder="Search for artist..."
                                value={modalArtistSearch}
                                onChange={(e) => handleModalArtistSearch(e.target.value)}
                                className={isSearching ? 'pr-10' : ''}
                            />
                            {isSearching && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                </div>
                            )}
                        </div>

                        {/* Artist Not Found Message */}
                        {hasSearched && !isSearching &&
                            searchResults.spotify.length === 0 &&
                            searchResults.apple.length === 0 &&
                            searchResults.youtube.length === 0 &&
                            modalArtistSearch.length > 2 && (
                                <div className="mt-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
                                    <p className="text-sm text-yellow-600 dark:text-yellow-400">
                                        Artist not found. Please upload music via a distributor to create a Spotify profile
                                    </p>
                                </div>
                            )}

                        {/* Rich Search Results */}
                        {modalArtistSearch && modalArtistSearch.length > 2 && !isSearching && (searchResults.spotify.length > 0 || searchResults.apple.length > 0 || searchResults.youtube.length > 0) && (
                            <div className="mt-4 space-y-6 border border-border rounded-lg p-4 bg-card/50">
                                <h4 className="font-semibold text-sm text-foreground">
                                    We found this artist on other platforms. Is this you?
                                </h4>

                                {/* Spotify Results */}
                                {searchResults.spotify.length > 0 && (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <svg className="h-5 w-5 text-[#1DB954]" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                                                </svg>
                                                <span className="text-sm font-medium">Spotify</span>
                                            </div>
                                            {modalSpotifyProfile && (
                                                <button
                                                    onClick={() => setModalSpotifyProfile('')}
                                                    className="text-xs text-primary hover:underline hover:text-primary/80"
                                                    type="button"
                                                >
                                                    Change Selection
                                                </button>
                                            )}
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
                                                        className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent cursor-pointer"
                                                        onClick={() => setModalSpotifyProfile('new')}
                                                    >
                                                        <div className="h-4 w-4 rounded-full border border-primary flex items-center justify-center">
                                                            {modalSpotifyProfile === 'new' && <div className="h-2 w-2 rounded-full bg-primary" />}
                                                        </div>
                                                        <Label className="font-normal cursor-pointer">
                                                            This will be my first <strong>{modalArtistSearch}</strong> release on Spotify.
                                                        </Label>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="bg-primary/10 border border-primary rounded-md p-3">
                                                {modalSpotifyProfile === 'new' ? (
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                                                            <Music className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-primary">New Artist Profile</p>
                                                            <p className="text-sm text-muted-foreground">Creating a new profile for {modalArtistSearch}</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    (() => {
                                                        const selected = searchResults.spotify.find(a => a.id === modalSpotifyProfile)
                                                        if (!selected) return null;
                                                        return (
                                                            <div className="flex items-center gap-3">
                                                                {selected.image ? (
                                                                    <img src={selected.image} alt={selected.name} className="h-10 w-10 rounded-full object-cover" />
                                                                ) : (
                                                                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                                                        <Music className="h-5 w-5 text-muted-foreground" />
                                                                    </div>
                                                                )}
                                                                <div className="flex-1">
                                                                    <p className="font-medium text-primary">{selected.name}</p>
                                                                    <p className="text-sm text-muted-foreground">{(selected.followers || 0).toLocaleString()} followers</p>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">Selected</span>
                                                                </div>
                                                            </div>
                                                        )
                                                    })()
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Apple Music Results */}
                                {searchResults.apple.length > 0 && (
                                    <div className="space-y-3 pt-4 border-t border-border">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <svg className="h-5 w-5 text-[#FA243C]" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm3.227 15.653c-.347.187-.773.053-.96-.293l-1.36-2.587c-.187-.347-.053-.773.293-.96l.16-.08c.347-.187.773-.053.96.293l1.36 2.587c.187.347.053.773-.293.96l-.16.08zm-1.893-1.013c-.347.187-.773.053-.96-.293l-1.36-2.587c-.187-.347-.053-.773.293-.96l.16-.08c.347-.187.773-.053.96.293l1.36 2.587c.187.347.053.773-.293.96l-.16.08zm-1.893-1.013c-.347.187-.773.053-.96-.293l-1.36-2.587c-.187-.347-.053-.773.293-.96l.16-.08c.347-.187.773-.053.96.293l1.36 2.587c.187.347.053.773-.293.96l-.16.08z" />
                                                </svg>
                                                <span className="text-sm font-medium">Apple Music</span>
                                            </div>
                                            {modalAppleMusicProfile && (
                                                <button
                                                    onClick={() => setModalAppleMusicProfile('')}
                                                    className="text-xs text-primary hover:underline hover:text-primary/80"
                                                    type="button"
                                                >
                                                    Change Selection
                                                </button>
                                            )}
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
                                                        className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent cursor-pointer"
                                                        onClick={() => setModalAppleMusicProfile('new')}
                                                    >
                                                        <div className="h-4 w-4 rounded-full border border-primary flex items-center justify-center">
                                                            {modalAppleMusicProfile === 'new' && <div className="h-2 w-2 rounded-full bg-primary" />}
                                                        </div>
                                                        <Label className="font-normal cursor-pointer">
                                                            This will be my first <strong>{modalArtistSearch}</strong> release on Apple Music.
                                                        </Label>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="bg-primary/10 border border-primary rounded-md p-3">
                                                {modalAppleMusicProfile === 'new' ? (
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                                                            <Music className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-primary">New Artist Profile</p>
                                                            <p className="text-sm text-muted-foreground">Creating a new profile for {modalArtistSearch}</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    (() => {
                                                        const selected = searchResults.apple.find(a => a.id === modalAppleMusicProfile)
                                                        if (!selected) return null;
                                                        return (
                                                            <div className="flex items-center gap-3">
                                                                {selected.image ? (
                                                                    <img src={selected.image} alt={selected.name} className="h-10 w-10 rounded-full object-cover" />
                                                                ) : (
                                                                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                                                        <Music className="h-5 w-5 text-muted-foreground" />
                                                                    </div>
                                                                )}
                                                                <div className="flex-1">
                                                                    <p className="font-medium text-primary">{selected.name}</p>
                                                                    <p className="text-sm text-muted-foreground">{selected.track || 'Apple Music Artist'}</p>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">Selected</span>
                                                                </div>
                                                            </div>
                                                        )
                                                    })()
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* YouTube Results */}
                                {searchResults.youtube.length > 0 && (
                                    <div className="space-y-3 pt-4 border-t border-border">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <svg className="h-5 w-5 text-[#FF0000]" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                                </svg>
                                                <span className="text-sm font-medium">YouTube Music</span>
                                            </div>
                                            {modalYoutubeProfile && (
                                                <button
                                                    onClick={() => setModalYoutubeProfile('')}
                                                    className="text-xs text-primary hover:underline hover:text-primary/80"
                                                    type="button"
                                                >
                                                    Change Selection
                                                </button>
                                            )}
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
                                                        className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent cursor-pointer"
                                                        onClick={() => setModalYoutubeProfile('new')}
                                                    >
                                                        <div className="h-4 w-4 rounded-full border border-primary flex items-center justify-center">
                                                            {modalYoutubeProfile === 'new' && <div className="h-2 w-2 rounded-full bg-primary" />}
                                                        </div>
                                                        <Label className="font-normal cursor-pointer">
                                                            This will be my first <strong>{modalArtistSearch}</strong> release on YouTube Music.
                                                        </Label>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="bg-primary/10 border border-primary rounded-md p-3">
                                                {modalYoutubeProfile === 'new' ? (
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                                                            <Music className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-primary">New Channel</p>
                                                            <p className="text-sm text-muted-foreground">Creating a new channel for {modalArtistSearch}</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    (() => {
                                                        const selected = searchResults.youtube.find(p => p.id === modalYoutubeProfile)
                                                        if (!selected) return null;
                                                        return (
                                                            <div className="flex items-center gap-3">
                                                                {selected.image ? (
                                                                    <img src={selected.image} alt={selected.name} className="h-10 w-10 rounded-full object-cover" />
                                                                ) : (
                                                                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                                                        <Music className="h-5 w-5 text-muted-foreground" />
                                                                    </div>
                                                                )}
                                                                <div className="flex-1">
                                                                    <p className="font-medium text-primary">{selected.name}</p>
                                                                    <p className="text-sm text-muted-foreground">{selected.track || 'YouTube Channel'}</p>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">Selected</span>
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
                        )}
                    </div>
                    {/* Instagram */}
                    <div className="space-y-3 pt-4 border-t">
                        <div className="flex items-center gap-2">
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="url(#instagram-gradient)">
                                <defs>
                                    <linearGradient id="instagram-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" style={{ stopColor: '#833AB4' }} />
                                        <stop offset="50%" style={{ stopColor: '#E1306C' }} />
                                        <stop offset="100%" style={{ stopColor: '#FD1D1D' }} />
                                    </linearGradient>
                                </defs>
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                            </svg>
                            <Label className="text-lg font-semibold">Instagram</Label>
                        </div>
                        <p className="text-sm font-medium">Artist already on Instagram?</p>
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    id="instagram-yes"
                                    name="instagram-status"
                                    value="yes"
                                    checked={instagramStatus === 'yes'}
                                    onChange={() => setInstagramStatus('yes')}
                                    className="h-4 w-4"
                                />
                                <Label htmlFor="instagram-yes" className="font-normal cursor-pointer">
                                    Yes - Group with other <strong>{modalArtistSearch || 'artist'}</strong> releases
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    id="instagram-no"
                                    name="instagram-status"
                                    value="no"
                                    checked={instagramStatus === 'no'}
                                    onChange={() => setInstagramStatus('no')}
                                    className="h-4 w-4"
                                />
                                <Label htmlFor="instagram-no" className="font-normal cursor-pointer">
                                    No - <strong>{modalArtistSearch || 'artist'}</strong> is not on Instagram
                                </Label>
                            </div>
                        </div>
                        {instagramStatus === 'yes' && (
                            <div className="mt-3">
                                <Input
                                    placeholder="https://instagram.com/..."
                                    value={instagramUrl}
                                    onChange={(e) => setInstagramUrl(e.target.value)}
                                    className="border-primary/50"
                                />
                            </div>
                        )}
                    </div>

                    {/* Facebook */}
                    <div className="space-y-3 pt-4 border-t">
                        <div className="flex items-center gap-2">
                            <svg className="h-5 w-5 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                            <Label className="text-lg font-semibold">Facebook</Label>
                        </div>
                        <p className="text-sm font-medium">Artist already on Facebook?</p>
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    id="facebook-yes"
                                    name="facebook-status"
                                    value="yes"
                                    checked={facebookStatus === 'yes'}
                                    onChange={() => setFacebookStatus('yes')}
                                    className="h-4 w-4"
                                />
                                <Label htmlFor="facebook-yes" className="font-normal cursor-pointer">
                                    Yes - Group with other <strong>{modalArtistSearch || 'artist'}</strong> releases
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    id="facebook-no"
                                    name="facebook-status"
                                    value="no"
                                    checked={facebookStatus === 'no'}
                                    onChange={() => setFacebookStatus('no')}
                                    className="h-4 w-4"
                                />
                                <Label htmlFor="facebook-no" className="font-normal cursor-pointer">
                                    No - <strong>{modalArtistSearch || 'artist'}</strong> is not on Facebook
                                </Label>
                            </div>
                        </div>
                        {facebookStatus === 'yes' && (
                            <div className="mt-3">
                                <Input
                                    placeholder="https://facebook.com/..."
                                    value={facebookUrl}
                                    onChange={(e) => setFacebookUrl(e.target.value)}
                                    className="border-primary/50"
                                />
                            </div>
                        )}
                    </div>
                    {/* Language */}
                    <div className="space-y-2">
                        <Label htmlFor="track-language">Language</Label>
                        <select
                            id="track-language"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                        >
                            <option value="">Select a language</option>
                            <option value="english">English</option>
                            <option value="spanish">Spanish</option>
                            <option value="french">French</option>
                            <option value="german">German</option>
                            <option value="italian">Italian</option>
                            <option value="portuguese">Portuguese</option>
                            <option value="japanese">Japanese</option>
                            <option value="korean">Korean</option>
                            <option value="chinese">Chinese (Mandarin)</option>
                            <option value="hindi">Hindi</option>
                            <option value="arabic">Arabic</option>
                            <option value="russian">Russian</option>
                            <option value="turkish">Turkish</option>
                            <option value="dutch">Dutch</option>
                            <option value="swedish">Swedish</option>
                            <option value="polish">Polish</option>
                            <option value="urdu">Urdu</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    {/* ISRC */}
                    <div className="space-y-4 pt-4 border-t border-border">
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
                                            // Pre-fill with default from env if empty
                                            if (!isrc) {
                                                setIsrc(process.env.NEXT_PUBLIC_DEFAULT_ISRC || "QZ-K6P-25-00001")
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
                                        if (user?.plan === 'free' && e.target.value !== (process.env.NEXT_PUBLIC_DEFAULT_ISRC || "QZ-K6P-25-00001")) {
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

                    {/* Previously Released */}
                    <div className="space-y-3">
                        <Label className="text-lg font-semibold">Has this track been previously released?</Label>
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    id="track-prev-no"
                                    name="track-previously-released"
                                    value="no"
                                    checked={previouslyReleased === 'no'}
                                    onChange={() => setPreviouslyReleased('no')}
                                />
                                <Label htmlFor="track-prev-no">No</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    id="track-prev-yes"
                                    name="track-previously-released"
                                    value="yes"
                                    checked={previouslyReleased === 'yes'}
                                    onChange={() => setPreviouslyReleased('yes')}
                                />
                                <Label htmlFor="track-prev-yes">Yes</Label>
                            </div>
                        </div>
                    </div>

                    {/* Primary Genre */}
                    <div className="space-y-2">
                        <Label htmlFor="track-genre">Primary Genre <span className="text-red-500">*</span></Label>
                        <select
                            id="track-genre"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={primaryGenre}
                            onChange={(e) => setPrimaryGenre(e.target.value)}
                        >
                            <option value="">Select a genre</option>
                            {genresLoading ? (
                                <option disabled>Loading genres...</option>
                            ) : (
                                genres.map((genre) => (
                                    <option key={genre._id} value={genre.slug}>
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
                            disabled={!primaryGenre || subGenresLoading}
                        >
                            <option value="">
                                {!primaryGenre
                                    ? "Select a genre first"
                                    : subGenresLoading
                                        ? "Loading sub-genres..."
                                        : "Select a sub-genre"}
                            </option>
                            {subGenres.map((subGenre) => (
                                <option key={subGenre._id} value={subGenre.slug}>
                                    {subGenre.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Songwriters */}
                    <div className="space-y-3 pt-4 border-t">
                        <div>
                            <Label className="text-lg font-semibold">Songwriter/Author <span className="text-red-500">*</span></Label>
                            <p className="text-xs text-muted-foreground mt-1">Real names, not stage names</p>
                        </div>
                        {modalSongwriters.map((songwriter, idx) => (
                            <div key={idx} className="space-y-2 p-3 rounded-lg border border-border bg-accent/5">
                                <Input
                                    placeholder="Enter First name and last name *"
                                    value={songwriter.firstName}
                                    onChange={(e) => {
                                        const updated = [...modalSongwriters]
                                        updated[idx].firstName = e.target.value
                                        setModalSongwriters(updated)
                                        // Validate immediately
                                        const errors = [...songwriterErrors]
                                        errors[idx] = validateName(e.target.value)
                                        setSongwriterErrors(errors)
                                    }}
                                    className={songwriterErrors[idx] ? 'border-red-500' : ''}
                                />
                                {songwriterErrors[idx] && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {songwriterErrors[idx]}
                                    </p>
                                )}
                                {modalSongwriters.length > 1 && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setModalSongwriters(modalSongwriters.filter((_, i) => i !== idx))
                                            setSongwriterErrors(songwriterErrors.filter((_, i) => i !== idx))
                                        }}
                                        className="text-destructive hover:text-destructive"
                                        type="button"
                                    >
                                        Remove songwriter
                                    </Button>
                                )}
                            </div>
                        ))}
                        <Button
                            variant="outline"
                            onClick={() => {
                                setModalSongwriters([...modalSongwriters, { role: 'Music and lyrics', firstName: '', middleName: '', lastName: '' }])
                                setSongwriterErrors([...songwriterErrors, ''])
                            }}
                            className="text-primary hover:text-primary"
                            type="button"
                        >
                            + Add another songwriter
                        </Button>
                    </div>

                    {/* Composers */}
                    <div className="space-y-3 pt-4 border-t">
                        <div>
                            <Label className="text-lg font-semibold">Composer</Label>
                            <p className="text-xs text-muted-foreground mt-1">Real names, not stage names</p>
                        </div>
                        {modalComposers.map((composer, idx) => (
                            <div key={idx} className="space-y-2 p-3 rounded-lg border border-border bg-accent/5">
                                <Input
                                    placeholder="Enter First name and last name"
                                    value={composer.firstName}
                                    onChange={(e) => {
                                        const updated = [...modalComposers]
                                        updated[idx].firstName = e.target.value
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
                                setModalComposers([...modalComposers, { role: 'Composer', firstName: '', middleName: '', lastName: '' }])
                                setComposerErrors([...composerErrors, ''])
                            }}
                            className="text-primary hover:text-primary"
                            type="button"
                        >
                            + Add Composer
                        </Button>
                    </div>

                    {/* Preview Clip Start Time */}
                    <div className="space-y-3 pt-6 border-t border-border">
                        <Label className="text-lg font-semibold">
                            Preview clip start time{" "}
                            <span className="text-muted-foreground font-normal">
                                (TikTok, Apple Music, iTunes)
                            </span>
                        </Label>

                        <div className="grid grid-cols-1 gap-1">
                            <Input
                                placeholder="HH:MM:SS"
                                type="text"
                                value={previewClipStartTime}
                                onChange={(e) => {
                                    let v = e.target.value.replace(/\D/g, "") // only digits

                                    // limit to HHMMSS (6 digits)
                                    if (v.length > 6) v = v.slice(0, 6)

                                    let hh = v.substring(0, 2)
                                    let mm = v.substring(2, 4)
                                    let ss = v.substring(4, 6)

                                    let formatted = ""
                                    if (hh) formatted = hh
                                    if (mm) formatted += ":" + mm
                                    if (ss) formatted += ":" + ss

                                    setPreviewClipStartTime(formatted)
                                }}
                                className="text-sm"
                            />
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
        </div>
    )
}

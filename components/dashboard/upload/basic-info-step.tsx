'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Music, ExternalLink, Info, Plus, X, AlertCircle, Lock, UserCheck, Link as LinkIcon } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/contexts/AuthContext'
import { UploadFormData, SecondaryArtist } from './types'
import { useFormContext } from 'react-hook-form'
import { getPlanLimits, getPlanFieldRules } from '@/lib/api/plans'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

interface BasicInfoStepProps {
    // Keeping these optional for compatibility, but we primarily use context
    formData?: UploadFormData
    setFormData?: (data: UploadFormData) => void
    usedArtists?: any[] // Changed from string[] to any[] for object support
}


export default function BasicInfoStep({ formData: propFormData, setFormData: propSetFormData, usedArtists = [] }: BasicInfoStepProps) {
    const { user } = useAuth()
    const { register, formState: { errors }, watch, setValue } = useFormContext<UploadFormData>()

    // Watch values for conditional rendering
    const artistName = watch('artistName')
    const artists = watch('artists') || []
    const title = watch('title')
    const spotifyProfile = watch('spotifyProfile')
    const appleMusicProfile = watch('appleMusicProfile')
    const youtubeMusicProfile = watch('youtubeMusicProfile')
    const instagramProfile = watch('instagramProfile')
    const facebookProfile = watch('facebookProfile')

    // Plan limits state
    const [planLimits, setPlanLimits] = useState<{ artistLimit: number; allowConcurrent: boolean; allowedFormats: string[] } | null>(null)
    const [fieldRules, setFieldRules] = useState<Record<string, any>>({})
    const planKey = user?.plan || 'free'
    const allowedFormats = planLimits?.allowedFormats || ['single']

    // Fetch plan limits on mount and when plan changes
    useEffect(() => {
        const fetchPlanData = async () => {
            try {
                const [limits, rules] = await Promise.all([
                    getPlanLimits(planKey, true), // Force refresh
                    getPlanFieldRules(planKey, true) // Force refresh to get latest from DB
                ])
                setPlanLimits(limits)
                setFieldRules(rules)
                console.log('Loaded fieldRules:', rules) // Debug log
            } catch (error) {
                console.error('Failed to fetch plan data:', error)
                // Fallback to default (free plan)
                setPlanLimits({ artistLimit: 1, allowConcurrent: false, allowedFormats: ['single'] })
                setFieldRules({})
            }
        }
        fetchPlanData()
    }, [planKey])

    // Check if user can add more artists based on plan
    const canAddMoreArtists = planLimits ? artists.length < (planLimits.artistLimit - 1) : false // -1 because main artist is separate field

    // Check if featured artists are allowed by plan fieldRules
    const areFeaturedArtistsAllowed = fieldRules.featuredArtists?.allow !== false
    const isExplicitAllowed = fieldRules.isExplicit?.allow !== false

    // Check if main artist name should be locked (Limit reached)
    const isArtistLocked = !!planLimits && usedArtists.length >= planLimits.artistLimit;

    // Check if current artist is from the roster
    const isArtistFromRoster = usedArtists.some(a => (typeof a === 'string' ? a : a.name) === artistName);

    // Update featuringArtist validation when fieldRules change
    useEffect(() => {
        if (Object.keys(fieldRules).length > 0) {
            console.log('Registering featuringArtist with validation:', {
                required: fieldRules.featuredArtists?.required,
                message: fieldRules.featuredArtists?.required ? 'Featuring artist is required' : 'Not required'
            });
            // Re-register the field with updated validation
            register('featuringArtist', {
                required: fieldRules.featuredArtists?.required ? 'Featuring artist is required' : false
            });
        }
    }, [fieldRules, register]);



    // Search State
    const [isSearching, setIsSearching] = useState(false)
    const [hasSearched, setHasSearched] = useState(false)
    const [activeSearchIndex, setActiveSearchIndex] = useState<number | 'main' | null>(null)
    const [searchResults, setSearchResults] = useState<{
        spotify: any[];
        apple: any[];
        youtube: any[];
    }>({ spotify: [], apple: [], youtube: [] })

    const searchTimeout = useRef<NodeJS.Timeout>()

    // Clear search results when switching between artists
    useEffect(() => {
        setSearchResults({ spotify: [], apple: [], youtube: [] })
    }, [activeSearchIndex])

    // State for upgrade modal
    const [showUpgradeModal, setShowUpgradeModal] = useState(false)

    // Handle adding a new artist
    const handleAddArtist = () => {
        // Safe access to limits and rules
        const limit = planLimits?.artistLimit ?? 1; // Default to 1 (strictest) if not loaded
        // const allowFeatured = fieldRules.featuredArtists?.allow ?? false; // Default to false (strictest) if not loaded - Unused var

        // 1. Check if featured artists are allowed specifically
        if (fieldRules.featuredArtists?.allow === false) {
            setShowUpgradeModal(true)
            return
        }

        // 2. Check numeric limit
        // Current count = 1 (main) + N (secondary)
        if ((1 + (artists?.length || 0)) >= limit) {
            setShowUpgradeModal(true)
            return
        }

        const currentArtists = artists || []
        setValue('artists', [...currentArtists, { name: '' }], { shouldValidate: true })
    }

    // Handle removing an artist
    const handleRemoveArtist = (index: number) => {
        const currentArtists = artists || []
        const updated = currentArtists.filter((_, i) => i !== index)
        setValue('artists', updated, { shouldValidate: true })

        // If removing the currently searched artist, clear search
        if (activeSearchIndex === index) {
            setActiveSearchIndex(null)
            setSearchResults({ spotify: [], apple: [], youtube: [] })
        } else if (typeof activeSearchIndex === 'number' && activeSearchIndex > index) {
            // Shift active index if removing an item before it
            setActiveSearchIndex(activeSearchIndex - 1)
        }
    }

    // Handle updating an artist at a specific index
    const handleArtistChange = (index: number, name: string) => {
        const currentArtists = [...(artists || [])]
        currentArtists[index] = { ...currentArtists[index], name }
        setValue('artists', currentArtists, { shouldValidate: true })

        handleSearch(name, index)
    }

    const handleSearch = useCallback((name: string, index: number | 'main') => {
        // Clear previous timeout
        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current)
        }

        setActiveSearchIndex(index)

        if (name.length >= 2) {
            setIsSearching(true)
            searchTimeout.current = setTimeout(async () => {
                try {
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

                    // Call Spotify, Apple Music, and YouTube search APIs in parallel via backend
                    const [spotifyResponse, appleResponse, youtubeResponse] = await Promise.all([
                        fetch(`${apiUrl}/integrations/spotify/search?q=${encodeURIComponent(name)}&limit=15`)
                            .catch(err => {
                                console.error('Spotify search error:', err)
                                return null
                            }),
                        fetch(`${apiUrl}/integrations/apple/search?q=${encodeURIComponent(name)}&limit=15`)
                            .catch(err => {
                                console.error('Apple Music search error:', err)
                                return null
                            }),
                        fetch(`${apiUrl}/integrations/youtube/search?q=${encodeURIComponent(name)}&limit=15`)
                            .catch(err => {
                                console.error('YouTube search error:', err)
                                return null
                            })
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
            }, 1000)
        } else {
            setSearchResults({ spotify: [], apple: [], youtube: [] })
            setIsSearching(false)
            setHasSearched(false)
        }
    }, [searchTimeout, setActiveSearchIndex, setIsSearching, setSearchResults, setHasSearched])



    // Prefill artistName Logic - ONLY if artistLimit is exactly 1
    // Also attempts to hydrate legacy URL profiles by matching them with search results
    useEffect(() => {
        const checkAndPrefillArtist = () => {
            // Don't prefill if plan limits haven't loaded yet
            if (!planLimits) return

            // If explicit artist name is already set and we are not in the middle of hydration check, skip
            // Note: We might want to re-run this if artistName matches usedArtists[0] but profiles are missing
            if (artistName && artistName !== (typeof usedArtists[0] === 'string' ? usedArtists[0] : usedArtists[0]?.name)) return

            // ONLY prefill if plan allows exactly 1 artist AND we have a used artist
            if (planLimits.artistLimit === 1 && usedArtists.length > 0) {
                const previousArtistObj = usedArtists[0];
                const artistNameStr = typeof previousArtistObj === 'string' ? previousArtistObj : previousArtistObj.name;

                if (artistNameStr && artistNameStr !== artistName) {
                    console.log('Prefilling artist:', artistNameStr);
                    setValue('artistName', artistNameStr, { shouldValidate: true })
                    handleSearch(artistNameStr, 'main')
                }

                // Set profiles if available (even if legacy string, useful for hydration matching)
                if (typeof previousArtistObj === 'object') {
                    if (previousArtistObj.spotifyProfile && !spotifyProfile) setValue('spotifyProfile', previousArtistObj.spotifyProfile);
                    if (previousArtistObj.appleMusicProfile && !appleMusicProfile) setValue('appleMusicProfile', previousArtistObj.appleMusicProfile);
                    if (previousArtistObj.youtubeMusicProfile && !youtubeMusicProfile) setValue('youtubeMusicProfile', previousArtistObj.youtubeMusicProfile);
                    if (previousArtistObj.instagramProfile && !instagramProfile) setValue('instagramProfile', previousArtistObj.instagramProfile);
                    // Handle Instagram URL separately as it might be 'yes'/'no' radio + url field logic
                    if (previousArtistObj.instagramProfile) {
                        // Check if it looks like a URL
                        if (previousArtistObj.instagramProfile.startsWith('http')) {
                            setValue('instagramProfile', 'yes');
                            setValue('instagramProfileUrl', previousArtistObj.instagramProfile);
                        } else {
                            setValue('instagramProfile', previousArtistObj.instagramProfile);
                        }
                    }
                    if (previousArtistObj.facebookProfile && !facebookProfile) setValue('facebookProfile', previousArtistObj.facebookProfile);
                    if (previousArtistObj.facebookProfile) {
                        if (previousArtistObj.facebookProfile.startsWith('http')) {
                            setValue('facebookProfile', 'yes');
                            setValue('facebookProfileUrl', previousArtistObj.facebookProfile);
                        } else {
                            setValue('facebookProfile', previousArtistObj.facebookProfile);
                        }
                    }

                }
            }
        }

        if (user && planLimits) {
            checkAndPrefillArtist()
        }
    }, [user, setValue, planLimits, usedArtists, handleSearch]) // Removed artistName to avoid loops, handled inside

    // Hydrate Legacy Profiles from Search Results
    // If we have a profile set as a string (URL) and search results appear, try to find a match to upgrade to rich object
    useEffect(() => {
        const hydrateProfile = (platform: 'spotify' | 'apple' | 'youtube', currentVal: any, results: any[]) => {
            if (typeof currentVal === 'string' && results.length > 0) {
                // Try to find match by ID or URL
                // Spotify results usually have id, externalUrl
                // Apple results have url, id?
                const match = results.find(r =>
                    r.id === currentVal ||
                    (r.externalUrl && r.externalUrl === currentVal) ||
                    (r.url && r.url === currentVal) ||
                    (r.channelUrl && r.channelUrl === currentVal)
                );

                if (match) {
                    console.log(`Hydrating ${platform} profile from search result`, match);
                    // Construct proper object
                    const richProfile = {
                        id: match.id,
                        name: match.name,
                        image: match.image || '',
                        url: match.externalUrl || match.channelUrl || match.url || '',
                        followers: match.followers,
                        track: match.track
                    };

                    if (platform === 'spotify') setValue('spotifyProfile', richProfile);
                    if (platform === 'apple') setValue('appleMusicProfile', richProfile);
                    if (platform === 'youtube') setValue('youtubeMusicProfile', richProfile);
                }
            }
        }

        if (activeSearchIndex === 'main' && hasSearched && !isSearching) {
            hydrateProfile('spotify', spotifyProfile, searchResults.spotify);
            hydrateProfile('apple', appleMusicProfile, searchResults.apple);
            hydrateProfile('youtube', youtubeMusicProfile, searchResults.youtube);
        }

    }, [searchResults, hasSearched, isSearching, activeSearchIndex, spotifyProfile, appleMusicProfile, youtubeMusicProfile, setValue]);

    const handleMainArtistNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value
        setValue('artistName', name, { shouldValidate: true })
        handleSearch(name, 'main')
    }

    // Helper to render search results for a specific index (main or numeric)
    const renderSearchResults = (index: number | 'main') => {
        // Specific handlers for this index
        const handleSelectProfile = (platform: 'spotify' | 'apple' | 'youtube', profile: any | 'new' | '') => {
            let valueToSave: any = ''

            if (profile === 'new') {
                valueToSave = 'new'
            } else if (profile === '') {
                valueToSave = ''
                // Force a search if results are empty to ensure user has options after clearing
                const currentName = index === 'main' ? artistName : (artists && artists[index]?.name)
                if (currentName && (!searchResults[platform === 'spotify' ? 'spotify' : platform === 'apple' ? 'apple' : 'youtube'] || searchResults[platform === 'spotify' ? 'spotify' : platform === 'apple' ? 'apple' : 'youtube'].length === 0)) {
                    handleSearch(currentName, index)
                }
            } else if (typeof profile === 'string') {
                // Handle manual URL entry
                valueToSave = profile
            } else {
                // Construct the profile object based on the platform and source data
                // We map the different API responses to our standard ArtistProfile schema
                valueToSave = {
                    id: profile.id,
                    name: profile.name,
                    image: profile.image || '',
                    url: profile.externalUrl || profile.channelUrl || profile.url || '',
                    followers: profile.followers,
                    track: profile.track
                }
            }

            if (index === 'main') {
                if (platform === 'spotify') setValue('spotifyProfile', valueToSave, { shouldValidate: true })
                if (platform === 'apple') setValue('appleMusicProfile', valueToSave, { shouldValidate: true })
                if (platform === 'youtube') setValue('youtubeMusicProfile', valueToSave, { shouldValidate: true })
            } else {
                const currentArtists = [...(artists || [])]
                const fieldName = platform === 'spotify' ? 'spotifyProfile' :
                    platform === 'apple' ? 'appleMusicProfile' : 'youtubeMusicProfile'

                currentArtists[index] = { ...currentArtists[index], [fieldName]: valueToSave }
                setValue('artists', currentArtists, { shouldValidate: true })
            }
        }

        // Get current values for this index to checking selection state
        const getCurrentProfile = (platform: 'spotify' | 'apple' | 'youtube') => {
            if (index === 'main') {
                if (platform === 'spotify') return spotifyProfile
                if (platform === 'apple') return appleMusicProfile
                if (platform === 'youtube') return youtubeMusicProfile
            } else {
                if (!artists || !artists[index]) return ''
                if (platform === 'spotify') return artists[index].spotifyProfile
                if (platform === 'apple') return artists[index].appleMusicProfile
                if (platform === 'youtube') return artists[index].youtubeMusicProfile
            }
            return ''
        }

        const currentSpotify = getCurrentProfile('spotify')
        const currentApple = getCurrentProfile('apple')
        const currentYoutube = getCurrentProfile('youtube')

        // Render Selected View Helper
        const renderSelectedProfile = (platform: 'spotify' | 'apple' | 'youtube', profileData: any) => {
            if (!profileData) return null
            if (profileData === 'new') {
                return (
                    <div className="bg-primary/10 border border-primary rounded-md p-3 flex flex-col">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                                <Plus className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="font-medium text-primary">New Artist Profile</p>
                                <p className="text-sm text-muted-foreground">Creating a new profile for {currentName}</p>
                            </div>
                            {!isArtistFromRoster && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleSelectProfile(platform, '')}
                                    className="h-8 text-xs text-muted-foreground hover:text-red-500"
                                >
                                    Change
                                </Button>
                            )}
                        </div>
                    </div>
                )
            }

            // Handle legacy string (URL) - Render a "Linked" card
            if (typeof profileData === 'string') {
                return (
                    <div className="bg-primary/10 border border-primary rounded-md p-3 flex flex-col">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                {/* Platform specific icon or generic link icon could go here */}
                                {platform === 'spotify' && (
                                    <svg className="h-5 w-5 text-[#1DB954]" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                                    </svg>
                                )}
                                {platform === 'apple' && (
                                    <svg className="h-5 w-5 text-[#FA243C]" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm3.227 15.653c-.347.187-.773.053-.96-.293l-1.36-2.587c-.187-.347-.053-.773.293-.96l.16-.08c.347-.187.773-.053.96.293l1.36 2.587c.187.347.053.773-.293.96l-.16.08zm-1.893-1.013c-.347.187-.773.053-.96-.293l-1.36-2.587c-.187-.347-.053-.773.293-.96l.16-.08c.347-.187.773-.053.96.293l1.36 2.587c.187.347.053.773-.293.96l-.16.08zm-1.893-1.013c-.347.187-.773.053-.96-.293l-1.36-2.587c-.187-.347-.053-.773.293-.96l.16-.08c.347-.187.773-.053.96.293l1.36 2.587c.187.347.053.773-.293.96l-.16.08z" />
                                    </svg>
                                )}
                                {platform === 'youtube' && (
                                    <svg className="h-5 w-5 text-[#FF0000]" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                                    </svg>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-primary">Profile Linked</p>
                                <p className="text-sm text-muted-foreground truncate" title={profileData}>
                                    {profileData}
                                </p>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">Selected</span>
                                {!isArtistFromRoster && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleSelectProfile(platform, '')}
                                        className="h-7 px-1.5 text-[10px] text-muted-foreground hover:text-red-500"
                                    >
                                        Change
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }

            return (
                <div className="bg-primary/10 border border-primary rounded-md p-3 flex flex-col">
                    <div className="flex items-center gap-3">
                        {profileData.image ? (
                            <img src={profileData.image} alt={profileData.name} className="h-10 w-10 rounded-full object-cover" />
                        ) : (
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                <Music className="h-5 w-5 text-muted-foreground" />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-primary truncate">{profileData.name}</p>
                            <p className="text-sm text-muted-foreground truncate">
                                {profileData.followers ? `${profileData.followers.toLocaleString()} followers` : profileData.track}
                            </p>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">Selected</span>
                            {!isArtistFromRoster && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleSelectProfile(platform, '')}
                                    className="h-7 px-1.5 text-[10px] text-muted-foreground hover:text-red-500"
                                >
                                    Change
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )
        }

        const currentName = index === 'main' ? artistName : (artists && artists[index]?.name)
        if (!currentName || currentName.length < 2) return null

        // Conditions to show the block:
        // 1. If actively searching this index.
        // 2. OR if there are results (and not searching).
        // 3. OR if there are selected profiles for this index (Persistent View).
        // NOW UPDATED: Always show if active search index matches, to allow manual entry even if no results.
        const isActiveSearch = activeSearchIndex === index
        // const hasResults = searchResults.spotify.length > 0 || searchResults.apple.length > 0 || searchResults.youtube.length > 0
        // const showSearchResults = isActiveSearch && (hasResults || isSearching)
        const showSearchResults = isActiveSearch // Always show when active to allow manual entry

        const hasAnySelection = !!(currentSpotify || currentApple || currentYoutube)

        if (!showSearchResults && !hasAnySelection) return null

        return (
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 space-y-6 border border-border rounded-lg p-4 bg-card/50"
            >
                <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm text-foreground">
                        We found this artist on other platforms. Is this you?
                    </h4>
                    {isSearching && isActiveSearch && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                className="h-3 w-3 border-2 border-primary border-t-transparent rounded-full"
                            />
                            <span className="text-xs">Searching...</span>
                        </div>
                    )}
                </div>

                {isSearching && isActiveSearch ? (
                    // Show skeleton or just keep the header with loader above
                    <div className="space-y-4 opacity-50 pointer-events-none">
                        {/* Placeholder for Spotify */}
                        <div className="h-12 bg-muted/20 rounded-md animate-pulse" />
                        <div className="h-12 bg-muted/20 rounded-md animate-pulse" />
                        <div className="h-12 bg-muted/20 rounded-md animate-pulse" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Spotify Section */}
                        {(showSearchResults || currentSpotify) && (
                            <div className="space-y-3 flex flex-col">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <svg className="h-5 w-5 text-[#1DB954]" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                                        </svg>
                                        <span className="text-sm font-medium">Spotify</span>
                                    </div>
                                </div>

                                {currentSpotify ? (
                                    renderSelectedProfile('spotify', currentSpotify)
                                ) : (
                                    // Only show results if no selection exists
                                    <>
                                        {searchResults.spotify.map((artist: any) => (
                                            <div
                                                key={artist.id}
                                                className="flex items-center gap-3 p-3 rounded-md bg-background hover:bg-accent transition-colors cursor-pointer"
                                                onClick={() => handleSelectProfile('spotify', artist)}
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
                                                <a
                                                    href={artist.externalUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="p-2 hover:bg-background rounded-full transition-colors text-muted-foreground hover:text-primary"
                                                    title="Open in Spotify"
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                </a>
                                            </div>
                                        ))}
                                        <div className="space-y-3 mt-3 pt-3 border-t border-border/50">
                                            <div
                                                className="flex items-center gap-3 p-3 rounded-md hover:bg-accent cursor-pointer transition-colors"
                                                onClick={() => handleSelectProfile('spotify', 'new')}
                                            >
                                                <div className="h-10 w-10 rounded-full border border-dashed border-primary flex items-center justify-center bg-primary/5">
                                                    <Plus className="h-5 w-5 text-primary" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-foreground">Create New Profile</p>
                                                    <p className="text-sm text-muted-foreground">Create a new Spotify profile for <strong>{currentName}</strong></p>
                                                </div>
                                            </div>
                                            <div className="px-1">
                                                <Label className="text-xs font-medium text-foreground mb-1.5 block px-2">Or paste Spotify URL</Label>
                                                <div className="relative">
                                                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                                    <Input
                                                        placeholder="https://open.spotify.com/artist/..."
                                                        className="h-9 text-sm pl-9"
                                                        onBlur={(e) => {
                                                            if (e.target.value) handleSelectProfile('spotify', e.target.value)
                                                        }}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault()
                                                                if (e.currentTarget.value) handleSelectProfile('spotify', e.currentTarget.value)
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Apple Music Section */}
                        {(showSearchResults || currentApple) && (
                            <div className="space-y-3 flex flex-col">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <svg className="h-5 w-5 text-[#FA243C]" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm3.227 15.653c-.347.187-.773.053-.96-.293l-1.36-2.587c-.187-.347-.053-.773.293-.96l.16-.08c.347-.187.773-.053.96.293l1.36 2.587c.187.347.053.773-.293.96l-.16.08zm-1.893-1.013c-.347.187-.773.053-.96-.293l-1.36-2.587c-.187-.347-.053-.773.293-.96l.16-.08c.347-.187.773-.053.96.293l1.36 2.587c.187.347.053.773-.293.96l-.16.08zm-1.893-1.013c-.347.187-.773.053-.96-.293l-1.36-2.587c-.187-.347-.053-.773.293-.96l.16-.08c.347-.187.773-.053.96.293l1.36 2.587c.187.347.053.773-.293.96l-.16.08z" />
                                        </svg>
                                        <span className="text-sm font-medium">Apple Music</span>
                                    </div>
                                </div>

                                {currentApple ? (
                                    renderSelectedProfile('apple', currentApple)
                                ) : (
                                    <>
                                        {searchResults.apple.map((artist: any) => (
                                            <div
                                                key={artist.id}
                                                className="flex items-center gap-3 p-3 rounded-md bg-background hover:bg-accent transition-colors cursor-pointer"
                                                onClick={() => handleSelectProfile('apple', artist)}
                                            >
                                                <div className="h-4 w-4 rounded-full border border-primary flex items-center justify-center">
                                                    <div className="h-2 w-2 rounded-full hidden" />
                                                </div>
                                                <img src={artist.image} alt={artist.name} className="h-10 w-10 rounded-full object-cover" />
                                                <div className="flex-1">
                                                    <p className="font-medium text-foreground">{artist.name}</p>
                                                    <p className="text-sm text-muted-foreground">{artist.track}</p>
                                                </div>
                                                {artist.url && (
                                                    <a
                                                        href={artist.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="p-2 hover:bg-background rounded-full transition-colors text-muted-foreground hover:text-primary"
                                                        title="Open in Apple Music"
                                                    >
                                                        <ExternalLink className="h-4 w-4" />
                                                    </a>
                                                )}
                                            </div>
                                        ))}
                                        <div className="space-y-3 mt-3 pt-3 border-t border-border/50">
                                            <div
                                                className="flex items-center gap-3 p-3 rounded-md hover:bg-accent cursor-pointer transition-colors"
                                                onClick={() => handleSelectProfile('apple', 'new')}
                                            >
                                                <div className="h-10 w-10 rounded-full border border-dashed border-primary flex items-center justify-center bg-primary/5">
                                                    <Plus className="h-5 w-5 text-primary" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-foreground">Create New Profile</p>
                                                    <p className="text-sm text-muted-foreground">Create a new Apple Music profile for <strong>{currentName}</strong></p>
                                                </div>
                                            </div>
                                            <div className="px-1">
                                                <Label className="text-xs font-medium text-foreground mb-1.5 block px-2">Or paste Apple Music URL</Label>
                                                <div className="relative">
                                                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                                    <Input
                                                        placeholder="https://music.apple.com/artist/..."
                                                        className="h-9 text-sm pl-9"
                                                        onBlur={(e) => {
                                                            if (e.target.value) handleSelectProfile('apple', e.target.value)
                                                        }}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault()
                                                                if (e.currentTarget.value) handleSelectProfile('apple', e.currentTarget.value)
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* YouTube Section */}
                        {(showSearchResults || currentYoutube) && (
                            <div className="space-y-3 flex flex-col">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <svg className="h-5 w-5 text-[#FF0000]" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                                        </svg>
                                        <span className="text-sm font-medium">YouTube Music</span>
                                    </div>
                                </div>

                                {currentYoutube ? (
                                    renderSelectedProfile('youtube', currentYoutube)
                                ) : (
                                    <>
                                        {searchResults.youtube.map((profile: any) => (
                                            <div
                                                key={profile.id}
                                                className={`flex items-center gap-3 p-3 rounded-md transition-colors cursor-pointer ${currentYoutube === profile.id ? 'bg-primary/10 border border-primary' : 'bg-background hover:bg-accent'
                                                    }`}
                                                onClick={() => handleSelectProfile('youtube', profile)}
                                            >
                                                <div className="h-4 w-4 rounded-full border border-primary flex items-center justify-center">
                                                    <div className="h-2 w-2 rounded-full hidden" />
                                                </div>
                                                <img src={profile.image} alt={profile.name} className="h-10 w-10 rounded-full object-cover" />
                                                <div className="flex-1">
                                                    <p className="font-medium text-foreground">{profile.name}</p>
                                                    <p className="text-sm text-muted-foreground">{profile.track}</p>
                                                </div>
                                                {profile.channelUrl && (
                                                    <a
                                                        href={profile.channelUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="p-2 hover:bg-background rounded-full transition-colors text-muted-foreground hover:text-primary"
                                                        title="Open in YouTube Music"
                                                    >
                                                        <ExternalLink className="h-4 w-4" />
                                                    </a>
                                                )}
                                            </div>
                                        ))}
                                        <div className="space-y-3 mt-3 pt-3 border-t border-border/50">
                                            <div
                                                className="flex items-center gap-3 p-3 rounded-md hover:bg-accent cursor-pointer transition-colors"
                                                onClick={() => handleSelectProfile('youtube', 'new')}
                                            >
                                                <div className="h-10 w-10 rounded-full border border-dashed border-primary flex items-center justify-center bg-primary/5">
                                                    <Plus className="h-5 w-5 text-primary" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-foreground">Create New Profile</p>
                                                    <p className="text-sm text-muted-foreground">Create a new YouTube Music profile for <strong>{currentName}</strong></p>
                                                </div>
                                            </div>
                                            <div className="px-1">
                                                <Label className="text-xs font-medium text-foreground mb-1.5 block px-2">Or paste YouTube URL</Label>
                                                <div className="relative">
                                                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                                    <Input
                                                        placeholder="https://music.youtube.com/channel/..."
                                                        className="h-9 text-sm pl-9"
                                                        onBlur={(e) => {
                                                            if (e.target.value) handleSelectProfile('youtube', e.target.value)
                                                        }}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault()
                                                                if (e.currentTarget.value) handleSelectProfile('youtube', e.currentTarget.value)
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </motion.div>
        )
    }

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold">Release Information</h3>
            <p className="text-muted-foreground">Let's start with the basics about your release</p>

            <div className="space-y-4 mt-6">
                <div className="space-y-2">
                    <Label htmlFor="title">Track/Album Title <span className="text-red-500">*</span></Label>
                    <Input
                        id="title"
                        placeholder="Enter title"
                        {...register('title')}
                        className={errors.title ? 'border-red-500' : ''}
                    />
                    {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="version">Version/Subtitle</Label>
                    <Input
                        id="version"
                        placeholder="Enter version/subtitle"
                        {...register('version')}
                    />
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center justify-between w-full">
                            <Label htmlFor="artistName">Artist Name <span className="text-red-500">*</span></Label>
                            {planLimits && planLimits.artistLimit < Infinity && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <AlertCircle className="h-3 w-3" />
                                    <span>Plan limit: {planLimits.artistLimit} artist{planLimits.artistLimit > 1 ? 's' : ''} only</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="relative space-y-3">
                    {/* Main Artist Field */}
                    <div className="relative flex items-center gap-2">
                        <div className="flex-1 relative space-y-2">
                            {/* Artist Selection Dropdown - Show if we have used artists */}
                            {usedArtists.length > 0 && (
                                <div className="relative">
                                    <Select
                                        value={usedArtists.find(a => (typeof a === 'string' ? a : a.name) === artistName) ? artistName : (isArtistLocked ? '' : 'new')}
                                        onValueChange={(val) => {
                                            if (val === 'new') {
                                                // Check limit before allowing 'new'
                                                if (isArtistLocked) {
                                                    setShowUpgradeModal(true);
                                                } else {
                                                    setValue('artistName', '', { shouldValidate: true })
                                                    setValue('spotifyProfile', '')
                                                    setValue('appleMusicProfile', '')
                                                    setValue('youtubeMusicProfile', '')
                                                    setValue('instagramProfile', '')
                                                    setValue('facebookProfile', '')
                                                    setValue('instagramProfileUrl', '')
                                                    setValue('facebookProfileUrl', '')
                                                    setActiveSearchIndex('main')
                                                }
                                            } else {
                                                // Find the full artist object
                                                const selectedArtist = usedArtists.find(a => (typeof a === 'string' ? a : a.name) === val);
                                                if (selectedArtist) {
                                                    const name = typeof selectedArtist === 'string' ? selectedArtist : selectedArtist.name;
                                                    setValue('artistName', name, { shouldValidate: true });

                                                    // Auto-fill profiles if available
                                                    if (typeof selectedArtist === 'object') {
                                                        console.log('Auto-filling profiles for', name);
                                                        if (selectedArtist.spotifyProfile) setValue('spotifyProfile', selectedArtist.spotifyProfile);
                                                        if (selectedArtist.appleMusicProfile) setValue('appleMusicProfile', selectedArtist.appleMusicProfile);
                                                        if (selectedArtist.youtubeMusicProfile) setValue('youtubeMusicProfile', selectedArtist.youtubeMusicProfile);
                                                        if (selectedArtist.instagramProfile) {
                                                            if (typeof selectedArtist.instagramProfile === 'string' && selectedArtist.instagramProfile.startsWith('http')) {
                                                                setValue('instagramProfile', 'yes');
                                                                setValue('instagramProfileUrl', selectedArtist.instagramProfile);
                                                            } else {
                                                                setValue('instagramProfile', selectedArtist.instagramProfile);
                                                            }
                                                        }
                                                        if (selectedArtist.facebookProfile) {
                                                            if (typeof selectedArtist.facebookProfile === 'string' && selectedArtist.facebookProfile.startsWith('http')) {
                                                                setValue('facebookProfile', 'yes');
                                                                setValue('facebookProfileUrl', selectedArtist.facebookProfile);
                                                            } else {
                                                                setValue('facebookProfile', selectedArtist.facebookProfile);
                                                            }
                                                        }
                                                    }
                                                    // Trigger search to hydrate legacy profiles if needed, or just to visually confirm
                                                    handleSearch(name, 'main');
                                                }
                                            }
                                        }}
                                    >
                                        <SelectTrigger className={errors.artistName ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select an artist" />
                                        </SelectTrigger>
                                        <SelectContent className="z-[999]">
                                            {usedArtists.map((artist, i) => {
                                                const name = typeof artist === 'string' ? artist : artist.name;
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
                                    {/* Removed Change Artist button for roster selection as per user feedback */}
                                </div>
                            )}

                            {/* Manual Input - Show if NO used artists OR if 'new' is selected/active (and not locked) */}
                            {/* If locked, we don't show input at all if we have a dropdown, ensuring user picks from dropdown */}
                            {/* Actually if locked, `isArtistLocked` is true. Above dropdown handles selection. */}
                            {/* We show input if: usedArtists is empty OR (artistName is not in usedArtists AND not locked) */}

                            {(!usedArtists.length || (!usedArtists.some(a => (typeof a === 'string' ? a : a.name) === artistName) && !isArtistLocked)) && (
                                <div className="relative">
                                    <Input
                                        id="artistName"
                                        placeholder="Your artist name"
                                        {...register('artistName')}
                                        onChange={(e) => {
                                            register('artistName').onChange(e)
                                            handleMainArtistNameChange(e)
                                        }}
                                        onFocus={() => !isArtistLocked && setActiveSearchIndex('main')}
                                        readOnly={isArtistLocked || !!spotifyProfile || !!appleMusicProfile || !!youtubeMusicProfile}
                                        className={`${isSearching && activeSearchIndex === 'main' ? 'pr-10' : ''} ${errors.artistName ? 'border-red-500' : ''} ${(isArtistLocked || !!spotifyProfile || !!appleMusicProfile || !!youtubeMusicProfile) ? 'bg-muted text-muted-foreground cursor-not-allowed pr-10' : ''}`}
                                    />
                                    {(!!spotifyProfile || !!appleMusicProfile || !!youtubeMusicProfile) && !isArtistLocked && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setValue('artistName', '');
                                                setValue('spotifyProfile', '');
                                                setValue('appleMusicProfile', '');
                                                setValue('youtubeMusicProfile', '');
                                                setActiveSearchIndex('main');
                                            }}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-primary hover:text-primary/80 font-medium"
                                        >
                                            Change Artist
                                        </button>
                                    )}
                                    {isSearching && activeSearchIndex === 'main' && !(!!spotifyProfile || !!appleMusicProfile || !!youtubeMusicProfile) && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                                className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Add Artist Button (for secondary artists) */}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleAddArtist}
                            className="shrink-0 h-10 w-10 p-0 self-start mt-2" // align with top if multiline
                            title="Add another artist"
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                    {errors.artistName && <p className="text-xs text-red-500 mt-1">{errors.artistName.message}</p>}


                    {/* Artist Not Found Message */}
                    {activeSearchIndex === 'main' && hasSearched && !isSearching &&
                        searchResults.spotify.length === 0 &&
                        searchResults.apple.length === 0 &&
                        searchResults.youtube.length === 0 &&
                        artistName.length >= 2 && (
                            <div className="mt-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
                                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                                    Artist not found. Please upload music via a distributor to create a Spotify profile
                                </p>
                            </div>
                        )}

                    {/* Main Artist Search Results */}
                    {renderSearchResults('main')}

                    {/* Additional Artist Fields */}
                    {artists && artists.length > 0 && (
                        <div className="space-y-2 pl-0">
                            {artists.map((artist, index) => (
                                <div key={index}>
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="flex items-center gap-2"
                                    >
                                        <div className="flex-1 relative">
                                            <Input
                                                placeholder={`Artist ${index + 2} name`}
                                                value={artist.name}
                                                onChange={(e) => handleArtistChange(index, e.target.value)}
                                                className="flex-1"
                                                onFocus={() => setActiveSearchIndex(index)}
                                            />
                                            {isSearching && activeSearchIndex === index && (
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                    <motion.div
                                                        animate={{ rotate: 360 }}
                                                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                                        className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveArtist(index)}
                                            className="shrink-0 h-10 w-10 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </motion.div>

                                    {/* Secondary Artist Search Results */}
                                    {renderSearchResults(index)}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Upgrade Message for Free Users */}
                    {(user?.plan === 'free' && artists.length === 0) || (!areFeaturedArtistsAllowed && artists.length === 0) && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-start gap-2 p-3 bg-muted/50 rounded-md border border-border"
                        >
                            <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                            <div className="text-xs text-muted-foreground">
                                <p className="font-medium">Want to add multiple artists?</p>
                                <p>Upgrade to Premium to collaborate with unlimited artists on your releases.</p>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Social Media Profiles */}
                <div className="space-y-6 pt-6 border-t border-border">
                    {/* Instagram Profile */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <span className="text-[#E4405F] font-bold text-lg">Instagram</span>
                            <h3 className="text-base font-semibold">Artist already on Instagram?</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    id="instagram-yes"
                                    value="yes"
                                    {...register('instagramProfile')}
                                    className="h-4 w-4 border-primary text-primary focus:ring-primary"
                                />
                                <Label htmlFor="instagram-yes" className="font-normal cursor-pointer">
                                    Yes - Group with other <strong>{artistName || 'artist'}</strong> releases
                                </Label>
                            </div>
                            {instagramProfile === 'yes' && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="ml-6 space-y-2"
                                >
                                    <Input
                                        id="instagramUrl"
                                        placeholder="https://instagram.com/..."
                                        {...register('instagramProfileUrl')}
                                        className="text-sm"
                                    />
                                </motion.div>
                            )}
                            <div className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    id="instagram-no"
                                    value="no"
                                    {...register('instagramProfile')}
                                    className="h-4 w-4 border-primary text-primary focus:ring-primary"
                                />
                                <Label htmlFor="instagram-no" className="font-normal cursor-pointer">
                                    No - <strong>{artistName || 'Artist'}</strong> is not on Instagram
                                </Label>
                            </div>
                        </div>
                    </div>

                    {/* Facebook Profile */}
                    <div className="space-y-3 pt-4 border-t border-border/50">
                        <div className="flex items-center gap-2">
                            <span className="text-[#1877F2] font-bold text-lg">Facebook</span>
                            <h3 className="text-base font-semibold">Artist already on Facebook?</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    id="facebook-yes"
                                    value="yes"
                                    {...register('facebookProfile')}
                                    className="h-4 w-4 border-primary text-primary focus:ring-primary"
                                />
                                <Label htmlFor="facebook-yes" className="font-normal cursor-pointer">
                                    Yes - Group with other <strong>{artistName || 'artist'}</strong> releases
                                </Label>
                            </div>
                            {facebookProfile === 'yes' && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="ml-6 space-y-2"
                                >
                                    <Input
                                        id="facebookUrl"
                                        placeholder="https://facebook.com/..."
                                        {...register('facebookProfileUrl')}
                                        className="text-sm"
                                    />
                                </motion.div>
                            )}
                            <div className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    id="facebook-no"
                                    value="no"
                                    {...register('facebookProfile')}
                                    className="h-4 w-4 border-primary text-primary focus:ring-primary"
                                />
                                <Label htmlFor="facebook-no" className="font-normal cursor-pointer">
                                    No - <strong>{artistName || 'Artist'}</strong> is not on Facebook
                                </Label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Featuring Artist - Only show if allowed by plan */}
                {areFeaturedArtistsAllowed && (
                    <div className="space-y-2">
                        <Label htmlFor="featuringArtist">
                            Featuring Artist{fieldRules.featuredArtists?.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <Input
                            id="featuringArtist"
                            placeholder="Enter Featuring Artist"
                            {...register('featuringArtist')}
                            className={errors.featuringArtist ? 'border-red-500' : ''}
                        />
                        {errors.featuringArtist && (
                            <p className="text-xs text-red-500 mt-1">{errors.featuringArtist.message}</p>
                        )}
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="language">Language <span className="text-red-500">*</span></Label>
                    <select
                        id="language"
                        className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${errors.language ? 'border-red-500' : ''}`}
                        {...register('language')}
                    >
                        <option value="">Select a language</option>
                        <option value="hindi">Hindi</option>
                        <option value="english">English</option>
                        <option value="punjabi">Punjabi</option>
                        <option value="tamil">Tamil</option>
                        <option value="telugu">Telugu</option>
                        <option value="bengali">Bengali</option>
                        <option value="marathi">Marathi</option>
                        <option value="gujarati">Gujarati</option>
                        <option value="kannada">Kannada</option>
                        <option value="malayalam">Malayalam</option>
                        <option value="urdu">Urdu</option>
                        <option value="other">Other</option>
                    </select>
                    {errors.language && <p className="text-xs text-red-500 mt-1">{errors.language.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="format">Format <span className="text-red-500">*</span></Label>
                    <div className="space-y-2">
                        <select
                            id="format"
                            className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${errors.format ? 'border-red-500' : ''}`}
                            {...register('format')}
                        >
                            <option disabled value="">Select a format</option>

                            <option value="single">Single</option>
                            <option value="ep" disabled={!allowedFormats.includes('ep')}>
                                EP {!allowedFormats.includes('ep') ? `(Creator+ Plan)` : ''}
                            </option>
                            <option value="album" disabled={!allowedFormats.includes('album')}>
                                Album {!allowedFormats.includes('album') ? `(Creator+ Plan)` : ''}
                            </option>
                        </select>
                        {!allowedFormats.includes('album') && (
                            <div className="flex items-start gap-2 p-2 bg-muted/50 rounded-md text-xs text-muted-foreground">
                                <Info className="h-3 w-3 mt-0.5" />
                                <span>Upgrade to Creator+ or higher to release EPs and Albums.</span>
                            </div>
                        )}
                    </div>
                    {errors.format && <p className="text-xs text-red-500 mt-1">{errors.format.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="releaseDate">Release Date <span className="text-red-500">*</span></Label>
                    <Input
                        id="releaseDate"
                        type="date"
                        min={(() => {
                            const d = new Date();
                            d.setDate(d.getDate() + 2);
                            const yyyy = d.getFullYear();
                            const mm = String(d.getMonth() + 1).padStart(2, '0');
                            const dd = String(d.getDate()).padStart(2, '0');
                            return `${yyyy}-${mm}-${dd}`;
                        })()}
                        {...register('releaseDate')}
                        className={errors.releaseDate ? 'border-red-500' : ''}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                        Release date must be at least 2 days from today.
                    </p>
                    {errors.releaseDate && <p className="text-xs text-red-500 mt-1">{errors.releaseDate.message}</p>}
                </div>
                {/* Explicit Lyrics - Only show if allowed by plan */}
                <div className="space-y-3 pt-6 border-t border-border">
                    <Label className="text-lg font-semibold flex items-center gap-2">
                        Explicit lyrics <span className="text-red-500">*</span>
                        <span className="inline-flex items-center justify-center bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-red-200 dark:border-red-800">
                            18+
                        </span>
                    </Label>

                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <input
                                type="radio"
                                id="explicitNo"
                                value="no"
                                {...register('explicitLyrics')}
                                className="h-4 w-4"
                            />
                            <Label htmlFor="explicitNo" className="font-normal cursor-pointer">
                                No
                            </Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="radio"
                                id="explicitYes"
                                value="yes"
                                {...register('explicitLyrics')}
                                className="h-4 w-4"
                            />
                            <Label htmlFor="explicitYes" className="font-normal cursor-pointer">
                                Yes
                            </Label>
                        </div>
                    </div>
                    {errors.explicitLyrics && (
                        <p className="text-xs text-red-500 mt-1">{errors.explicitLyrics.message}</p>
                    )}
                </div>

                {/* Upgrade Modal */}
                <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Artist Limit Reached</DialogTitle>
                            <DialogDescription>
                                You have reached the maximum number of artists allowed on your current plan.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <div className="p-4 bg-primary/10 rounded-lg border border-primary flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-primary">Add Extra Artist Slot</p>
                                    <p className="text-sm text-muted-foreground">Add one more artist to your account</p>
                                </div>
                                <div className="text-right">
                                    <span className="font-bold text-lg">₹1,000</span>
                                    <span className="text-xs text-muted-foreground block">/ year</span>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowUpgradeModal(false)}>Cancel</Button>
                            <Button disabled onClick={() => {
                                // TODO: Integrate with payment gateway
                                // For now, redirect to query param or just close and maybe show toast
                                window.location.href = '/dashboard/subscription?upgrade=artist_addon'
                            }}>
                                Upgrade Now
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}



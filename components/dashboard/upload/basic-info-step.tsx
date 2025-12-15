'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Music, ExternalLink, Info, Plus, X, AlertCircle, Lock } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { UploadFormData, SecondaryArtist } from './types'
import { useFormContext } from 'react-hook-form'
import { getPlanLimits, getPlanFieldRules } from '@/lib/api/plans'

interface BasicInfoStepProps {
    // Keeping these optional for compatibility, but we primarily use context
    formData?: UploadFormData
    setFormData?: (data: UploadFormData) => void
    usedArtists?: string[]
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

    // Check if main artist name should be locked (Single artist plan + already used artist)
    const isArtistLocked = planLimits?.artistLimit === 1 && usedArtists.length > 0;

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

    // Handle adding a new artist
    const handleAddArtist = () => {
        // First check if featured artists are allowed by plan
        if (fieldRules.featuredArtists?.allow === false) {
            // Featured artists not allowed by plan
            return
        }

        // Then check artist limit: Check total artists (1 main + N secondary) against limit
        // Current count = 1 (main) + artists.length
        if (planLimits && (1 + (artists?.length || 0)) >= planLimits.artistLimit) {
            // Limit reached
            return
        }
        const currentArtists = artists || []
        // Add new artist object
        setValue('artists', [...currentArtists, { name: '' }], { shouldValidate: true })
        // Focus will be handled by auto-focusing the new input if needed, or user clicks
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
                        fetch(`${apiUrl}/integrations/spotify/search?q=${encodeURIComponent(name)}&limit=5`)
                            .catch(err => {
                                console.error('Spotify search error:', err)
                                return null
                            }),
                        fetch(`${apiUrl}/integrations/apple/search?q=${encodeURIComponent(name)}&limit=5`)
                            .catch(err => {
                                console.error('Apple Music search error:', err)
                                return null
                            }),
                        fetch(`${apiUrl}/integrations/youtube/search?q=${encodeURIComponent(name)}&limit=5`)
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
    useEffect(() => {
        const checkAndPrefillArtist = () => {
            // Don't prefill if plan limits haven't loaded yet
            if (!planLimits) return

            // If explicit artist name is already set, don't override
            if (artistName) return

            console.log('Checking prefill:', { planLimit: planLimits.artistLimit, usedArtistsLen: usedArtists.length, usedArtists });

            // ONLY prefill if plan allows exactly 1 artist AND we have a used artist
            // This means only Free Plan users get auto-filled
            if (planLimits.artistLimit === 1 && usedArtists.length > 0) {
                const previousArtist = usedArtists[0];
                if (previousArtist) {
                    console.log('Prefilling artist (artistLimit === 1):', previousArtist);
                    setValue('artistName', previousArtist, { shouldValidate: true })
                    handleSearch(previousArtist, 'main')
                }
            } else {
                console.log('Skipping prefill - artistLimit is not 1:', planLimits.artistLimit);
            }
        }

        if (user && planLimits) {
            checkAndPrefillArtist()
        }
    }, [user, setValue, planLimits, usedArtists, artistName, handleSearch])

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
                    <div className="bg-primary/10 border border-primary rounded-md p-3">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                                <Plus className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="font-medium text-primary">New Artist Profile</p>
                                <p className="text-sm text-muted-foreground">Creating a new profile for {currentName}</p>
                            </div>
                            <button
                                onClick={() => handleSelectProfile(platform, '')}
                                className="ml-auto text-xs text-primary hover:underline hover:text-primary/80"
                                type="button"
                            >
                                Change
                            </button>
                        </div>
                    </div>
                )
            }

            // If it's a string (legacy ID only), we can't show much, but we handle it gracefully or ignore if we want to force object
            if (typeof profileData === 'string') return null

            return (
                <div className="bg-primary/10 border border-primary rounded-md p-3">
                    <div className="flex items-center gap-3">
                        {profileData.image ? (
                            <img src={profileData.image} alt={profileData.name} className="h-10 w-10 rounded-full object-cover" />
                        ) : (
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                <Music className="h-5 w-5 text-muted-foreground" />
                            </div>
                        )}
                        <div className="flex-1">
                            <p className="font-medium text-primary">{profileData.name}</p>
                            <p className="text-sm text-muted-foreground">
                                {profileData.followers ? `${profileData.followers.toLocaleString()} followers` : profileData.track}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">Selected</span>
                            <button
                                onClick={() => handleSelectProfile(platform, '')}
                                className="text-xs text-muted-foreground hover:text-destructive transition-colors ml-2"
                                type="button"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )
        }

        const currentName = index === 'main' ? artistName : (artists && artists[index]?.name)
        if (!currentName || currentName.length < 2) return null

        // Conditions to show the block:
        // 1. If actively searching this index AND results exist.
        // 2. OR if there are selected profiles for this index (Persistent View).
        const isActiveSearch = activeSearchIndex === index && !isSearching
        const hasResults = searchResults.spotify.length > 0 || searchResults.apple.length > 0 || searchResults.youtube.length > 0
        const showSearchResults = isActiveSearch && hasResults

        const hasAnySelection = !!(currentSpotify || currentApple || currentYoutube)

        if (!showSearchResults && !hasAnySelection) return null

        return (
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 space-y-6 border border-border rounded-lg p-4 bg-card/50"
            >
                <h4 className="font-semibold text-sm text-foreground">
                    We found this artist on other platforms. Is this you?
                </h4>

                {/* Spotify Section */}
                {(showSearchResults || currentSpotify) && (
                    <div className="space-y-3">
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
                                <div className="space-y-2 mt-4">
                                    <div
                                        className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent cursor-pointer"
                                        onClick={() => handleSelectProfile('spotify', 'new')}
                                    >
                                        <div className="h-4 w-4 rounded-full border border-primary flex items-center justify-center">
                                        </div>
                                        <Label className="font-normal cursor-pointer">
                                            This will be my first <strong>{currentName}</strong> release in Spotify.
                                        </Label>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Apple Music Section */}
                {(showSearchResults || currentApple) && (
                    <div className="space-y-3 pt-4 border-t border-border">
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
                                <div className="space-y-2 mt-4">
                                    <div
                                        className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent cursor-pointer"
                                        onClick={() => handleSelectProfile('apple', 'new')}
                                    >
                                        <div className="h-4 w-4 rounded-full border border-primary flex items-center justify-center">
                                        </div>
                                        <Label className="font-normal cursor-pointer">
                                            This will be my first <strong>{currentName}</strong> release in Apple Music.
                                        </Label>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* YouTube Section */}
                {(showSearchResults || currentYoutube) && (
                    <div className="space-y-3 pt-4 border-t border-border">
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
                                <div className="space-y-2 mt-4">
                                    <div
                                        className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent cursor-pointer"
                                        onClick={() => handleSelectProfile('youtube', 'new')}
                                    >
                                        <div className="h-4 w-4 rounded-full border border-primary flex items-center justify-center">
                                        </div>
                                        <Label className="font-normal cursor-pointer">
                                            This will be my first <strong>{currentName}</strong> release in YouTube Music.
                                        </Label>
                                    </div>
                                </div>
                            </>
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
                        <Label htmlFor="artistName">Artist Name <span className="text-red-500">*</span></Label>
                        <div className="flex items-center justify-between">
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
                        <div className="flex-1 relative">
                            <Input
                                id="artistName"
                                placeholder="Your artist name"
                                {...register('artistName')}
                                onChange={(e) => {
                                    register('artistName').onChange(e)
                                    handleMainArtistNameChange(e)
                                }}
                                onFocus={() => !isArtistLocked && setActiveSearchIndex('main')}
                                readOnly={isArtistLocked}
                                className={`${isSearching && activeSearchIndex === 'main' ? 'pr-10' : ''} ${errors.artistName ? 'border-red-500' : ''} ${isArtistLocked ? 'bg-muted text-muted-foreground cursor-not-allowed pr-10' : ''}`}
                            />
                            {isSearching && activeSearchIndex === 'main' && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                        className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full"
                                    />
                                </div>
                            )}

                            {isArtistLocked && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" title="Artist name locked to your plan">
                                    <Lock className="h-4 w-4" />
                                </div>
                            )}
                        </div>

                        {/* Add Artist Button */}
                        {canAddMoreArtists && areFeaturedArtistsAllowed && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleAddArtist}
                                className="shrink-0 h-10 w-10 p-0"
                                title={!canAddMoreArtists ? 'Upgrade to add more artists' : 'Add another artist'}
                                disabled={!canAddMoreArtists}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        )}
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
                {/* Explicit Lyrics - Only show if allowed by plan */}
                {isExplicitAllowed && (
                    <div className="space-y-3 pt-6 border-t border-border">
                        <Label className="text-lg font-semibold">
                            Explicit lyrics{fieldRules.isExplicit?.required && ' *'}
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
                )}
            </div>
        </div>
    )
}

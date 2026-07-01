'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Music, ExternalLink, Info, Plus, X, AlertCircle, Lock, UserCheck, Link as LinkIcon, Loader2 } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/contexts/AuthContext'
import { UploadFormData, SecondaryArtist } from './types'
import { useFormContext, Controller } from 'react-hook-form'
import { getPlanLimits, getPlanFieldRules, getAllPlans, Plan } from '@/lib/api/plans'
import { useRazorpay } from '@/hooks/useRazorpay'
import UpgradePlanModal from '@/components/dashboard/upgrade-plan-modal'
import toast from 'react-hot-toast'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    extractAppleArtistId,
    profileNeedsAppleEnrichment,
    profileNeedsSearchHydration,
    resolvePlatformProfile,
} from '@/lib/integrations/platform-profile.util'
import { enrichArtistProfile } from '@/lib/api/artist-search'
import { emptySearchResults, type ArtistSearchResults } from '@/lib/integrations/artist-search.util'
import {
    buildProfileValueToSave,
    profileFieldForPlatform,
    rosterArtistHasPendingProfiles,
    type PlatformKey,
} from '@/lib/integrations/apply-artist-profile-selection'
import { useArtistPlatformSearch } from '@/lib/integrations/use-artist-platform-search'
import {
    applyRosterArtistToMainForm,
    applyRosterArtistToSecondarySlot,
    clearMainArtistFormProfiles,
    emptySecondaryArtistSlot,
    rosterArtistName,
} from '@/lib/integrations/artist-form-state.util'
import ArtistPlatformPicker from '@/components/dashboard/upload/artist-platform-picker'
import { getDefaultLabelName } from '@/lib/validation/label-name'

// Hardcoded artist add-on price (frontend display only — backend is source of truth)
const ARTIST_ADDON_PLAN_KEY = 'artist_addon'
const ARTIST_ADDON_PRICE_INR = 500

type SearchIndex = number | 'main'

interface BasicInfoStepProps {
    // Keeping these optional for compatibility, but we primarily use context
    formData?: UploadFormData
    setFormData?: (data: UploadFormData) => void
    usedArtists?: any[] // Changed from string[] to any[] for object support
}

export default function BasicInfoStep({ formData: propFormData, setFormData: propSetFormData, usedArtists = [] }: BasicInfoStepProps) {
    const { user, refreshUser } = useAuth()
    const { register, formState: { errors }, watch, setValue, control } = useFormContext<UploadFormData>()
    const { initiatePayment, isLoading: isPaymentLoading } = useRazorpay()

    // Watch values for conditional rendering
    const artistName = watch('artistName')
    const cosmosArtistId = watch('cosmosArtistId')
    const artists = watch('artists') || []
    const title = watch('title')
    const spotifyProfile = watch('spotifyProfile')
    const appleMusicProfile = watch('appleMusicProfile')
    const instagramProfile = watch('instagramProfile')
    const facebookProfile = watch('facebookProfile')

    // Plan limits state
    const [planLimits, setPlanLimits] = useState<{ artistLimit: number; allowConcurrent: boolean; allowedFormats: string[] } | null>(null)
    const [fieldRules, setFieldRules] = useState<Record<string, any>>({})
    const [allPlans, setAllPlans] = useState<Plan[]>([])
    const extraSlots = user?.extraArtistSlots || 0
    const [isAddonAutoPay] = useState(true)
    const [creatingNewMain, setCreatingNewMain] = useState(false)
    const [pendingProfileNotice, setPendingProfileNotice] = useState(false)
    const [creatingNewSecondary, setCreatingNewSecondary] = useState<Record<number, boolean>>({})
    const planKey = user?.plan || 'free'
    const allowedFormats = planLimits?.allowedFormats || ['single']

    // Fetch plan limits on mount and when plan changes
    useEffect(() => {
        const fetchPlanData = async () => {
            try {
                const [limits, rules, plans] = await Promise.all([
                    getPlanLimits(planKey),
                    getPlanFieldRules(planKey),
                    getAllPlans(),
                ])
                setPlanLimits(limits)
                setFieldRules(rules)
                setAllPlans(plans)
            } catch (error) {
                console.error('Failed to fetch plan data:', error)
                // Fallback to default (free plan)
                setPlanLimits({ artistLimit: 1, allowConcurrent: false, allowedFormats: ['single'] })
                setFieldRules({})
                setAllPlans([])
            }
        }
        fetchPlanData()
    }, [planKey])

    // Check if user can add more artists based on plan + purchased add-on slots
    const canAddMoreArtists = planLimits ? artists.length < (planLimits.artistLimit + extraSlots - 1) : false // -1 because main artist is separate field

    // Check if featured artists are allowed by plan fieldRules
    const areFeaturedArtistsAllowed = fieldRules.featuredArtists?.allow !== false
    const isLabelNameAllowed = planKey !== 'free'
    const defaultLabelName = getDefaultLabelName()
    const labelNameValue = watch('labelName')
    const isExplicitAllowed = fieldRules.isExplicit?.allow !== false

    // Free plan: keep label locked to the platform default (blocks paste/typing bypass).
    useEffect(() => {
        if (!isLabelNameAllowed && labelNameValue !== defaultLabelName) {
            setValue('labelName', defaultLabelName, { shouldValidate: true })
        }
    }, [isLabelNameAllowed, labelNameValue, defaultLabelName, setValue])

    // Check if main artist name should be locked (Limit reached, including any purchased add-on slots)
    const isArtistLocked = !!planLimits && usedArtists.length >= (planLimits.artistLimit + extraSlots);

    // Check if current artist is from the roster
    const isArtistFromRoster = usedArtists.some(a => (typeof a === 'string' ? a : a.name) === artistName);

    // Update featuringArtist validation when fieldRules change
    useEffect(() => {
        if (Object.keys(fieldRules).length > 0) {
            // Re-register the field with updated validation
            register('featuringArtist', {
                required: fieldRules.featuredArtists?.required ? 'Featuring artist is required' : false
            });
        }
    }, [fieldRules, register]);



    // Artist platform search (single BE-driven flow)
    const {
        searchResults,
        isSearching,
        hasSearched,
        activeSearchIndex,
        setActiveSearchIndex,
        handleSearch,
        getIndexResults,
        indexHasSearched,
        getCachedSearch,
        resetSearchForIndex,
        searchIndexKey,
    } = useArtistPlatformSearch()

    const hydratedArtistSearchRef = useRef<Set<string>>(new Set())

    // Modal/dialog state
    // - showAddonDialog: ₹500 "buy 1 extra artist" dialog (shown on the second-to-last plan)
    // - showUpgradeModal: full UpgradePlanModal with a single target plan (shown for tiers below second-to-last)
    const [showAddonDialog, setShowAddonDialog] = useState(false)
    const [showUpgradeModal, setShowUpgradeModal] = useState(false)
    const [upgradeTargetPlanKey, setUpgradeTargetPlanKey] = useState<string | undefined>(undefined)
    const [isPurchasingAddon, setIsPurchasingAddon] = useState(false)

    // Open the right "limit reached" UI based on the user's tier position.
    // - Tiers below second-to-last: UpgradePlanModal targeting the immediate next plan
    // - Second-to-last tier: ₹500 add-artist add-on dialog
    // - Last tier: contact-support toast
    const openUpgradeFlowForArtistLimit = useCallback(() => {
        const sorted = [...allPlans].sort((a, b) => a.pricePerYear - b.pricePerYear)
        const currentIdx = sorted.findIndex(p => p.key === planKey)
        const secondToLastIdx = sorted.length - 2

        if (sorted.length === 0 || currentIdx === -1) {
            setUpgradeTargetPlanKey(undefined)
            setShowUpgradeModal(true)
            return
        }

        if (currentIdx === secondToLastIdx) {
            setShowAddonDialog(true)
            return
        }

        if (currentIdx < secondToLastIdx) {
            setUpgradeTargetPlanKey(sorted[currentIdx + 1].key)
            setShowUpgradeModal(true)
            return
        }

        toast('Please contact support to add more artists.')
    }, [allPlans, planKey])

    // Handle adding a new artist
    const handleAddArtist = () => {
        const baseLimit = planLimits?.artistLimit ?? 1 // Default to 1 (strictest) if not loaded
        const effectiveLimit = baseLimit + extraSlots
        const blockedByFeatureRule = fieldRules.featuredArtists?.allow === false
        const blockedByCount = (1 + (artists?.length || 0)) >= effectiveLimit

        if (blockedByFeatureRule || blockedByCount) {
            openUpgradeFlowForArtistLimit()
            return
        }

        const currentArtists = artists || []
        setValue('artists', [...currentArtists, { name: '' }], { shouldValidate: true })
    }

    // Purchase one extra artist slot via Razorpay (uses generic /payments/create-order with addon key)
    const handleAddonPurchase = async () => {
        setIsPurchasingAddon(true)
        try {
            const result = await initiatePayment(ARTIST_ADDON_PLAN_KEY, {
                name: user?.fullName,
                email: user?.email,
            })
            if (result?.success) {
                toast.success('Extra artist slot added!')
                await refreshUser()
                setShowAddonDialog(false)
                setValue('artists', [...(artists || []), { name: '' }], { shouldValidate: true })
            }
        } catch (err) {
            // useRazorpay already surfaces toasts on errors
            console.error('Addon purchase failed:', err)
        } finally {
            setIsPurchasingAddon(false)
        }
    }

    // Handle removing an artist
    const handleRemoveArtist = (index: number) => {
        const currentArtists = artists || []
        const updated = currentArtists.filter((_, i) => i !== index)
        setValue('artists', updated, { shouldValidate: true })

        // If removing the currently searched artist, clear search
        if (activeSearchIndex === index) {
            setActiveSearchIndex(null)
            resetSearchForIndex(index)
        } else if (typeof activeSearchIndex === 'number' && activeSearchIndex > index) {
            // Shift active index if removing an item before it
            setActiveSearchIndex(activeSearchIndex - 1)
        }
    }

    // Handle updating an artist at a specific index
    const handleArtistChange = (index: number, name: string) => {
        const currentArtists = [...(artists || [])]
        const prevName = currentArtists[index]?.name?.trim() ?? ''
        const nextName = name.trim()

        if (prevName !== nextName) {
            currentArtists[index] = emptySecondaryArtistSlot(name)
        } else {
            currentArtists[index] = { ...currentArtists[index], name }
        }

        setValue('artists', currentArtists, { shouldValidate: true })
        handleSearch(name, index)
    }

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
            if (planLimits.artistLimit  === 1 && usedArtists.length > 0) {
                const previousArtistObj = usedArtists[0];
                const artistNameStr = typeof previousArtistObj === 'string' ? previousArtistObj : previousArtistObj.name;

                if (artistNameStr && artistNameStr !== artistName) {
                    setValue('artistName', artistNameStr, { shouldValidate: true })
                    handleSearch(artistNameStr, 'main')
                }

                // Set profiles if available (even if legacy string, useful for hydration matching)
                if (typeof previousArtistObj === 'object') {
                    applyRosterArtistToMainForm(setValue, previousArtistObj)
                    if (rosterArtistHasPendingProfiles(previousArtistObj)) {
                        setPendingProfileNotice(true)
                    }
                }
            }
        }

        if (user && planLimits) {
            checkAndPrefillArtist()
        }
    }, [user, setValue, planLimits, usedArtists, handleSearch]) // Removed artistName to avoid loops, handled inside

    // Hydrate lean profiles (id/url only) from search results — same as track-edit modal
    useEffect(() => {
        const hydrateMainProfiles = (results: ArtistSearchResults) => {
            if (!artistName) return

            const hydrateProfile = (
                platform: 'spotify' | 'apple',
                currentVal: unknown,
            ) => {
                if (!profileNeedsSearchHydration(currentVal)) return
                const rich = resolvePlatformProfile(
                    platform,
                    currentVal,
                    artistName,
                    results,
                    usedArtists,
                )
                if (!rich || rich === currentVal || typeof rich !== 'object') return
                if (platform === 'spotify') setValue('spotifyProfile', rich as UploadFormData['spotifyProfile'])
                if (platform === 'apple') setValue('appleMusicProfile', rich as UploadFormData['appleMusicProfile'])
            }

            hydrateProfile('spotify', spotifyProfile)
            hydrateProfile('apple', appleMusicProfile)
        }

        if (!isSearching && artistName) {
            const cached = getCachedSearch('main', artistName)
            if (cached?.hasSearched || (activeSearchIndex === 'main' && hasSearched)) {
                hydrateMainProfiles(cached?.results ?? searchResults)
            }
        }
    }, [
        searchResults,
        getCachedSearch,
        hasSearched,
        isSearching,
        activeSearchIndex,
        spotifyProfile,
        appleMusicProfile,
        artistName,
        usedArtists,
        setValue,
    ])

    // Apple profiles saved as URLs have no artist photo — fetch iTunes album-art fallback.
    useEffect(() => {
        if (!artistName || !profileNeedsAppleEnrichment(appleMusicProfile)) return

        const appleId = extractAppleArtistId(appleMusicProfile)
        if (!appleId) return

        let cancelled = false
        const storedUrl =
            typeof appleMusicProfile === 'string'
                ? appleMusicProfile
                : typeof appleMusicProfile === 'object' &&
                    appleMusicProfile !== null &&
                    typeof (appleMusicProfile as { url?: string }).url === 'string'
                  ? (appleMusicProfile as { url: string }).url
                  : `https://music.apple.com/artist/${appleId}`

        enrichArtistProfile({ appleId })
            .then((result) => {
                if (cancelled || !result.apple?.image) return
                setValue('appleMusicProfile', {
                    id: appleId,
                    name: artistName,
                    image: result.apple.image,
                    url: storedUrl,
                    track: result.apple.albumName || 'Apple Music',
                })
            })
            .catch(() => {})

        return () => {
            cancelled = true
        }
    }, [appleMusicProfile, artistName, setValue])

    // When artist name is pre-filled (edit/roster), run search once to load platform results
    useEffect(() => {
        if (!artistName || artistName.length < 2) return
        const cacheKey = `main:${artistName}`
        if (hydratedArtistSearchRef.current.has(cacheKey)) return
        const needsProfileHydration =
            profileNeedsSearchHydration(spotifyProfile) ||
            profileNeedsSearchHydration(appleMusicProfile) ||
            !getCachedSearch('main', artistName)?.hasSearched
        if (!needsProfileHydration) return
        hydratedArtistSearchRef.current.add(cacheKey)
        handleSearch(artistName, 'main')
    }, [artistName, spotifyProfile, appleMusicProfile, getCachedSearch, handleSearch])

    const handleMainArtistNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value
        const prevName = artistName?.trim() ?? ''
        if (prevName && prevName !== name.trim()) {
            clearMainArtistFormProfiles(setValue)
            resetSearchForIndex('main')
        }
        setValue('artistName', name, { shouldValidate: true })
        handleSearch(name, 'main')
    }

    // Helper to render search results for a specific index (main or numeric)
    const renderSearchResults = (index: number | 'main') => {
        const currentName = index === 'main' ? artistName : (artists && artists[index]?.name)
        if (!currentName || currentName.length < 2) return null

        const indexResults = getIndexResults(index, currentName)
        const isActiveSearch = activeSearchIndex === index
        const hasSearchedForIndex = indexHasSearched(index, currentName)

        const getCurrentProfile = (platform: PlatformKey) => {
            if (index === 'main') {
                if (platform === 'spotify') return spotifyProfile
                return appleMusicProfile
            }
            if (!artists || !artists[index]) return ''
            if (platform === 'spotify') return artists[index].spotifyProfile
            return artists[index].appleMusicProfile
        }

        const setCosmosArtistIdForIndex = (cosmosId: string) => {
            if (index === 'main') {
                setValue('cosmosArtistId', cosmosId, { shouldValidate: true })
            } else {
                const currentArtists = [...(artists || [])]
                currentArtists[index] = { ...currentArtists[index], cosmosArtistId: cosmosId }
                setValue('artists', currentArtists, { shouldValidate: true })
            }
        }

        const handleSelectProfile = (platform: PlatformKey, profile: unknown | 'new' | '') => {
            if (profile === '' && currentName) {
                const listKey = platform === 'spotify' ? 'spotify' : 'apple'
                if (!indexResults[listKey]?.length) {
                    handleSearch(currentName, index)
                }
            }

            const valueToSave = buildProfileValueToSave(profile)
            const field = profileFieldForPlatform(platform)

            if (index === 'main') {
                setValue(field, valueToSave as UploadFormData[typeof field], { shouldValidate: true })
            } else {
                const currentArtists = [...(artists || [])]
                currentArtists[index] = { ...currentArtists[index], [field]: valueToSave }
                setValue('artists', currentArtists, { shouldValidate: true })
            }

            if (
                profile &&
                typeof profile === 'object' &&
                typeof (profile as { cosmosId?: string }).cosmosId === 'string' &&
                (profile as { cosmosId: string }).cosmosId.trim()
            ) {
                setCosmosArtistIdForIndex((profile as { cosmosId: string }).cosmosId.trim())
            }

            if (index === 'main' && profile && profile !== 'new' && profile !== '') {
                setPendingProfileNotice(false)
            }
        }

        return (
            <ArtistPlatformPicker
                artistName={currentName}
                results={indexResults}
                isSearching={isSearching}
                isActiveSearch={isActiveSearch}
                hasSearchedForIndex={hasSearchedForIndex}
                spotifyProfile={getCurrentProfile('spotify')}
                appleMusicProfile={getCurrentProfile('apple')}
                onSelectProfile={handleSelectProfile}
                isArtistFromRoster={index === 'main' && isArtistFromRoster}
                usedArtists={usedArtists}
                profilesPendingNotice={index === 'main' && pendingProfileNotice}
            />
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
                            {planLimits && planLimits.artistLimit < Infinity && (() => {
                                const effectiveLimit = planLimits.artistLimit + extraSlots
                                return (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <AlertCircle className="h-3 w-3" />
                                        <span>
                                            Plan limit: {effectiveLimit} artist{effectiveLimit > 1 ? 's' : ''} only
                                            {extraSlots > 0 && (
                                                <span className="text-primary"> ({planLimits.artistLimit} + {extraSlots} add-on)</span>
                                            )}
                                        </span>
                                    </div>
                                )
                            })()}
                        </div>
                    </div>
                </div>

                {/* ── Artist 1 Card ───────────────────────────────────── */}
                <div className="rounded-lg border-2 border-primary/40 p-4 space-y-4 bg-primary/10">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Main Artist</p>
                    <div className="relative space-y-3">
                        {/* Main Artist Field */}
                        <div className="relative flex items-center gap-2">
                            <div className="flex-1 relative space-y-2">
                                {/* Artist Selection Dropdown - Show if we have used artists */}
                                {usedArtists.length > 0 && !creatingNewMain && (artistName === '' || usedArtists.some(a => (typeof a === 'string' ? a : a.name) === artistName)) && (
                                    <div className="relative">
                                        <Select
                                            value={usedArtists.find(a => (typeof a === 'string' ? a : a.name) === artistName) ? artistName : (isArtistLocked ? '' : 'new')}
                                            onValueChange={(val) => {
                                                if (val === 'new') {
                                                    if (isArtistLocked) {
                                                        setShowUpgradeModal(true);
                                                    } else {
                                                        clearMainArtistFormProfiles(setValue)
                                                        setValue('artistName', '', { shouldValidate: true })
                                                        setActiveSearchIndex('main')
                                                        resetSearchForIndex('main')
                                                        setCreatingNewMain(true)
                                                        setPendingProfileNotice(false)
                                                    }
                                                } else {
                                                    const selectedArtist = usedArtists.find(a => rosterArtistName(a) === val);
                                                    if (selectedArtist) {
                                                        const name = rosterArtistName(selectedArtist);
                                                        clearMainArtistFormProfiles(setValue)
                                                        setValue('artistName', name, { shouldValidate: true });
                                                        applyRosterArtistToMainForm(setValue, selectedArtist)
                                                        handleSearch(name, 'main');
                                                        setPendingProfileNotice(
                                                            rosterArtistHasPendingProfiles(selectedArtist),
                                                        )
                                                    }
                                                }
                                            }}
                                        >
                                            <SelectTrigger className={errors.artistName ? 'border-red-500' : ''}>
                                                <SelectValue placeholder="Select an artist" />
                                            </SelectTrigger>
                                            <SelectContent className="z-[999]">
                                                {usedArtists.filter(ua => {
                                                    const name = typeof ua === 'string' ? ua : ua.name;
                                                    return name === artistName || !artists.some(a => a.name === name);
                                                }).map((artist, i) => {
                                                    const name = typeof artist === 'string' ? artist : artist.name;
                                                    const pending =
                                                        typeof artist === 'object' &&
                                                        rosterArtistHasPendingProfiles(artist);
                                                    return (
                                                        <SelectItem key={i} value={name}>
                                                            <div className="flex items-center gap-2">
                                                                <UserCheck className="h-4 w-4 text-primary" />
                                                                <span>{name}</span>
                                                                {pending && (
                                                                    <span className="text-[10px] text-amber-500 font-medium">
                                                                        profiles pending
                                                                    </span>
                                                                )}
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

                                {(!usedArtists.length || creatingNewMain || (artistName !== '' && !usedArtists.some(a => (typeof a === 'string' ? a : a.name) === artistName))) && (
                                    <div className="relative flex items-center gap-2">
                                        <div className="relative flex-1">
                                            <Input
                                                id="artistName"
                                                placeholder="Your artist name"
                                                {...register('artistName')}
                                                onChange={(e) => {
                                                    register('artistName').onChange(e)
                                                    handleMainArtistNameChange(e)
                                                }}
                                                onFocus={() => !isArtistLocked && setActiveSearchIndex('main')}
                                                readOnly={isArtistLocked || !!spotifyProfile || !!appleMusicProfile}
                                                className={`${errors.artistName ? 'border-red-500' : ''} ${(isArtistLocked || !!spotifyProfile || !!appleMusicProfile) ? 'bg-muted text-muted-foreground cursor-not-allowed pr-10' : ''} ${(usedArtists.length > 0 || !!spotifyProfile || !!appleMusicProfile) && !isArtistLocked ? 'pr-24' : ''}`}
                                            />
                                            {(usedArtists.length > 0 || !!spotifyProfile || !!appleMusicProfile) && !isArtistLocked && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setCreatingNewMain(false);
                                                        clearMainArtistFormProfiles(setValue)
                                                        setValue('artistName', '');
                                                        setActiveSearchIndex('main');
                                                        resetSearchForIndex('main');
                                                    }}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white font-medium bg-primary px-2 py-1 rounded-[5px] hover:bg-primary/80"
                                                >
                                                    Change Artist
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        {errors.artistName && <p className="text-xs text-red-500 mt-1">{errors.artistName.message}</p>}


                        {/* Artist Not Found Message */}
                        {getCachedSearch('main', artistName)?.hasSearched && !isSearching &&
                            (getCachedSearch('main', artistName)?.results.spotify.length ?? 0) === 0 &&
                            (getCachedSearch('main', artistName)?.results.apple.length ?? 0) === 0 &&
                            artistName.length >= 2 &&
                            !spotifyProfile &&
                            !appleMusicProfile && (
                                <div className="mt-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
                                    <p className="text-sm text-yellow-600 dark:text-yellow-400">
                                        Artist not found. Please upload music via a distributor to create a Spotify profile
                                    </p>
                                </div>
                            )}

                        {/* Main Artist Search Results */}
                        {renderSearchResults('main')}

                        {/* Main Artist Social Media Profiles */}
                        <div className="pt-4 border-t border-border/50">
                            <div className="grid grid-cols-2 gap-4">
                                {/* Instagram */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="instagramUrl" className="text-sm font-medium flex items-center gap-2">
                                        <span className="text-[#E4405F] font-bold">Instagram</span>
                                        <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
                                    </Label>
                                    <Input
                                        id="instagramUrl"
                                        placeholder="https://instagram.com/..."
                                        {...register('instagramProfileUrl')}
                                        className="text-sm"
                                    />
                                </div>

                                {/* Facebook */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="facebookUrl" className="text-sm font-medium flex items-center gap-2">
                                        <span className="text-[#1877F2] font-bold">Facebook</span>
                                        <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
                                    </Label>
                                    <Input
                                        id="facebookUrl"
                                        placeholder="https://facebook.com/..."
                                        {...register('facebookProfileUrl')}
                                        className="text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div> {/* end Artist 1 Card */}
                {/* Secondary Artist Cards */}
                {artists && artists.length > 0 && (
                    <div className="space-y-4">
                        {artists.map((artist, index) => (
                            <div key={index} className="rounded-lg border-2 border-primary/40 p-4 space-y-4 bg-primary/10 p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Artist {index + 2}</p>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemoveArtist(index)}
                                        className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="relative space-y-2">
                                    {usedArtists.length > 0 && !creatingNewSecondary[index] && (!artist.name || usedArtists.some(a => (typeof a === 'string' ? a : a.name) === artist.name)) && (
                                        <div className="relative">
                                            <Select
                                                value={usedArtists.find(a => (typeof a === 'string' ? a : a.name) === artist.name) ? artist.name : (artist.name ? 'new' : '')}
                                                onValueChange={(val) => {
                                                    if (val === 'new') {
                                                        const currentArtists = [...(artists || [])]
                                                        currentArtists[index] = emptySecondaryArtistSlot('')
                                                        setValue('artists', currentArtists, { shouldValidate: true })
                                                        setActiveSearchIndex(index);
                                                        resetSearchForIndex(index);
                                                        setCreatingNewSecondary(prev => ({ ...prev, [index]: true }));
                                                    } else {
                                                        const selectedArtist = usedArtists.find(a => rosterArtistName(a) === val);
                                                        if (selectedArtist) {
                                                            const name = rosterArtistName(selectedArtist);
                                                            const currentArtists = [...(artists || [])]
                                                            currentArtists[index] = applyRosterArtistToSecondarySlot(selectedArtist)
                                                            setValue('artists', currentArtists, { shouldValidate: true })
                                                            handleSearch(name, index);
                                                        }
                                                    }
                                                }}
                                            >
                                                <SelectTrigger className={errors.artists?.[index]?.name ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder={`Select Artist ${index + 2}`} />
                                                </SelectTrigger>
                                                <SelectContent className="z-[999]">
                                                    {usedArtists.filter(ua => {
                                                        const name = typeof ua === 'string' ? ua : ua.name;
                                                        if (name === artistName) return false;
                                                        return name === artist.name || !artists.some((a, idx) => idx !== index && a.name === name);
                                                    }).map((ua, i) => {
                                                        const name = typeof ua === 'string' ? ua : ua.name;
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
                                        </div>
                                    )}

                                    {(!usedArtists.length || creatingNewSecondary[index] || (artist.name && !usedArtists.some(a => (typeof a === 'string' ? a : a.name) === artist.name))) && (
                                        <div className="relative flex items-center gap-2 w-full">
                                            <div className="relative flex-1">
                                                <Input
                                                    placeholder={`Artist ${index + 2} name`}
                                                    value={artist.name}
                                                    onChange={(e) => handleArtistChange(index, e.target.value)}
                                                    className={`w-full ${usedArtists.length > 0 ? 'pr-24' : 'pr-10'}`}
                                                    onFocus={() => setActiveSearchIndex(index)}
                                                />
                                                {usedArtists.length > 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setCreatingNewSecondary(prev => ({ ...prev, [index]: false }));
                                                            const currentArtists = [...(artists || [])]
                                                            currentArtists[index] = emptySecondaryArtistSlot('')
                                                            setValue('artists', currentArtists, { shouldValidate: true })
                                                            resetSearchForIndex(index);
                                                        }}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-primary hover:text-primary/80 font-medium bg-background pl-2"
                                                    >
                                                        Change Artist
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {/* Secondary Artist Search Results */}
                                {renderSearchResults(index)}

                                {/* Secondary Artist Social Media Profiles - only show when artist is selected */}
                                {artist.name && <div className="pt-4 border-t border-border/50">
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Instagram */}
                                        <div className="space-y-1.5">
                                            <Label className="text-sm font-medium flex items-center gap-2">
                                                <span className="text-[#E4405F] font-bold">Instagram</span>
                                                <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
                                            </Label>
                                            <Input
                                                placeholder="https://instagram.com/..."
                                                value={((artist.instagramProfile || '').startsWith('http') ? artist.instagramProfile : '') || ''}
                                                onChange={(e) => {
                                                    const currentArtists = [...(artists || [])]
                                                    currentArtists[index] = { ...currentArtists[index], instagramProfile: e.target.value }
                                                    setValue('artists', currentArtists, { shouldValidate: true })
                                                }}
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
                                                value={((artist.facebookProfile || '').startsWith('http') ? artist.facebookProfile : '') || ''}
                                                onChange={(e) => {
                                                    const currentArtists = [...(artists || [])]
                                                    currentArtists[index] = { ...currentArtists[index], facebookProfile: e.target.value }
                                                    setValue('artists', currentArtists, { shouldValidate: true })
                                                }}
                                                className="text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                                }
                            </div>
                        ))}
                    </div>
                )}

                {/* Add Artist Button */}
                {areFeaturedArtistsAllowed && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddArtist}
                        className="w-full border-dashed border-primary/50 bg-primary/5 hover:bg-primary/10 gap-2 text-primary hover:text-primary transition-colors py-6"
                    >
                        <Plus className="h-5 w-5" />
                        <span className="font-semibold">Add Another Artist</span>
                    </Button>
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
                            <option value="remix" disabled={!allowedFormats.includes('remix')}>
                                Remix {!allowedFormats.includes('remix') ? `(Creator+ Plan)` : ''}
                            </option>
                            <option value="compilation" disabled={!allowedFormats.includes('compilation')}>
                                Compilation {!allowedFormats.includes('compilation') ? `(Creator+ Plan)` : ''}
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
                        onClick={(e) => e.currentTarget.showPicker()}
                        className={errors.releaseDate ? 'border-red-500' : ''}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                        Release date must be at least 2 days from today.
                    </p>
                    {errors.releaseDate && <p className="text-xs text-red-500 mt-1">{errors.releaseDate.message}</p>}
                </div>
                {/* Label Name Field - editable on paid plans; locked to default on free */}
                <div className="space-y-3 pt-6 border-t border-border">
                    <Label htmlFor="labelName" className="text-lg font-semibold">
                        Label Name <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                        name="labelName"
                        control={control}
                        render={({ field }) => (
                            <Input
                                id="labelName"
                                placeholder="Enter Label Name"
                                value={isLabelNameAllowed ? (field.value ?? '') : defaultLabelName}
                                onChange={(event) => {
                                    if (!isLabelNameAllowed) {
                                        field.onChange(defaultLabelName)
                                        return
                                    }
                                    field.onChange(event.target.value)
                                }}
                                onBlur={field.onBlur}
                                onPaste={(event) => {
                                    if (!isLabelNameAllowed) {
                                        event.preventDefault()
                                    }
                                }}
                                onKeyDown={(event) => {
                                    if (!isLabelNameAllowed) {
                                        event.preventDefault()
                                    }
                                }}
                                readOnly={!isLabelNameAllowed}
                                className={errors.labelName ? 'border-red-500' : ''}
                            />
                        )}
                    />
                    {!isLabelNameAllowed && (
                        <div className="flex items-start gap-2 p-2 bg-muted/50 rounded-md text-xs text-muted-foreground">
                            <Info className="h-3 w-3 mt-0.5" />
                            <span>Free plan releases use the default label ({defaultLabelName}). Upgrade to set a custom label name.</span>
                        </div>
                    )}
                    {errors.labelName && (
                        <p className="text-xs text-red-500 mt-1">{errors.labelName.message}</p>
                    )}
                </div>

                {/* UPC Field */}
                <div className="space-y-3 pt-6 border-t border-border">
                    <div className="flex items-center gap-2">
                        <Label htmlFor="upc" className="text-lg font-semibold">
                            UPC
                        </Label>
                        <div className="group relative">
                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                            <div className="invisible group-hover:visible absolute left-0 top-6 z-50 w-72 p-3 bg-popover border border-border rounded-md shadow-lg text-xs">
                                <p className="font-medium mb-1">Don't have a UPC?</p>
                                <p className="text-muted-foreground">
                                    If you don't have a UPC, or it is less than 13 characters, leave this field empty and we will generate one for you.
                                </p>
                            </div>
                        </div>
                    </div>

                    <Input
                        id="upc"
                        placeholder="Enter 13-digit UPC"
                        {...register('upc')}
                        maxLength={13}
                        className={errors.upc ? 'border-red-500' : ''}
                    />
                    {/* <p className="text-xs text-muted-foreground">
                        UPC must be exactly 13 digits. Leave empty for auto-generation.
                    </p> */}
                    {errors.upc && (
                        <p className="text-xs text-red-500 mt-1">{errors.upc.message}</p>
                    )}
                </div>

                {/* Add-on dialog: shown on the second-to-last plan, lets the user buy 1 extra artist slot */}
                <Dialog open={showAddonDialog} onOpenChange={(open) => !isPurchasingAddon && setShowAddonDialog(open)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Artist Limit Reached</DialogTitle>
                            <DialogDescription>
                                You have reached the maximum number of artists allowed on your current plan.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            <div className="p-4 bg-primary/10 rounded-lg border border-primary flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-primary">Add Extra Artist Slot</p>
                                    <p className="text-sm text-muted-foreground">Add one more artist to your current plan</p>
                                </div>
                                <div className="text-right">
                                    <span className="font-bold text-lg">₹{ARTIST_ADDON_PRICE_INR}</span>
                                </div>
                            </div>

                            {/* <div className="mt-5">
                                <p className="text-sm font-semibold text-foreground mb-3">Select Billing Frequency</p>
                                
                                <div className="grid grid-cols-2 gap-3 w-full">
                                    <div 
                                        onClick={() => setIsAddonAutoPay(true)} 
                                        className={`cursor-pointer rounded-lg border-2 p-2.5 flex flex-col items-center justify-center transition-all ${isAddonAutoPay ? 'border-primary bg-primary/5' : 'border-border bg-transparent hover:bg-muted/50'}`}
                                    >
                                        <RefreshCw className={`h-4 w-4 mb-1.5 ${isAddonAutoPay ? 'text-primary' : 'text-muted-foreground'}`} />
                                        <span className={`font-semibold text-xs ${isAddonAutoPay ? 'text-foreground' : 'text-muted-foreground'}`}>Subscription</span>
                                        <span className="text-[10px] text-muted-foreground mt-0.5 text-center leading-tight">Auto-renews annually</span>
                                    </div>
                                    
                                    <div 
                                        onClick={() => setIsAddonAutoPay(false)} 
                                        className={`cursor-pointer rounded-lg border-2 p-2.5 flex flex-col items-center justify-center transition-all ${!isAddonAutoPay ? 'border-primary bg-primary/5' : 'border-border bg-transparent hover:bg-muted/50'}`}
                                    >
                                        <CreditCard className={`h-4 w-4 mb-1.5 ${!isAddonAutoPay ? 'text-primary' : 'text-muted-foreground'}`} />
                                        <span className={`font-semibold text-xs ${!isAddonAutoPay ? 'text-foreground' : 'text-muted-foreground'}`}>One-time</span>
                                        <span className="text-[10px] text-muted-foreground mt-0.5 text-center leading-tight">Pay for 1 year only</span>
                                    </div>
                                </div>
                            </div> */}
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowAddonDialog(false)} disabled={isPurchasingAddon}>Cancel</Button>
                            <Button onClick={handleAddonPurchase} disabled={isPurchasingAddon}>
                                {isPurchasingAddon ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Processing…
                                    </>
                                ) : (
                                    'Pay & Add Artist'
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Upgrade modal: shown for tiers below the second-to-last plan, targets the immediate next tier */}
                <UpgradePlanModal
                    isOpen={showUpgradeModal}
                    onClose={() => setShowUpgradeModal(false)}
                    currentPlanKey={planKey}
                    targetPlanKey={upgradeTargetPlanKey}
                    title="Upgrade to add more artists"
                    subtitle="Your current plan does not allow more artists. Upgrade to continue."
                />
            </div>
        </div>
    )
}



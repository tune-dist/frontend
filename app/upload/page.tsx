'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { submitNewSubmission } from '@/lib/api/submissions'
import { useAuth } from '@/contexts/AuthContext'

export default function UploadPage() {
    const router = useRouter()
    const { user } = useAuth()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formErrors, setFormErrors] = useState<string[]>([])
    const [formData, setFormData] = useState({
        // Basic track info
        title: '',
        artistName: '',
        numberOfSongs: '1',

        // Release info
        previouslyReleased: 'no',
        releaseDate: '',
        recordLabel: '',
        language: '',
        primaryGenre: '',
        secondaryGenre: '',

        // Social media & platforms
        socialMediaPack: false,
        spotifyProfile: '',
        appleMusicProfile: '',
        youtubeMusicProfile: '',
        instagramProfile: 'no',
        instagramProfileUrl: '',
        facebookProfile: 'no',
        facebookProfileUrl: '',

        // Files
        coverArt: null as File | null,
        coverArtPreview: '',
        audioFile: null as File | null,
        audioFileName: '',

        // Track details
        artworkConfirmed: false,
        explicitLyrics: 'no',
        radioEdit: 'no',
        instrumental: 'no',
        previewClipStartTime: 'auto',
    })

    const [songwriters, setSongwriters] = useState<Array<{
        role: string;
        firstName: string;
        middleName: string;
        lastName: string;
    }>>([{
        role: 'Music and lyrics',
        firstName: '',
        middleName: '',
        lastName: ''
    }])

    // Prefill title with user name as requested
    useEffect(() => {
        console.log(user, 'user')
        if (user?.fullName && !formData.title) {
            setFormData(prev => ({
                ...prev,
                title: user.fullName // "Track 1 title should be same as logged in user name"
            }))
        }
    }, [user, formData.title]) // formData.title dependency ensures we only do it once if empty

    const [mandatoryChecks, setMandatoryChecks] = useState({
        youtubeConfirmation: false,
        capitalizationConfirmation: false,
        promoServices: false,
        rightsAuthorization: false,
        nameUsage: false,
        termsAgreement: false,
    })

    const [isSearching, setIsSearching] = useState(false)
    const [searchResults, setSearchResults] = useState<{
        spotify: any[];
        apple: any[];
        youtube: any[];
    }>({ spotify: [], apple: [], youtube: [] })

    const searchTimeout = useRef<NodeJS.Timeout>()

    const addSongwriter = () => {
        setSongwriters([...songwriters, {
            role: 'Music and lyrics',
            firstName: '',
            middleName: '',
            lastName: ''
        }])
    }

    const updateSongwriter = (index: number, field: string, value: string) => {
        const updated = [...songwriters]
        updated[index] = { ...updated[index], [field]: value }
        setSongwriters(updated)
    }

    const removeSongwriter = (index: number) => {
        if (songwriters.length > 1) {
            setSongwriters(songwriters.filter((_, i) => i !== index))
        }
    }


    const handleArtistNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value
        setFormData({ ...formData, artistName: name })

        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current)
        }

        if (name.length > 2) {
            setIsSearching(true)
            searchTimeout.current = setTimeout(async () => {
                try {
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

                    // Call both Spotify and YouTube search APIs in parallel
                    const [spotifyResponse, youtubeResponse] = await Promise.all([
                        fetch(`${apiUrl}/integrations/spotify/search?q=${encodeURIComponent(name)}&limit=5`)
                            .catch(err => {
                                console.error('Spotify search error:', err)
                                return null
                            }),
                        fetch(`${apiUrl}/integrations/youtube/search?q=${encodeURIComponent(name)}&limit=5`)
                            .catch(err => {
                                console.error('YouTube search error:', err)
                                return null
                            })
                    ])

                    const spotifyArtists = spotifyResponse?.ok ? await spotifyResponse.json() : []
                    const youtubeChannels = youtubeResponse?.ok ? await youtubeResponse.json() : []

                    setSearchResults({
                        spotify: spotifyArtists,
                        apple: [], // TODO: Implement Apple Music search
                        youtube: youtubeChannels
                    })
                } catch (error) {
                    console.error('Search error:', error)
                    setSearchResults({ spotify: [], apple: [], youtube: [] })
                } finally {
                    setIsSearching(false)
                }
            }, 1000)
        } else {
            setSearchResults({ spotify: [], apple: [], youtube: [] })
            setIsSearching(false)
        }
    }

    // Album Cover Upload Handlers
    const handleCoverArtChange = (file: File) => {
        console.log('🖼️ Album cover upload started:', file.name)

        if (!file.type.startsWith('image/')) {
            console.log('❌ Invalid file type:', file.type)
            alert('Please upload an image file (JPG, PNG, etc.)')
            return
        }
        console.log('✅ File type valid:', file.type)

        if (file.size > 10 * 1024 * 1024) {
            console.log('❌ File too large:', (file.size / 1024 / 1024).toFixed(2), 'MB')
            alert('File size must be less than 10MB')
            return
        }
        console.log('✅ File size valid:', (file.size / 1024 / 1024).toFixed(2), 'MB')

        const reader = new FileReader()
        reader.onloadend = () => {
            const img = new Image()
            img.onload = () => {
                console.log('📏 Image dimensions:', img.width, 'x', img.height)

                if (img.width < 1000 || img.height < 1000) {
                    console.log('❌ Image too small! Minimum is 1000x1000')
                    alert('Image dimensions must be at least 1000x1000 pixels. Recommended: 3000x3000 pixels')
                    return
                }
                console.log('✅ Image dimensions valid')

                setFormData({
                    ...formData,
                    coverArt: file,
                    coverArtPreview: reader.result as string
                })
                console.log('✅ Image accepted and preview set')
            }
            img.src = reader.result as string
        }
        reader.readAsDataURL(file)
    }

    const handleCoverArtDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        const file = e.dataTransfer.files[0]
        if (file) {
            handleCoverArtChange(file)
        }
    }

    const handleCoverArtDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
    }

    const handleCoverArtClick = () => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'image/*'
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0]
            if (file) {
                handleCoverArtChange(file)
            }
        }
        input.click()
    }

    // Audio File Upload Handlers
    const handleAudioFileChange = (file: File) => {
        const validFormats = ['audio/wav', 'audio/mpeg', 'audio/mp4', 'audio/flac', 'audio/aiff', 'audio/x-ms-wma', 'audio/x-m4a']

        if (!validFormats.some(format => file.type.includes(format.split('/')[1]))) {
            alert('Please upload a valid audio file (WAV, MP3, M4A, FLAC, AIFF, WMA)')
            return
        }

        if (file.size > 500 * 1024 * 1024) {
            alert('File size must be less than 500MB')
            return
        }

        setFormData({
            ...formData,
            audioFile: file,
            audioFileName: file.name
        })
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

    const handleSubmit = async () => {
        // Clear previous errors
        setFormErrors([])
        const errors: string[] = []

        // Validate required fields
        if (!formData.title?.trim()) {
            errors.push('Please enter a song title')
        }
        if (!formData.artistName?.trim()) {
            errors.push('Please enter an artist name')
        }
        if (!formData.primaryGenre) {
            errors.push('Please select a primary genre')
        }
        if (!formData.language) {
            errors.push('Please select a language')
        }
        if (!formData.releaseDate) {
            errors.push('Please select a release date')
        }
        if (!formData.coverArt) {
            errors.push('Please upload an album cover')
        }
        if (!formData.artworkConfirmed) {
            errors.push('Please confirm that your artwork meets the requirements')
        }
        if (!formData.audioFile) {
            errors.push('Please upload an audio file')
        }

        if (!mandatoryChecks.promoServices || !mandatoryChecks.rightsAuthorization || !mandatoryChecks.nameUsage || !mandatoryChecks.termsAgreement) {
            errors.push('Please agree to all mandatory checkboxes at the bottom of the form')
        }


        // Detect conditions for conditional checkboxes
        const hasIrregularCapitalization = (text: string) => {
            if (!text) return false
            // Simple check: mixed case that looks "weird" (e.g. "TiTle", "NAME")
            // This is a heuristic. For now, true if it contains uppercase inside the word (excluding first letter)
            // or if it's ALL CAPS (if length > 3)
            // Better heuristic:
            // 1. Not Title Case (First letter of each word caps)
            // 2. Not Sentence case (First letter of sentence caps)
            // 3. Not all lowercase

            // For this impl, let's just use a simple regex for "weird" casing often flagged
            // e.g. "cApiTaliZaTiOn"
            return /[a-z][A-Z]/.test(text) || (text === text.toUpperCase() && text.length > 3)
        }

        const needsCapitalizationCheck = hasIrregularCapitalization(formData.title) || hasIrregularCapitalization(formData.artistName)
        // Assume YouTube is selected by default or if profile is non-empty (logic can be refined)
        const isYoutubeSelected = true // Defaulting to true as per "Select Stores" usually defaults to all

        if (needsCapitalizationCheck && !mandatoryChecks.capitalizationConfirmation) {
            errors.push('Please confirm the non-standard capitalization')
        }
        if (isYoutubeSelected && !mandatoryChecks.youtubeConfirmation) {
            errors.push('Please confirm the YouTube Music selection')
        }
        if (!mandatoryChecks.promoServices || !mandatoryChecks.rightsAuthorization || !mandatoryChecks.nameUsage || !mandatoryChecks.termsAgreement) {
            errors.push('Please agree to all mandatory checkboxes at the bottom of the form')
        }

        if (errors.length > 0) {
            setFormErrors(errors)
            alert(errors.join('\n'))
            return
        }

        setIsSubmitting(true)
        try {


            // Prepare songwriter credits
            const writers = songwriters
                .filter(s => s.firstName || s.lastName)
                .map(s => `${s.firstName} ${s.middleName} ${s.lastName}`.trim())



            // Submit to backend
            const result = await submitNewSubmission({
                title: formData.title,
                artistName: formData.artistName,
                numberOfSongs: formData.numberOfSongs,

                previouslyReleased: formData.previouslyReleased,
                releaseDate: formData.releaseDate,
                recordLabel: formData.recordLabel,
                language: formData.language,
                primaryGenre: formData.primaryGenre,
                secondaryGenre: formData.secondaryGenre,

                socialMediaPack: formData.socialMediaPack,
                spotifyProfile: formData.spotifyProfile,
                appleMusicProfile: formData.appleMusicProfile,
                youtubeMusicProfile: formData.youtubeMusicProfile,
                instagramProfile: formData.instagramProfile,
                instagramProfileUrl: formData.instagramProfileUrl,
                facebookProfile: formData.facebookProfile,
                facebookProfileUrl: formData.facebookProfileUrl,

                coverArt: formData.coverArt!,
                coverArtPreview: formData.coverArtPreview,
                audioFile: formData.audioFile!,
                audioFileName: formData.audioFileName,

                artworkConfirmed: formData.artworkConfirmed,
                explicitLyrics: formData.explicitLyrics,
                radioEdit: formData.radioEdit,
                instrumental: formData.instrumental,
                previewClipStartTime: formData.previewClipStartTime,

                // Computed/Legacy fields
                releaseType: 'single', // or derive from numberOfSongs
                writers: writers.length > 0 ? writers : undefined,
                selectedPlatforms: [
                    formData.spotifyProfile !== '' ? 'Spotify' : undefined,
                    formData.appleMusicProfile !== '' ? 'Apple Music' : undefined,
                    formData.youtubeMusicProfile !== '' ? 'YouTube Music' : undefined,
                ].filter(Boolean) as string[],
            })

            console.log('✅ Release created successfully:', result)
            alert('Your music has been uploaded successfully!')
            // router.push('/dashboard')
        } catch (error: any) {
            console.error('❌ Upload failed:', error)
            alert(error.message || 'Upload failed. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-border">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="flex items-center gap-2 text-foreground/80 hover:text-foreground transition-colors">
                            <ArrowLeft className="h-4 w-4" />
                            <span>Back to Home</span>
                        </Link>
                        <h1 className="text-xl font-bold animated-gradient">TuneFlow</h1>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-2xl mx-auto"
                >
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold mb-2">
                            Upload Your <span className="animated-gradient">Music</span>
                        </h1>
                        <p className="text-muted-foreground">
                            Distribute your music to major streaming platforms
                        </p>
                    </div>

                    <div className="bg-card border border-border rounded-lg p-6 space-y-8">

                        {/* Number of Songs */}
                        <div className="space-y-3 pt-6 border-t border-border">
                            <Label htmlFor="numberOfSongs" className="text-lg font-semibold">
                                Number of songs
                            </Label>
                            <select
                                id="numberOfSongs"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                value={formData.numberOfSongs}
                                onChange={(e) => setFormData({ ...formData, numberOfSongs: e.target.value })}
                            >
                                {[...Array(16)].map((_, i) => (
                                    <option key={i + 1} value={String(i + 1)}>
                                        {i + 1} song{i > 0 ? 's' : ' (a single)'}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Social Media Pack */}
                        <div className="space-y-4 pt-6 border-t border-border">
                            <h3 className="text-lg font-semibold">
                                Monetize your single on social media?
                            </h3>

                            <div className="flex items-start space-x-3 p-6 rounded-lg border border-border bg-accent/5">
                                <input
                                    type="checkbox"
                                    id="socialMediaPack"
                                    checked={formData.socialMediaPack}
                                    onChange={(e) => setFormData({ ...formData, socialMediaPack: e.target.checked })}
                                    className="h-4 w-4 mt-1 rounded border-input text-primary focus:ring-2 focus:ring-primary"
                                />
                                <div className="flex-1 space-y-3">
                                    <Label htmlFor="socialMediaPack" className="text-base font-medium cursor-pointer">
                                        💰 Social Media Pack{' '}
                                        <span className="text-primary font-semibold">
                                            ($4.95/yr + 20% of platform ad revenue)
                                        </span>
                                    </Label>

                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Get notified & paid when your music is used in content on YouTube, TikTok,
                                        Instagram, and Facebook.
                                    </p>

                                    <div className="mt-4 space-y-2.5 pt-3">
                                        <p className="text-sm font-semibold text-foreground">
                                            Your music will be added to:
                                        </p>
                                        <div className="space-y-2 text-sm text-muted-foreground">
                                            <div className="flex items-start gap-2.5">
                                                <span className="text-red-500 text-base">▶️</span>
                                                <span>YouTube's Content ID, Creator Music, and Shorts music libraries.</span>
                                            </div>
                                            <div className="flex items-start gap-2.5">
                                                <span className="text-base">🎵</span>
                                                <span>TikTok's music ID recognition service.</span>
                                            </div>
                                            <div className="flex items-start gap-2.5">
                                                <span className="text-pink-500 text-base">📷</span>
                                                <span>Instagram monetization with Meta Rights Manager.</span>
                                            </div>
                                            <div className="flex items-start gap-2.5">
                                                <span className="text-blue-500 text-base">👥</span>
                                                <span>Facebook's recognition service using Meta Rights Manager.</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Previously Released */}
                        <div className="space-y-3 pt-6 border-t border-border">
                            <Label className="text-lg font-semibold">
                                Has this single been previously released?
                            </Label>
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        id="previouslyReleased-no"
                                        name="previouslyReleased"
                                        value="no"
                                        checked={formData.previouslyReleased === 'no'}
                                        onChange={(e) => setFormData({ ...formData, previouslyReleased: e.target.value })}
                                        className="h-4 w-4 border-primary text-primary focus:ring-primary"
                                    />
                                    <Label htmlFor="previouslyReleased-no" className="font-normal cursor-pointer">No</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        id="previouslyReleased-yes"
                                        name="previouslyReleased"
                                        value="yes"
                                        checked={formData.previouslyReleased === 'yes'}
                                        onChange={(e) => setFormData({ ...formData, previouslyReleased: e.target.value })}
                                        className="h-4 w-4 border-primary text-primary focus:ring-primary"
                                    />
                                    <Label htmlFor="previouslyReleased-yes" className="font-normal cursor-pointer">Yes</Label>
                                </div>
                            </div>
                        </div>

                        {/* Artist Name Input */}
                        <div className="space-y-3 pt-6 border-t border-border">
                            <Label htmlFor="artistName" className="text-lg font-semibold">
                                Artist/band name
                            </Label>
                            <Input
                                id="artistName"
                                placeholder="Enter artist name"
                                value={formData.artistName}
                                onChange={handleArtistNameChange}
                                className="text-lg py-6"
                            />
                            <div className="text-xs text-muted-foreground space-y-1">
                                <p>💡 Important: Only list your name, stage name,  or band name.</p>
                                <p>💡 Don't Use Emojis Here: Streaming services do not allow them.</p>
                            </div>
                        </div>

                        {/* Platform Profile Sections - Only show when artist name is entered */}
                        {formData.artistName.length > 2 && (
                            <>
                                {/* Spotify Profile Selection */}
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="space-y-4 pt-6 border-t border-border"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-[#1DB954] font-bold text-xl">Spotify</span>
                                        <h3 className="text-lg font-semibold">Artist already in Spotify?</h3>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        There are already artists named "{formData.artistName}" live on Spotify. Are any of these you?
                                    </p>

                                    {isSearching ? (
                                        <div className="flex items-center justify-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {searchResults.spotify.length > 0 ? (
                                                searchResults.spotify.map((profile) => (
                                                    <div
                                                        key={profile.id}
                                                        className={`flex items-center space-x-4 p-3 rounded-lg border cursor-pointer transition-colors ${formData.spotifyProfile === profile.id
                                                            ? 'border-primary bg-primary/5'
                                                            : 'border-border hover:bg-accent/50'
                                                            }`}
                                                        onClick={() => setFormData({ ...formData, spotifyProfile: profile.id })}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="spotifyProfile"
                                                            checked={formData.spotifyProfile === profile.id}
                                                            onChange={() => { }}
                                                            className="h-4 w-4 border-primary text-primary"
                                                        />
                                                        <img src={profile.image} alt={profile.name} className="h-10 w-10 rounded-full object-cover" />
                                                        <div className="flex-1">
                                                            <p className="font-medium text-primary">{profile.name}</p>
                                                            <p className="text-sm text-muted-foreground">{profile.track}</p>
                                                        </div>
                                                        {profile.url && (
                                                            <a
                                                                href={profile.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="p-2 hover:bg-background rounded-full transition-colors text-muted-foreground hover:text-primary"
                                                                title="Open in Spotify"
                                                            >
                                                                <ExternalLink className="h-4 w-4" />
                                                            </a>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm text-muted-foreground italic">No matching profiles found on Spotify.</p>
                                            )}

                                            <div className="space-y-2 mt-4">
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        type="radio"
                                                        name="spotifyProfile"
                                                        id="spotify-not-listed"
                                                        value="not-listed"
                                                        checked={formData.spotifyProfile === 'not-listed'}
                                                        onChange={(e) => setFormData({ ...formData, spotifyProfile: e.target.value })}
                                                        className="h-4 w-4"
                                                    />
                                                    <Label htmlFor="spotify-not-listed" className="font-normal cursor-pointer">
                                                        There is a page for <strong>{formData.artistName}</strong> in Spotify, but it's not listed above.
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        type="radio"
                                                        name="spotifyProfile"
                                                        id="spotify-new"
                                                        value="new"
                                                        checked={formData.spotifyProfile === 'new'}
                                                        onChange={(e) => setFormData({ ...formData, spotifyProfile: e.target.value })}
                                                        className="h-4 w-4"
                                                    />
                                                    <Label htmlFor="spotify-new" className="font-normal cursor-pointer">
                                                        This will be my first <strong>{formData.artistName}</strong> release in Spotify.
                                                    </Label>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>

                                {/* Apple Music Profile Selection - Same pattern as Spotify */}
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="space-y-4 pt-6 border-t border-border"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-[#FA243C] font-bold text-xl"> Music</span>
                                        <h3 className="text-lg font-semibold">Artist already in Apple Music?</h3>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        There are already artists named "{formData.artistName}" live on Apple Music. Are any of these you?
                                    </p>

                                    {isSearching ? (
                                        <div className="flex items-center justify-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {searchResults.apple.length > 0 ? (
                                                searchResults.apple.map((profile) => (
                                                    <div
                                                        key={profile.id}
                                                        className={`flex items-center space-x-4 p-3 rounded-lg border cursor-pointer transition-colors ${formData.appleMusicProfile === profile.id
                                                            ? 'border-primary bg-primary/5'
                                                            : 'border-border hover:bg-accent/50'
                                                            }`}
                                                        onClick={() => setFormData({ ...formData, appleMusicProfile: profile.id })}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="appleProfile"
                                                            checked={formData.appleMusicProfile === profile.id}
                                                            onChange={() => { }}
                                                            className="h-4 w-4 border-primary text-primary"
                                                        />
                                                        <img src={profile.image} alt={profile.name} className="h-10 w-10 rounded-full object-cover" />
                                                        <div className="flex-1">
                                                            <p className="font-medium text-primary">{profile.name}</p>
                                                            <p className="text-sm text-muted-foreground">{profile.track}</p>
                                                        </div>
                                                        {profile.url && (
                                                            <a
                                                                href={profile.url}
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
                                                ))
                                            ) : (
                                                <p className="text-sm text-muted-foreground italic">No matching profiles found on Apple Music.</p>
                                            )}

                                            <div className="space-y-2 mt-4">
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        type="radio"
                                                        name="appleProfile"
                                                        id="apple-not-listed"
                                                        value="not-listed"
                                                        checked={formData.appleMusicProfile === 'not-listed'}
                                                        onChange={(e) => setFormData({ ...formData, appleMusicProfile: e.target.value })}
                                                        className="h-4 w-4"
                                                    />
                                                    <Label htmlFor="apple-not-listed" className="font-normal cursor-pointer">
                                                        There is a page for <strong>{formData.artistName}</strong> in Apple Music, but it's not listed above.
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        type="radio"
                                                        name="appleProfile"
                                                        id="apple-new"
                                                        value="new"
                                                        checked={formData.appleMusicProfile === 'new'}
                                                        onChange={(e) => setFormData({ ...formData, appleMusicProfile: e.target.value })}
                                                        className="h-4 w-4"
                                                    />
                                                    <Label htmlFor="apple-new" className="font-normal cursor-pointer">
                                                        This will be my first <strong>{formData.artistName}</strong> release in Apple Music.
                                                    </Label>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>

                                {/* YouTube Music Profile Selection */}
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="space-y-4 pt-6 border-t border-border"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-[#FF0000] font-bold text-xl">YouTube Music</span>
                                        <h3 className="text-lg font-semibold">Artist already on YouTube Music?</h3>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        There are already artists named "{formData.artistName}" live on YouTube Music. Are any of these you?
                                    </p>

                                    {isSearching ? (
                                        <div className="flex items-center justify-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {searchResults.youtube.length > 0 ? (
                                                searchResults.youtube.map((profile) => (
                                                    <div
                                                        key={profile.id}
                                                        className={`flex items-center space-x-4 p-3 rounded-lg border cursor-pointer transition-colors ${formData.youtubeMusicProfile === profile.id
                                                            ? 'border-primary bg-primary/5'
                                                            : 'border-border hover:bg-accent/50'
                                                            }`}
                                                        onClick={() => setFormData({ ...formData, youtubeMusicProfile: profile.id })}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="youtubeProfile"
                                                            checked={formData.youtubeMusicProfile === profile.id}
                                                            onChange={() => { }}
                                                            className="h-4 w-4 border-primary text-primary"
                                                        />
                                                        <img src={profile.image} alt={profile.name} className="h-10 w-10 rounded-full object-cover" />
                                                        <div className="flex-1">
                                                            <p className="font-medium text-primary">{profile.name}</p>
                                                            <p className="text-sm text-muted-foreground">{profile.track}</p>
                                                        </div>
                                                        {profile.url && (
                                                            <a
                                                                href={profile.url}
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
                                                ))
                                            ) : (
                                                <p className="text-sm text-muted-foreground italic">No matching profiles found on YouTube Music.</p>
                                            )}

                                            <div className="space-y-2 mt-4">
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        type="radio"
                                                        name="youtubeProfile"
                                                        id="youtube-not-listed"
                                                        value="not-listed"
                                                        checked={formData.youtubeMusicProfile === 'not-listed'}
                                                        onChange={(e) => setFormData({ ...formData, youtubeMusicProfile: e.target.value })}
                                                        className="h-4 w-4"
                                                    />
                                                    <Label htmlFor="youtube-not-listed" className="font-normal cursor-pointer">
                                                        There is a page for <strong>{formData.artistName}</strong> in YouTube Music, but it's not listed above.
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        type="radio"
                                                        name="youtubeProfile"
                                                        id="youtube-new"
                                                        value="new"
                                                        checked={formData.youtubeMusicProfile === 'new'}
                                                        onChange={(e) => setFormData({ ...formData, youtubeMusicProfile: e.target.value })}
                                                        className="h-4 w-4"
                                                    />
                                                    <Label htmlFor="youtube-new" className="font-normal cursor-pointer">
                                                        This will be my first <strong>{formData.artistName}</strong> release in YouTube Music.
                                                    </Label>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            </>
                        )}

                        {/* Instagram and Facebook Profiles */}
                        {/* Instagram Profile */}
                        <div className="space-y-3 pt-6 border-t border-border">
                            <div className="flex items-center gap-2">
                                <span className="text-[#E4405F] font-bold text-xl">Instagram</span>
                                <h3 className="text-lg font-semibold">Artist already on Instagram?</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        id="instagram-yes"
                                        name="instagramProfile"
                                        value="yes"
                                        checked={formData.instagramProfile === 'yes'}
                                        onChange={(e) => setFormData({ ...formData, instagramProfile: e.target.value })}
                                        className="h-4 w-4 border-primary text-primary focus:ring-primary"
                                    />
                                    <Label htmlFor="instagram-yes" className="font-normal cursor-pointer">
                                        Yes - Group this single with my other <strong>{formData.artistName || 'artist'}</strong> releases on Instagram
                                    </Label>
                                </div>
                                {formData.instagramProfile === 'yes' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="ml-6 space-y-2"
                                    >
                                        <Label htmlFor="instagramUrl" className="text-sm">
                                            Enter your Instagram Profile Artist URL below. <a href="#" className="text-primary hover:underline">Help me find it</a>
                                        </Label>
                                        <Input
                                            id="instagramUrl"
                                            placeholder="https://instagram.com/..."
                                            value={formData.instagramProfileUrl}
                                            onChange={(e) => setFormData({ ...formData, instagramProfileUrl: e.target.value })}
                                            className="text-sm"
                                        />
                                    </motion.div>
                                )}
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        id="instagram-no"
                                        name="instagramProfile"
                                        value="no"
                                        checked={formData.instagramProfile === 'no'}
                                        onChange={(e) => setFormData({ ...formData, instagramProfile: e.target.value })}
                                        className="h-4 w-4 border-primary text-primary focus:ring-primary"
                                    />
                                    <Label htmlFor="instagram-no" className="font-normal cursor-pointer">
                                        No - <strong>{formData.artistName || 'Artist'}</strong> doesn't yet have a profile on Instagram
                                    </Label>
                                </div>
                            </div>
                        </div>

                        {/* Facebook Profile */}
                        <div className="space-y-3 pt-6 border-t border-border">
                            <div className="flex items-center gap-2">
                                <span className="text-[#1877F2] font-bold text-xl">Facebook</span>
                                <h3 className="text-lg font-semibold">Artist already on Facebook?</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        id="facebook-yes"
                                        name="facebookProfile"
                                        value="yes"
                                        checked={formData.facebookProfile === 'yes'}
                                        onChange={(e) => setFormData({ ...formData, facebookProfile: e.target.value })}
                                        className="h-4 w-4 border-primary text-primary focus:ring-primary"
                                    />
                                    <Label htmlFor="facebook-yes" className="font-normal cursor-pointer">
                                        Yes - Group this single with my other <strong>{formData.artistName || 'artist'}</strong> releases on Facebook
                                    </Label>
                                </div>
                                {formData.facebookProfile === 'yes' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="ml-6 space-y-2"
                                    >
                                        <Label htmlFor="facebookUrl" className="text-sm">
                                            Enter your Facebook Profile Artist URL below. <a href="#" className="text-primary hover:underline">Help me find it</a>
                                        </Label>
                                        <Input
                                            id="facebookUrl"
                                            placeholder="https://facebook.com/..."
                                            value={formData.facebookProfileUrl}
                                            onChange={(e) => setFormData({ ...formData, facebookProfileUrl: e.target.value })}
                                            className="text-sm"
                                        />
                                    </motion.div>
                                )}
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        id="facebook-no"
                                        name="facebookProfile"
                                        value="no"
                                        checked={formData.facebookProfile === 'no'}
                                        onChange={(e) => setFormData({ ...formData, facebookProfile: e.target.value })}
                                        className="h-4 w-4 border-primary text-primary focus:ring-primary"
                                    />
                                    <Label htmlFor="facebook-no" className="font-normal cursor-pointer">
                                        No - <strong>{formData.artistName || 'Artist'}</strong> doesn't yet have a profile on Facebook
                                    </Label>
                                </div>
                            </div>
                        </div>

                        {/* Release Date */}
                        <div className="space-y-3 pt-6 border-t border-border">
                            <Label htmlFor="releaseDate" className="text-lg font-semibold">
                                Release date
                            </Label>
                            <Input
                                id="releaseDate"
                                type="date"
                                value={formData.releaseDate}
                                onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                                className="text-sm"
                            />
                            <p className="text-xs text-muted-foreground">
                                Setting your release date to at least 1-week in the future increases your chances of getting added to playlists.
                            </p>
                            <p className="text-xs text-muted-foreground">
                                If it's important that your album goes live in all stores on the same day, <a href="#" className="text-primary hover:underline">click here for info</a>.
                            </p>
                        </div>

                        {/* Record Label */}
                        <div className="space-y-3 pt-6 border-t border-border">
                            <Label htmlFor="recordLabel" className="text-lg font-semibold">
                                Record label
                            </Label>
                            <Input
                                id="recordLabel"
                                placeholder="Enter record label name"
                                value={formData.recordLabel}
                                onChange={(e) => setFormData({ ...formData, recordLabel: e.target.value })}
                                className="text-sm"
                            />
                        </div>

                        {/* Language */}
                        <div className="space-y-3 pt-6 border-t border-border">
                            <Label htmlFor="language" className="text-lg font-semibold">
                                Language
                            </Label>
                            <select
                                id="language"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                value={formData.language}
                                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
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
                        </div>

                        {/* Primary Genre */}
                        <div className="space-y-3 pt-6 border-t border-border">
                            <Label htmlFor="primaryGenre" className="text-lg font-semibold">
                                Primary genre
                            </Label>
                            <select
                                id="primaryGenre"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                value={formData.primaryGenre}
                                onChange={(e) => setFormData({ ...formData, primaryGenre: e.target.value })}
                            >
                                <option value="">Select a genre</option>
                                <option value="pop">Pop</option>
                                <option value="rock">Rock</option>
                                <option value="hip-hop">Hip-Hop/Rap</option>
                                <option value="electronic">Electronic</option>
                                <option value="r&b">R&B/Soul</option>
                                <option value="country">Country</option>
                                <option value="jazz">Jazz</option>
                                <option value="classical">Classical</option>
                                <option value="indie">Indie</option>
                                <option value="alternative">Alternative</option>
                                <option value="folk">Folk</option>
                                <option value="reggae">Reggae</option>
                                <option value="latin">Latin</option>
                                <option value="world">World</option>
                                <option value="metal">Metal</option>
                                <option value="blues">Blues</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        {/* Secondary Genre */}
                        <div className="space-y-3 pt-6 border-t border-border">
                            <Label htmlFor="secondaryGenre" className="text-lg font-semibold">
                                Secondary genre <span className="text-muted-foreground font-normal">(optional)</span>
                            </Label>
                            <select
                                id="secondaryGenre"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                value={formData.secondaryGenre}
                                onChange={(e) => setFormData({ ...formData, secondaryGenre: e.target.value })}
                            >
                                <option value="">Select another genre</option>
                                <option value="pop">Pop</option>
                                <option value="rock">Rock</option>
                                <option value="hip-hop">Hip-Hop/Rap</option>
                                <option value="electronic">Electronic</option>
                                <option value="r&b">R&B/Soul</option>
                                <option value="country">Country</option>
                                <option value="jazz">Jazz</option>
                                <option value="classical">Classical</option>
                                <option value="indie">Indie</option>
                                <option value="alternative">Alternative</option>
                                <option value="folk">Folk</option>
                                <option value="reggae">Reggae</option>
                                <option value="latin">Latin</option>
                                <option value="world">World</option>
                                <option value="metal">Metal</option>
                                <option value="blues">Blues</option>
                                <option value="other">Other</option>
                            </select>
                        </div>



                        {/* Album Cover */}
                        <div className="space-y-4 pt-6 border-t border-border">
                            <h3 className="text-lg font-semibold">Album cover</h3>

                            {!formData.coverArtPreview ? (
                                <div
                                    className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary/50 transition-colors cursor-pointer bg-muted/20"
                                    onClick={handleCoverArtClick}
                                    onDrop={handleCoverArtDrop}
                                    onDragOver={handleCoverArtDragOver}
                                >
                                    <div className="flex flex-col items-center">
                                        <svg className="h-12 w-12 text-muted-foreground mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="text-base font-medium mb-1 text-primary">Select an image</p>
                                        <p className="text-sm text-muted-foreground">
                                            Or drag image here to upload
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="relative inline-block">
                                        <img
                                            src={formData.coverArtPreview}
                                            alt="Album cover preview"
                                            className="w-full max-w-sm mx-auto rounded-lg border-2 border-border shadow-lg"
                                        />
                                    </div>
                                    {formData.coverArt && (
                                        <div className="text-sm text-muted-foreground text-center">
                                            <p className="font-medium">{formData.coverArt.name}</p>
                                            <p>{(formData.coverArt.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                    )}
                                    <div className="flex justify-center gap-3">
                                        <Button
                                            variant="outline"
                                            onClick={handleCoverArtClick}
                                            type="button"
                                        >
                                            Change Image
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => setFormData({ ...formData, coverArt: null, coverArtPreview: '' })}
                                            type="button"
                                            className="text-destructive hover:text-destructive"
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Recommendations */}
                            <div className="space-y-3 text-sm">
                                <div className="flex items-start gap-2">
                                    <span className="text-yellow-500 mt-0.5">💡</span>
                                    <div>
                                        <strong>Recommended images</strong> are 3000x3000 square JPG format. This is just a recommendation though—we accept most image sizes.
                                    </div>
                                </div>

                                <div className="flex items-start gap-2">
                                    <span className="text-yellow-500 mt-0.5">💡</span>
                                    <div>
                                        <strong>Stores will reject</strong> artwork that contains a website address (URL), X name, or any image that's pixelated, rotated, or poor quality. They'll also reject artwork with prices or store logos (don't put an iTunes or Spotify logo on your artwork). Also, please don't reuse the same artwork for multiple albums.
                                    </div>
                                </div>

                                <div className="flex items-start gap-2">
                                    <span className="text-yellow-500 mt-0.5">💡</span>
                                    <div>
                                        <strong>You own this artwork</strong> and everything in it. Stores will reject your artwork if it contains images you found online that you don't have the explicit right to use.
                                    </div>
                                </div>

                                {/* Artwork Confirmation */}
                                <div className="flex items-start space-x-3 pt-4 border-t border-border/50">
                                    <input
                                        type="checkbox"
                                        id="artworkConfirmed"
                                        checked={formData.artworkConfirmed}
                                        onChange={(e) => setFormData({ ...formData, artworkConfirmed: e.target.checked })}
                                        className="h-4 w-4 mt-1 rounded border-input text-primary focus:ring-2 focus:ring-primary"
                                    />
                                    <Label htmlFor="artworkConfirmed" className="text-sm font-medium cursor-pointer leading-relaxed">
                                        I confirm that this artwork is 3000x3000px (or at least 1000x1000px), is not pixelated, and contains no URLs, social media logos, or pricing. I also confirm that I own the rights to this image.
                                    </Label>
                                </div>
                            </div>
                        </div>

                        {/* Track 1 Details */}
                        <div className="space-y-6 pt-6 border-t border-border">
                            <h3 className="text-lg font-semibold">Track 1</h3>

                            {/* Song Title */}
                            <div className="space-y-2">
                                <Label htmlFor="songTitle">Song title</Label>
                                <p className="text-xs text-muted-foreground">Just the title, no feat. artists or other info</p>
                                <Input
                                    id="songTitle"
                                    placeholder="Track 1 title"
                                    className="text-sm"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                                    <p className="flex items-start gap-2">
                                        <span className="text-yellow-500">💡</span>
                                        <span><strong>Don't include featured artists here</strong>. Add them below, instead.</span>
                                    </p>
                                    <p className="flex items-start gap-2">
                                        <span className="text-yellow-500">💡</span>
                                        <span><strong>If a cover song, don't include original artist's name</strong></span>
                                    </p>
                                    <p className="flex items-start gap-2">
                                        <span className="text-yellow-500">💡</span>
                                        <span><strong>No year/dates</strong>. Do not include any year info (ex: 2025) in your song title.</span>
                                    </p>
                                </div>
                            </div>

                            {/* Featured Artist */}
                            <div className="space-y-3">
                                <Label>Add featured artist to song title?</Label>
                                <p className="text-xs text-muted-foreground">Featured artist or remixer other than {formData.artistName || 'the main artist'}</p>

                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            id="noFeaturedArtist"
                                            name="featuredArtist"
                                            defaultChecked
                                            className="h-4 w-4"
                                        />
                                        <Label htmlFor="noFeaturedArtist" className="font-normal cursor-pointer">
                                            No, don't show any other artists in song title
                                        </Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            id="yesFeaturedArtist"
                                            name="featuredArtist"
                                            className="h-4 w-4"
                                        />
                                        <Label htmlFor="yesFeaturedArtist" className="font-normal cursor-pointer">
                                            Yes, add featured artists to track title (please specify...)
                                        </Label>
                                    </div>
                                </div>
                            </div>

                            {/* Version Info */}
                            <div className="space-y-3">
                                <Label>Add "version" info to song title?</Label>

                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            id="normalVersion"
                                            name="versionType"
                                            defaultChecked
                                            className="h-4 w-4"
                                        />
                                        <Label htmlFor="normalVersion" className="font-normal cursor-pointer">
                                            No, this is the normal version
                                        </Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            id="radioEdit"
                                            name="versionType"
                                            className="h-4 w-4"
                                        />
                                        <Label htmlFor="radioEdit" className="font-normal cursor-pointer">
                                            Radio Edit
                                        </Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            id="otherVersion"
                                            name="versionType"
                                            className="h-4 w-4"
                                        />
                                        <Label htmlFor="otherVersion" className="font-normal cursor-pointer">
                                            Other...
                                        </Label>
                                    </div>
                                </div>

                                {/* Song Title Preview */}
                                <div className="mt-4 p-4 rounded-lg bg-muted">
                                    <p className="text-sm font-medium mb-2">Song title preview:</p>
                                    <div className="flex items-center gap-3 p-3 rounded-md bg-card border border-border">
                                        <div className="h-10 w-10 rounded bg-primary/20 flex items-center justify-center">
                                            <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-medium">Track 1</p>
                                            <p className="text-sm text-muted-foreground">{formData.artistName || 'Artist Name'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Disclaimers */}
                                <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                                    <p className="font-medium">Disclaimers:</p>
                                    <ul className="list-disc list-inside space-y-1 ml-2">
                                        <li>Different streaming services show titles differently, thus yours may not appear exactly as above—and that's okay!</li>
                                        <li><strong>Producers</strong> aren't shown in song titles. Spotify shows them underneath the track title; other services show producers in a "credits" menu.</li>
                                        <li><strong>Primary artists</strong> (incl. "additional" primary artists) aren't shown in song titles. Spotify shows them underneath the track title.</li>
                                        <li><strong>Remixer's name</strong> is shown in song titles as part of version info.</li>
                                        <li>Some parentheses have been converted to [square brackets] to comply with streaming service guidelines.</li>
                                    </ul>
                                </div>
                            </div>

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
                                        <svg className="h-12 w-12 mx-auto text-muted-foreground mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        <p className="text-base font-medium mb-1">Select an audio file</p>
                                        <p className="text-sm text-muted-foreground">
                                            Or drag audio file here to upload
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="p-4 rounded-lg border border-border bg-muted/20">
                                            <div className="flex items-center gap-3">
                                                <svg className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                                </svg>
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

                            {/* Dolby Atmos */}
                            <div className="space-y-3 pt-6 border-t border-border">
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
                                            defaultChecked
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
                                            className="h-4 w-4"
                                        />
                                        <Label htmlFor="yesDolbyAtmos" className="font-normal cursor-pointer">
                                            Yes, I have a version mixed with Atmos I'd like to upload in addition...
                                        </Label>
                                    </div>
                                </div>
                            </div>
                            {/* Songwriter(s) Real Name */}
                            <div className="space-y-4 pt-6 border-t border-border">
                                <div>
                                    <Label className="text-lg font-semibold">
                                        Songwriter(s) real name
                                    </Label>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Real names, not stage names <a href="#" className="text-primary hover:underline">(why?)</a>
                                    </p>
                                </div>

                                {songwriters.map((songwriter, index) => (
                                    <div key={index} className="space-y-3 p-4 rounded-lg border border-border bg-accent/5">
                                        {/* Role Dropdown */}
                                        <div className="space-y-2">
                                            <select
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                value={songwriter.role}
                                                onChange={(e) => updateSongwriter(index, 'role', e.target.value)}
                                            >
                                                <option value="Music and lyrics">Music and lyrics</option>
                                                <option value="Music only">Music only</option>
                                                <option value="Lyrics only">Lyrics only</option>
                                                <option value="Producer">Producer</option>
                                                <option value="Composer">Composer</option>
                                            </select>
                                        </div>

                                        {/* Name Fields */}
                                        <div className="grid grid-cols-3 gap-3">
                                            <Input
                                                placeholder="First name"
                                                value={songwriter.firstName}
                                                onChange={(e) => updateSongwriter(index, 'firstName', e.target.value)}
                                                className="text-sm"
                                            />
                                            <Input
                                                placeholder="Middle name"
                                                value={songwriter.middleName}
                                                onChange={(e) => updateSongwriter(index, 'middleName', e.target.value)}
                                                className="text-sm"
                                            />
                                            <Input
                                                placeholder="Last name"
                                                value={songwriter.lastName}
                                                onChange={(e) => updateSongwriter(index, 'lastName', e.target.value)}
                                                className="text-sm"
                                            />
                                        </div>

                                        {/* Remove Button (only show if more than one songwriter) */}
                                        {songwriters.length > 1 && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => removeSongwriter(index)}
                                                className="text-destructive hover:text-destructive"
                                                type="button"
                                            >
                                                Remove songwriter
                                            </Button>
                                        )}
                                    </div>
                                ))}

                                {/* Add Another Songwriter Button */}
                                <Button
                                    variant="outline"
                                    onClick={addSongwriter}
                                    className="text-primary hover:text-primary"
                                    type="button"
                                >
                                    + Add another songwriter
                                </Button>
                            </div>

                            {/* Explicit Lyrics */}
                            <div className="space-y-3 pt-6 border-t border-border">
                                <Label className="text-lg font-semibold">
                                    Explicit lyrics
                                </Label>

                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            id="explicitNo"
                                            name="explicitLyrics"
                                            value="no"
                                            checked={formData.explicitLyrics === 'no'}
                                            onChange={(e) => setFormData({ ...formData, explicitLyrics: e.target.value })}
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
                                            name="explicitLyrics"
                                            value="yes"
                                            checked={formData.explicitLyrics === 'yes'}
                                            onChange={(e) => setFormData({ ...formData, explicitLyrics: e.target.value })}
                                            className="h-4 w-4"
                                        />
                                        <Label htmlFor="explicitYes" className="font-normal cursor-pointer">
                                            Yes
                                        </Label>
                                    </div>
                                </div>
                            </div>

                            {/* Radio Edit */}
                            <div className="space-y-3 pt-6 border-t border-border">
                                <Label className="text-lg font-semibold">
                                    Is this a "radio edit"?
                                </Label>

                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            id="radioEditNo"
                                            name="radioEdit"
                                            value="no"
                                            checked={formData.radioEdit === 'no'}
                                            onChange={(e) => setFormData({ ...formData, radioEdit: e.target.value })}
                                            className="h-4 w-4"
                                        />
                                        <Label htmlFor="radioEditNo" className="font-normal cursor-pointer">
                                            No - This song is clean, and always has been
                                        </Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            id="radioEditYes"
                                            name="radioEdit"
                                            value="yes"
                                            checked={formData.radioEdit === 'yes'}
                                            onChange={(e) => setFormData({ ...formData, radioEdit: e.target.value })}
                                            className="h-4 w-4"
                                        />
                                        <Label htmlFor="radioEditYes" className="font-normal cursor-pointer">
                                            Yes - There is an explicit version of this song, but this is the clean (or censored) version of it
                                        </Label>
                                    </div>
                                </div>
                            </div>

                            {/* Instrumental */}
                            <div className="space-y-3 pt-6 border-t border-border">
                                <Label className="text-lg font-semibold">
                                    Instrumental?
                                </Label>

                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            id="instrumentalNo"
                                            name="instrumental"
                                            value="no"
                                            checked={formData.instrumental === 'no'}
                                            onChange={(e) => setFormData({ ...formData, instrumental: e.target.value })}
                                            className="h-4 w-4"
                                        />
                                        <Label htmlFor="instrumentalNo" className="font-normal cursor-pointer">
                                            This song contains lyrics
                                        </Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            id="instrumentalYes"
                                            name="instrumental"
                                            value="yes"
                                            checked={formData.instrumental === 'yes'}
                                            onChange={(e) => setFormData({ ...formData, instrumental: e.target.value })}
                                            className="h-4 w-4"
                                        />
                                        <Label htmlFor="instrumentalYes" className="font-normal cursor-pointer">
                                            This song is instrumental and contains no lyrics
                                        </Label>
                                    </div>
                                </div>
                            </div>

                            {/* Preview Clip Start Time */}
                            <div className="space-y-3 pt-6 border-t border-border">
                                <Label className="text-lg font-semibold">
                                    Preview clip start time <span className="text-muted-foreground font-normal">(TikTok, Apple Music, iTunes)</span>
                                </Label>

                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            id="previewAuto"
                                            name="previewClipStartTime"
                                            value="auto"
                                            checked={formData.previewClipStartTime === 'auto'}
                                            onChange={(e) => setFormData({ ...formData, previewClipStartTime: e.target.value })}
                                            className="h-4 w-4"
                                        />
                                        <Label htmlFor="previewAuto" className="font-normal cursor-pointer">
                                            Let streaming services decide
                                        </Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            id="previewManual"
                                            name="previewClipStartTime"
                                            value="manual"
                                            checked={formData.previewClipStartTime === 'manual'}
                                            onChange={(e) => setFormData({ ...formData, previewClipStartTime: e.target.value })}
                                            className="h-4 w-4"
                                        />
                                        <Label htmlFor="previewManual" className="font-normal cursor-pointer">
                                            Let me specify when the good part starts
                                        </Label>
                                    </div>
                                </div>
                            </div>

                            {/* Track Price */}
                            <div className="space-y-3 pt-6 border-t border-border">
                                <Label htmlFor="trackPrice" className="text-lg font-semibold">
                                    Track Price
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    iTunes and Amazon (USD)
                                </p>
                                <select
                                    id="trackPrice"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    defaultValue="0.99"
                                >
                                    <option value="0.69">$0.69</option>
                                    <option value="0.99">$0.99</option>
                                    <option value="1.29">$1.29</option>
                                </select>
                                <p className="text-xs text-muted-foreground">
                                    Tracks over 10 minutes long will be priced higher.
                                </p>
                            </div>

                            {/* Apple Music Additional Requirements */}
                            <div className="space-y-4 pt-6 border-t border-border">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M23.994 6.124a9.23 9.23 0 0 0-.24-2.132c-.317-1.354-1.092-2.145-2.456-2.52A9.44 9.44 0 0 0 19.4.876C17.4.029 15.346-.235 13.27.097c-1.86.297-3.45 1.078-4.898 2.24-.627.502-1.204 1.053-1.748 1.644-.31-.737-.635-1.453-.952-2.17-.077-.174-.28-.343-.49-.396-.27-.07-.56-.02-.773.146-.204.156-.353.398-.428.649-.36 1.206-.71 2.413-1.058 3.62-.22.76-.423 1.525-.65 2.283-.246.82-.564 1.617-.908 2.4-.12.272-.23.55-.35.822-.05.115-.134.227-.227.318-.206.202-.427.218-.647.063-.17-.12-.265-.305-.314-.518-.093-.404-.16-.813-.216-1.222-.05-.362-.063-.725-.064-1.088 0-.17-.016-.344-.052-.51-.08-.369-.435-.577-.804-.465-.328.1-.52.315-.569.65-.062.426-.112.853-.162 1.28-.06.51-.112 1.02-.18 1.53-.06.452-.137.902-.218 1.351-.085.47-.18.938-.278 1.405a9.45 9.45 0 0 1-.32 1.22c-.12.345-.26.683-.41 1.015-.18.4-.39.785-.625 1.155-.29.458-.628.88-1.017 1.264-.36.356-.752.68-1.167.97-.51.358-1.058.67-1.64.925-.615.27-1.256.493-1.914.676-.724.2-1.462.355-2.213.465-.577.085-1.16.14-1.745.174a1.78 1.78 0 0 0-.456.07c-.37.114-.604.407-.615.79-.01.363.197.684.538.838.26.117.544.167.832.186.96.062 1.922.096 2.884.093 1.246-.004 2.49-.064 3.733-.19 1.354-.137 2.693-.37 4.01-.733 1.404-.387 2.76-.912 4.053-1.57 1.323-.672 2.59-1.445 3.798-2.315.93-.67 1.828-1.38 2.682-2.143.612-.548 1.203-1.116 1.767-1.708.485-.51.946-1.04 1.38-1.593.395-.504.76-1.028 1.1-1.57.28-.448.543-.904.788-1.37.208-.396.4-.8.578-1.21.15-.345.285-.696.407-1.052.105-.308.194-.62.273-.935.088-.352.164-.707.23-1.063.068-.37.124-.743.166-1.118.05-.425.082-.852.105-1.28.025-.458.036-.917.023-1.376zM13.27 3.097c1.375-.232 2.748-.19 4.115.092.715.147 1.416.352 2.098.622.306.12.597.27.87.456.272.186.514.408.71.67.175.233.307.49.395.766.093.293.152.596.18.905.053.585.018 1.168-.09 1.744-.122.646-.322 1.272-.584 1.875-.273.626-.61 1.223-1.003 1.788a10.96 10.96 0 0 1-1.363 1.64c-.524.524-1.09 1.01-1.69 1.456-.63.47-1.296.898-1.993 1.285-.71.395-1.447.75-2.208 1.065-.77.318-1.56.598-2.366.838-.825.246-1.663.45-2.513.615-.86.167-1.73.295-2.606.385-.893.092-1.79.15-2.69.178-.91.028-1.822.02-2.733-.024a15.47 15.47 0 0 1-2.712-.307c-.44-.08-.872-.19-1.296-.33-.433-.142-.85-.325-1.244-.555-.408-.238-.782-.525-1.117-.858-.348-.345-.646-.737-.885-1.17-.25-.45-.44-.932-.564-1.437-.135-.55-.21-1.113-.223-1.682-.014-.617.038-1.232.154-1.838.127-.665.328-1.313.602-1.935.285-.647.64-1.26 1.058-1.837.44-.61.947-1.17 1.51-1.678.594-.536 1.243-1.01 1.937-1.422.73-.433 1.497-.81 2.293-1.135.82-.335 1.663-.62 2.524-.86.88-.246 1.774-.448 2.68-.608.92-.163 1.848-.282 2.78-.365.95-.084 1.904-.13 2.86-.14z" />
                                        </svg>
                                        <h3 className="text-lg font-semibold">Apple Music</h3>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">Additional requirements</span>
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                            </svg>
                                            Not yet complete
                                        </span>
                                    </div>
                                </div>

                                <p className="text-sm text-muted-foreground">
                                    Apple Music requires at least one performer and producer credit for each song.
                                </p>

                                <button
                                    type="button"
                                    className="flex items-center gap-2 px-4 py-3 rounded-lg border border-border bg-accent/5 hover:bg-accent/10 transition-colors w-full text-left"
                                >
                                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10">
                                        <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-primary">Add credits for each song on this release</p>
                                    </div>
                                </button>

                                <p className="text-xs text-muted-foreground">
                                    To skip this step for now, simply <a href="#" className="text-primary hover:underline">deselect Apple Music and iTunes at the top of the page</a>. You can always add this release to Apple later.
                                </p>
                            </div>
                        </div>


                        {/* Mandatory Checkboxes */}
                        <div className="space-y-4 pt-6 border-t border-border">
                            <h3 className="text-lg font-bold">Important checkboxes (mandatory)</h3>
                            <div className="space-y-3 p-4 bg-secondary/50 rounded-xl border border-border/50">

                                {/* YouTube Confirmation - Conditional */}
                                <div className="flex items-start space-x-3">
                                    <input
                                        type="checkbox"
                                        id="youtubeConfirmation"
                                        checked={mandatoryChecks.youtubeConfirmation}
                                        onChange={(e) => setMandatoryChecks({ ...mandatoryChecks, youtubeConfirmation: e.target.checked })}
                                        className="mt-1 h-4 w-4 rounded border-gray-300"
                                    />
                                    <Label htmlFor="youtubeConfirmation" className="text-sm font-normal leading-relaxed cursor-pointer">
                                        I selected &quot;YouTube Music&quot;. So I won&apos;t email the platform later asking, &quot;why&apos;d you upload my music to YouTube?!&quot; ...mkay?
                                    </Label>
                                </div>

                                {/* Capitalization Confirmation - Conditional */}
                                {(/[a-z][A-Z]/.test(formData.title) || (formData.title === formData.title.toUpperCase() && formData.title.length > 3) ||
                                    /[a-z][A-Z]/.test(formData.artistName) || (formData.artistName === formData.artistName.toUpperCase() && formData.artistName.length > 3)) && (
                                        <div className="flex items-start space-x-3 bg-yellow-500/10 p-2 rounded">
                                            <input
                                                type="checkbox"
                                                id="capitalizationConfirmation"
                                                checked={mandatoryChecks.capitalizationConfirmation}
                                                onChange={(e) => setMandatoryChecks({ ...mandatoryChecks, capitalizationConfirmation: e.target.checked })}
                                                className="mt-1 h-4 w-4 rounded border-gray-300"
                                            />
                                            <Label htmlFor="capitalizationConfirmation" className="text-sm font-normal leading-relaxed cursor-pointer text-yellow-600 dark:text-yellow-400">
                                                Non-standard cApiTaliZaTiOn detected. Stores may convert to standard capitalization per their style guides.
                                            </Label>
                                        </div>
                                    )}

                                <div className="flex items-start space-x-3">
                                    <input
                                        type="checkbox"
                                        id="promoServices"
                                        checked={mandatoryChecks.promoServices}
                                        onChange={(e) => setMandatoryChecks({ ...mandatoryChecks, promoServices: e.target.checked })}
                                        className="mt-1 h-4 w-4 rounded border-gray-300"
                                    />
                                    <Label htmlFor="promoServices" className="text-sm font-normal leading-relaxed cursor-pointer">
                                        I won&apos;t use &quot;promo services&quot; that guarantee streams or playlisting—even if they claim &quot;organic and real&quot; streams. These services typically use fake stream-bots easily detectable by streaming services.
                                    </Label>
                                </div>

                                <div className="flex items-start rounded-lg">
                                    <input
                                        type="checkbox"
                                        id="rightsAuthorization"
                                        checked={mandatoryChecks.rightsAuthorization}
                                        onChange={(e) => setMandatoryChecks({ ...mandatoryChecks, rightsAuthorization: e.target.checked })}
                                        className="mt-1 h-4 w-4 rounded border-gray-300"
                                    />
                                    <Label htmlFor="rightsAuthorization" className="text-sm font-bold leading-relaxed cursor-pointer">
                                        I recorded this music, and am authorized to sell it in stores worldwide & collect all royalties.
                                    </Label>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <input
                                        type="checkbox"
                                        id="nameUsage"
                                        checked={mandatoryChecks.nameUsage}
                                        onChange={(e) => setMandatoryChecks({ ...mandatoryChecks, nameUsage: e.target.checked })}
                                        className="mt-1 h-4 w-4 rounded border-gray-300"
                                    />
                                    <Label htmlFor="nameUsage" className="text-sm font-normal leading-relaxed cursor-pointer">
                                        I&apos;m not using any other artist&apos;s name in my name, song titles, or album title, without their approval.
                                    </Label>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <input
                                        type="checkbox"
                                        id="termsAgreement"
                                        checked={mandatoryChecks.termsAgreement}
                                        onChange={(e) => setMandatoryChecks({ ...mandatoryChecks, termsAgreement: e.target.checked })}
                                        className="mt-1 h-4 w-4 rounded border-gray-300"
                                    />
                                    <Label htmlFor="termsAgreement" className="text-sm font-normal leading-relaxed cursor-pointer">
                                        I have read and agree to the terms of the Distribution Agreement
                                    </Label>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-6">
                            <Link href="/" className="flex-1">
                                <Button variant="outline" className="w-full">
                                    Cancel
                                </Button>
                            </Link>
                            <Button className="flex-1" onClick={handleSubmit} disabled={isSubmitting}>
                                {isSubmitting ? 'Uploading...' : 'Continue'}
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    )
}

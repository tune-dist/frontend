'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import axios from 'axios'

export default function UploadPage() {
    const [formData, setFormData] = useState({
        artistName: '',
        numberOfSongs: '1',
        previouslyReleased: 'no',
        socialMediaPack: false,
        spotifyProfile: '',
        appleMusicProfile: '',
        youtubeMusicProfile: '',
        instagramProfile: 'no',
        instagramProfileUrl: '',
        facebookProfile: 'no',
        facebookProfileUrl: '',
        coverArt: null as File | null,
        coverArtPreview: '',
        audioFile: null as File | null,
        audioFileName: '',
    })

    const [isSearching, setIsSearching] = useState(false)
    const [searchResults, setSearchResults] = useState<{
        spotify: any[];
        apple: any[];
        youtube: any[];
    }>({ spotify: [], apple: [], youtube: [] })

    const searchTimeout = useRef<NodeJS.Timeout>()

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
                    const [spotifyRes, appleRes, youtubeRes] = await Promise.allSettled([
                        axios.get(`/api/spotify/search?q=${encodeURIComponent(name)}`),
                        axios.get(`/api/apple/search?q=${encodeURIComponent(name)}`),
                        axios.get(`/api/youtube/search?q=${encodeURIComponent(name)}`)
                    ])

                    setSearchResults({
                        spotify: spotifyRes.status === 'fulfilled' ? spotifyRes.value.data.artists : [],
                        apple: appleRes.status === 'fulfilled' ? appleRes.value.data.artists : [],
                        youtube: youtubeRes.status === 'fulfilled' ? youtubeRes.value.data.artists : []
                    })
                } catch (error) {
                    console.error('Search failed', error)
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
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file (JPG, PNG, etc.)')
            return
        }

        if (file.size > 10 * 1024 * 1024) {
            alert('File size must be less than 10MB')
            return
        }

        const reader = new FileReader()
        reader.onloadend = () => {
            const img = new Image()
            img.onload = () => {
                if (img.width < 1000 || img.height < 1000) {
                    alert('Image dimensions must be at least 1000x1000 pixels. Recommended: 3000x3000 pixels')
                    return
                }

                setFormData({
                    ...formData,
                    coverArt: file,
                    coverArtPreview: reader.result as string
                })
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

                        {/* Primary Genre */}
                        <div className="space-y-3 pt-6 border-t border-border">
                            <Label htmlFor="primaryGenre" className="text-lg font-semibold">
                                Primary genre
                            </Label>
                            <select
                                id="primaryGenre"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                defaultValue=""
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
                                defaultValue=""
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

                            {/* Songwriter / Cover Song */}
                            <div className="space-y-3 pt-6 border-t border-border">
                                <h4 className="text-base font-semibold">Songwriter / Cover Song</h4>

                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            id="originalSong"
                                            name="coverSong"
                                            defaultChecked
                                            className="h-4 w-4"
                                        />
                                        <Label htmlFor="originalSong" className="font-normal cursor-pointer">
                                            I wrote this song, or manage the songwriter (it's an <strong>original song</strong>)
                                        </Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            id="coverSong"
                                            name="coverSong"
                                            className="h-4 w-4"
                                        />
                                        <Label htmlFor="coverSong" className="font-normal cursor-pointer">
                                            Another artist wrote it (it's a <strong>cover song</strong>)
                                        </Label>
                                    </div>
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
                            <Button className="flex-1">
                                Continue
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    )
}

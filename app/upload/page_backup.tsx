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

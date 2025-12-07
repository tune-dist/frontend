'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Music, ExternalLink, Info } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { UploadFormData } from './types'

interface BasicInfoStepProps {
    formData: UploadFormData
    setFormData: (data: UploadFormData) => void
}

export default function BasicInfoStep({ formData, setFormData }: BasicInfoStepProps) {
    const { user } = useAuth()

    // Prefill title with user name
    useEffect(() => {
        if (user?.fullName && !formData.title) {
            setFormData({
                ...formData,
                title: user.fullName
            })
        }
    }, [user, formData.title, setFormData, formData])

    // Search State
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

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold">Release Information</h3>
            <p className="text-muted-foreground">Let's start with the basics about your release</p>

            {/* Number of Songs */}
            {/* <div className="space-y-3 pt-6 border-t border-border">
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
            </div> */}
            <div className="space-y-4 mt-6">
                <div className="space-y-2">
                    <Label htmlFor="title">Track/Album Title *</Label>
                    <Input
                        id="title"
                        placeholder="Enter title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="title">Version/Subtitle</Label>
                    <Input
                        id="title"
                        placeholder="Enter title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                </div>

                <div className="space-y-4">
                    <Label htmlFor="artistName">Artist Name *</Label>
                    <div className="relative">
                        <Input
                            id="artistName"
                            placeholder="Your artist name"
                            value={formData.artistName}
                            onChange={handleArtistNameChange}
                            className={isSearching ? 'pr-10' : ''}
                        />
                        {isSearching && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                    className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full"
                                />
                            </div>
                        )}
                    </div>

                    {/* Search Results / Platform Linking */}
                    {formData.artistName.length > 2 && !isSearching && (searchResults.spotify.length > 0 || searchResults.youtube.length > 0) && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 space-y-6 border border-border rounded-lg p-4 bg-card/50"
                        >
                            <h4 className="font-semibold text-sm text-foreground">
                                We found this artist on other platforms. Is this you?
                            </h4>

                            {/* Spotify Results */}
                            {searchResults.spotify.length > 0 && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <svg className="h-5 w-5 text-[#1DB954]" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                                        </svg>
                                        <span className="text-sm font-medium">Spotify</span>
                                    </div>

                                    {searchResults.spotify.map((artist: any) => (
                                        <div
                                            key={artist.id}
                                            className={`flex items-center gap-3 p-3 rounded-md transition-colors cursor-pointer ${formData.spotifyProfile === artist.id ? 'bg-primary/10 border border-primary' : 'bg-background hover:bg-accent'
                                                }`}
                                            onClick={() => setFormData({ ...formData, spotifyProfile: artist.id })}
                                        >
                                            <input
                                                type="radio"
                                                name="spotifyProfile"
                                                checked={formData.spotifyProfile === artist.id}
                                                onChange={() => { }}
                                                className="h-4 w-4 border-primary text-primary"
                                            />
                                            {artist.image ? (
                                                <img src={artist.image} alt={artist.name} className="h-10 w-10 rounded-full object-cover" />
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                                    <Music className="h-5 w-5 text-muted-foreground" />
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <p className="font-medium text-primary">{artist.name}</p>
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

                            {/* YouTube Results */}
                            {searchResults.youtube.length > 0 && (
                                <div className="space-y-3 pt-4 border-t border-border">
                                    <div className="flex items-center gap-2">
                                        <svg className="h-5 w-5 text-[#FF0000]" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                                        </svg>
                                        <span className="text-sm font-medium">YouTube Music</span>
                                    </div>

                                    {searchResults.youtube.map((profile: any) => (
                                        <div
                                            key={profile.id}
                                            className={`flex items-center gap-3 p-3 rounded-md transition-colors cursor-pointer ${formData.youtubeMusicProfile === profile.id ? 'bg-primary/10 border border-primary' : 'bg-background hover:bg-accent'
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
                                    name="instagramProfile"
                                    value="yes"
                                    checked={formData.instagramProfile === 'yes'}
                                    onChange={(e) => setFormData({ ...formData, instagramProfile: e.target.value })}
                                    className="h-4 w-4 border-primary text-primary focus:ring-primary"
                                />
                                <Label htmlFor="instagram-yes" className="font-normal cursor-pointer">
                                    Yes - Group with other <strong>{formData.artistName || 'artist'}</strong> releases
                                </Label>
                            </div>
                            {formData.instagramProfile === 'yes' && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="ml-6 space-y-2"
                                >
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
                                    No - <strong>{formData.artistName || 'Artist'}</strong> is not on Instagram
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
                                    name="facebookProfile"
                                    value="yes"
                                    checked={formData.facebookProfile === 'yes'}
                                    onChange={(e) => setFormData({ ...formData, facebookProfile: e.target.value })}
                                    className="h-4 w-4 border-primary text-primary focus:ring-primary"
                                />
                                <Label htmlFor="facebook-yes" className="font-normal cursor-pointer">
                                    Yes - Group with other <strong>{formData.artistName || 'artist'}</strong> releases
                                </Label>
                            </div>
                            {formData.facebookProfile === 'yes' && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="ml-6 space-y-2"
                                >
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
                                    No - <strong>{formData.artistName || 'Artist'}</strong> is not on Facebook
                                </Label>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="title">Featuring Artist</Label>
                    <Input
                        id="title"
                        placeholder="Enter Featuring Artist"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="language">Language *</Label>
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
                <div className="space-y-2">
                    <Label htmlFor="format">Format *</Label>
                    <select
                        id="format"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={formData.format}
                        onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                    >
                        <option value="">Select a format</option>
                        <option value="single">Single</option>
                        <option value="ep">EP</option>
                        <option value="album">Album</option>
                    </select>
                </div>
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
            </div>
        </div>
    )
}

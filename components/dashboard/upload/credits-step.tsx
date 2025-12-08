'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UploadFormData, Songwriter, Track } from './types'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, Music, X, GripVertical, Pencil, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'



// CreditsStepProps interface
interface CreditsStepProps {
    formData: UploadFormData
    setFormData: (data: UploadFormData) => void
    songwriters: Songwriter[]
    setSongwriters: (data: Songwriter[]) => void
    composers: Songwriter[]
    setComposers: (data: Songwriter[]) => void
}

export default function CreditsStep({ formData, setFormData, songwriters, setSongwriters, composers, setComposers }: CreditsStepProps) {
    // ... (state unchanged) ...

    const [isSearching, setIsSearching] = useState(false)
    const [isTrackModalOpen, setIsTrackModalOpen] = useState(false)
    const tracks = formData.tracks || []
    const setTracks = (newTracks: Track[]) => {
        setFormData({ ...formData, tracks: newTracks })
    }
    const [editingTrackIndex, setEditingTrackIndex] = useState<number | null>(null)

    const [searchResults, setSearchResults] = useState<{
        spotify: any[];
        apple: any[];
        youtube: any[];
    }>({ spotify: [], apple: [], youtube: [] })
    const searchTimeout = useRef<NodeJS.Timeout | null>(null)

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

    // Track artist name change handler for modal
    const handleTrackArtistNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value
        setCurrentTrack({ ...currentTrack, artistName: name })

        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current)
        }

        if (name.length > 2) {
            setIsSearching(true)
            searchTimeout.current = setTimeout(async () => {
                try {
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

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
                        apple: [],
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

    const [currentTrack, setCurrentTrack] = useState<Track>({
        id: '',
        title: '',
        subtitle: '',
        artistName: '',
        audioFile: null,
        audioFileName: '',
        isExplicit: false,
        explicitLyrics: 'no',
        featuringArtist: '',
        language: '',
        spotifyProfile: '',
        youtubeMusicProfile: '',
        instagramProfile: '',
        instagramProfileUrl: '',
        facebookProfile: '',
        facebookProfileUrl: '',
        songwriters: [{ role: 'Music and lyrics', firstName: '', middleName: '', lastName: '' }],
        composers: [{ role: 'Composer', firstName: '', middleName: '', lastName: '' }],
        isInstrumental: 'no',
        previewStartTime: 'auto',
        price: '0.99'
    })

    // ... (handlers unchanged)

    // Open modal for adding a new track
    const openAddTrackModal = () => {
        setCurrentTrack({
            id: Date.now().toString(),
            title: '',
            subtitle: '',
            artistName: formData.artistName || '',
            audioFile: null,
            audioFileName: '',
            isExplicit: false,
            explicitLyrics: 'no',
            featuringArtist: '',
            language: formData.language || '',
            spotifyProfile: '',
            youtubeMusicProfile: '',
            instagramProfile: '',
            instagramProfileUrl: '',
            facebookProfile: '',
            facebookProfileUrl: '',
            songwriters: [{ role: 'Music and lyrics', firstName: '', middleName: '', lastName: '' }],
            composers: [{ role: 'Composer', firstName: '', middleName: '', lastName: '' }],
            isInstrumental: 'no',
            previewStartTime: 'auto',
            price: '0.99',
            previouslyReleased: 'no',
            originalReleaseDate: '',
            primaryGenre: '',
            secondaryGenre: ''
        })
        setEditingTrackIndex(null)
        setSearchResults({ spotify: [], apple: [], youtube: [] })
        setIsTrackModalOpen(true)
    }

    // ... (other handlers unchanged)

    // Helper functions for updating track-specific songwriters/composers
    const updateTrackSongwriter = (index: number, field: keyof Songwriter, value: string) => {
        const currentSongwriters = currentTrack.songwriters || []
        const updated = [...currentSongwriters]
        if (updated[index]) {
            updated[index] = { ...updated[index], [field]: value }
            setCurrentTrack({ ...currentTrack, songwriters: updated })
        }
    }

    const addTrackSongwriter = () => {
        const currentSongwriters = currentTrack.songwriters || []
        setCurrentTrack({
            ...currentTrack,
            songwriters: [...currentSongwriters, { role: 'Music and lyrics', firstName: '', middleName: '', lastName: '' }]
        })
    }

    const removeTrackSongwriter = (index: number) => {
        const currentSongwriters = currentTrack.songwriters || []
        if (currentSongwriters.length > 1) {
            setCurrentTrack({
                ...currentTrack,
                songwriters: currentSongwriters.filter((_, i) => i !== index)
            })
        }
    }

    const updateTrackComposer = (index: number, field: keyof Songwriter, value: string) => {
        const currentComposers = currentTrack.composers || []
        const updated = [...currentComposers]
        if (updated[index]) {
            updated[index] = { ...updated[index], [field]: value }
            setCurrentTrack({ ...currentTrack, composers: updated })
        }
    }

    const addTrackComposer = () => {
        const currentComposers = currentTrack.composers || []
        setCurrentTrack({
            ...currentTrack,
            composers: [...currentComposers, { role: 'Composer', firstName: '', middleName: '', lastName: '' }]
        })
    }

    const removeTrackComposer = (index: number) => {
        const currentComposers = currentTrack.composers || []
        if (currentComposers.length > 1) {
            setCurrentTrack({
                ...currentTrack,
                composers: currentComposers.filter((_, i) => i !== index)
            })
        }
    }




    // Helper functions for updating track-specific songwriters/composers


    // Open modal for editing an existing track
    const openEditTrackModal = (index: number) => {
        setCurrentTrack({ ...tracks[index] })
        setEditingTrackIndex(index)
        setSearchResults({ spotify: [], apple: [], youtube: [] })
        setIsTrackModalOpen(true)
    }

    // Save track (add new or update existing)
    const saveTrack = () => {
        if (!currentTrack.title.trim()) {
            return // Don't save empty tracks
        }

        if (editingTrackIndex !== null) {
            // Update existing track
            const updatedTracks = [...tracks]
            updatedTracks[editingTrackIndex] = currentTrack
            setTracks(updatedTracks)
        } else {
            // Add new track
            setTracks([...tracks, currentTrack])
        }
        setIsTrackModalOpen(false)
    }

    // Delete a track
    const deleteTrack = (index: number) => {
        setTracks(tracks.filter((_, i) => i !== index))
    }
    const addSongwriter = () => {
        setSongwriters([...songwriters, {
            role: 'Music and lyrics',
            firstName: '',
            middleName: '',
            lastName: ''
        }])
    }

    const updateSongwriter = (index: number, field: keyof Songwriter, value: string) => {
        const updated = [...songwriters]
        updated[index] = { ...updated[index], [field]: value }
        setSongwriters(updated)
    }

    const removeSongwriter = (index: number) => {
        if (songwriters.length > 1) {
            setSongwriters(songwriters.filter((_, i) => i !== index))
        }
    }
    const addComposer = () => {
        setComposers([...composers, {
            role: 'Composer',
            firstName: '',
            middleName: '',
            lastName: ''
        }])
    }

    const updateComposer = (index: number, field: keyof Songwriter, value: string) => {
        const updated = [...composers]
        updated[index] = { ...updated[index], [field]: value }
        setComposers(updated)
    }

    const removeComposer = (index: number) => {
        if (composers.length > 1) {
            setComposers(composers.filter((_, i) => i !== index))
        }
    }
    return (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold">Credits & Metadata</h3>
            <p className="text-muted-foreground">Give credit to everyone involved</p>
            <div className="space-y-4 mt-6">
                <div className="space-y-2">
                    <Label htmlFor="isrc">ISRC</Label>
                    <Input
                        id="isrc"
                        placeholder="Enter ISRC"
                        value={formData.isrc}
                        onChange={(e) => setFormData({ ...formData, isrc: e.target.value })}
                    />
                </div>
                {/* 
                <div className="space-y-2">
                    <Label htmlFor="writers">Composer*</Label>
                    <Input
                        id="writers"
                        placeholder="Comma-separated names"
                        onChange={(e) => setFormData({ ...formData, writers: e.target.value.split(',').map((w: string) => w.trim()) })}
                    />
                </div> */}

                {/* <div className="space-y-2">
                    <Label htmlFor="copyright">Copyright (Optional)</Label>
                    <Input
                        id="copyright"
                        placeholder="© 2025 Your Name"
                        value={formData.copyright}
                        onChange={(e) => setFormData({ ...formData, copyright: e.target.value })}
                    />
                </div> */}
            </div>
            <div className="space-y-4">
                {/* <h3 className="text-xl font-semibold">Release Details</h3>
                <p className="text-muted-foreground">When do you want to release your music?</p> */}
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
                <div className="space-y-4 mt-6">
                    {/* <div className="space-y-2">
                    <Label htmlFor="releaseDate">Release Date *</Label>
                    <Input
                        id="releaseDate"
                        type="date"
                        value={formData.releaseDate}
                        onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                        Must be at least 7 days from today
                    </p>
                </div> */}

                    <div className="space-y-3">
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

                    <div className="space-y-3">
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
                </div>
            </div>
            <div className="space-y-4 mt-6">
                <div className="space-y-4 pt-6 border-t border-border">
                    <div>
                        <Label className="text-lg font-semibold">
                            Songwriter/Author
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                            Real names, not stage names <a href="#" className="text-primary hover:underline">(why?)</a>
                        </p>
                    </div>

                    {songwriters.map((songwriter, index) => (
                        <div key={index} className="space-y-3 p-4 rounded-lg border border-border bg-accent/5">

                            {/* Name Fields */}
                            <div className="grid grid-cols-1 gap-1">
                                <Input
                                    placeholder="Enter First name and last name *"
                                    value={songwriter.firstName}
                                    onChange={(e) => updateSongwriter(index, 'firstName', e.target.value)}
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
                <div className="space-y-4 pt-6 border-t border-border">
                    <div>
                        <Label className="text-lg font-semibold">
                            Composer
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                            Real names, not stage names <a href="#" className="text-primary hover:underline">(why?)</a>
                        </p>
                    </div>

                    {composers.map((composer, index) => (
                        <div key={index} className="space-y-3 p-4 rounded-lg border border-border bg-accent/5">

                            {/* Name Fields */}
                            <div className="grid grid-cols-1 gap-1">
                                <Input
                                    placeholder="Enter First name and last name"
                                    value={composer.firstName}
                                    onChange={(e) => updateComposer(index, 'firstName', e.target.value)}
                                    className="text-sm"
                                />
                            </div>

                            {/* Remove Button (only show if more than one songwriter) */}
                            {composers.length > 1 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeComposer(index)}
                                    className="text-destructive hover:text-destructive"
                                    type="button"
                                >
                                    Remove Composer
                                </Button>
                            )}
                        </div>
                    ))}

                    {/* Add Another Songwriter Button */}
                    <Button
                        variant="outline"
                        onClick={addComposer}
                        className="text-primary hover:text-primary"
                        type="button"
                    >
                        + Add Composer
                    </Button>
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

                    <div className="grid grid-cols-1 gap-1">
                        <Input
                            placeholder="HH:MM:SS"
                            value={formData.previewClipStartTime}
                            onChange={(e) => setFormData({ ...formData, previewClipStartTime: e.target.value })}
                            className="text-sm"
                        />
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

                {/* Tracks Section */}
                <div className="pt-6 border-t border-border space-y-4">
                    {/* Tracks List */}
                    {tracks.length > 0 && (
                        <div className="space-y-2">
                            {tracks.map((track, index) => (
                                <div
                                    key={track.id}
                                    className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/50 hover:bg-accent/10 transition-colors"
                                >
                                    {/* Drag Handle */}
                                    <div className="cursor-grab text-muted-foreground hover:text-foreground">
                                        <GripVertical className="h-5 w-5" />
                                    </div>

                                    {/* Music Icon */}
                                    <div className="flex items-center justify-center h-8 w-8 rounded bg-muted">
                                        <Music className="h-4 w-4 text-muted-foreground" />
                                    </div>

                                    {/* Track Number and Title */}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">
                                            {index + 1}. {track.title || 'Untitled'}
                                        </p>
                                    </div>

                                    {/* Artist Name */}
                                    <div className="flex-1 min-w-0 text-muted-foreground">
                                        <p className="truncate">{track.artistName || 'Unknown Artist'}</p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => openEditTrackModal(index)}
                                            className="h-8 px-3 text-sm"
                                        >
                                            <Pencil className="h-3 w-3 mr-1" />
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => deleteTrack(index)}
                                            className="h-8 px-3 text-sm text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="h-3 w-3 mr-1" />
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {tracks.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-lg">
                            <Music className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>No tracks added yet</p>
                            <p className="text-sm">Click "+ Add track" to add your first track</p>
                        </div>
                    )}

                    {/* Add Track Button - Below the list */}
                    {(formData.format == 'ep' || formData.format == 'album') && <Button
                        variant="outline"
                        onClick={openAddTrackModal}
                        className="w-full text-primary hover:text-primary"
                        type="button"
                    >
                        + Add track
                    </Button>}
                </div>

                {/* Apple Music Additional Requirements */}
                {/* <div className="space-y-4 pt-6 border-t border-border">
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
                </div> */}

            </div>
            <div className="space-y-2">
                <Label htmlFor="copyright">Copyright</Label>
                <Input
                    id="copyright"
                    placeholder="© Your label Name"
                    value={formData.copyright || ''}
                    onChange={(e) => setFormData({ ...formData, copyright: e.target.value })}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="producers">Producers</Label>
                <Input
                    id="producers"
                    placeholder="℗ Your label Name"
                    onChange={(e) => setFormData({ ...formData, producers: e.target.value.split(',').map((p: string) => p.trim()) })}
                />
            </div>

            {/* Track Modal */}
            <AnimatePresence>
                {isTrackModalOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                            onClick={() => setIsTrackModalOpen(false)}
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-4 md:inset-10 lg:inset-20 bg-background border border-border rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-4 md:p-6 border-b border-border">
                                <div>
                                    <h2 className="text-xl font-bold">{editingTrackIndex !== null ? 'Edit Track' : 'Add Track'}</h2>
                                    <p className="text-sm text-muted-foreground">Enter track details</p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsTrackModalOpen(false)}
                                    className="h-8 w-8 p-0"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Modal Content - Scrollable */}
                            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="isrc">ISRC</Label>
                                        <Input
                                            id="isrc"
                                            placeholder="Enter ISRC"
                                            value={formData.isrc}
                                            onChange={(e) => setFormData({ ...formData, isrc: e.target.value })}
                                        />
                                    </div>
                                    {/* <h3 className="text-xl font-semibold">Release Information</h3>
                                    <p className="text-muted-foreground">Let's start with the basics about your release</p> */}

                                    <div className="space-y-4 mt-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="modal-title">Track Title *</Label>
                                            <Input
                                                id="modal-title"
                                                placeholder="Enter title"
                                                value={currentTrack.title}
                                                onChange={(e) => setCurrentTrack({ ...currentTrack, title: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="modal-subtitle">Version/Subtitle</Label>
                                            <Input
                                                id="modal-subtitle"
                                                placeholder="Enter subtitle"
                                                value={currentTrack.subtitle}
                                                onChange={(e) => setCurrentTrack({ ...currentTrack, subtitle: e.target.value })}
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <Label htmlFor="modal-artistName">Artist Name *</Label>
                                            <div className="relative">
                                                <Input
                                                    id="modal-artistName"
                                                    placeholder="Your artist name"
                                                    value={currentTrack.artistName}
                                                    onChange={handleTrackArtistNameChange}
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

                                            {/* Previously Released */}
                                            <div className="space-y-4 pt-4">
                                                <Label className="text-base font-semibold">Has this single been previously released?</Label>
                                                <div className="flex gap-6">
                                                    <div className="flex items-center space-x-2">
                                                        <input
                                                            type="radio"
                                                            id="modal-prev-no"
                                                            checked={currentTrack.previouslyReleased === 'no'}
                                                            onChange={() => setCurrentTrack({ ...currentTrack, previouslyReleased: 'no', originalReleaseDate: '' })}
                                                            className="h-4 w-4"
                                                        />
                                                        <Label htmlFor="modal-prev-no" className="font-normal cursor-pointer">No</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <input
                                                            type="radio"
                                                            id="modal-prev-yes"
                                                            checked={currentTrack.previouslyReleased === 'yes'}
                                                            onChange={() => setCurrentTrack({ ...currentTrack, previouslyReleased: 'yes' })}
                                                            className="h-4 w-4"
                                                        />
                                                        <Label htmlFor="modal-prev-yes" className="font-normal cursor-pointer">Yes</Label>
                                                    </div>
                                                </div>

                                                {currentTrack.previouslyReleased === 'yes' && (
                                                    <div className="pt-2">
                                                        <Label htmlFor="modal-originalDate">Original Release Date</Label>
                                                        <Input
                                                            id="modal-originalDate"
                                                            type="date"
                                                            value={currentTrack.originalReleaseDate}
                                                            onChange={(e) => setCurrentTrack({ ...currentTrack, originalReleaseDate: e.target.value })}
                                                            className="mt-1"
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Primary Genre */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                                <div className="space-y-2">
                                                    <Label htmlFor="modal-primaryGenre">Primary Genre *</Label>
                                                    <select
                                                        id="modal-primaryGenre"
                                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                        value={currentTrack.primaryGenre}
                                                        onChange={(e) => setCurrentTrack({ ...currentTrack, primaryGenre: e.target.value })}
                                                    >
                                                        <option value="">Select Genre</option>
                                                        <option value="Pop">Pop</option>
                                                        <option value="Rock">Rock</option>
                                                        <option value="Hip Hop/Rap">Hip Hop/Rap</option>
                                                        <option value="R&B/Soul">R&B/Soul</option>
                                                        <option value="Electronic/Dance">Electronic/Dance</option>
                                                        <option value="Latin">Latin</option>
                                                        <option value="Country">Country</option>
                                                        <option value="Jazz">Jazz</option>
                                                        <option value="Classical">Classical</option>
                                                        <option value="Folk">Folk</option>
                                                        <option value="Reggae">Reggae</option>
                                                        <option value="Blues">Blues</option>
                                                        <option value="Metal">Metal</option>
                                                        <option value="Alternative">Alternative</option>
                                                        <option value="Indie">Indie</option>
                                                        <option value="World">World</option>
                                                        <option value="Soundtrack">Soundtrack</option>
                                                        <option value="Spoken Word">Spoken Word</option>
                                                        <option value="Children's Music">Children's Music</option>
                                                        <option value="Other">Other</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="modal-secondaryGenre">Secondary Genre</Label>
                                                    <select
                                                        id="modal-secondaryGenre"
                                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                        value={currentTrack.secondaryGenre}
                                                        onChange={(e) => setCurrentTrack({ ...currentTrack, secondaryGenre: e.target.value })}
                                                    >
                                                        <option value="">Select Genre</option>
                                                        <option value="Pop">Pop</option>
                                                        <option value="Rock">Rock</option>
                                                        <option value="Hip Hop/Rap">Hip Hop/Rap</option>
                                                        <option value="R&B/Soul">R&B/Soul</option>
                                                        <option value="Electronic/Dance">Electronic/Dance</option>
                                                        <option value="Latin">Latin</option>
                                                        <option value="Country">Country</option>
                                                        <option value="Jazz">Jazz</option>
                                                        <option value="Classical">Classical</option>
                                                        <option value="Folk">Folk</option>
                                                        <option value="Reggae">Reggae</option>
                                                        <option value="Blues">Blues</option>
                                                        <option value="Metal">Metal</option>
                                                        <option value="Alternative">Alternative</option>
                                                        <option value="Indie">Indie</option>
                                                        <option value="World">World</option>
                                                        <option value="Soundtrack">Soundtrack</option>
                                                        <option value="Spoken Word">Spoken Word</option>
                                                        <option value="Children's Music">Children's Music</option>
                                                        <option value="Other">Other</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Search Results / Platform Linking */}
                                            {currentTrack.artistName.length > 2 && !isSearching && (searchResults.spotify.length > 0 || searchResults.youtube.length > 0) && (
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
                                                                    className={`flex items-center gap-3 p-3 rounded-md transition-colors cursor-pointer ${currentTrack.spotifyProfile === artist.id ? 'bg-primary/10 border border-primary' : 'bg-background hover:bg-accent'}`}
                                                                    onClick={() => setCurrentTrack({ ...currentTrack, spotifyProfile: artist.id })}
                                                                >
                                                                    <input
                                                                        type="radio"
                                                                        name="modal-spotifyProfile"
                                                                        checked={currentTrack.spotifyProfile === artist.id}
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
                                                                        name="modal-spotifyProfile"
                                                                        id="modal-spotify-new"
                                                                        value="new"
                                                                        checked={currentTrack.spotifyProfile === 'new'}
                                                                        onChange={(e) => setCurrentTrack({ ...currentTrack, spotifyProfile: e.target.value })}
                                                                        className="h-4 w-4"
                                                                    />
                                                                    <Label htmlFor="modal-spotify-new" className="font-normal cursor-pointer">
                                                                        This will be my first <strong>{currentTrack.artistName}</strong> release in Spotify.
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
                                                                    className={`flex items-center gap-3 p-3 rounded-md transition-colors cursor-pointer ${currentTrack.youtubeMusicProfile === profile.id ? 'bg-primary/10 border border-primary' : 'bg-background hover:bg-accent'}`}
                                                                    onClick={() => setCurrentTrack({ ...currentTrack, youtubeMusicProfile: profile.id })}
                                                                >
                                                                    <input
                                                                        type="radio"
                                                                        name="modal-youtubeProfile"
                                                                        checked={currentTrack.youtubeMusicProfile === profile.id}
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
                                                                        name="modal-youtubeProfile"
                                                                        id="modal-youtube-new"
                                                                        value="new"
                                                                        checked={currentTrack.youtubeMusicProfile === 'new'}
                                                                        onChange={(e) => setCurrentTrack({ ...currentTrack, youtubeMusicProfile: e.target.value })}
                                                                        className="h-4 w-4"
                                                                    />
                                                                    <Label htmlFor="modal-youtube-new" className="font-normal cursor-pointer">
                                                                        This will be my first <strong>{currentTrack.artistName}</strong> release in YouTube Music.
                                                                    </Label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}
                                        </div>


                                        {/* Songwriter Section */}
                                        <div className="space-y-4 pt-6 border-t border-border">
                                            <div>
                                                <Label className="text-lg font-semibold">Songwriter/Author</Label>
                                                <p className="text-xs text-muted-foreground mt-1">Real names, not stage names</p>
                                            </div>
                                            {(currentTrack.songwriters || []).map((songwriter, index) => (
                                                <div key={index} className="space-y-3 p-4 rounded-lg border border-border bg-accent/5">
                                                    <Input
                                                        placeholder="Enter First name and last name *"
                                                        value={songwriter.firstName}
                                                        onChange={(e) => updateTrackSongwriter(index, 'firstName', e.target.value)}
                                                        className="text-sm"
                                                    />
                                                    {(currentTrack.songwriters?.length || 0) > 1 && (
                                                        <Button variant="outline" size="sm" onClick={() => removeTrackSongwriter(index)} className="text-destructive">Remove</Button>
                                                    )}
                                                </div>
                                            ))}
                                            <Button variant="outline" onClick={addTrackSongwriter}>+ Add another songwriter</Button>
                                        </div>

                                        {/* Composer Section */}
                                        <div className="space-y-4 pt-6 border-t border-border">
                                            <div>
                                                <Label className="text-lg font-semibold">Composer</Label>
                                                <p className="text-xs text-muted-foreground mt-1">Real names, not stage names</p>
                                            </div>
                                            {(currentTrack.composers || []).map((composer, index) => (
                                                <div key={index} className="space-y-3 p-4 rounded-lg border border-border bg-accent/5">
                                                    <Input
                                                        placeholder="Enter First name and last name"
                                                        value={composer.firstName}
                                                        onChange={(e) => updateTrackComposer(index, 'firstName', e.target.value)}
                                                        className="text-sm"
                                                    />
                                                    {(currentTrack.composers?.length || 0) > 1 && (
                                                        <Button variant="outline" size="sm" onClick={() => removeTrackComposer(index)} className="text-destructive">Remove</Button>
                                                    )}
                                                </div>
                                            ))}
                                            <Button variant="outline" onClick={addTrackComposer}>+ Add Composer</Button>
                                        </div>

                                        {/* Instrumental */}
                                        <div className="space-y-3 pt-6 border-t border-border">
                                            <Label className="text-lg font-semibold">Instrumental?</Label>
                                            <div className="space-y-2">
                                                <div className="flex items-center space-x-2">
                                                    <input type="radio" id="track-inst-no" checked={currentTrack.isInstrumental === 'no'} onChange={() => setCurrentTrack({ ...currentTrack, isInstrumental: 'no' })} className="h-4 w-4" />
                                                    <Label htmlFor="track-inst-no">This song contains lyrics</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <input type="radio" id="track-inst-yes" checked={currentTrack.isInstrumental === 'yes'} onChange={() => setCurrentTrack({ ...currentTrack, isInstrumental: 'yes' })} className="h-4 w-4" />
                                                    <Label htmlFor="track-inst-yes">This song is instrumental</Label>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Preview Clip Start Time */}
                                        <div className="space-y-3 pt-6 border-t border-border">
                                            <Label className="text-lg font-semibold">Preview clip start time</Label>
                                            <Input
                                                placeholder="HH:MM:SS"
                                                value={currentTrack.previewStartTime}
                                                onChange={(e) => setCurrentTrack({ ...currentTrack, previewStartTime: e.target.value })}
                                            />
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
                                                            id="modal-instagram-yes"
                                                            name="modal-instagramProfile"
                                                            value="yes"
                                                            checked={currentTrack.instagramProfile === 'yes'}
                                                            onChange={(e) => setCurrentTrack({ ...currentTrack, instagramProfile: e.target.value })}
                                                            className="h-4 w-4 border-primary text-primary focus:ring-primary"
                                                        />
                                                        <Label htmlFor="modal-instagram-yes" className="font-normal cursor-pointer">
                                                            Yes - Group with other <strong>{currentTrack.artistName || 'artist'}</strong> releases
                                                        </Label>
                                                    </div>
                                                    {currentTrack.instagramProfile === 'yes' && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            className="ml-6 space-y-2"
                                                        >
                                                            <Input
                                                                id="modal-instagramUrl"
                                                                placeholder="https://instagram.com/..."
                                                                value={currentTrack.instagramProfileUrl}
                                                                onChange={(e) => setCurrentTrack({ ...currentTrack, instagramProfileUrl: e.target.value })}
                                                                className="text-sm"
                                                            />
                                                        </motion.div>
                                                    )}
                                                    <div className="flex items-center space-x-2">
                                                        <input
                                                            type="radio"
                                                            id="modal-instagram-no"
                                                            name="modal-instagramProfile"
                                                            value="no"
                                                            checked={currentTrack.instagramProfile === 'no'}
                                                            onChange={(e) => setCurrentTrack({ ...currentTrack, instagramProfile: e.target.value })}
                                                            className="h-4 w-4 border-primary text-primary focus:ring-primary"
                                                        />
                                                        <Label htmlFor="modal-instagram-no" className="font-normal cursor-pointer">
                                                            No - <strong>{currentTrack.artistName || 'Artist'}</strong> is not on Instagram
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
                                                            id="modal-facebook-yes"
                                                            name="modal-facebookProfile"
                                                            value="yes"
                                                            checked={currentTrack.facebookProfile === 'yes'}
                                                            onChange={(e) => setCurrentTrack({ ...currentTrack, facebookProfile: e.target.value })}
                                                            className="h-4 w-4 border-primary text-primary focus:ring-primary"
                                                        />
                                                        <Label htmlFor="modal-facebook-yes" className="font-normal cursor-pointer">
                                                            Yes - Group with other <strong>{currentTrack.artistName || 'artist'}</strong> releases
                                                        </Label>
                                                    </div>
                                                    {currentTrack.facebookProfile === 'yes' && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            className="ml-6 space-y-2"
                                                        >
                                                            <Input
                                                                id="modal-facebookUrl"
                                                                placeholder="https://facebook.com/..."
                                                                value={currentTrack.facebookProfileUrl}
                                                                onChange={(e) => setCurrentTrack({ ...currentTrack, facebookProfileUrl: e.target.value })}
                                                                className="text-sm"
                                                            />
                                                        </motion.div>
                                                    )}
                                                    <div className="flex items-center space-x-2">
                                                        <input
                                                            type="radio"
                                                            id="modal-facebook-no"
                                                            name="modal-facebookProfile"
                                                            value="no"
                                                            checked={currentTrack.facebookProfile === 'no'}
                                                            onChange={(e) => setCurrentTrack({ ...currentTrack, facebookProfile: e.target.value })}
                                                            className="h-4 w-4 border-primary text-primary focus:ring-primary"
                                                        />
                                                        <Label htmlFor="modal-facebook-no" className="font-normal cursor-pointer">
                                                            No - <strong>{currentTrack.artistName || 'Artist'}</strong> is not on Facebook
                                                        </Label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="modal-featuring">Featuring Artist</Label>
                                            <Input
                                                id="modal-featuring"
                                                placeholder="Enter Featuring Artist"
                                                value={currentTrack.featuringArtist}
                                                onChange={(e) => setCurrentTrack({ ...currentTrack, featuringArtist: e.target.value })}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="modal-language">Language *</Label>
                                            <select
                                                id="modal-language"
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                value={currentTrack.language}
                                                onChange={(e) => setCurrentTrack({ ...currentTrack, language: e.target.value })}
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

                                        {/* <div className="space-y-2">
                                            <Label htmlFor="modal-format">Format *</Label>
                                            <select
                                                id="modal-format"
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                value={formData.format}
                                                onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                                            >
                                                <option value="">Select a format</option>
                                                <option value="single">Single</option>
                                                <option value="ep">EP</option>
                                                <option value="album">Album</option>
                                            </select>
                                        </div> */}

                                        <div className="space-y-3 pt-6 border-t border-border">
                                            <Label className="text-lg font-semibold">
                                                Explicit lyrics
                                            </Label>

                                            <div className="space-y-2">
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        type="radio"
                                                        id="modal-explicitNo"
                                                        name="modal-explicitLyrics"
                                                        value="no"
                                                        checked={currentTrack.explicitLyrics === 'no'}
                                                        onChange={(e) => setCurrentTrack({ ...currentTrack, explicitLyrics: e.target.value })}
                                                        className="h-4 w-4"
                                                    />
                                                    <Label htmlFor="modal-explicitNo" className="font-normal cursor-pointer">
                                                        No
                                                    </Label>
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        type="radio"
                                                        id="modal-explicitYes"
                                                        name="modal-explicitLyrics"
                                                        value="yes"
                                                        checked={currentTrack.explicitLyrics === 'yes'}
                                                        onChange={(e) => setCurrentTrack({ ...currentTrack, explicitLyrics: e.target.value })}
                                                        className="h-4 w-4"
                                                    />
                                                    <Label htmlFor="modal-explicitYes" className="font-normal cursor-pointer">
                                                        Yes
                                                    </Label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="flex items-center justify-end gap-3 p-4 md:p-6 border-t border-border">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsTrackModalOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={saveTrack}
                                >
                                    {editingTrackIndex !== null ? 'Update Track' : 'Save Track'}
                                </Button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}

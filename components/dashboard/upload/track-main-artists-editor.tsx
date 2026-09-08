'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tooltip } from '@/components/ui/tooltip'
import { Info, Loader2, Plus, UserCheck, X } from 'lucide-react'
import toast from 'react-hot-toast'
import ArtistPlatformPicker from './artist-platform-picker'
import {
  emptySearchResults,
  searchArtistProfiles,
} from '@/lib/integrations/artist-search.util'
import type { ArtistSearchResponse } from '@/lib/api/artist-search'
import { rosterArtistName, type RosterArtist } from '@/lib/integrations/artist-form-state.util'
import type { PlatformKey } from '@/lib/integrations/apply-artist-profile-selection'
import type { TrackMainArtistFormValue } from '@/lib/releases/track-main-artists.util'

type TrackMainArtistsEditorProps = {
  artists: TrackMainArtistFormValue[]
  onChange: (artists: TrackMainArtistFormValue[]) => void
  releasePrimaryArtists?: TrackMainArtistFormValue[]
  usedArtists?: unknown[]
  artistLimit?: number
}

function profileUrl(
  value: TrackMainArtistFormValue['instagramProfile'],
): string {
  if (typeof value === 'string' && value.startsWith('http')) return value
  return ''
}

export default function TrackMainArtistsEditor({
  artists,
  onChange,
  releasePrimaryArtists = [],
  usedArtists = [],
  artistLimit = Infinity,
}: TrackMainArtistsEditorProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(
    artists.length > 0 ? 0 : null,
  )
  const [showAdd, setShowAdd] = useState(false)
  const [draftName, setDraftName] = useState('')
  const [searchByIndex, setSearchByIndex] = useState<
    Record<number, ArtistSearchResponse>
  >({})
  const [searchingIndex, setSearchingIndex] = useState<number | null>(null)
  const [hasSearchedByIndex, setHasSearchedByIndex] = useState<
    Record<number, boolean>
  >({})
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const runSearch = useCallback(async (index: number, name: string) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    if (name.trim().length < 2) {
      setSearchByIndex((prev) => ({ ...prev, [index]: emptySearchResults() }))
      setSearchingIndex(null)
      setHasSearchedByIndex((prev) => ({ ...prev, [index]: false }))
      return
    }
    setSearchingIndex(index)
    searchTimeout.current = setTimeout(async () => {
      try {
        const results = await searchArtistProfiles(name, {
          spotifyLimit: 5,
          appleLimit: 5,
          cosmosLimit: 10,
        })
        setSearchByIndex((prev) => ({ ...prev, [index]: results }))
        setHasSearchedByIndex((prev) => ({ ...prev, [index]: true }))
      } catch {
        setSearchByIndex((prev) => ({ ...prev, [index]: emptySearchResults() }))
      } finally {
        setSearchingIndex((current) => (current === index ? null : current))
      }
    }, 400)
  }, [])

  useEffect(() => {
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current)
    }
  }, [])

  // When an artist row expands and has a name but no profiles yet, search.
  useEffect(() => {
    if (expandedIndex == null) return
    const artist = artists[expandedIndex]
    if (!artist?.name?.trim()) return
    if (artist.spotifyProfile || artist.appleMusicProfile) return
    if (hasSearchedByIndex[expandedIndex]) return
    void runSearch(expandedIndex, artist.name)
  }, [
    expandedIndex,
    artists,
    hasSearchedByIndex,
    runSearch,
  ])

  const updateArtist = (
    index: number,
    patch: Partial<TrackMainArtistFormValue>,
  ) => {
    onChange(
      artists.map((artist, i) =>
        i === index ? { ...artist, ...patch } : artist,
      ),
    )
  }

  const removeArtist = (index: number) => {
    const next = artists.filter((_, i) => i !== index)
    onChange(next)
    if (expandedIndex === index) {
      setExpandedIndex(next.length > 0 ? Math.min(index, next.length - 1) : null)
    } else if (expandedIndex != null && expandedIndex > index) {
      setExpandedIndex(expandedIndex - 1)
    }
  }

  const addArtist = (artist: TrackMainArtistFormValue) => {
    const name = artist.name.trim()
    if (!name) return
    if (
      artists.some((a) => a.name.trim().toLowerCase() === name.toLowerCase())
    ) {
      toast.error('Artist already added to this track')
      return
    }
    if (Number.isFinite(artistLimit) && artists.length >= artistLimit) {
      toast.error(`Artist limit reached (${artistLimit})`)
      return
    }
    const next = [...artists, { ...artist, name }]
    onChange(next)
    setExpandedIndex(next.length - 1)
    setShowAdd(false)
    setDraftName('')
    void runSearch(next.length - 1, name)
  }

  const addCandidates = releasePrimaryArtists.filter(
    (candidate) =>
      !artists.some(
        (a) =>
          a.name.trim().toLowerCase() === candidate.name.trim().toLowerCase(),
      ),
  )

  const rosterCandidates = usedArtists
    .map((ua) => rosterArtistName(ua as RosterArtist))
    .filter(
      (name): name is string =>
        !!name &&
        !artists.some((a) => a.name.trim().toLowerCase() === name.toLowerCase()),
    )

  return (
    <div className="space-y-4 rounded-lg border-2 border-primary/40 p-4 bg-primary/5">
      <div className="flex items-center gap-2">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Track Main Artist
        </Label>
        <Tooltip
          content="Artists who perform on this track (sent to COSMOS as track main artists / singers). Defaults from the release Primary Artists when empty; add or remove per track."
          className="max-w-xs whitespace-normal"
        >
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground"
            aria-label="About Track Main Artist"
          >
            <Info className="h-3.5 w-3.5" />
          </button>
        </Tooltip>
      </div>

      {artists.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No artists on this track yet. Add at least one performer.
        </p>
      ) : (
        <div className="space-y-3">
          {artists.map((artist, index) => {
            const isExpanded = expandedIndex === index
            const results = searchByIndex[index] || emptySearchResults()
            const isSearching = searchingIndex === index
            return (
              <div
                key={`${artist.name}-${index}`}
                className="rounded-lg border border-border bg-card/40 p-3 space-y-3"
              >
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="flex-1 text-left font-medium truncate hover:text-primary"
                    onClick={() =>
                      setExpandedIndex(isExpanded ? null : index)
                    }
                  >
                    {artist.name || `Artist ${index + 1}`}
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() =>
                      setExpandedIndex(isExpanded ? null : index)
                    }
                  >
                    {isExpanded ? 'Hide' : 'Edit'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600"
                    aria-label={`Remove ${artist.name}`}
                    onClick={() => removeArtist(index)}
                    disabled={artists.length <= 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {isExpanded && (
                  <div className="space-y-3 pt-2 border-t border-border/50">
                    <div className="relative">
                      <Input
                        value={artist.name}
                        placeholder="Artist name"
                        onChange={(e) => {
                          const name = e.target.value
                          updateArtist(index, {
                            name,
                            spotifyProfile: undefined,
                            appleMusicProfile: undefined,
                          })
                          setHasSearchedByIndex((prev) => ({
                            ...prev,
                            [index]: false,
                          }))
                          void runSearch(index, name)
                        }}
                        className={isSearching ? 'pr-10' : ''}
                      />
                      {isSearching && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    <ArtistPlatformPicker
                      artistName={artist.name}
                      results={results}
                      isSearching={isSearching}
                      isActiveSearch={expandedIndex === index}
                      hasSearchedForIndex={!!hasSearchedByIndex[index]}
                      spotifyProfile={artist.spotifyProfile}
                      appleMusicProfile={artist.appleMusicProfile}
                      usedArtists={usedArtists}
                      onSelectProfile={(platform: PlatformKey, profile) => {
                        if (platform === 'spotify') {
                          updateArtist(index, {
                            spotifyProfile:
                              profile === '' ? undefined : (profile as never),
                          })
                        } else {
                          updateArtist(index, {
                            appleMusicProfile:
                              profile === '' ? undefined : (profile as never),
                          })
                        }
                      }}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <span className="text-[#E4405F] font-bold">
                            Instagram
                          </span>
                          <span className="text-xs text-muted-foreground font-normal">
                            (Optional)
                          </span>
                        </Label>
                        <Input
                          placeholder="https://instagram.com/..."
                          value={profileUrl(artist.instagramProfile)}
                          onChange={(e) =>
                            updateArtist(index, {
                              instagramProfile: e.target.value || null,
                            })
                          }
                          className="text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <span className="text-[#1877F2] font-bold">
                            Facebook
                          </span>
                          <span className="text-xs text-muted-foreground font-normal">
                            (Optional)
                          </span>
                        </Label>
                        <Input
                          placeholder="https://facebook.com/..."
                          value={profileUrl(artist.facebookProfile)}
                          onChange={(e) =>
                            updateArtist(index, {
                              facebookProfile: e.target.value || null,
                            })
                          }
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {showAdd ? (
        <div className="space-y-2 rounded-md border border-dashed border-primary/40 p-3">
          {(addCandidates.length > 0 || rosterCandidates.length > 0) && (
            <Select
              value=""
              onValueChange={(val) => {
                if (!val) return
                const fromRelease = addCandidates.find((a) => a.name === val)
                if (fromRelease) {
                  addArtist(fromRelease)
                  return
                }
                addArtist({ name: val })
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pick from release / roster artists" />
              </SelectTrigger>
              <SelectContent className="z-[999]">
                {addCandidates.map((a) => (
                  <SelectItem key={`rel-${a.name}`} value={a.name}>
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-primary" />
                      <span>{a.name}</span>
                    </div>
                  </SelectItem>
                ))}
                {rosterCandidates
                  .filter(
                    (name) => !addCandidates.some((a) => a.name === name),
                  )
                  .map((name) => (
                    <SelectItem key={`roster-${name}`} value={name}>
                      {name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          )}
          <div className="flex gap-2">
            <Input
              placeholder="Or type a new artist name"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
            />
            <Button
              type="button"
              size="sm"
              onClick={() => addArtist({ name: draftName.trim() })}
            >
              Add
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowAdd(false)
                setDraftName('')
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => setShowAdd(true)}
          disabled={
            Number.isFinite(artistLimit) && artists.length >= artistLimit
          }
        >
          <Plus className="h-4 w-4" />
          Add Another Artist
        </Button>
      )}
    </div>
  )
}

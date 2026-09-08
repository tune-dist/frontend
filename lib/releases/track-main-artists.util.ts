import type { PlatformProfileFormValue } from '@/components/dashboard/upload/upload-form.schema'

export type TrackMainArtistFormValue = {
  name: string
  cosmosArtistId?: string
  spotifyProfile?: PlatformProfileFormValue
  appleMusicProfile?: PlatformProfileFormValue
  youtubeMusicProfile?: PlatformProfileFormValue
  instagramProfile?: string | null
  facebookProfile?: string | null
}

type ReleaseArtistFormSlice = {
  artistName?: string
  cosmosArtistId?: string
  spotifyProfile?: PlatformProfileFormValue
  appleMusicProfile?: PlatformProfileFormValue
  youtubeMusicProfile?: PlatformProfileFormValue
  instagramProfile?: string | null
  instagramProfileUrl?: string | null
  facebookProfile?: string | null
  facebookProfileUrl?: string | null
  artists?: Array<{
    name: string
    cosmosArtistId?: string
    spotifyProfile?: PlatformProfileFormValue
    appleMusicProfile?: PlatformProfileFormValue
    youtubeMusicProfile?: PlatformProfileFormValue
    instagramProfile?: string | null
    facebookProfile?: string | null
  }>
}

/** Deep-copy release primary artists into per-track Track Main Artist form values. */
export function copyReleasePrimaryArtistsFromForm(
  form: ReleaseArtistFormSlice,
): TrackMainArtistFormValue[] {
  const out: TrackMainArtistFormValue[] = []

  if (form.artistName?.trim()) {
    out.push({
      name: form.artistName.trim(),
      cosmosArtistId: form.cosmosArtistId,
      spotifyProfile: form.spotifyProfile,
      appleMusicProfile: form.appleMusicProfile,
      youtubeMusicProfile: form.youtubeMusicProfile,
      instagramProfile:
        form.instagramProfileUrl?.trim() || form.instagramProfile || null,
      facebookProfile:
        form.facebookProfileUrl?.trim() || form.facebookProfile || null,
    })
  }

  for (const artist of form.artists || []) {
    if (!artist.name?.trim()) continue
    out.push({
      name: artist.name.trim(),
      cosmosArtistId: artist.cosmosArtistId,
      spotifyProfile: artist.spotifyProfile,
      appleMusicProfile: artist.appleMusicProfile,
      youtubeMusicProfile: artist.youtubeMusicProfile,
      instagramProfile: artist.instagramProfile,
      facebookProfile: artist.facebookProfile,
    })
  }

  return out.map((artist) => ({ ...artist }))
}

type SeedTrackInput = {
  trackMainArtists?: TrackMainArtistFormValue[] | null
  artistName?: string | null
  spotifyProfile?: PlatformProfileFormValue
  appleMusicProfile?: PlatformProfileFormValue
  youtubeMusicProfile?: PlatformProfileFormValue
  instagramProfile?: unknown
  facebookProfile?: unknown
}

function profileToUrl(value: unknown): string | null {
  if (value == null) return null
  if (typeof value === 'string') {
    return value.startsWith('http') ? value : value || null
  }
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>
    if (typeof record.url === 'string') return record.url
  }
  return null
}

/**
 * Seed modal Track Main Artists for album track edit:
 * 1) explicit trackMainArtists
 * 2) legacy single artistName (+ profiles) — preserves existing one-artist tracks
 * 3) release primary artists (new/empty tracks)
 */
export function seedTrackMainArtistsForModal(
  track: SeedTrackInput,
  releasePrimaryArtists: TrackMainArtistFormValue[] = [],
): TrackMainArtistFormValue[] {
  if (track.trackMainArtists && track.trackMainArtists.length > 0) {
    return track.trackMainArtists.map((artist) => ({ ...artist }))
  }
  if (track.artistName?.trim()) {
    return [
      {
        name: track.artistName.trim(),
        spotifyProfile: track.spotifyProfile,
        appleMusicProfile: track.appleMusicProfile,
        youtubeMusicProfile: track.youtubeMusicProfile,
        instagramProfile: profileToUrl(track.instagramProfile),
        facebookProfile: profileToUrl(track.facebookProfile),
      },
    ]
  }
  return releasePrimaryArtists.map((artist) => ({ ...artist }))
}

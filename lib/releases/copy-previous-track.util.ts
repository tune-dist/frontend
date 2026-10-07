import type { Track } from '@/components/dashboard/upload/upload-form.schema'
import {
  seedTrackMainArtistsForModal,
  type TrackMainArtistFormValue,
} from '@/lib/releases/track-main-artists.util'

export type PreviousTrackCredits = {
  trackMainArtists: TrackMainArtistFormValue[]
  writers: string[]
  composers: string[]
  featuringArtist: string
}

export type PreviousTrackMetadata = PreviousTrackCredits & {
  title: string
  version: string
  language: string
  primaryGenre: string
  secondaryGenre: string
  mood: string
  isExplicit: boolean
  isInstrumental: string
  previewClipStartTime: string
}

function namesOrBlank(names: string[] | undefined): string[] {
  const filled = (names || []).map((name) => name)
  if (filled.length === 0) return ['']
  return filled
}

/** Credits from the track immediately before this one. */
export function copyArtistsFromPreviousTrack(previous: Track): PreviousTrackCredits {
  return {
    trackMainArtists: seedTrackMainArtistsForModal(previous, []),
    writers: namesOrBlank(previous.writers),
    composers: namesOrBlank(previous.composers),
    featuringArtist: previous.featuringArtist || '',
  }
}

export function applyPreviousTrackCopy(
  current: Track,
  previous: Track,
  mode: 'artists' | 'all',
): Track {
  const credits = copyArtistsFromPreviousTrack(previous)
  const primary = credits.trackMainArtists[0]
  const next: Track = {
    ...current,
    artistName: primary?.name || '',
    trackMainArtists: credits.trackMainArtists,
    writers: credits.writers.filter((name) => name.trim()),
    composers: credits.composers.filter((name) => name.trim()),
    featuringArtist: credits.featuringArtist,
    spotifyProfile: primary?.spotifyProfile,
    appleMusicProfile: primary?.appleMusicProfile,
    youtubeMusicProfile: primary?.youtubeMusicProfile || '',
    instagramProfile: primary?.instagramProfile || '',
    facebookProfile: primary?.facebookProfile || '',
  }

  if (mode === 'artists') return next

  const metadata = copyAllMetadataFromPreviousTrack(previous)
  return {
    ...next,
    title: metadata.title,
    version: metadata.version,
    language: metadata.language,
    primaryGenre: metadata.primaryGenre,
    secondaryGenre: metadata.secondaryGenre,
    mood: metadata.mood,
    isExplicit: metadata.isExplicit,
    isInstrumental: metadata.isInstrumental,
    previewClipStartTime: metadata.previewClipStartTime,
  }
}

/** Every track-form field except this recording's own ISRC. */
export function copyAllMetadataFromPreviousTrack(previous: Track): PreviousTrackMetadata {
  return {
    ...copyArtistsFromPreviousTrack(previous),
    title: previous.title || '',
    version: previous.version || '',
    language: previous.language || '',
    primaryGenre: previous.primaryGenre || '',
    secondaryGenre: previous.secondaryGenre || '',
    mood: previous.mood || '',
    isExplicit: previous.isExplicit === true,
    isInstrumental: previous.isInstrumental || 'no',
    previewClipStartTime: previous.previewClipStartTime || '',
  }
}

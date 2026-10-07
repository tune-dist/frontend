import { describe, expect, it } from 'vitest'
import type { Track } from '@/components/dashboard/upload/upload-form.schema'
import {
  applyPreviousTrackCopy,
  copyAllMetadataFromPreviousTrack,
  copyArtistsFromPreviousTrack,
} from './copy-previous-track.util'

function previousTrack(): Track {
  return {
    id: 'track-1',
    title: 'Aarti One',
    audioFileId: 'audio-1',
    artistName: 'Prashant Joshi',
    trackMainArtists: [{ name: 'Prashant Joshi' }, { name: 'Puja Sadhu' }],
    writers: ['Prashant Joshi'],
    composers: ['Remo Composer'],
    featuringArtist: 'Dj Remo',
    language: 'Gujarati',
    primaryGenre: 'Hindu Devotional',
    secondaryGenre: 'Aarti',
    mood: 'Spiritual',
    version: 'Afro House',
    isExplicit: false,
    isInstrumental: 'no',
    previewClipStartTime: '0:15',
    isrc: 'IN-ABC-26-00001',
  }
}

describe('copyArtistsFromPreviousTrack', () => {
  it('copies main artists, writers, composers, and featuring artist', () => {
    const copied = copyArtistsFromPreviousTrack(previousTrack())

    expect(copied.trackMainArtists.map((artist) => artist.name)).toEqual([
      'Prashant Joshi',
      'Puja Sadhu',
    ])
    expect(copied.writers).toEqual(['Prashant Joshi'])
    expect(copied.composers).toEqual(['Remo Composer'])
    expect(copied.featuringArtist).toBe('Dj Remo')
  })

  it('leaves genre and title off the artist copy', () => {
    const copied = copyArtistsFromPreviousTrack(previousTrack())

    expect(copied).not.toHaveProperty('primaryGenre')
    expect(copied).not.toHaveProperty('title')
    expect(copied).not.toHaveProperty('isrc')
  })

  it('keeps a blank credit row when the previous track has none', () => {
    const copied = copyArtistsFromPreviousTrack({
      ...previousTrack(),
      writers: [],
      composers: undefined,
      featuringArtist: undefined,
      trackMainArtists: [],
      artistName: '',
    })

    expect(copied.writers).toEqual([''])
    expect(copied.composers).toEqual([''])
    expect(copied.featuringArtist).toBe('')
    expect(copied.trackMainArtists).toEqual([])
  })
})

describe('applyPreviousTrackCopy', () => {
  it('keeps this track audio and ISRC when copying artists', () => {
    const current = {
      ...previousTrack(),
      id: 'track-2',
      title: 'Aarti Two',
      audioFileId: 'audio-2',
      isrc: 'IN-ABC-26-00002',
      writers: [],
      featuringArtist: '',
    }
    const copied = applyPreviousTrackCopy(current, previousTrack(), 'artists')

    expect(copied.id).toBe('track-2')
    expect(copied.audioFileId).toBe('audio-2')
    expect(copied.isrc).toBe('IN-ABC-26-00002')
    expect(copied.title).toBe('Aarti Two')
    expect(copied.writers).toEqual(['Prashant Joshi'])
    expect(copied.artistName).toBe('Prashant Joshi')
  })

  it('copies the rest of the form without replacing ISRC', () => {
    const current = {
      ...previousTrack(),
      id: 'track-2',
      title: 'Aarti Two',
      audioFileId: 'audio-2',
      isrc: 'IN-ABC-26-00002',
      primaryGenre: '',
    }
    const copied = applyPreviousTrackCopy(current, previousTrack(), 'all')

    expect(copied.title).toBe('Aarti One')
    expect(copied.primaryGenre).toBe('Hindu Devotional')
    expect(copied.isrc).toBe('IN-ABC-26-00002')
    expect(copied.audioFileId).toBe('audio-2')
  })
})

describe('copyAllMetadataFromPreviousTrack', () => {
  it('copies the rest of the track form and still skips ISRC', () => {
    const copied = copyAllMetadataFromPreviousTrack(previousTrack())

    expect(copied.title).toBe('Aarti One')
    expect(copied.version).toBe('Afro House')
    expect(copied.language).toBe('Gujarati')
    expect(copied.primaryGenre).toBe('Hindu Devotional')
    expect(copied.secondaryGenre).toBe('Aarti')
    expect(copied.mood).toBe('Spiritual')
    expect(copied.isExplicit).toBe(false)
    expect(copied.isInstrumental).toBe('no')
    expect(copied.previewClipStartTime).toBe('0:15')
    expect(copied.featuringArtist).toBe('Dj Remo')
    expect(copied).not.toHaveProperty('isrc')
  })
})

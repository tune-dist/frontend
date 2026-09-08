import { describe, expect, it } from 'vitest'
import {
  copyReleasePrimaryArtistsFromForm,
  seedTrackMainArtistsForModal,
} from './track-main-artists.util'

describe('seedTrackMainArtistsForModal', () => {
  const releasePrimaries = [
    { name: 'AAMIR MIR' },
    { name: 'Vidhi Patel' },
    { name: 'Rohan Suthar' },
  ]

  it('prefers explicit trackMainArtists', () => {
    const seeded = seedTrackMainArtistsForModal(
      {
        artistName: 'AAMIR MIR',
        trackMainArtists: [
          { name: 'AAMIR MIR' },
          { name: 'Vidhi Patel' },
        ],
      },
      releasePrimaries,
    )
    expect(seeded.map((a) => a.name)).toEqual(['AAMIR MIR', 'Vidhi Patel'])
  })

  it('seeds a single legacy artistName without forcing all release primaries', () => {
    const seeded = seedTrackMainArtistsForModal(
      {
        artistName: 'AAMIR MIR',
        spotifyProfile: { id: 'sp1', name: 'AAMIR MIR' },
      },
      releasePrimaries,
    )
    expect(seeded).toHaveLength(1)
    expect(seeded[0].name).toBe('AAMIR MIR')
    expect(seeded[0].spotifyProfile).toEqual({ id: 'sp1', name: 'AAMIR MIR' })
  })

  it('falls back to release primaries when track has no artists yet', () => {
    const seeded = seedTrackMainArtistsForModal({}, releasePrimaries)
    expect(seeded.map((a) => a.name)).toEqual([
      'AAMIR MIR',
      'Vidhi Patel',
      'Rohan Suthar',
    ])
  })
})

describe('copyReleasePrimaryArtistsFromForm', () => {
  it('copies main + secondary artists', () => {
    const copied = copyReleasePrimaryArtistsFromForm({
      artistName: 'AAMIR MIR',
      cosmosArtistId: 'c1',
      artists: [{ name: 'Vidhi Patel', cosmosArtistId: 'c2' }],
    })
    expect(copied.map((a) => a.name)).toEqual(['AAMIR MIR', 'Vidhi Patel'])
    expect(copied[0].cosmosArtistId).toBe('c1')
  })
})

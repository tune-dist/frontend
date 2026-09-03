import { describe, expect, it } from 'vitest';
import {
  draftRequestToWriteSnapshot,
  pickChangedDraftFields,
  releaseToWriteSnapshot,
} from './pick-changed-draft-fields';
import type { CreateReleaseDraftRequest } from './types';

function buildSingleDraft(title: string): CreateReleaseDraftRequest {
  return {
    release: {
      title,
      type: 'single',
      labelName: 'KratoLib',
      releaseDate: '2026-06-01',
      previouslyReleased: false,
      distributionTerritories: ['Worldwide'],
      publisher: 'KratoLib',
      recordingYear: 2026,
    },
    artists: { main: [{ name: 'Artist One' }], featured: [] },
    coverArt: {
      storageKey: 'tracks/u/cover.jpg',
      filename: 'cover.jpg',
      size: 1,
      dimensions: { width: 3000, height: 3000 },
      format: 'jpeg',
    },
    tracks: [
      {
        order: 1,
        title,
        artistName: 'Artist One',
        language: 'English',
        genre: { primary: 'Pop', secondary: 'Indian Pop' },
        mood: 'Happy',
        isExplicit: false,
        isInstrumental: false,
        previouslyReleased: false,
        credits: { writers: ['Writer'], composers: ['Composer'], featuring: null },
        audio: {
          storageKey: 'tracks/u/audio/song.wav',
          filename: 'song.wav',
          size: 1,
          duration: 180,
          format: 'wav',
        },
      },
    ],
    submission: { rightsAccepted: true },
  };
}

describe('single release title sync on update', () => {
  it('includes tracks in sparse patch when release and track titles change together', () => {
    const baseline = releaseToWriteSnapshot({
      title: 'Dwarikadish Radha No Shyam - From Vidhi Vision Production',
      releaseType: 'single',
      artistName: 'AAMIR MIR',
      labelName: 'KratoLib',
      tracks: [
        {
          title: 'Dwarikadish Radha No Shyam - From Vidhi Vision Production',
          artistName: 'AAMIR MIR',
          language: 'Gujarati',
          primaryGenre: 'Pop',
          secondaryGenre: 'Indian Pop',
          audioFile: {
            url: 'tracks/u/audio/song.wav',
            filename: 'song.wav',
            size: 1,
            duration: 180,
          },
        },
      ],
      coverArt: {
        url: 'tracks/u/cover.jpg',
        filename: 'cover.jpg',
        size: 1,
      },
    });

    const current = draftRequestToWriteSnapshot(
      buildSingleDraft('Dwarikadish Radha No Shyam'),
    );

    const patch = pickChangedDraftFields(baseline, current);

    expect(patch.title).toBe('Dwarikadish Radha No Shyam');
    expect(patch.tracks?.[0]?.title).toBe('Dwarikadish Radha No Shyam');
  });
});

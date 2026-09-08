import { describe, expect, it } from 'vitest';
import { buildDraftPayload } from './build-draft-payload';

function buildSingleCreateForm(overrides: Record<string, unknown> = {}) {
  return {
    title: 'Test Song',
    artistName: 'Test Artist',
    cosmosArtistId: 'cosmos-1',
    format: 'single',
    releaseType: 'single',
    releaseDate: '2026-12-01',
    labelName: 'KratoLib',
    primaryGenre: 'Pop',
    secondaryGenre: 'Indian Pop',
    mood: 'Happy',
    language: 'Hindi',
    writers: ['Writer One'],
    composers: ['Composer One'],
    previewClipStartTime: '0:30',
    distributionTerritories: ['Worldwide'],
    audioConsent: true,
    coverArtConsent: true,
    audioFiles: [
      {
        id: 'af1',
        fileName: 'song.wav',
        path: 'tracks/user/audio/song.wav',
        duration: 180,
        size: 5000000,
        hash: 'abc',
        fingerprint: 'fp1',
      },
    ],
    tracks: [
      {
        id: 't1',
        title: 'Test Song',
        audioFileId: 'af1',
        primaryGenre: 'Pop',
        secondaryGenre: 'Indian Pop',
        mood: 'Happy',
      },
    ],
    coverArt: {
      path: 'tracks/user/coverart/cover.jpg',
      fileName: 'cover.jpg',
      size: 2048000,
      dimensions: { width: 3000, height: 3000 },
      format: 'jpeg',
    },
    mandatoryChecks: {
      rightsAuthorization: true,
      ownershipConfirmation: true,
    },
    ...overrides,
  };
}

describe('buildDraftPayload — create release submit', () => {
  it('builds canonical single draft payload without uploading files', async () => {
    const { payload } = await buildDraftPayload(
      buildSingleCreateForm(),
      'test-token',
    );

    expect(payload.release.title).toBe('Test Song');
    expect(payload.release.type).toBe('single');
    expect(payload.release.labelName).toBe('KratoLib');
    expect(payload.artists.main).toHaveLength(1);
    expect(payload.artists.main[0]).toMatchObject({
      name: 'Test Artist',
      cosmosId: 'cosmos-1',
    });
    expect(payload.tracks).toHaveLength(1);
    expect(payload.tracks[0]).toMatchObject({
      order: 1,
      title: 'Test Song',
      genre: { primary: 'Pop', secondary: 'Indian Pop' },
      mood: 'Happy',
      language: 'Hindi',
      audio: {
        storageKey: 'tracks/user/audio/song.wav',
        duration: 180,
        format: 'wav',
      },
      previewClip: { startTime: '0:30' },
    });
    expect(payload.coverArt.storageKey).toBe('tracks/user/coverart/cover.jpg');
    expect(payload.submission.rightsAccepted).toBe(true);
    expect(payload.submission.audioDuplicateConsent).toBe(true);
    expect(payload.submission.coverArtValidationConsent).toBe(true);
  });

  it('synthesizes a single track when tracks array is empty', async () => {
    const { payload } = await buildDraftPayload(
      buildSingleCreateForm({
        tracks: [],
        audioFile: {
          fileName: 'song.wav',
          path: 'tracks/user/audio/song.wav',
          duration: 180,
          size: 5000000,
        },
      }),
      'test-token',
    );

    expect(payload.tracks).toHaveLength(1);
    expect(payload.tracks[0].title).toBe('Test Song');
    expect(payload.tracks[0].genre.primary).toBe('Pop');
  });

  it('clears writers for instrumental album tracks', async () => {
    const { payload } = await buildDraftPayload(
      buildSingleCreateForm({
        format: 'album',
        releaseType: 'album',
        tracks: [
          {
            id: 't1',
            title: 'Instrumental Track',
            audioFileId: 'af1',
            primaryGenre: 'Instrumental',
            secondaryGenre: 'Indian Pop',
            mood: 'Calm',
            isInstrumental: 'yes',
            writers: ['Should Be Dropped'],
          },
        ],
      }),
      'test-token',
    );

    expect(payload.tracks[0].credits.writers).toEqual([]);
    expect(payload.tracks[0].isInstrumental).toBe(true);
  });

  it('omits preview clip when track is too short for CRBT', async () => {
    const { payload } = await buildDraftPayload(
      buildSingleCreateForm({
        audioFiles: [
          {
            id: 'af1',
            fileName: 'song.wav',
            path: 'tracks/user/audio/song.wav',
            duration: 45,
            size: 1000,
          },
        ],
        previewClipStartTime: '0:10',
      }),
      'test-token',
    );

    expect(payload.tracks[0].previewClip).toBeUndefined();
  });
});

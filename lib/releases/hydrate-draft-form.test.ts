import { describe, expect, it } from 'vitest';
import { hydrateDraftForm } from './hydrate-draft-form';
import { mapMongoReleaseToDetail } from './release-document.mapper';
import type { MongoReleaseDocument } from './release.types';

/** Realistic saved Mongo document — edit flow loads this shape via the API. */
function buildSavedRelease(overrides: Partial<MongoReleaseDocument> = {}): MongoReleaseDocument {
  return {
    _id: 'release-qa-1',
    title: 'Midnight Drive',
    version: 'Radio Edit',
    releaseType: 'album',
    status: 'Draft',
    labelName: 'Indie Records',
    copyright: '2026 Indie Records',
    publisher: '2026 Custom P-Line',
    producers: ['2026 Custom P-Line'],
    recordingYear: 2024,
    releaseDate: '2026-06-15',
    originalReleaseDate: '2020-01-10',
    previouslyReleased: 'yes',
    distributionTerritories: ['India', 'Worldwide'],
    upc: '1234567890123',
    primaryArtists: [
      {
        name: 'Main Artist',
        cosmosId: 'cosmos-main',
        instagramProfileUrl: 'https://instagram.com/mainartist',
        facebookProfileUrl: 'https://facebook.com/mainartist',
      },
      {
        name: 'Second Artist',
        cosmosId: 'cosmos-second',
        instagramProfileUrl: 'https://instagram.com/secondartist',
      },
    ],
    featuredArtists: ['Guest Vocalist'],
    coverArt: {
      url: 'tracks/user/coverart/midnight-ca.jpg',
      filename: 'cover.jpg',
      size: 2048,
      dimensions: { width: 3000, height: 3000 },
      format: 'jpeg',
    },
    tracks: [
      {
        _id: 'track-1',
        trackOrder: 1,
        title: 'Midnight Drive',
        version: 'Album Version',
        artistName: 'Main Artist',
        language: 'English',
        primaryGenre: 'Pop',
        secondaryGenre: 'Synth Pop',
        mood: 'Energetic',
        isExplicit: true,
        isInstrumental: false,
        isrc: 'US-ABC-12-34567',
        previouslyReleased: 'yes',
        originalReleaseDate: '2020-01-10',
        writers: ['Writer One'],
        composers: ['Composer One'],
        featuringArtist: 'Guest Vocalist',
        previewStartTime: '0:30',
        audioFile: {
          url: 'tracks/user/audio/track1.wav',
          filename: 'track1.wav',
          size: 5000000,
          duration: 210,
        },
      },
      {
        _id: 'track-2',
        trackOrder: 2,
        title: 'Sunrise',
        version: 'Extended Mix',
        language: 'Hindi',
        primaryGenre: 'Electronic',
        secondaryGenre: 'House',
        mood: 'Calm',
        isExplicit: false,
        isInstrumental: 'yes',
        previouslyReleased: 'no',
        writers: ['Writer Two'],
        composers: ['Composer Two'],
        audioFile: {
          url: 'tracks/user/audio/track2.wav',
          filename: 'track2.wav',
          size: 6000000,
          duration: 300,
        },
      },
    ],
    ...overrides,
  };
}

describe('hydrateDraftForm — edit round-trip QA', () => {
  it('restores saved P-Line (publisher) instead of default label', () => {
    const form = hydrateDraftForm(buildSavedRelease());
    expect(form.producers).toEqual(['2026 Custom P-Line']);
    expect(form.copyright).toBe('2026 Indie Records');
  });

  it('restores release metadata (version, label, dates, territories, UPC)', () => {
    const form = hydrateDraftForm(buildSavedRelease());
    expect(form.title).toBe('Midnight Drive');
    expect(form.version).toBe('Radio Edit');
    expect(form.labelName).toBe('Indie Records');
    expect(form.releaseDate).toBe('2026-06-15');
    expect(form.previouslyReleased).toBe('yes');
    expect(form.originalReleaseDate).toBe('2020-01-10');
    expect(form.distributionTerritories).toEqual(['India', 'Worldwide']);
    expect(form.upc).toBe('1234567890123');
    expect(form.recordingYear).toBe(2024);
  });

  it('restores main artist social URLs and secondary artists with cosmos IDs', () => {
    const form = hydrateDraftForm(buildSavedRelease());
    expect(form.artistName).toBe('Main Artist');
    expect(form.cosmosArtistId).toBe('cosmos-main');
    expect(form.instagramProfileUrl).toBe('https://instagram.com/mainartist');
    expect(form.facebookProfileUrl).toBe('https://facebook.com/mainartist');
    expect(form.artists).toHaveLength(1);
    expect(form.artists?.[0]).toMatchObject({
      name: 'Second Artist',
      cosmosArtistId: 'cosmos-second',
      instagramProfile: 'https://instagram.com/secondartist',
    });
  });

  it('restores featured artist and cover art storage key', () => {
    const form = hydrateDraftForm(buildSavedRelease());
    expect(form.featuringArtist).toBe('Guest Vocalist');
    expect(form.coverArt).toMatchObject({
      path: 'tracks/user/coverart/midnight-ca.jpg',
      fileName: 'cover.jpg',
    });
  });

  it('restores per-track metadata including version and prior-release fields', () => {
    const form = hydrateDraftForm(buildSavedRelease());
    expect(form.tracks).toHaveLength(2);

    expect(form.tracks?.[0]).toMatchObject({
      title: 'Midnight Drive',
      version: 'Album Version',
      language: 'English',
      isrc: 'US-ABC-12-34567',
      previouslyReleased: 'yes',
      originalReleaseDate: '2020-01-10',
      primaryGenre: 'Pop',
      secondaryGenre: 'Synth Pop',
      mood: 'Energetic',
      isExplicit: true,
      isInstrumental: 'no',
      featuringArtist: 'Guest Vocalist',
      previewClipStartTime: '0:30',
      writers: ['Writer One'],
      composers: ['Composer One'],
    });

    expect(form.tracks?.[1]).toMatchObject({
      title: 'Sunrise',
      version: 'Extended Mix',
      previouslyReleased: 'no',
      isInstrumental: 'yes',
      primaryGenre: 'Electronic',
    });
  });

  it('restores single-release track-level fields onto form root', () => {
    const single = buildSavedRelease({
      releaseType: 'single',
      tracks: undefined,
      audioFile: {
        url: 'tracks/user/audio/single.wav',
        filename: 'single.wav',
        size: 1000,
        duration: 180,
      },
      primaryGenre: 'Rock',
      secondaryGenre: 'Alt Rock',
      language: 'English',
      mood: 'Dark',
      isExplicit: false,
      isrc: 'US-XYZ-99-11111',
      instrumental: 'no',
      writers: ['Solo Writer'],
      composers: ['Solo Composer'],
      previewClipStartTime: '1:00',
    });

    const form = hydrateDraftForm(single);
    expect(form.format).toBe('single');
    expect(form.primaryGenre).toBe('Rock');
    expect(form.secondaryGenre).toBe('Alt Rock');
    expect(form.language).toBe('English');
    expect(form.mood).toBe('Dark');
    expect(form.isrc).toBe('US-XYZ-99-11111');
    expect(form.writers).toEqual(['Solo Writer']);
    expect(form.composers).toEqual(['Solo Composer']);
    expect(form.previewClipStartTime).toBe('1:00');
    expect(form.instrumental).toBe('no');
  });

  it('does not substitute copyright when publisher is empty', () => {
    const form = hydrateDraftForm(
      buildSavedRelease({
        publisher: undefined,
        producers: [],
      }),
    );
    expect(form.producers?.[0]).not.toBe('2026 Indie Records');
    expect(form.copyright).toBe('2026 Indie Records');
  });

  it('prefers producers array when publisher is stale default label', () => {
    const form = hydrateDraftForm({
      ...buildSavedRelease(),
      publisher: 'KratoLib',
      producers: ['2026 Vidhi Vision Production'],
    });
    expect(form.producers).toEqual(['2026 Vidhi Vision Production']);
  });
});

describe('mapMongoReleaseToDetail — read model QA', () => {
  it('maps album track version from Mongo (not null)', () => {
    const detail = mapMongoReleaseToDetail(buildSavedRelease());
    expect(detail.tracks[0].version).toBe('Album Version');
    expect(detail.tracks[1].version).toBe('Extended Mix');
  });

  it('maps release-level publisher without conflating copyright', () => {
    const detail = mapMongoReleaseToDetail(buildSavedRelease());
    expect(detail.release.publisher).toBe('2026 Custom P-Line');
    expect(detail.release.copyright).toBe('2026 Indie Records');
  });

  it('maps track previouslyReleased and originalReleaseDate', () => {
    const detail = mapMongoReleaseToDetail(buildSavedRelease());
    expect(detail.tracks[0].previouslyReleased).toBe(true);
    expect(detail.tracks[0].originalReleaseDate).toBe('2020-01-10');
    expect(detail.tracks[1].previouslyReleased).toBe(false);
  });
});

import { describe, expect, it } from 'vitest';
import { hydrateDraftForm } from './hydrate-draft-form';
import { resolveDraftPublisher } from './build-draft-payload';
import {
  mapDetailToFlatRelease,
  mapMongoReleaseToDetail,
} from './release-document.mapper';
import {
  draftRequestToWriteSnapshot,
  pickChangedDraftFields,
  releaseToWriteSnapshot,
  type ReleaseWriteSnapshot,
} from './pick-changed-draft-fields';
import type { CreateReleaseDraftRequest, MongoReleaseDocument } from './types';

/** Realistic single saved in Mongo — root fields duplicated on tracks[0]. */
function buildSavedSingle(
  overrides: Partial<MongoReleaseDocument> = {},
): MongoReleaseDocument {
  return {
    _id: 'single-1',
    title: 'Dwarikadish Radha No Shyam - From Vidhi Vision Production',
    releaseType: 'single',
    status: 'Draft',
    labelName: 'KratoLib',
    copyright: '2026 KratoLib',
    publisher: '2026 Vidhi Vision Production',
    producers: ['2026 Vidhi Vision Production'],
    recordingYear: 2026,
    releaseDate: '2026-06-01',
    distributionTerritories: ['Worldwide'],
    primaryArtists: [{ name: 'AAMIR MIR', cosmosId: 'cosmos-1' }],
    featuredArtists: [],
    language: 'Gujarati',
    primaryGenre: 'Pop',
    secondaryGenre: 'Indian Pop',
    mood: 'Happy',
    isExplicit: false,
    isInstrumentalFlag: false,
    isrc: 'IN-VVP-26-00001',
    writers: ['Writer One'],
    composers: ['Composer One'],
    previewClipStartTime: '0:30',
    coverArt: {
      url: 'tracks/u/cover.jpg',
      filename: 'cover.jpg',
      size: 1,
      dimensions: { width: 3000, height: 3000 },
      format: 'jpeg',
    },
    tracks: [
      {
        _id: 'track-1',
        trackOrder: 1,
        title: 'Dwarikadish Radha No Shyam - From Vidhi Vision Production',
        artistName: 'AAMIR MIR',
        language: 'Gujarati',
        primaryGenre: 'Pop',
        secondaryGenre: 'Indian Pop',
        mood: 'Happy',
        isExplicit: false,
        isInstrumental: false,
        isrc: 'IN-VVP-26-00001',
        writers: ['Writer One'],
        composers: ['Composer One'],
        previewStartTime: '0:30',
        audioFile: {
          url: 'tracks/u/audio/song.wav',
          filename: 'song.wav',
          size: 1,
          duration: 180,
        },
      },
    ],
    ...overrides,
  };
}

function buildSavedAlbum(
  overrides: Partial<MongoReleaseDocument> = {},
): MongoReleaseDocument {
  return {
    _id: 'album-1',
    title: 'Midnight Drive',
    releaseType: 'album',
    status: 'Draft',
    labelName: 'Indie Records',
    copyright: '2026 Indie Records',
    publisher: '2026 Custom P-Line',
    producers: ['2026 Custom P-Line'],
    recordingYear: 2024,
    releaseDate: '2026-06-15',
    distributionTerritories: ['India'],
    primaryArtists: [{ name: 'Main Artist' }],
    featuredArtists: [],
    coverArt: {
      url: 'tracks/u/cover.jpg',
      filename: 'cover.jpg',
      size: 1,
      dimensions: { width: 3000, height: 3000 },
      format: 'jpeg',
    },
    tracks: [
      {
        _id: 'track-1',
        trackOrder: 1,
        title: 'Midnight Drive',
        language: 'English',
        primaryGenre: 'Pop',
        secondaryGenre: 'Synth Pop',
        mood: 'Energetic',
        isExplicit: true,
        isInstrumental: false,
        writers: ['Writer One'],
        composers: ['Composer One'],
        audioFile: {
          url: 'tracks/u/audio/t1.wav',
          filename: 't1.wav',
          size: 1,
          duration: 210,
        },
      },
      {
        _id: 'track-2',
        trackOrder: 2,
        title: 'Sunrise',
        language: 'Hindi',
        primaryGenre: 'Electronic',
        secondaryGenre: 'House',
        mood: 'Calm',
        isExplicit: false,
        isInstrumental: 'yes',
        writers: ['Writer Two'],
        composers: ['Composer Two'],
        audioFile: {
          url: 'tracks/u/audio/t2.wav',
          filename: 't2.wav',
          size: 1,
          duration: 300,
        },
      },
    ],
    ...overrides,
  };
}

function editBaselineFromMongo(saved: MongoReleaseDocument): ReleaseWriteSnapshot {
  const detail = mapMongoReleaseToDetail(saved);
  const flat = mapDetailToFlatRelease(detail);
  return releaseToWriteSnapshot(flat);
}

function resolveTrackAudioStorageKey(
  form: ReturnType<typeof hydrateDraftForm>,
  track: NonNullable<typeof form.tracks>[number],
  index: number,
  releaseType: 'single' | 'album',
): string {
  const audioId = track.audioFileId;
  const linked = audioId
    ? form.audioFiles?.find((file) => file.id === audioId)
    : undefined;
  if (linked?.path) return linked.path;
  if (releaseType === 'single' && index === 0 && form.audioFile?.path) {
    return form.audioFile.path;
  }
  return 'tracks/u/audio/song.wav';
}

function resolveTrackAudioMeta(
  form: ReturnType<typeof hydrateDraftForm>,
  track: NonNullable<typeof form.tracks>[number],
  index: number,
  releaseType: 'single' | 'album',
) {
  const audioId = track.audioFileId;
  const linked = audioId
    ? form.audioFiles?.find((file) => file.id === audioId)
    : undefined;
  if (linked) {
    return {
      filename: linked.fileName || 'song.wav',
      size: linked.size || 1,
      duration: linked.duration || 180,
    };
  }
  if (releaseType === 'single' && index === 0 && form.audioFile) {
    return {
      filename: form.audioFile.fileName || 'song.wav',
      size: form.audioFile.size || 1,
      duration: form.audioFile.duration || 180,
    };
  }
  return { filename: 'song.wav', size: 1, duration: 180 };
}

function formToDraftRequest(
  form: ReturnType<typeof hydrateDraftForm>,
  releaseType: 'single' | 'album' = 'single',
): CreateReleaseDraftRequest {
  const publisher = resolveDraftPublisher({
    producers: form.producers,
    publisher: form.publisher,
    labelName: form.labelName,
  });

  const mainArtist = {
    name: form.artistName || 'Artist',
    cosmosId: form.cosmosArtistId,
    profiles: {
      instagram: form.instagramProfileUrl
        ? { url: form.instagramProfileUrl }
        : undefined,
      facebook: form.facebookProfileUrl
        ? { url: form.facebookProfileUrl }
        : undefined,
    },
  };

  const mapTrack = (
    track: NonNullable<typeof form.tracks>[number],
    index: number,
  ) => ({
    order: index + 1,
    title: track.title || form.title,
    version: track.version || null,
    artistName: track.artistName || form.artistName,
    language: track.language || form.language || 'English',
    genre: {
      primary:
        track.primaryGenre ||
        (releaseType === 'single' && index === 0 ? form.primaryGenre : '') ||
        'Pop',
      secondary:
        track.secondaryGenre ||
        (releaseType === 'single' && index === 0 ? form.secondaryGenre : '') ||
        'Indian Pop',
    },
    mood:
      track.mood ||
      (releaseType === 'single' && index === 0 ? form.mood : '') ||
      'Happy',
    isExplicit:
      track.isExplicit ??
      (releaseType === 'single' && index === 0 ? form.isExplicit : false) ??
      false,
    isInstrumental:
      track.isInstrumental === 'yes' ||
      (releaseType === 'single' && index === 0 && form.instrumental === 'yes'),
    isrc: track.isrc || (releaseType === 'single' && index === 0 ? form.isrc : undefined),
    previouslyReleased: track.previouslyReleased === 'yes',
    originalReleaseDate: track.originalReleaseDate || null,
    credits: {
      writers:
        track.writers?.length
          ? track.writers
          : releaseType === 'single' && index === 0
            ? form.writers || []
            : [],
      composers:
        track.composers?.length
          ? track.composers
          : releaseType === 'single' && index === 0
            ? form.composers || []
            : [],
      featuring: track.featuringArtist || form.featuringArtist || null,
    },
    audio: {
      storageKey:
        track.audioFile?.path ||
        (index === 0 && releaseType === 'single'
          ? form.audioFile?.path
          : undefined) ||
        'tracks/u/audio/song.wav',
      filename: track.audioFile?.fileName || 'song.wav',
      size: track.audioFile?.size || 1,
      duration: track.audioFile?.duration || 180,
      format: 'wav',
    },
    previewClip: track.previewClipStartTime
      ? { startTime: track.previewClipStartTime }
      : releaseType === 'single' && index === 0 && form.previewClipStartTime
        ? { startTime: form.previewClipStartTime }
        : undefined,
  });

  const mapTrackWithAudio = (
    track: NonNullable<typeof form.tracks>[number],
    index: number,
  ) => {
    const audioMeta = resolveTrackAudioMeta(form, track, index, releaseType);
    const base = mapTrack(track, index);
    return {
      ...base,
      audio: {
        storageKey: resolveTrackAudioStorageKey(form, track, index, releaseType),
        filename: audioMeta.filename,
        size: audioMeta.size,
        duration: audioMeta.duration,
        format: 'wav',
      },
    };
  };

  const tracks =
    form.tracks?.length && releaseType !== 'single'
      ? form.tracks.map(mapTrackWithAudio)
      : [mapTrackWithAudio(form.tracks?.[0] ?? {}, 0)];

  return {
    release: {
      title: form.title,
      version: form.version || null,
      type: releaseType,
      labelName: form.labelName || 'KratoLib',
      releaseDate: form.releaseDate || '2026-06-01',
      originalReleaseDate: form.originalReleaseDate || null,
      previouslyReleased: form.previouslyReleased === 'yes',
      distributionTerritories: form.distributionTerritories || ['Worldwide'],
      upc: form.upc || null,
      copyright: form.copyright || null,
      publisher,
      recordingYear: form.recordingYear || 2026,
    },
    artists: {
      main: [mainArtist],
      featured: form.featuringArtist ? [form.featuringArtist] : [],
    },
    coverArt: {
      storageKey: form.coverArt?.path || 'tracks/u/cover.jpg',
      filename: form.coverArt?.fileName || 'cover.jpg',
      size: form.coverArt?.size || 1,
      dimensions: { width: 3000, height: 3000 },
      format: 'jpeg',
    },
    tracks,
    submission: { rightsAccepted: true },
  };
}

function buildPatchFromEdit(
  saved: MongoReleaseDocument,
  mutate: (form: ReturnType<typeof hydrateDraftForm>) => void,
  releaseType: 'single' | 'album' = 'single',
) {
  const form = hydrateDraftForm(saved);
  mutate(form);
  const baseline = editBaselineFromMongo(saved);
  const current = draftRequestToWriteSnapshot(formToDraftRequest(form, releaseType));
  return { patch: pickChangedDraftFields(baseline, current), baseline, current };
}

/** User-editable sync fields must stay out of patch when re-saving unchanged data. */
function expectNoMeaningfulSingleChanges(patch: ReleaseWriteSnapshot) {
  expect(patch.title).toBeUndefined();
  expect(patch.publisher).toBeUndefined();
  expect(patch.producers).toBeUndefined();
  expect(patch.copyright).toBeUndefined();
  expect(patch.primaryGenre).toBeUndefined();
  expect(patch.secondaryGenre).toBeUndefined();
  expect(patch.mood).toBeUndefined();
  expect(patch.isrc).toBeUndefined();
  expect(patch.writers).toBeUndefined();
  expect(patch.composers).toBeUndefined();
  expect(patch.previewClipStartTime).toBeUndefined();
  expect(patch.language).toBeUndefined();
  expect(patch.isExplicit).toBeUndefined();
  expect(patch.isInstrumentalFlag).toBeUndefined();
}

describe('resolveDraftPublisher', () => {
  it('uses producers[0] and never falls back to copyright', () => {
    expect(
      resolveDraftPublisher({
        producers: ['2026 Vidhi Vision Production'],
        publisher: undefined,
        labelName: 'KratoLib',
      }),
    ).toBe('2026 Vidhi Vision Production');
  });

  it('falls back to default label when producers and publisher are empty', () => {
    expect(
      resolveDraftPublisher({
        producers: [],
        publisher: undefined,
        labelName: 'KratoLib',
      }),
    ).toBe('KratoLib');
  });
});

describe('Single release edit round-trip', () => {
  it('hydrate restores P-Line separately from copyright', () => {
    const form = hydrateDraftForm(buildSavedSingle());
    expect(form.producers).toEqual(['2026 Vidhi Vision Production']);
    expect(form.copyright).toBe('2026 KratoLib');
    expect(form.producers?.[0]).not.toBe(form.copyright);
  });

  it('title edit produces sparse patch with root and tracks[0].title aligned', () => {
    const { patch } = buildPatchFromEdit(buildSavedSingle(), (form) => {
      form.title = 'Dwarikadish Radha No Shyam';
      if (form.tracks?.[0]) {
        form.tracks[0].title = 'Dwarikadish Radha No Shyam';
      }
    });

    expect(patch.title).toBe('Dwarikadish Radha No Shyam');
    expect(patch.tracks?.[0]?.title).toBe('Dwarikadish Radha No Shyam');
  });

  it('P-Line edit produces publisher/producers patch without touching copyright', () => {
    const { patch } = buildPatchFromEdit(buildSavedSingle(), (form) => {
      form.producers = ['2026 New P-Line Label'];
    });

    expect(patch.publisher).toBe('2026 New P-Line Label');
    expect(patch.producers).toEqual(['2026 New P-Line Label']);
    expect(patch.copyright).toBeUndefined();
  });

  it('copyright edit alone does not rewrite publisher', () => {
    const { patch } = buildPatchFromEdit(buildSavedSingle(), (form) => {
      form.copyright = '2027 Custom C-Line';
    });

    expect(patch.copyright).toBe('2027 Custom C-Line');
    expect(patch.publisher).toBeUndefined();
    expect(patch.producers).toBeUndefined();
  });

  it('does not emit meaningful field changes when re-saving hydrated single unchanged', () => {
    const saved = buildSavedSingle();
    const form = hydrateDraftForm(saved);
    const baseline = editBaselineFromMongo(saved);
    const current = draftRequestToWriteSnapshot(formToDraftRequest(form, 'single'));
    const patch = pickChangedDraftFields(baseline, current);
    expectNoMeaningfulSingleChanges(patch);
    if (patch.tracks?.[0]?.title) {
      expect(patch.tracks[0].title).toBe(baseline.tracks?.[0]?.title);
    }
  });

  it('single denormalized field edits appear in sparse patch', () => {
    const { patch } = buildPatchFromEdit(buildSavedSingle(), (form) => {
      form.primaryGenre = 'Rock';
      form.secondaryGenre = 'Alt Rock';
      form.mood = 'Dark';
      form.isrc = 'IN-NEW-26-99999';
      form.writers = ['New Writer'];
      form.composers = ['New Composer'];
      form.previewClipStartTime = '1:00';
      form.language = 'Hindi';
      form.isExplicit = true;
      form.instrumental = 'yes';
      if (form.tracks?.[0]) {
        form.tracks[0].primaryGenre = 'Rock';
        form.tracks[0].secondaryGenre = 'Alt Rock';
        form.tracks[0].mood = 'Dark';
        form.tracks[0].isrc = 'IN-NEW-26-99999';
        form.tracks[0].writers = ['New Writer'];
        form.tracks[0].composers = ['New Composer'];
        form.tracks[0].previewClipStartTime = '1:00';
        form.tracks[0].language = 'Hindi';
        form.tracks[0].isExplicit = true;
        form.tracks[0].isInstrumental = 'yes';
      }
    });

    expect(patch.primaryGenre).toBe('Rock');
    expect(patch.secondaryGenre).toBe('Alt Rock');
    expect(patch.mood).toBe('Dark');
    expect(patch.isrc).toBe('IN-NEW-26-99999');
    expect(patch.writers).toEqual(['New Writer']);
    expect(patch.composers).toEqual(['New Composer']);
    expect(patch.previewClipStartTime).toBe('1:00');
    expect(patch.language).toBe('Hindi');
    expect(patch.isExplicit).toBe(true);
    expect(patch.isInstrumentalFlag).toBe(true);
    expect(patch.tracks?.[0]?.primaryGenre).toBe('Rock');
    expect(patch.tracks?.[0]?.isrc).toBe('IN-NEW-26-99999');
  });
});

describe('Album release edit round-trip', () => {
  it('album title change updates release title but not track titles', () => {
    const { patch } = buildPatchFromEdit(
      buildSavedAlbum(),
      (form) => {
        form.title = 'Renamed Album Title';
      },
      'album',
    );

    expect(patch.title).toBe('Renamed Album Title');
    if (patch.tracks) {
      expect(patch.tracks[0]?.title).toBe('Midnight Drive');
      expect(patch.tracks[1]?.title).toBe('Sunrise');
    }
  });

  it('track title change does not change release title in patch', () => {
    const { patch } = buildPatchFromEdit(
      buildSavedAlbum(),
      (form) => {
        if (form.tracks?.[0]) {
          form.tracks[0].title = 'Renamed Track One';
        }
      },
      'album',
    );

    expect(patch.title).toBeUndefined();
    expect(patch.tracks?.[0]?.title).toBe('Renamed Track One');
    expect(patch.tracks?.[1]?.title).toBe('Sunrise');
  });

  it('second track metadata change does not touch release root genre fields', () => {
    const { patch } = buildPatchFromEdit(
      buildSavedAlbum(),
      (form) => {
        if (form.tracks?.[1]) {
          form.tracks[1].primaryGenre = 'Jazz';
          form.tracks[1].mood = 'Smooth';
        }
      },
      'album',
    );

    expect(patch.primaryGenre).toBeUndefined();
    expect(patch.mood).toBeUndefined();
    expect(patch.tracks?.[1]?.primaryGenre).toBe('Jazz');
    expect(patch.tracks?.[1]?.mood).toBe('Smooth');
  });
});

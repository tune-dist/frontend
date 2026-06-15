export const INSTRUMENTAL_LANGUAGE = 'Instrumental';

export const LANGUAGE_OPTIONS = [
  'Hindi',
  'English',
  'Punjabi',
  'Tamil',
  'Telugu',
  'Bengali',
  'Marathi',
  'Gujarati',
  'Kannada',
  'Malayalam',
  'Urdu',
  'Bhojpuri',
  'Haryanvi',
  'Rajasthani',
  INSTRUMENTAL_LANGUAGE,
] as const;

export function isInstrumentalPrimaryGenre(genre?: string): boolean {
  if (!genre?.trim()) return false;
  return genre.trim().toLowerCase().includes('instrumental');
}

export function isInstrumentalSelection(value?: string | boolean): boolean {
  return value === 'yes' || value === true;
}

/** Instrumental genre and/or explicit "no lyrics" selection — skip lyricists. */
export function isInstrumentalRelease(
  primaryGenre?: string,
  instrumental?: string | boolean,
): boolean {
  return (
    isInstrumentalPrimaryGenre(primaryGenre) ||
    isInstrumentalSelection(instrumental)
  );
}

/** Release-level: no lyricist / songwriter fields should be shown or sent. */
export function isReleaseNoLyrics(release: {
  primaryGenre?: string;
  language?: string;
  instrumental?: string;
  isInstrumentalFlag?: boolean;
}): boolean {
  if (isInstrumentalRelease(release.primaryGenre, release.instrumental)) {
    return true;
  }
  if (release.language?.trim().toLowerCase() === INSTRUMENTAL_LANGUAGE.toLowerCase()) {
    return true;
  }
  if (release.isInstrumentalFlag === true) {
    return true;
  }
  return false;
}

/** Track-level: inherits release instrumental rules when track is not explicitly lyrical. */
export function isTrackNoLyrics(
  track: {
    primaryGenre?: string;
    language?: string;
    isInstrumental?: boolean | string;
  },
  release?: {
    primaryGenre?: string;
    language?: string;
    instrumental?: string;
    isInstrumentalFlag?: boolean;
  },
): boolean {
  if (track.isInstrumental === true || track.isInstrumental === 'yes') {
    return true;
  }
  return isReleaseNoLyrics({
    primaryGenre: track.primaryGenre || release?.primaryGenre,
    language: track.language || release?.language,
    instrumental: release?.instrumental,
    isInstrumentalFlag: release?.isInstrumentalFlag,
  });
}

/** Language shown/stored for a release — Instrumental when genre requires it. */
export function resolveLanguage(
  primaryGenre: string | undefined,
  language: string | undefined,
): string {
  if (isInstrumentalPrimaryGenre(primaryGenre)) {
    return INSTRUMENTAL_LANGUAGE;
  }
  return language?.trim() ?? '';
}

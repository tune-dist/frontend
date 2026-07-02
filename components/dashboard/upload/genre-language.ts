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

/** Pick the default instrumental primary genre from the catalog. */
export function resolveInstrumentalPrimaryGenre<T extends { name: string }>(
  genres: T[],
): string | undefined {
  const instrumentalGenres = genres.filter((g) =>
    isInstrumentalPrimaryGenre(g.name),
  );
  if (instrumentalGenres.length === 0) return undefined;

  const exact = instrumentalGenres.find(
    (g) => g.name.trim().toLowerCase() === 'instrumental',
  );
  return (exact ?? instrumentalGenres[0]).name;
}

/** Genres shown based on instrumental vs lyrical selection. */
export function filterGenresForInstrumentalChoice<T extends { name: string }>(
  genres: T[],
  instrumental?: string | boolean,
): T[] {
  const isInstrumental = isInstrumentalSelection(instrumental);
  if (isInstrumental) {
    const instrumentalGenres = genres.filter((g) =>
      isInstrumentalPrimaryGenre(g.name),
    );
    return instrumentalGenres.length > 0 ? instrumentalGenres : genres;
  }
  const lyricalGenres = genres.filter(
    (g) => !isInstrumentalPrimaryGenre(g.name),
  );
  return lyricalGenres.length > 0 ? lyricalGenres : genres;
}

/** Language shown/stored for a release — Instrumental when track has no lyrics. */
export function resolveLanguage(
  primaryGenre: string | undefined,
  language: string | undefined,
  instrumental?: string | boolean,
): string {
  if (isInstrumentalRelease(primaryGenre, instrumental)) {
    return INSTRUMENTAL_LANGUAGE;
  }
  return language?.trim() ?? '';
}

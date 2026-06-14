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

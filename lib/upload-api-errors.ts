import type { UseFormSetError, FieldPath } from 'react-hook-form';
import { extractApiFieldErrors, type ApiFieldError } from './get-error-message';
import type { UploadFormData } from '@/components/dashboard/upload/upload-form.schema';

const API_TO_FORM_FIELD: Record<string, FieldPath<UploadFormData>> = {
  releaseType: 'format',
  genres: 'primaryGenre',
  subGenre: 'secondaryGenre',
  featuredArtists: 'featuringArtist',
  coverImage: 'coverArt',
  songwriters: 'writers',
};

const FIELD_TO_STEP: Record<string, number> = {
  title: 1,
  artistName: 1,
  format: 1,
  releaseType: 1,
  releaseDate: 1,
  labelName: 1,
  upc: 1,
  version: 1,
  featuringArtist: 1,
  featuredArtists: 1,
  spotifyProfile: 1,
  appleMusicProfile: 1,
  youtubeMusicProfile: 1,
  instagramProfile: 1,
  facebookProfile: 1,
  audioFile: 2,
  audioConsent: 2,
  primaryGenre: 3,
  secondaryGenre: 3,
  genres: 3,
  subGenre: 3,
  language: 3,
  mood: 3,
  writers: 3,
  composers: 3,
  tracks: 3,
  isExplicit: 3,
  explicitLyrics: 3,
  isrc: 3,
  instrumental: 3,
  coverArt: 4,
  coverArtConsent: 4,
  coverImage: 4,
  copyright: 5,
  producers: 5,
};

export type AppliedUploadApiErrors = {
  fieldErrors: ApiFieldError[];
  globalErrors: ApiFieldError[];
  targetStep: number | null;
};

export function applyUploadApiErrors(
  error: unknown,
  setError: UseFormSetError<UploadFormData>,
): AppliedUploadApiErrors {
  const parsed = extractApiFieldErrors(error);
  const fieldErrors: ApiFieldError[] = [];
  const globalErrors: ApiFieldError[] = [];

  for (const item of parsed) {
    if (!item.field || item.field === 'global') {
      globalErrors.push(item);
      continue;
    }

    const formField = API_TO_FORM_FIELD[item.field] ?? (item.field as FieldPath<UploadFormData>);
    fieldErrors.push({ field: formField, message: item.message });
    setError(formField, { type: 'server', message: item.message });
  }

  const targetStep = fieldErrors.reduce<number | null>((min, { field }) => {
    const step = FIELD_TO_STEP[field] ?? 5;
    return min === null ? step : Math.min(min, step);
  }, null);

  return { fieldErrors, globalErrors, targetStep };
}

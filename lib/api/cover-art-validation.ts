import apiClient from '../api-client';

export interface CoverArtMetadata {
  artistName: string;
  trackTitle: string;
  featuredArtists?: string[];
  isExplicit?: boolean;
  releaseYear?: string;
  recordLabel?: string;
}

export type CoverArtValidationStatus = 'approved' | 'rejected' | 'warned' | 'warning';

export interface CoverArtValidationError {
  code: string;
  message: string;
  field?: string;
  severity?: 'error' | 'warning';
}

export interface CoverArtValidationResponse {
  status: CoverArtValidationStatus;
  issues?: CoverArtValidationError[];
  errors: CoverArtValidationError[];
}

/** Server-side cover art validation (OCR, NSFW, metadata rules). */
export async function validateCoverArt(
  file: File,
  metadata: CoverArtMetadata,
): Promise<CoverArtValidationResponse> {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('metadata', JSON.stringify(metadata));

  const response = await apiClient.post<CoverArtValidationResponse>(
    '/cover-art-validation/validate',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );

  return response.data;
}

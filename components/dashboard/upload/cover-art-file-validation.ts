import apiClient from '@/lib/api-client';

export interface CoverArtFieldRules {
  allowedFileTypes?: string[];
  maxFileSizeMB?: number;
}

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

export function getCoverArtMaxSizeMB(rules?: CoverArtFieldRules): number {
  return rules?.maxFileSizeMB ?? 10;
}

export function validateCoverArtFile(
  file: File,
  rules?: CoverArtFieldRules,
): { valid: true } | { valid: false; message: string } {
  const maxSizeMB = getCoverArtMaxSizeMB(rules);
  const allowedTypes = (rules?.allowedFileTypes ?? ["jpg", "jpeg", "png"]).map(
    (t) => t.toLowerCase(),
  );

  if (!file.type.startsWith("image/")) {
    return {
      valid: false,
      message: "Please upload an image file (JPG, PNG, etc.)",
    };
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const subtype = file.type.split("/")[1]?.toLowerCase() ?? "";
  const typeAllowed =
    allowedTypes.includes(ext) ||
    allowedTypes.includes(subtype) ||
    (subtype === "jpeg" && allowedTypes.includes("jpg"));

  if (!typeAllowed) {
    return {
      valid: false,
      message: `File type '${ext || subtype}' is not allowed. Allowed types: ${allowedTypes.join(", ")}`,
    };
  }

  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    const fileSizeMB = file.size / (1024 * 1024);
    return {
      valid: false,
      message: `File size (${fileSizeMB.toFixed(2)}MB) exceeds the maximum allowed size of ${maxSizeMB}MB.`,
    };
  }

  return { valid: true };
}

export function validateCoverArtSize(
  sizeBytes: number,
  rules?: CoverArtFieldRules,
): { valid: true } | { valid: false; message: string } {
  const maxSizeMB = getCoverArtMaxSizeMB(rules);
  const maxBytes = maxSizeMB * 1024 * 1024;
  if (sizeBytes <= maxBytes) return { valid: true };

  const fileSizeMB = sizeBytes / (1024 * 1024);
  return {
    valid: false,
    message: `File size (${fileSizeMB.toFixed(2)}MB) exceeds the maximum allowed size of ${maxSizeMB}MB.`,
  };
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

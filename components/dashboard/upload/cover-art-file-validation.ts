export interface CoverArtFieldRules {
  allowedFileTypes?: string[];
  maxFileSizeMB?: number;
}

export type {
  CoverArtMetadata,
  CoverArtValidationStatus,
  CoverArtValidationError,
  CoverArtValidationResponse,
} from '@/lib/api/cover-art-validation';

export { validateCoverArt } from '@/lib/api/cover-art-validation';

export function getCoverArtMaxSizeMB(rules?: CoverArtFieldRules): number {
  return rules?.maxFileSizeMB ?? 10;
}

export const COVER_ART_MIN_DIMENSION_PX = 1500;
export const COVER_ART_MAX_DIMENSION_PX = 6000;

export function isExistingUnchangedCoverArt(
  coverArt: unknown,
  coverArtChanged?: boolean,
): boolean {
  if (coverArtChanged) return false;
  const data = coverArt as { path?: string } | null | undefined;
  return Boolean(data?.path?.trim());
}

export function validateCoverArtDimensions(
  width: number,
  height: number,
  minPx: number = COVER_ART_MIN_DIMENSION_PX,
  maxPx: number = COVER_ART_MAX_DIMENSION_PX,
): { valid: true } | { valid: false; message: string } {
  if (width < minPx || height < minPx) {
    return {
      valid: false,
      message: `Image resolution too low. Minimum ${minPx}x${minPx}px required. Current: ${width}x${height}px`,
    };
  }

  if (width > maxPx || height > maxPx) {
    return {
      valid: false,
      message: `Image resolution too high. Maximum ${maxPx}x${maxPx}px allowed. Current: ${width}x${height}px`,
    };
  }

  return { valid: true };
}

export function loadCoverArtImage(
  file: File,
): Promise<{ width: number; height: number; previewDataUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('Failed to read image file.'));
    };

    reader.onloadend = () => {
      const img = new Image();

      img.onerror = () => {
        reject(
          new Error(
            'Failed to load image. If you are using a phone, please ensure it is a standard JPG or PNG file.',
          ),
        );
      };

      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
          previewDataUrl: reader.result as string,
        });
      };

      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
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

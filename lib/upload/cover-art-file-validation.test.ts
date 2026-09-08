import { describe, expect, it } from 'vitest';
import {
  COVER_ART_MAX_DIMENSION_PX,
  COVER_ART_MIN_DIMENSION_PX,
  getCoverArtMaxSizeMB,
  isExistingUnchangedCoverArt,
  validateCoverArtDimensions,
  validateCoverArtFile,
  validateCoverArtSize,
} from '@/components/dashboard/upload/cover-art-file-validation';

function mockFile(
  name: string,
  type: string,
  sizeBytes: number,
): File {
  return { name, type, size: sizeBytes } as File;
}

describe('cover-art-file-validation — cover art step', () => {
  it('uses default 10MB max when plan rules are missing', () => {
    expect(getCoverArtMaxSizeMB()).toBe(10);
    expect(getCoverArtMaxSizeMB({ maxFileSizeMB: 5 })).toBe(5);
  });

  it('accepts valid JPG cover art file', () => {
    const result = validateCoverArtFile(
      mockFile('cover.jpg', 'image/jpeg', 2 * 1024 * 1024),
    );
    expect(result.valid).toBe(true);
  });

  it('rejects non-image files', () => {
    const result = validateCoverArtFile(
      mockFile('cover.pdf', 'application/pdf', 1024),
    );
    expect(result.valid).toBe(false);
  });

  it('rejects files larger than plan limit', () => {
    const result = validateCoverArtFile(
      mockFile('cover.jpg', 'image/jpeg', 11 * 1024 * 1024),
      { maxFileSizeMB: 10 },
    );
    expect(result.valid).toBe(false);
  });

  it('validates cover art dimensions', () => {
    expect(
      validateCoverArtDimensions(3000, 3000).valid,
    ).toBe(true);
    expect(
      validateCoverArtDimensions(1000, 1000).valid,
    ).toBe(false);
    expect(
      validateCoverArtDimensions(7000, 7000).valid,
    ).toBe(false);
  });

  it('uses shared min/max dimension constants', () => {
    expect(COVER_ART_MIN_DIMENSION_PX).toBe(1500);
    expect(COVER_ART_MAX_DIMENSION_PX).toBe(6000);
  });

  it('validates byte size independently of File object', () => {
    expect(validateCoverArtSize(5 * 1024 * 1024).valid).toBe(true);
    expect(validateCoverArtSize(11 * 1024 * 1024).valid).toBe(false);
  });

  it('detects unchanged existing cover art in edit mode', () => {
    expect(
      isExistingUnchangedCoverArt({ path: 'tracks/u/cover.jpg' }, false),
    ).toBe(true);
    expect(
      isExistingUnchangedCoverArt({ path: 'tracks/u/cover.jpg' }, true),
    ).toBe(false);
  });
});

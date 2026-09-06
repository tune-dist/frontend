import { describe, expect, it } from 'vitest';
import { uploadFormSchema } from '@/components/dashboard/upload/upload-form.schema';
import { earliestValidReleaseDate } from '@/lib/distribution-issue';

const FUTURE = '2026-12-01';

function buildValidSingleForm(overrides: Record<string, unknown> = {}) {
  return {
    numberOfSongs: '1',
    title: 'Test Song',
    artistName: 'Test Artist',
    format: 'single',
    releaseType: 'single',
    releaseDate: FUTURE,
    labelName: 'KratoLib',
    primaryGenre: 'Pop',
    secondaryGenre: 'Indian Pop',
    mood: 'Happy',
    distributionTerritories: ['Worldwide'],
    ...overrides,
  };
}

describe('uploadFormSchema — create release form', () => {
  it('accepts a valid single release draft', () => {
    const result = uploadFormSchema.safeParse(buildValidSingleForm());
    expect(result.success).toBe(true);
  });

  it('requires title', () => {
    const result = uploadFormSchema.safeParse(
      buildValidSingleForm({ title: '' }),
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('title'))).toBe(
        true,
      );
    }
  });

  it('requires artist name', () => {
    const result = uploadFormSchema.safeParse(
      buildValidSingleForm({ artistName: '' }),
    );
    expect(result.success).toBe(false);
  });

  it('requires vibe on single releases', () => {
    const result = uploadFormSchema.safeParse(
      buildValidSingleForm({ mood: '' }),
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('mood'))).toBe(
        true,
      );
    }
  });

  it('requires primary and sub-genre on single releases', () => {
    const result = uploadFormSchema.safeParse(
      buildValidSingleForm({ primaryGenre: '', secondaryGenre: '' }),
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join('.'));
      expect(paths).toContain('primaryGenre');
      expect(paths).toContain('secondaryGenre');
    }
  });

  it('requires vibe on each album track', () => {
    const result = uploadFormSchema.safeParse({
      ...buildValidSingleForm({ format: 'album', mood: undefined }),
      tracks: [
        {
          id: 't1',
          title: 'Track One',
          audioFileId: 'af1',
          primaryGenre: 'Pop',
          secondaryGenre: 'Indian Pop',
          mood: '',
        },
      ],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((i) => i.path.join('.') === 'tracks.0.mood'),
      ).toBe(true);
    }
  });

  it('rejects invalid ISRC format', () => {
    const result = uploadFormSchema.safeParse(
      buildValidSingleForm({ isrc: 'BAD-ISRC' }),
    );
    expect(result.success).toBe(false);
  });

  it('accepts valid ISRC format', () => {
    const result = uploadFormSchema.safeParse(
      buildValidSingleForm({ isrc: 'US-ABC-12-34567' }),
    );
    expect(result.success).toBe(true);
  });

  it('rejects UPC that is not 13 digits', () => {
    const result = uploadFormSchema.safeParse(
      buildValidSingleForm({ upc: '12345' }),
    );
    expect(result.success).toBe(false);
  });

  it('accepts empty UPC for auto-generation', () => {
    const result = uploadFormSchema.safeParse(
      buildValidSingleForm({ upc: '' }),
    );
    expect(result.success).toBe(true);
  });

  it('rejects release dates before today', () => {
    const result = uploadFormSchema.safeParse(
      buildValidSingleForm({ releaseDate: '2020-01-01' }),
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('releaseDate'))).toBe(
        true,
      );
    }
  });

  it('accepts release date on or after today', () => {
    const today = earliestValidReleaseDate();
    const result = uploadFormSchema.safeParse(
      buildValidSingleForm({ releaseDate: today }),
    );
    expect(result.success).toBe(true);
  });

  it('rejects invalid songwriter names', () => {
    const result = uploadFormSchema.safeParse(
      buildValidSingleForm({ writers: ['123 Invalid Name'] }),
    );
    expect(result.success).toBe(false);
  });
});

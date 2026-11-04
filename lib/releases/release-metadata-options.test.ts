import { describe, expect, it } from 'vitest';
import {
  canonicalMetadataValue,
  filterMetadataOptions,
  releaseMetadataOptions,
} from './release-metadata-options';

describe('releaseMetadataOptions', () => {
  it('merges the legacy value without duplicating it', () => {
    expect(releaseMetadataOptions(['Alpha', 'Beta'], 'alpha')).toEqual([
      'Alpha',
      'Beta',
    ]);
  });
});

describe('filterMetadataOptions', () => {
  const options = ['Alpha Records', 'Beta Music'];

  it('shows every saved value when the search is empty', () => {
    expect(filterMetadataOptions(options, '   ')).toEqual({
      matches: options,
      addValue: null,
    });
  });

  it('filters while the user types and hides add when a result exists', () => {
    expect(filterMetadataOptions(options, 'alp')).toEqual({
      matches: ['Alpha Records'],
      addValue: null,
    });
  });

  it('offers add only when nothing matches', () => {
    expect(filterMetadataOptions(options, 'Gamma')).toEqual({
      matches: [],
      addValue: 'Gamma',
    });
  });

  it('does not offer add for an exact saved value', () => {
    expect(filterMetadataOptions(options, 'beta music')).toEqual({
      matches: ['Beta Music'],
      addValue: null,
    });
  });
});

describe('canonicalMetadataValue', () => {
  it('keeps the saved spelling', () => {
    expect(canonicalMetadataValue(['My Label'], ' my label ')).toBe('My Label');
  });
});

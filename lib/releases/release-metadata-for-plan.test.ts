import { describe, expect, it } from 'vitest';
import { releaseMetadataForPlan } from './release-metadata-for-plan';

describe('releaseMetadataForPlan', () => {
  it('uses KratoLib for a free plan', () => {
    expect(releaseMetadataForPlan({ planKey: 'free' })).toEqual({
      labelName: 'KratoLib',
      copyright: 'KratoLib',
      producers: ['KratoLib'],
    });
  });

  it('leaves paid fields empty until the user saves their own lines', () => {
    expect(releaseMetadataForPlan({ planKey: 'solo' })).toEqual({
      labelName: '',
      copyright: '',
      producers: [''],
    });
  });

  it('prefills a paid plan from saved metadata', () => {
    expect(
      releaseMetadataForPlan({
        planKey: 'solo',
        savedLabelName: 'My Label',
        savedCopyright: '2026 My Label',
        savedPublisher: '2026 My P-Line',
      }),
    ).toEqual({
      labelName: 'My Label',
      copyright: '2026 My Label',
      producers: ['2026 My P-Line'],
    });
  });

  it('replaces a free-plan release default after upgrade', () => {
    expect(
      releaseMetadataForPlan({
        planKey: 'solo',
        savedLabelName: 'My Label',
        savedCopyright: '2026 My Label',
        savedPublisher: '2026 My P-Line',
        replaceDefaultOnly: true,
        current: {
          labelName: 'KratoLib',
          copyright: 'KratoLib',
          producers: ['KratoLib'],
        },
      }),
    ).toEqual({
      labelName: 'My Label',
      copyright: '2026 My Label',
      producers: ['2026 My P-Line'],
    });
  });

  it('clears the free default on edit when paid metadata is not saved yet', () => {
    expect(
      releaseMetadataForPlan({
        planKey: 'solo',
        replaceDefaultOnly: true,
        current: {
          labelName: 'KratoLib',
          copyright: 'KratoLib',
          producers: ['KratoLib'],
        },
      }),
    ).toEqual({
      labelName: '',
      copyright: '',
      producers: [''],
    });
  });

  it('keeps a custom line already stored on the release', () => {
    expect(
      releaseMetadataForPlan({
        planKey: 'solo',
        savedLabelName: 'My Label',
        savedCopyright: '2026 My Label',
        savedPublisher: '2026 My P-Line',
        replaceDefaultOnly: true,
        current: {
          labelName: 'Indie Records',
          copyright: '2026 Indie Records',
          producers: ['2026 Indie P-Line'],
        },
      }),
    ).toBeNull();
  });
});

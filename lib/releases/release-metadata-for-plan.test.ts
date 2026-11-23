import { describe, expect, it } from 'vitest';
import {
  isActiveEnterpriseCatalog,
  releaseMetadataForPlan,
  usesDefaultReleaseMetadata,
} from './release-metadata-for-plan';

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

  it('uses the default label after enterprise access ends', () => {
    expect(
      releaseMetadataForPlan({
        planKey: 'enterprise',
        hasPaidPlanAccess: false,
        savedLabelName: 'Nova Records',
        savedCopyright: 'test c line',
        savedPublisher: 'test p line',
      }),
    ).toEqual({
      labelName: 'KratoLib',
      copyright: 'KratoLib',
      producers: ['KratoLib'],
    });
  });

  it('keeps saved enterprise lines while access is active', () => {
    expect(isActiveEnterpriseCatalog({
      planKey: 'enterprise',
      hasPaidPlanAccess: true,
    })).toBe(true);
    expect(usesDefaultReleaseMetadata({
      planKey: 'enterprise',
      hasPaidPlanAccess: true,
    })).toBe(false);
    expect(
      releaseMetadataForPlan({
        planKey: 'enterprise',
        hasPaidPlanAccess: true,
        savedLabelName: 'Nova Records',
        savedCopyright: 'test c line',
        savedPublisher: 'test p line',
      }),
    ).toEqual({
      labelName: 'Nova Records',
      copyright: 'test c line',
      producers: ['test p line'],
    });
  });

  it('gives staff the enterprise catalog even on a free stored plan', () => {
    expect(isActiveEnterpriseCatalog({ planKey: 'free', isStaff: true })).toBe(true);
    expect(usesDefaultReleaseMetadata({ planKey: 'free', isStaff: true })).toBe(false);
  });

  it('keeps a paid plan on its saved line after leaving enterprise', () => {
    expect(isActiveEnterpriseCatalog({ planKey: 'solo', hasPaidPlanAccess: true })).toBe(false);
    expect(usesDefaultReleaseMetadata({ planKey: 'solo', hasPaidPlanAccess: true })).toBe(false);
    expect(
      releaseMetadataForPlan({
        planKey: 'solo',
        hasPaidPlanAccess: true,
        savedLabelName: 'Nova Records',
        savedCopyright: 'test c line',
        savedPublisher: 'test p line',
      }),
    ).toEqual({
      labelName: 'Nova Records',
      copyright: 'test c line',
      producers: ['test p line'],
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

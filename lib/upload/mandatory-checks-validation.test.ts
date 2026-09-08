import { describe, expect, it } from 'vitest';
import {
  areMandatoryChecksComplete,
  buildAcceptedMandatoryChecks,
  getRequiredMandatoryCheckKeys,
  getUncheckedMandatoryChecks,
  hasIrregularCapitalization,
  needsCapitalizationConfirmation,
} from './mandatory-checks-validation';
import type { MandatoryChecks } from '@/components/dashboard/upload/upload-form.schema';

function allCheckedExcept(
  omit: Partial<Record<keyof MandatoryChecks, boolean>> = {},
): MandatoryChecks {
  return {
    youtubeConfirmation: true,
    capitalizationConfirmation: true,
    promoServices: true,
    rightsAuthorization: true,
    nameUsage: true,
    termsAgreement: true,
    ownershipConfirmation: true,
    ...omit,
  };
}

describe('mandatory-checks-validation — review step', () => {
  it('detects irregular capitalization in title or artist', () => {
    expect(hasIrregularCapitalization('mySongTitle')).toBe(true);
    expect(hasIrregularCapitalization('MY ARTIST')).toBe(true);
    expect(hasIrregularCapitalization('Normal Title')).toBe(false);
  });

  it('requires capitalization confirmation only when needed', () => {
    expect(needsCapitalizationConfirmation('mySongTitle', 'Artist Name')).toBe(
      true,
    );
    expect(needsCapitalizationConfirmation('My Song', 'Artist Name')).toBe(
      false,
    );
  });

  it('lists required check keys for normal title casing', () => {
    expect(getRequiredMandatoryCheckKeys('My Song', 'Artist Name')).toEqual([
      'promoServices',
      'ownershipConfirmation',
      'rightsAuthorization',
      'nameUsage',
      'termsAgreement',
    ]);
  });

  it('prepends capitalization confirmation when title casing is irregular', () => {
    const keys = getRequiredMandatoryCheckKeys('mySongTitle', 'Artist Name');
    expect(keys[0]).toBe('capitalizationConfirmation');
    expect(keys).toContain('termsAgreement');
  });

  it('reports unchecked mandatory checks', () => {
    const unchecked = getUncheckedMandatoryChecks(
      allCheckedExcept({ termsAgreement: false }),
      'My Song',
      'Artist Name',
    );
    expect(unchecked).toEqual(['termsAgreement']);
  });

  it('returns complete when all required checks are ticked', () => {
    expect(
      areMandatoryChecksComplete(
        allCheckedExcept(),
        'My Song',
        'Artist Name',
      ),
    ).toBe(true);
  });

  it('builds pre-accepted checks for already-submitted releases', () => {
    const checks = buildAcceptedMandatoryChecks();
    expect(
      areMandatoryChecksComplete(checks, 'ANY TITLE', 'ANY ARTIST'),
    ).toBe(true);
  });
});

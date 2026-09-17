import { describe, expect, it } from 'vitest';
import {
  formatIdentityDetailLines,
  mergeIdentityDetails,
} from './verification-details';

describe('formatIdentityDetailLines', () => {
  it('returns empty when there are no details', () => {
    expect(formatIdentityDetailLines(undefined)).toEqual([]);
    expect(formatIdentityDetailLines({})).toEqual([]);
  });

  it('merges PAN and Aadhaar fields for the KYC section', () => {
    expect(
      formatIdentityDetailLines(
        mergeIdentityDetails(
          { name: 'Prashant Joshi', number: 'ABCDE1234F' },
          { numberMasked: 'XXXX-XXXX-9012', dob: '2002-03-28' },
        ),
      ),
    ).toEqual([
      'Name: Prashant Joshi',
      'PAN: ABCDE1234F',
      'Aadhaar: XXXX-XXXX-9012',
      'DOB: 2002-03-28',
    ]);
  });

  it('merges Aadhaar front and back details', () => {
    expect(
      mergeIdentityDetails(
        { name: 'Prashant Joshi', dob: '2002-03-28' },
        { numberMasked: 'XXXX-XXXX-9012', address: '123 Main Street' },
      ),
    ).toEqual({
      name: 'Prashant Joshi',
      numberMasked: 'XXXX-XXXX-9012',
      dob: '2002-03-28',
      address: '123 Main Street',
    });
  });

  it('formats PAN details', () => {
    expect(
      formatIdentityDetailLines({
        name: 'Test User',
        number: 'ABCDE1234F',
        dob: '1990-01-31',
        fatherName: 'Father Name',
      }),
    ).toEqual([
      'Name: Test User',
      'PAN: ABCDE1234F',
      'DOB: 1990-01-31',
      'Father: Father Name',
    ]);
  });

  it('formats masked Aadhaar details', () => {
    expect(
      formatIdentityDetailLines({
        name: 'Test User',
        numberMasked: 'XXXX-XXXX-9012',
        gender: 'F',
        address: '123 Main Street',
        consentValidTill: '2026-10-14',
      }),
    ).toEqual([
      'Name: Test User',
      'Aadhaar: XXXX-XXXX-9012',
      'Gender: F',
      'Address: 123 Main Street',
      'Consent valid till: 2026-10-14',
    ]);
  });
});

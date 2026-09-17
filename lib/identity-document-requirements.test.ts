import { describe, expect, it } from 'vitest';
import { VerificationDocumentType } from './api/profile-verifications';
import {
  aadhaarUploadIssues,
  getIdentityRequirementStatus,
  getIdentityRequirements,
} from './identity-document-requirements';

describe('identity-document-requirements', () => {
  it('returns PAN and Aadhaar checklists separately', () => {
    const pan = getIdentityRequirements(VerificationDocumentType.PAN);
    const aadhaar = getIdentityRequirements(VerificationDocumentType.AADHAR);

    expect(pan.map((item) => item.id)).toEqual(['correct', 'number']);
    expect(aadhaar.map((item) => item.id)).toEqual([
      'correct',
      'number',
      'front',
      'back',
    ]);
    expect(pan.find((item) => item.id === 'number')?.codes).toContain(
      'PAN_NUMBER_MISSING',
    );
    expect(aadhaar.find((item) => item.id === 'number')?.codes).toContain(
      'AADHAAR_NUMBER_MISSING',
    );
  });

  it('maps requirement status from validation issues', () => {
    expect(getIdentityRequirementStatus(['PAN_NUMBER_MISSING'], false, [])).toBe(
      'pending',
    );
    expect(
      getIdentityRequirementStatus(['PAN_NUMBER_MISSING'], true, [
        'PAN_NUMBER_MISSING',
      ]),
    ).toBe('error');
    expect(getIdentityRequirementStatus(['PAN_NUMBER_MISSING'], true, [])).toBe(
      'success',
    );
  });

  it('does not reject a merged front and back as name-missing', () => {
    expect(
      aadhaarUploadIssues(
        {
          name: 'Prashant Joshi',
          numberMasked: 'XXXX-XXXX-9012',
          address: 'Pune',
        },
        true,
        true,
      ),
    ).toEqual([]);
  });

  it('asks for the back after a front-only upload', () => {
    const issues = aadhaarUploadIssues(
      {
        name: 'Prashant Joshi',
        numberMasked: 'XXXX-XXXX-9012',
      },
      true,
      false,
    );

    expect(issues.map((issue) => issue.code)).toEqual(['AADHAAR_BACK_MISSING']);
    expect(issues[0]?.severity).toBe('warning');
  });

  it('asks for the front after a back-only upload', () => {
    const issues = aadhaarUploadIssues(
      {
        numberMasked: 'XXXX-XXXX-9012',
        address: 'Pune',
      },
      false,
      true,
    );

    expect(issues.map((issue) => issue.code)).toEqual([
      'AADHAAR_FRONT_MISSING',
    ]);
    expect(issues[0]?.message).toBe('Upload the front of your Aadhaar card.');
  });
});

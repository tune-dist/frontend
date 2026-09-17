import {
  type IdentityValidationIssue,
  VerificationDocumentType,
} from './api/profile-verifications';
import type { IdentityDocumentDetails } from './verification-details';

export interface IdentityRequirement {
  id: string;
  label: string;
  codes: string[];
}

export const PAN_VALIDATION_REQUIREMENTS: IdentityRequirement[] = [
  { id: 'correct', label: 'PAN card detected', codes: ['WRONG_DOCUMENT_TYPE'] },
  { id: 'number', label: 'PAN number extracted', codes: ['PAN_NUMBER_MISSING'] },
];

export const AADHAAR_VALIDATION_REQUIREMENTS: IdentityRequirement[] = [
  {
    id: 'correct',
    label: 'Aadhaar card detected',
    codes: ['WRONG_DOCUMENT_TYPE'],
  },
  {
    id: 'number',
    label: 'Aadhaar number extracted',
    codes: ['AADHAAR_NUMBER_MISSING'],
  },
  {
    id: 'front',
    label: 'Front details extracted',
    codes: ['AADHAAR_FRONT_MISSING', 'AADHAAR_NAME_MISSING'],
  },
  {
    id: 'back',
    label: 'Back details extracted',
    codes: ['AADHAAR_BACK_MISSING'],
  },
];

export function getIdentityRequirements(
  documentType: VerificationDocumentType,
): IdentityRequirement[] {
  if (documentType === VerificationDocumentType.PAN) {
    return PAN_VALIDATION_REQUIREMENTS;
  }
  return AADHAAR_VALIDATION_REQUIREMENTS;
}

export type IdentityRequirementStatus = 'pending' | 'success' | 'error';

export function aadhaarUploadIssues(
  details: IdentityDocumentDetails,
  hasFrontFile: boolean,
  hasBackFile: boolean,
): IdentityValidationIssue[] {
  if (!hasFrontFile && !hasBackFile) return [];

  const issues: IdentityValidationIssue[] = [];

  if (!details.numberMasked) {
    issues.push({
      code: 'AADHAAR_NUMBER_MISSING',
      message: 'Aadhaar number was not found on this document.',
      severity: 'error',
    });
  }

  if (!details.name) {
    if (hasFrontFile) {
      issues.push({
        code: 'AADHAAR_NAME_MISSING',
        message: 'Name was not found. You can still continue.',
        severity: 'warning',
      });
    } else {
      issues.push({
        code: 'AADHAAR_FRONT_MISSING',
        message: 'Upload the front of your Aadhaar card.',
        severity: 'error',
      });
    }
  }

  if (!details.address) {
    issues.push({
      code: 'AADHAAR_BACK_MISSING',
      message: hasBackFile
        ? 'Address was not found on the back of this Aadhaar card.'
        : 'Upload the back of your Aadhaar card.',
      severity: hasBackFile ? 'error' : 'warning',
    });
  }

  return issues;
}

export function getIdentityRequirementStatus(
  codes: string[],
  hasValidated: boolean,
  issueCodes: string[],
): IdentityRequirementStatus {
  if (!hasValidated) return 'pending';
  if (issueCodes.some((code) => codes.includes(code))) return 'error';
  return 'success';
}

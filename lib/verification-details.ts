export interface IdentityDocumentDetails {
  name?: string;
  number?: string;
  numberMasked?: string;
  dob?: string;
  fatherName?: string;
  gender?: string;
  address?: string;
  consentValidTill?: string;
}

export function mergeIdentityDetails(
  primary?: IdentityDocumentDetails | null,
  fallback?: IdentityDocumentDetails | null,
): IdentityDocumentDetails {
  const details: IdentityDocumentDetails = {};
  if (fallback?.name) details.name = fallback.name;
  if (fallback?.number) details.number = fallback.number;
  if (fallback?.numberMasked) details.numberMasked = fallback.numberMasked;
  if (fallback?.dob) details.dob = fallback.dob;
  if (fallback?.fatherName) details.fatherName = fallback.fatherName;
  if (fallback?.gender) details.gender = fallback.gender;
  if (fallback?.address) details.address = fallback.address;
  if (fallback?.consentValidTill) details.consentValidTill = fallback.consentValidTill;

  if (primary?.name) details.name = primary.name;
  if (primary?.number) details.number = primary.number;
  if (primary?.numberMasked) details.numberMasked = primary.numberMasked;
  if (primary?.dob) details.dob = primary.dob;
  if (primary?.fatherName) details.fatherName = primary.fatherName;
  if (primary?.gender) details.gender = primary.gender;
  if (primary?.address) details.address = primary.address;
  if (primary?.consentValidTill) details.consentValidTill = primary.consentValidTill;
  return details;
}

export function formatIdentityDetailLines(
  details?: IdentityDocumentDetails | null,
): string[] {
  if (!details) return [];

  const lines: string[] = [];
  if (details.name) lines.push(`Name: ${details.name}`);
  if (details.number) lines.push(`PAN: ${details.number}`);
  if (details.numberMasked) lines.push(`Aadhaar: ${details.numberMasked}`);
  if (details.dob) lines.push(`DOB: ${details.dob}`);
  if (details.fatherName) lines.push(`Father: ${details.fatherName}`);
  if (details.gender) lines.push(`Gender: ${details.gender}`);
  if (details.address) lines.push(`Address: ${details.address}`);
  if (details.consentValidTill) {
    lines.push(`Consent valid till: ${details.consentValidTill}`);
  }
  return lines;
}

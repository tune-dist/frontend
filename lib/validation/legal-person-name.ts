/** Legal writer/composer names: 2–4 Roman words, min 3 chars each — or the word "Traditional". */
export const LEGAL_PERSON_NAME_MIN_WORDS = 2;
export const LEGAL_PERSON_NAME_MAX_WORDS = 4;
export const LEGAL_PERSON_NAME_MIN_CHARS_PER_WORD = 3;
export const LEGAL_PERSON_NAME_MAX_LENGTH = 80;

export const LEGAL_PERSON_NAME_REGEX = /^[a-zA-Z]{3,}(?: [a-zA-Z]{3,}){1,3}$/;

/** Allowed credit when the work has no known author/composer (folk / public-domain style). */
export const LEGAL_PERSON_NAME_TRADITIONAL = 'Traditional';

export const LEGAL_PERSON_NAME_HINT =
  'Use "Traditional", or 2–4 words (letters A–Z only). Each part must be at least 3 characters.';

function isTraditionalCredit(value: string): boolean {
  return value.trim().toLowerCase() === LEGAL_PERSON_NAME_TRADITIONAL.toLowerCase();
}

export function isValidLegalPersonName(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > LEGAL_PERSON_NAME_MAX_LENGTH) {
    return false;
  }
  if (isTraditionalCredit(trimmed)) {
    return true;
  }
  return LEGAL_PERSON_NAME_REGEX.test(trimmed);
}

export function getLegalPersonNameError(value: string): string | null {
  if (!value.trim()) {
    return null;
  }
  return isValidLegalPersonName(value) ? null : LEGAL_PERSON_NAME_HINT;
}

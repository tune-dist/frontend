/** Legal writer/composer names: 2–4 Roman words, min 3 chars each. Songwriters may use "Traditional". */
export const LEGAL_PERSON_NAME_MIN_WORDS = 2;
export const LEGAL_PERSON_NAME_MAX_WORDS = 4;
export const LEGAL_PERSON_NAME_MIN_CHARS_PER_WORD = 3;
export const LEGAL_PERSON_NAME_MAX_LENGTH = 80;

export const LEGAL_PERSON_NAME_REGEX = /^[a-zA-Z]{3,}(?: [a-zA-Z]{3,}){1,3}$/;

export const LEGAL_PERSON_NAME_TRADITIONAL = 'Traditional';

export const LEGAL_PERSON_NAME_HINT =
  'Use "Traditional", or 2–4 words (letters A–Z only). Each part must be at least 3 characters.';

export const LEGAL_PERSON_NAME_COMPOSER_HINT =
  'Use 2–4 words (letters A–Z only). Each part must be at least 3 characters.';

function isTraditionalCredit(value: string): boolean {
  return value.trim().toLowerCase() === LEGAL_PERSON_NAME_TRADITIONAL.toLowerCase();
}

export function isValidLegalPersonName(value: string, allowTraditional = true): boolean {
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > LEGAL_PERSON_NAME_MAX_LENGTH) {
    return false;
  }
  if (allowTraditional && isTraditionalCredit(trimmed)) {
    return true;
  }
  return LEGAL_PERSON_NAME_REGEX.test(trimmed);
}

export function getLegalPersonNameError(value: string, allowTraditional = true): string | null {
  if (!value.trim()) {
    return null;
  }
  const hint = allowTraditional ? LEGAL_PERSON_NAME_HINT : LEGAL_PERSON_NAME_COMPOSER_HINT;
  return isValidLegalPersonName(value, allowTraditional) ? null : hint;
}

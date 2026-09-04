/** Normalize user input to MSG91 identifier (country code, no +). */
export function formatPhoneForMsg91(input: string): string {
  const digits = input.replace(/\D/g, '');

  if (digits.startsWith('91') && digits.length >= 12) {
    return digits.slice(0, 12);
  }

  if (digits.length === 10) {
    return `91${digits}`;
  }

  return digits;
}

/** Display stored phone for UI (e.g. 919876543210 → +91 9876543210). */
export function formatPhoneDisplay(phone?: string | null): string {
  if (!phone) return '';

  const digits = phone.replace(/\D/g, '');

  if (digits.startsWith('91') && digits.length === 12) {
    return `+91 ${digits.slice(2)}`;
  }

  if (digits.length === 10) {
    return `+91 ${digits}`;
  }

  return phone.startsWith('+') ? phone : `+${digits}`;
}

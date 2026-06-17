const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'];

const ALLOWED_MIME_PREFIXES = ['image/'];
const ALLOWED_MIME_TYPES = ['application/pdf'];

export function isAllowedVerificationFile(file: File): boolean {
  if (ALLOWED_MIME_TYPES.includes(file.type)) return true;
  if (ALLOWED_MIME_PREFIXES.some((prefix) => file.type.startsWith(prefix))) {
    return true;
  }

  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  return ALLOWED_EXTENSIONS.includes(extension);
}

export const VERIFICATION_FILE_ACCEPT = 'image/*,.pdf';

export const VERIFICATION_FILE_HINT =
  'Upload a clear image (JPG, PNG, WEBP) or PDF';

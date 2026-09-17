import { describe, expect, it } from 'vitest';
import { getVerificationFileError, MAX_VERIFICATION_DOC_BYTES } from './verification-document';

describe('verification-document', () => {
  it('rejects unsupported files and oversized documents', () => {
    const textFile = new File(['hello'], 'notes.txt', { type: 'text/plain' });
    expect(getVerificationFileError(textFile)).toBe(
      'Please upload an image (JPG, PNG, WEBP) or PDF file',
    );

    const oversized = new File(['abc'], 'pan.jpg', { type: 'image/jpeg' });
    Object.defineProperty(oversized, 'size', { value: MAX_VERIFICATION_DOC_BYTES + 1 });
    expect(getVerificationFileError(oversized)).toBe('Document must be 15MB or smaller');
  });

  it('accepts an allowed image', () => {
    const image = new File(['abc'], 'pan.jpg', { type: 'image/jpeg' });
    expect(getVerificationFileError(image)).toBeNull();
  });
});

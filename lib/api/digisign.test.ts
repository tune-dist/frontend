import { describe, expect, it } from 'vitest';
import {
  getB2bDocumentStatusColor,
  getB2bDocumentStatusLabel,
} from './digisign';

describe('digisign status display', () => {
  it('labels each signing state', () => {
    expect(getB2bDocumentStatusLabel('pending')).toBe('Pending');
    expect(getB2bDocumentStatusLabel('signing')).toBe('Signing');
    expect(getB2bDocumentStatusLabel('signed')).toBe('Signed');
    expect(getB2bDocumentStatusLabel('failed')).toBe('Failed');
    expect(getB2bDocumentStatusLabel('expired')).toBe('Expired');
  });

  it('uses success color only for signed documents', () => {
    expect(getB2bDocumentStatusColor('signed')).toContain('green');
    expect(getB2bDocumentStatusColor('failed')).toContain('red');
    expect(getB2bDocumentStatusColor('expired')).toContain('red');
  });
});

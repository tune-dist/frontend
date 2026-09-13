import { describe, expect, it } from 'vitest';
import { isDigioSdkSuccess } from './load-digio-sdk';

describe('isDigioSdkSuccess', () => {
  it('treats a callback without error_code as success', () => {
    expect(isDigioSdkSuccess({ digio_doc_id: 'DID123' })).toBe(true);
  });

  it('treats a callback with error_code as failure', () => {
    expect(isDigioSdkSuccess({ error_code: 'CANCELLED' })).toBe(false);
  });
});

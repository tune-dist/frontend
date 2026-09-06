import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('OAuth callback flow', () => {
  it('uses one-time code exchange instead of tokens in the URL', () => {
    const authService = readFileSync(
      join(process.cwd(), '../backend/src/modules/auth/auth.service.ts'),
      'utf8',
    );
    const callbackPage = readFileSync(
      join(process.cwd(), 'app/auth/callback/page.tsx'),
      'utf8',
    );

    expect(authService).toContain('/auth/callback?code=');
    expect(authService).not.toContain('/auth/callback?token=');
    expect(callbackPage).toContain('exchangeOAuthCode');
    expect(callbackPage).not.toContain("searchParams.get('token')");
  });
});

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  DIGILOCKER_CALLBACK_PATH,
  digilockerCallbackPath,
  isDigilockerReturnQuery,
} from './digilocker-return';

describe('DigiLocker callback flow', () => {
  it('forwards DigiLocker redirects from the frontend origin to the callback page', () => {
    const middleware = readFileSync(join(process.cwd(), 'middleware.ts'), 'utf8');
    const homePage = readFileSync(join(process.cwd(), 'app/page.tsx'), 'utf8');
    const callbackPage = readFileSync(
      join(process.cwd(), 'app/auth/digilocker/callback/page.tsx'),
      'utf8',
    );

    expect(middleware).toContain("pathname === '/'");
    expect(middleware).toContain('isDigilockerReturnQuery');
    expect(middleware).toContain('DIGILOCKER_CALLBACK_PATH');
    expect(homePage).toContain('DigilockerReturnRedirect');
    expect(callbackPage).toContain('completeDigilockerCallback');
    expect(callbackPage).toContain("searchParams.get('code')");
    expect(callbackPage).toContain("searchParams.get('state')");
    expect(callbackPage).toContain('isAuthenticated');
  });

  it('detects DigiLocker return query params', () => {
    const params = new URLSearchParams('code=abc&state=xyz');
    expect(isDigilockerReturnQuery(params)).toBe(true);
    expect(
      isDigilockerReturnQuery(new URLSearchParams('error=access_denied&state=xyz')),
    ).toBe(true);
    expect(isDigilockerReturnQuery(new URLSearchParams('code=abc'))).toBe(false);
    expect(digilockerCallbackPath(params.toString())).toBe(
      `${DIGILOCKER_CALLBACK_PATH}?code=abc&state=xyz`,
    );
  });
});

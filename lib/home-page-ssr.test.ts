import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('home-page SSR', () => {
  it('renders marketing without gating on auth loading', () => {
    const source = readFileSync(
      join(process.cwd(), 'components/home-page.tsx'),
      'utf8',
    );

    expect(source).not.toContain("'use client'");
    expect(source).not.toMatch(/if\s*\(\s*loading\s*\)/);
    expect(source).toContain('HomeAuthRedirect');
    expect(source).toContain('<Hero />');
  });

  it('keeps auth redirect in a small client island', () => {
    const source = readFileSync(
      join(process.cwd(), 'components/home-auth-redirect.tsx'),
      'utf8',
    );

    expect(source).toContain("'use client'");
    expect(source).toContain("router.push('/dashboard')");
  });
});

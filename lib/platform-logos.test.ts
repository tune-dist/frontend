import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('platform logos', () => {
  it('includes YouTube as a stream analytics platform', () => {
    const source = readFileSync(
      join(process.cwd(), 'lib/platform-logos.ts'),
      'utf8',
    );

    expect(source).toContain('| "youtube"');
    expect(source).toContain('key: "youtube"');
    expect(source).toContain('youtube: "YouTube"');
  });

  it('includes youtube in the analytics DSP filter type', () => {
    const source = readFileSync(
      join(process.cwd(), 'lib/api/analytics.ts'),
      'utf8',
    );

    expect(source).toContain("'youtube'");
  });
});

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const MARKETING_COMING_SOON_PAGES = ['guides', 'academy'] as const;
const STATIC_CONTENT_FILES = [
  'terms-page-content.tsx',
  'privacy-page-content.tsx',
  'faqs-page-content.tsx',
  'testimonials-page-content.tsx',
  'blogs-page-content.tsx',
  'blog-detail-content.tsx',
  'home-page.tsx',
] as const;

describe('marketing pages SSR', () => {
  it.each(MARKETING_COMING_SOON_PAGES)('%s page is a server component', (route) => {
    const source = readFileSync(
      join(process.cwd(), `app/${route}/page.tsx`),
      'utf8',
    );

    expect(source).not.toContain("'use client'");
    expect(source).toContain('MarketingComingSoonPage');
  });

  it('contact route is a server component', () => {
    const source = readFileSync(
      join(process.cwd(), 'app/contact/page.tsx'),
      'utf8',
    );

    expect(source).not.toContain("'use client'");
    expect(source).not.toContain('contact-page-content');
  });

  it('blogs route fetches data on the server', () => {
    const source = readFileSync(
      join(process.cwd(), 'app/blogs/page.tsx'),
      'utf8',
    );

    expect(source).not.toContain("'use client'");
    expect(source).toContain('fetchPublishedBlogs');
  });

  it('testimonials route fetches data on the server', () => {
    const source = readFileSync(
      join(process.cwd(), 'app/testimonials/page.tsx'),
      'utf8',
    );

    expect(source).not.toContain("'use client'");
    expect(source).toContain('fetchTestimonials');
  });

  it.each(STATIC_CONTENT_FILES)('%s is a server component', (fileName) => {
    const source = readFileSync(
      join(process.cwd(), 'components', fileName),
      'utf8',
    );

    expect(source).not.toContain("'use client'");
    expect(source).not.toContain('framer-motion');
  });

  it('faqs accordion is the only client island for FAQ interactivity', () => {
    const source = readFileSync(
      join(process.cwd(), 'components/faqs-accordion.tsx'),
      'utf8',
    );

    expect(source).toContain("'use client'");
    expect(source).not.toContain('framer-motion');
  });
});

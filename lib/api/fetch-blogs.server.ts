import { config } from '@/lib/config';
import type { Blog, BlogListItem } from '@/lib/api/blogs';

export async function fetchPublishedBlogs(): Promise<BlogListItem[]> {
  try {
    const response = await fetch(`${config.apiUrl}/blogs`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return [];
    }

    return response.json();
  } catch {
    return [];
  }
}

export async function fetchBlogBySlug(slug: string): Promise<Blog | null> {
  try {
    const response = await fetch(`${config.apiUrl}/blogs/${slug}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch {
    return null;
  }
}

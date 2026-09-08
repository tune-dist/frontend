import BlogsPageContent from '@/components/blogs-page-content';
import { fetchPublishedBlogs } from '@/lib/api/fetch-blogs.server';

export default async function BlogsPage() {
  const blogs = await fetchPublishedBlogs();
  return <BlogsPageContent blogs={blogs} />;
}

import { notFound } from 'next/navigation';
import BlogDetailContent from '@/components/blog-detail-content';
import { fetchBlogBySlug } from '@/lib/api/fetch-blogs.server';
import { createPageMetadata } from '@/lib/site-metadata';

type BlogDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const blog = await fetchBlogBySlug(slug);

  if (!blog) {
    return createPageMetadata('Blog Not Found | KratoLib', '');
  }

  return createPageMetadata(`${blog.title} | KratoLib Blog`, blog.title);
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const blog = await fetchBlogBySlug(slug);

  if (!blog) {
    notFound();
  }

  return <BlogDetailContent blog={blog} />;
}

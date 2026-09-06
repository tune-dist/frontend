import Link from 'next/link';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { S3Image } from '@/components/ui/s3-image';
import { ArrowLeft } from 'lucide-react';
import type { Blog } from '@/lib/api/blogs';

type BlogDetailContentProps = {
  blog: Blog;
};

export default function BlogDetailContent({ blog }: BlogDetailContentProps) {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blogs
          </Link>

          <article>
            {blog.thumbnail ? (
              <div className="rounded-2xl overflow-hidden mb-8 aspect-[16/9] bg-muted">
                <S3Image
                  src={blog.thumbnail}
                  alt={blog.title}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : null}

            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 font_heading">
              {blog.title}
            </h1>

            {blog.createdAt ? (
              <p className="text-sm text-muted-foreground mb-8">
                {new Date(blog.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            ) : null}

            <div
              className="prose prose-invert max-w-none [&_img]:rounded-xl [&_img]:my-6 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_p]:leading-relaxed [&_p]:text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: blog.content || '' }}
            />
          </article>
        </div>
      </section>

      <Footer />
    </main>
  );
}

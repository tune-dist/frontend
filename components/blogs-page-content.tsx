import Link from 'next/link';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { S3Image } from '@/components/ui/s3-image';
import type { BlogListItem } from '@/lib/api/blogs';

type BlogsPageContentProps = {
  blogs: BlogListItem[];
};

export default function BlogsPageContent({ blogs }: BlogsPageContentProps) {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="relative pt-32 pb-12 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 font_heading tracking-tight text-white">
              Music Distribution <span className="animated-gradient">Blog</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground">
              Guides, tips, and artist stories from the KratoLib team.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-32 pt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {blogs.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              No blog posts yet. Check back soon.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog) => (
                <Link
                  key={blog._id}
                  href={`/blogs/${blog.slug}`}
                  className="group rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-md hover:border-primary/40 transition-all"
                >
                  <div className="aspect-[16/10] bg-muted overflow-hidden">
                    {blog.thumbnail ? (
                      <S3Image
                        src={blog.thumbnail}
                        alt={blog.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-muted-foreground text-sm">
                        No thumbnail
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h2 className="text-lg font-bold text-white group-hover:text-primary transition-colors line-clamp-2">
                      {blog.title}
                    </h2>
                    {blog.createdAt ? (
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(blog.createdAt).toLocaleDateString()}
                      </p>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}

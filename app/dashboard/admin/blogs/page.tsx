'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Trash2, Loader2, Plus, Edit, Save } from 'lucide-react';
import { blogsApi, Blog } from '@/lib/api/blogs';
import toast from 'react-hot-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { S3Image } from '@/components/ui/s3-image';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission } from '@/lib/permissions';
import BlogRichTextEditor from '@/components/dashboard/blogs/blog-rich-text-editor';
import { uploadFileDirectly } from '@/lib/upload/chunk-uploader';

function slugifyTitle(text: string): string {
  return text
    .toLowerCase()
    .replace(/[&]/g, 'and')
    .replace(/[/]/g, '-')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function BlogsAdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentBlog, setCurrentBlog] = useState<Partial<Blog>>({ published: true, content: '' });
  const [deleteDialogId, setDeleteDialogId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && user && !hasPermission(user, 'MANAGE_BLOGS')) {
      router.replace('/dashboard');
    }
  }, [user, authLoading, router]);

  const fetchBlogs = async () => {
    try {
      setIsLoading(true);
      const data = await blogsApi.getAllAdmin();
      setBlogs(data);
    } catch (error) {
      toast.error('Failed to load blogs');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && hasPermission(user, 'MANAGE_BLOGS')) {
      fetchBlogs();
    }
  }, [user]);

  const uploadSlug = slugifyTitle(currentBlog.slug || currentBlog.title || 'blog');

  const handleOpenCreate = () => {
    setCurrentBlog({ published: true, content: '' });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (blog: Blog) => {
    setCurrentBlog({ ...blog });
    setIsDialogOpen(true);
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const slug = uploadSlug;
    if (!slug) {
      toast.error('Enter a title first');
      return;
    }

    try {
      setIsUploading(true);
      const result = await uploadFileDirectly(file, '', undefined, 'blog', slug);
      setCurrentBlog((prev) => ({ ...prev, thumbnail: result.path }));
      toast.success('Thumbnail uploaded');
    } catch (error) {
      console.error(error);
      toast.error('Failed to upload thumbnail');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    const title = currentBlog.title?.trim();
    const content = currentBlog.content?.trim();

    if (!title) {
      toast.error('Title is required');
      return;
    }
    if (!content) {
      toast.error('Content is required');
      return;
    }

    const payload = {
      title,
      slug: slugifyTitle(currentBlog.slug || title),
      thumbnail: currentBlog.thumbnail,
      content,
      published: currentBlog.published !== false,
    };

    try {
      setIsSaving(true);
      if (currentBlog._id) {
        await blogsApi.update(currentBlog._id, payload);
        toast.success('Blog updated');
      } else {
        await blogsApi.create(payload);
        toast.success('Blog created');
      }
      setIsDialogOpen(false);
      fetchBlogs();
    } catch (error) {
      console.error(error);
      toast.error('Failed to save blog');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialogId || isDeleting) return;

    try {
      setIsDeleting(true);
      await blogsApi.remove(deleteDialogId);
      toast.success('Blog deleted');
      setDeleteDialogId(null);
      fetchBlogs();
    } catch (error) {
      toast.error('Failed to delete blog');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blogs</h1>
          <p className="text-muted-foreground">Create and manage blog posts shown on the public site.</p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Blog
        </Button>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            All Blogs
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : blogs.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No blogs yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thumbnail</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blogs.map((blog) => (
                  <TableRow key={blog._id}>
                    <TableCell>
                      {blog.thumbnail ? (
                        <S3Image src={blog.thumbnail} alt={blog.title} className="h-12 w-20 rounded object-cover" />
                      ) : (
                        <div className="h-12 w-20 rounded bg-muted" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{blog.title}</TableCell>
                    <TableCell>{blog.published ? 'Published' : 'Draft'}</TableCell>
                    <TableCell>
                      {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(blog)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteDialogId(blog._id)} className="text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{currentBlog._id ? 'Edit Blog' : 'Create Blog'}</DialogTitle>
            <DialogDescription>Add a title, thumbnail, and rich content for the blog post.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="blog-title">Title</Label>
              <Input
                id="blog-title"
                value={currentBlog.title || ''}
                onChange={(e) => setCurrentBlog({ ...currentBlog, title: e.target.value })}
                placeholder="Blog title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="blog-slug">Slug</Label>
              <Input
                id="blog-slug"
                value={currentBlog.slug || ''}
                onChange={(e) => setCurrentBlog({ ...currentBlog, slug: e.target.value })}
                placeholder={slugifyTitle(currentBlog.title || 'blog-title')}
              />
            </div>

            <div className="space-y-2">
              <Label>Thumbnail</Label>
              <div className="flex items-center gap-4">
                {currentBlog.thumbnail ? (
                  <S3Image src={currentBlog.thumbnail} alt="Thumbnail" className="h-20 w-32 rounded object-cover" />
                ) : (
                  <div className="h-20 w-32 rounded bg-muted" />
                )}
                <div>
                  <Input type="file" accept="image/*" onChange={handleThumbnailUpload} disabled={isUploading} />
                  {isUploading && <p className="text-xs text-muted-foreground mt-1">Uploading...</p>}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Content</Label>
              <BlogRichTextEditor
                value={currentBlog.content || ''}
                onChange={(html) => setCurrentBlog({ ...currentBlog, content: html })}
                uploadSlug={uploadSlug}
              />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={currentBlog.published !== false}
                onChange={(e) => setCurrentBlog({ ...currentBlog, published: e.target.checked })}
              />
              Published
            </label>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogId !== null} onOpenChange={(open) => !open && setDeleteDialogId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete blog?</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogId(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

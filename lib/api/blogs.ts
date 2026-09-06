import apiClient from '../api-client';

export interface Blog {
  _id: string;
  title: string;
  slug: string;
  thumbnail?: string;
  content?: string;
  published: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type BlogListItem = Pick<
  Blog,
  '_id' | 'title' | 'slug' | 'thumbnail' | 'createdAt' | 'updatedAt'
>;

export const blogsApi = {
  getPublished: async (): Promise<BlogListItem[]> => {
    const response = await apiClient.get<BlogListItem[]>('/blogs');
    return response.data;
  },

  getBySlug: async (slug: string): Promise<Blog> => {
    const response = await apiClient.get<Blog>(`/blogs/${slug}`);
    return response.data;
  },

  getAllAdmin: async (): Promise<Blog[]> => {
    const response = await apiClient.get<Blog[]>('/blogs/admin/all');
    return response.data;
  },

  create: async (data: Partial<Blog>): Promise<Blog> => {
    const response = await apiClient.post<Blog>('/blogs', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Blog>): Promise<Blog> => {
    const response = await apiClient.patch<Blog>(`/blogs/${id}`, data);
    return response.data;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/blogs/${id}`);
  },

  uploadImage: async (
    file: File,
    slug: string,
    kind: 'thumbnail' | 'content' = 'thumbnail',
  ): Promise<{ path: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'blog');
    formData.append('artistName', slug);
    if (kind === 'content') {
      formData.append('trackTitle', 'content');
    }

    const response = await apiClient.post<{ path: string }>(
      '/chunk_files/single',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return response.data;
  },
};

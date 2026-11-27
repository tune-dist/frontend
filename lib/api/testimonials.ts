import apiClient from '../api-client';
import { useEffect, useState } from 'react';

export interface Testimonial {
    _id: string;
    name: string;
    role: string;
    quote: string;
    image?: string;
}

async function bustTestimonialsPageCache(): Promise<void> {
    try {
        await fetch('/api/revalidate/testimonials', { method: 'POST' });
    } catch {
        // Public page may stay stale until the Next.js revalidate window ends.
    }
}

export const testimonialsApi = {
    getAll: async (): Promise<Testimonial[]> => {
        const response = await apiClient.get<Testimonial[]>('/testimonials');
        return response.data;
    },

    create: async (data: Partial<Testimonial>): Promise<Testimonial> => {
        const response = await apiClient.post<Testimonial>('/testimonials', data);
        await bustTestimonialsPageCache();
        return response.data;
    },

    update: async (id: string, data: Partial<Testimonial>): Promise<Testimonial> => {
        const response = await apiClient.patch<Testimonial>(`/testimonials/${id}`, data);
        await bustTestimonialsPageCache();
        return response.data;
    },

    remove: async (id: string): Promise<void> => {
        await apiClient.delete(`/testimonials/${id}`);
        await bustTestimonialsPageCache();
    },

    uploadImage: async (file: File, artistName: string): Promise<{ path: string }> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'testimonial');
        formData.append('artistName', artistName);
        const response = await apiClient.post<{ path: string }>('/chunk_files/single', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
};

export function useTestimonials() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        testimonialsApi
            .getAll()
            .then((data) => {
                if (active) setTestimonials(data);
            })
            .catch((error) => {
                console.error('Failed to load testimonials:', error);
                if (active) setTestimonials([]);
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, []);

    return { testimonials, loading };
}

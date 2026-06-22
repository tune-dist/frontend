import apiClient from '../api-client';
import { useEffect, useState } from 'react';

export interface Testimonial {
    _id: string;
    name: string;
    role: string;
    quote: string;
    image?: string;
}

export const testimonialsApi = {
    getAll: async (): Promise<Testimonial[]> => {
        const response = await apiClient.get<Testimonial[]>('/testimonials');
        return response.data;
    },

    create: async (data: Partial<Testimonial>): Promise<Testimonial> => {
        const response = await apiClient.post<Testimonial>('/testimonials', data);
        return response.data;
    },

    update: async (id: string, data: Partial<Testimonial>): Promise<Testimonial> => {
        const response = await apiClient.patch<Testimonial>(`/testimonials/${id}`, data);
        return response.data;
    },

    remove: async (id: string): Promise<void> => {
        await apiClient.delete(`/testimonials/${id}`);
    },

    uploadImage: async (file: File): Promise<{ path: string }> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'testimonial');
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

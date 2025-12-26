import apiClient from '../api-client';

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
};

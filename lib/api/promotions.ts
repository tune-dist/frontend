import apiClient from "../api-client";

export interface Promotion {
    _id: string;
    releaseId: any;
    userId: string;
    slug: string;
    streamingLinks: Array<{
        platform: string;
        url: string;
        isActive: boolean;
    }>;
    isPublished: boolean;
    customization: any;
    createdAt: string;
    updatedAt: string;
}

export const createOrUpdatePromotion = async (data: any) => {
    const response = await apiClient.post(`/promotions`, data);
    return response.data;
};

export const getPromotionByReleaseId = async (releaseId: string) => {
    const response = await apiClient.get(`/promotions/release/${releaseId}`);
    return response.data;
};

export const getPublicPromotionBySlug = async (slug: string) => {
    const response = await apiClient.get(`/promotions/public/${slug}`);
    return response.data;
};

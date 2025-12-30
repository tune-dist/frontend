import apiClient from '../api-client';

export interface Permission {
    _id: string;
    name: string;
    slug: string;
    description?: string;
}

export const getPermissions = async (): Promise<Permission[]> => {
    const response = await apiClient.get<Permission[]>('/permissions');
    return response.data;
};

export const createPermission = async (data: { name: string; slug: string; description?: string }): Promise<Permission> => {
    const response = await apiClient.post<Permission>('/permissions', data);
    return response.data;
};



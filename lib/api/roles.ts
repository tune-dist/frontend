import apiClient from '../api-client';

export interface Role {
    _id: string;
    name: string;
    description?: string;
    permissions: string[]; // Array of permission slugs
}

export const getRoles = async (): Promise<Role[]> => {
    const response = await apiClient.get<Role[]>('/roles');
    return response.data;
};

export const updateRole = async (id: string, data: Partial<Role>): Promise<Role> => {
    const response = await apiClient.patch<Role>(`/roles/${id}`, data);
    return response.data;
};

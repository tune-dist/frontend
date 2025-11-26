import apiClient from '../api-client';
import { User } from './auth';

export interface UsageStats {
  releases: {
    used: number;
    total: number;
    limit: number;
    canUpload: boolean;
  };
  storage: {
    used: number;
    usedFormatted: string;
  };
  plan: string;
}

export interface UpdateProfileData {
  fullName?: string;
}

// Get user profile
export const getUserProfile = async (): Promise<User> => {
  const response = await apiClient.get<User>('/users/profile');
  return response.data;
};

// Update user profile
export const updateUserProfile = async (data: UpdateProfileData): Promise<User> => {
  const response = await apiClient.put<User>('/users/profile', data);
  return response.data;
};

// Get usage statistics
export const getUsageStats = async (): Promise<UsageStats> => {
  const response = await apiClient.get<UsageStats>('/users/usage');
  return response.data;
};


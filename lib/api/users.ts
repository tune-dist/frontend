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
  revenueEarned?: number;
  totalStreams?: number;
}

export interface UpdateProfileData {
  fullName?: string;
  address?: string;
  addressProof?: {
    url: string;
    filename: string;
    uploadedAt: Date;
  };
  passport?: {
    url: string;
    filename: string;
    uploadedAt: Date;
  };
  selfieWithPassport?: {
    url: string;
    filename: string;
    uploadedAt: Date;
  };
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

// Get list of users with filters
export const getUsers = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}) => {
  const response = await apiClient.get<any>('/users', { params });
  return response.data;
};

// Update user permissions
export const updateUserPermissions = async (userId: string, permissions: string[]): Promise<User> => {
  const response = await apiClient.patch<User>(`/users/${userId}/permissions`, { permissions });
  return response.data;
};

// Send OTP to phone number
export const sendPhoneOTP = async (phoneNumber: string): Promise<{ success: boolean; message: string; otp?: string }> => {
  const response = await apiClient.post<{ success: boolean; message: string; otp?: string }>('/users/phone/send-otp', { phoneNumber });
  return response.data;
};

// Verify phone OTP
export const verifyPhoneOTP = async (otp: string): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.post<{ success: boolean; message: string }>('/users/phone/verify-otp', { otp });
  return response.data;
};

// Update address
export const updateAddress = async (address: string): Promise<User> => {
  const response = await apiClient.patch<User>('/users/profile/address', { address });
  return response.data;
};

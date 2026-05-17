import apiClient from '../api-client';
import { User } from './auth';
import { Plan, PlanLimits } from './plans';

export interface UserPlanMapping {
  _id: string;
  userId: string;
  planKey: string;
  planTitle: string;
  type: 'subscription' | 'addon';
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  isActive: boolean;
  limits: PlanLimits | null;
  addonQuantity: number;
  priceInPaise: number;
  currency: string;
  paymentId?: string;
  razorpayPaymentId?: string;
  razorpaySubscriptionId?: string;
  startDate: string;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EffectiveLimits extends PlanLimits {
  extraArtistSlots: number;
  planKey: string;
  planTitle: string;
  isActive: boolean;
}

export interface ProfileWithPlan extends User {
  planDetails: Plan | null;
  activePlanMapping: UserPlanMapping | null;
  activeAddons: UserPlanMapping[];
  effectiveLimits: EffectiveLimits | null;
}

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
  avatar?: string;
}

// Get user profile (raw user document — without enriched plan mapping)
export const getUserProfile = async (): Promise<User> => {
  const response = await apiClient.get<User>('/users/profile');
  return response.data;
};

// Get user profile enriched with active plan mapping, addons and effective limits.
// Backed by GET /users/profile -> getProfileWithPlan(). The enriched fields are
// the source of truth for the billing UI; user.plan can be stale on legacy rows.
export const getUserProfileWithPlan = async (): Promise<ProfileWithPlan> => {
  const response = await apiClient.get<ProfileWithPlan>('/users/profile');
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

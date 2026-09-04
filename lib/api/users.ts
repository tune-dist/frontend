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

export interface AddonEligibility {
  canBuyArtistAddon: boolean;
  reason?: string | null;
  suggestedAction?: 'upgrade' | 'renew' | 'contact_support' | null;
  suggestedPlanKey?: string | null;
  addonPlanKey: string;
  addonPriceInr: number;
  addonPriceWithGstInr: number;
  addonTotalInPaise: number;
  addonGstPercent: number;
  addonGstIncluded: boolean;
}

export interface ArtistUsage {
  used: number;
  limit: number;
  canAddMore: boolean;
}

export interface ProfileWithPlan extends User {
  planDetails: Plan | null;
  activePlanMapping: UserPlanMapping | null;
  activeAddons: UserPlanMapping[];
  effectiveLimits: EffectiveLimits | null;
  addonEligibility?: AddonEligibility;
  artistUsage?: ArtistUsage;
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
  phoneNumber?: string;
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

export interface PaginatedUsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

// Get list of users with filters
export const getUsers = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  plan?: string;
}): Promise<PaginatedUsersResponse> => {
  const { search, role, status, plan, page, limit } = params;
  const response = await apiClient.get<PaginatedUsersResponse>('/users', {
    params: {
      page,
      limit,
      ...(search?.trim() ? { search: search.trim() } : {}),
      ...(role && role !== 'All' ? { role } : {}),
      ...(status && status !== 'All' ? { status } : {}),
      ...(plan && plan !== 'All' ? { plan } : {}),
    },
  });
  return response.data;
};

export interface UsersOverviewStats {
  total: number;
  newSignups24h: number;
  previousNewSignups24h: number;
  pendingApprovals: number;
  flaggedAccounts: number;
  totalGrowthPercent: number;
  newSignupsGrowthPercent: number;
}

export const getUsersOverview = async (): Promise<{
  stats: UsersOverviewStats;
  planKeys: string[];
}> => {
  const response = await apiClient.get<{ stats: UsersOverviewStats; planKeys: string[] }>(
    '/users/overview',
  );
  return response.data;
};

// Get user by ID (admin)
export const getUserById = async (userId: string): Promise<User> => {
  const response = await apiClient.get<User>(`/users/${userId}`);
  return response.data;
};

// Suspend or unsuspend a user (admin)
export const updateUserStatus = async (
  userId: string,
  isSuspended: boolean,
): Promise<User> => {
  const response = await apiClient.patch<User>(`/users/${userId}/status`, { isSuspended });
  return response.data;
};

// Log out all users except the current admin (invalidates all sessions)
export const logoutAllUsers = async (): Promise<{ message: string; loggedOutCount: number }> => {
  const response = await apiClient.post<{ message: string; loggedOutCount: number }>(
    '/users/logout-all',
  );
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

// Verify phone via MSG91 widget access token
export const verifyMsg91PhoneToken = async (
  accessToken: string,
  phoneNumber?: string,
): Promise<User> => {
  const response = await apiClient.post<User>('/users/phone/verify-msg91-token', {
    accessToken,
    phoneNumber,
  });
  return response.data;
};

// Update address
export const updateAddress = async (address: string): Promise<User> => {
  const response = await apiClient.patch<User>('/users/profile/address', { address });
  return response.data;
};

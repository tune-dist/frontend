import apiClient from '../api-client';
import axios from 'axios';
import { config } from '../config';

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  googleId?: string;
  spotifyId?: string;
  avatar?: string;
  verificationToken?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  _id: string;
  userCode?: string;
  email: string;
  fullName: string;
  plan: 'free' | 'solo' | 'pro' | 'enterprise';
  /** False until the user explicitly picks a plan at signup; undefined for legacy users. */
  planSelected?: boolean;
  planEndDate: string | null;
  role: 'super_admin' | 'admin' | 'release_manager' | 'artist';
  permissions: string[];
  planStartDate?: string;
  usage: {
    totalReleases: number;
    storageUsed: number;
    totalStreams: number;
    revenueEarned: number;
  };
  // Backend is the source of truth; effective limit = plan.maxArtists + extraArtistSlots.
  extraArtistSlots?: number;
  effectiveLimits?: {
    maxArtists: number;
    extraArtistSlots: number;
    planKey: string;
    planTitle: string;
    isActive: boolean;
  } | null;
  addonEligibility?: {
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
  };
  artistUsage?: {
    used: number;
    limit: number;
    canAddMore: boolean;
  };
  isEmailVerified: boolean;
  isActive: boolean;
  isSuspended: boolean;
  createdAt: string;
  updatedAt: string;
  phoneNumber?: string;
  isPhoneVerified?: boolean;
  isPhoneNumberVerified?: boolean;
  isPanVerified?: boolean;
  isAadharVerified?: boolean;
  isKyc?: boolean;
  isProfileVerified?: boolean;
  phoneOtpExpiresAt?: string;
  address?: string;
  addressProof?: {
    url: string;
    filename: string;
    uploadedAt: string;
  };
  passport?: {
    url: string;
    filename: string;
    uploadedAt: string;
  };
  selfieWithPassport?: {
    url: string;
    filename: string;
    uploadedAt: string;
  };
  pan?: {
    url: string;
    filename: string;
    uploadedAt: string;
    number?: string;
    fullName?: string;
  };
  aadhar?: {
    url: string;
    filename: string;
    uploadedAt: string;
    name?: string;
    dateOfBirth?: string;
    gender?: string;
    maskedNumber?: string;
    phone?: string;
  };
  avatar?: string;
  avatarUrl?: string;
  isSubscriptionActive?: boolean;
  subscriptionStatus?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  user: User;
  access_token?: string;
  refresh_token?: string;
}

interface RefreshResponse {
  access_token: string;
  refresh_token: string;
  user?: User;
}

export interface LoginResponse {
  message?: string;
  email?: string;
  requireOtp?: boolean;
  access_token?: string; // For backward compatibility / OAuth redirect
  refresh_token?: string;
  user?: User;
}

export interface VerifyOtpData {
  email: string;
  otp: string;
}

export interface ResendOtpData {
  email: string;
}

// Register new user
export const register = async (data: RegisterData): Promise<RegisterResponse> => {
  const response = await apiClient.post<RegisterResponse>('/auth/register', data);
  return response.data;
};

// Login user
export const login = async (data: LoginData): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>('/auth/login', data);
  return response.data;
};

// Verify OTP
export const verifyOtp = async (data: VerifyOtpData): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/verify-otp', data);
  return response.data;
};

// Resend OTP
export const resendOtp = async (data: ResendOtpData): Promise<{ message: string }> => {
  const response = await apiClient.post<{ message: string }>('/auth/resend-otp', data);
  return response.data;
};

// Refresh token
export const refreshToken = async (token: string): Promise<RefreshResponse> => {
  const response = await axios.post<RefreshResponse>(
    `${config.apiUrl}/auth/refresh`,
    { refresh_token: token },
    { headers: { 'Content-Type': 'application/json' } },
  );
  return response.data;
};

// Get current user profile
export const getMe = async (): Promise<User> => {
  const response = await apiClient.get<User>('/auth/me');
  return response.data;
};

// Forgot password
export const forgotPassword = async (email: string): Promise<{ message: string }> => {
  const response = await apiClient.post<{ message: string }>('/auth/forgot-password', { email });
  return response.data;
};

// Reset password
export const resetPassword = async (token: string, password: string): Promise<{ message: string }> => {
  const response = await apiClient.post<{ message: string }>('/auth/reset-password', {
    token,
    password
  });
  return response.data;
};

// Send Email OTP
export const sendEmailOtp = async (email: string): Promise<{ message: string; otp?: string }> => {
  const response = await apiClient.post<{ message: string; otp?: string }>('/auth/email/send-otp', { email });
  return response.data;
};

// Verify Email OTP
export const verifyEmailOtp = async (email: string, otp: string): Promise<{ message: string; verificationToken: string }> => {
  const response = await apiClient.post<{ message: string; verificationToken: string }>('/auth/email/verify-otp', { email, otp });
  return response.data;
};


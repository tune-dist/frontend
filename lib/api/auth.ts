import apiClient from '../api-client';

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  role?: string;
  googleId?: string;
  spotifyId?: string;
  avatar?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  _id: string;
  email: string;
  fullName: string;
  plan: 'free' | 'pro' | 'enterprise';
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
  isEmailVerified: boolean;
  isActive: boolean;
  isSuspended: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

interface RefreshResponse {
  access_token: string;
  refresh_token: string;
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
  const response = await apiClient.post<RefreshResponse>('/auth/refresh', { refresh_token: token });
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


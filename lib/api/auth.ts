import apiClient from '../api-client';

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  role?: string;
  googleId?: string;
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
  role: 'super_admin' | 'admin' | 'release_manager' | 'artist';
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
  user: User;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

// Register new user
export const register = async (data: RegisterData): Promise<RegisterResponse> => {
  const response = await apiClient.post<RegisterResponse>('/auth/register', data);
  return response.data;
};

// Login user
export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', data);
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


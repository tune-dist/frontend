'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { User, login as apiLogin, register as apiRegister, getMe, forgotPassword as apiForgotPassword, resetPassword as apiResetPassword, verifyOtp as apiVerifyOtp, resendOtp as apiResendOtp, LoginResponse } from '@/lib/api/auth';
import { config } from '@/lib/config';
import { getErrorMessage } from '@/lib/api-client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, redirectUrl?: string) => Promise<LoginResponse>;
  register: (email: string, password: string, fullName: string, role?: string, googleId?: string, spotifyId?: string, avatar?: string, redirectUrl?: string, verificationToken?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  loginWithToken: (token: string, refreshToken?: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<{ message: string }>;
  resetPassword: (token: string, password: string) => Promise<{ message: string }>;
  verifyOtp: (email: string, otp: string, redirectUrl?: string) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check if user is authenticated on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = Cookies.get(config.tokenKey);

      if (token) {
        try {
          const userData = await getMe();
          setUser(userData);
        } catch (error: any) {
          // Only clear session if it's a 401/403 (unauthorized/forbidden)
          // If it's a network error or server error, don't logout automatically
          if (error.response?.status === 401 || error.response?.status === 403) {
            Cookies.remove(config.tokenKey);
            Cookies.remove('refresh_token');
            setUser(null);
          }
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  const login = React.useCallback(async (email: string, password: string, redirectUrl?: string) => {
    try {
      const response = await apiLogin({ email, password });

      if (response.requireOtp) {
        return response;
      }

      // If no OTP required (legacy or OAuth direct), store tokens
      if (response.access_token && response.refresh_token && response.user) {
        // Store tokens in cookie
        Cookies.set(config.tokenKey, response.access_token, {
          expires: 7, // 7 days
          sameSite: 'lax',
        });

        Cookies.set('refresh_token', response.refresh_token, {
          expires: 7,
          sameSite: 'lax',
        });

        // Store user info in cookie for subscription page
        Cookies.set('user', JSON.stringify(response.user), {
          expires: 7,
          sameSite: 'lax',
        });

        setUser(response.user);
        router.push(redirectUrl || '/dashboard');
      }
      return response;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }, [router]);

  const verifyOtp = React.useCallback(async (email: string, otp: string, redirectUrl?: string) => {
    try {
      const response = await apiVerifyOtp({ email, otp });

      // Store tokens in cookie
      Cookies.set(config.tokenKey, response.access_token, {
        expires: 7, // 7 days
        sameSite: 'lax',
      });

      Cookies.set('refresh_token', response.refresh_token, {
        expires: 7,
        sameSite: 'lax',
      });

      // Store user info in cookie for subscription page
      Cookies.set('user', JSON.stringify(response.user), {
        expires: 7,
        sameSite: 'lax',
      });

      setUser(response.user);
      router.push(redirectUrl || '/dashboard');
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }, [router]);

  const register = React.useCallback(async (email: string, password: string, fullName: string, role?: string, googleId?: string, spotifyId?: string, avatar?: string, redirectUrl?: string, verificationToken?: string) => {
    try {
      const response = await apiRegister({ email, password, fullName, role, googleId, spotifyId, avatar, verificationToken });

      // If registration returns tokens, log the user in directly (skipping OTP)
      if (response.access_token && response.refresh_token) {
        // Store tokens in cookie
        Cookies.set(config.tokenKey, response.access_token, {
          expires: 7, // 7 days
          sameSite: 'lax',
        });

        Cookies.set('refresh_token', response.refresh_token, {
          expires: 7,
          sameSite: 'lax',
        });

        // Store user info in cookie for subscription page
        Cookies.set('user', JSON.stringify(response.user), {
          expires: 7,
          sameSite: 'lax',
        });

        setUser(response.user);
        router.push(redirectUrl || '/dashboard');
      } else {
        // Fallback to login if no tokens returned (should not happen with new backend)
        await login(email, password, redirectUrl);
      }
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }, [login, router]);

  const logout = React.useCallback(() => {
    Cookies.remove(config.tokenKey);
    Cookies.remove('refresh_token');
    Cookies.remove('user');
    setUser(null);
    router.push('/auth');
  }, [router]);

  const refreshUser = React.useCallback(async () => {
    try {
      const userData = await getMe();
      setUser(userData);
    } catch (error: any) {
      // If refresh fails due to auth, logout. Otherwise just keep current state.
      if (error.response?.status === 401 || error.response?.status === 403) {
        logout();
      }
    }
  }, [logout]);

  const loginWithToken = React.useCallback(async (token: string, refreshToken?: string) => {
    try {
      // Store tokens in cookie
      Cookies.set(config.tokenKey, token, {
        expires: 7, // 7 days
        sameSite: 'lax',
      });

      if (refreshToken) {
        Cookies.set('refresh_token', refreshToken, {
          expires: 7,
          sameSite: 'lax',
        });
      }

      const userData = await getMe();
      setUser(userData);
      router.push('/dashboard');
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }, [router]);

  const resendOtp = React.useCallback(async (email: string) => {
    try {
      await apiResendOtp({ email });
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }, []);

  const value = React.useMemo(() => ({
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
    loginWithToken,
    forgotPassword: apiForgotPassword,
    resetPassword: apiResetPassword,
    verifyOtp,
    resendOtp,
  }), [user, loading, login, register, logout, refreshUser, loginWithToken, verifyOtp, resendOtp]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


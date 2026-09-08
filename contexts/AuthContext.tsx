'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { User, login as apiLogin, register as apiRegister, getMe, forgotPassword as apiForgotPassword, resetPassword as apiResetPassword, verifyOtp as apiVerifyOtp, resendOtp as apiResendOtp, LoginResponse } from '@/lib/api/auth';
import { config } from '@/lib/config';
import { AUTH_USER_UPDATED_EVENT } from '@/lib/auth-session';
import {
  clearAuthCookies,
  getCachedUser,
  hasAuthToken,
  setAuthTokens,
  setAuthUserCookie,
} from '@/lib/auth-cookies';

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const logout = React.useCallback(() => {
    clearAuthCookies();
    setUser(null);
    setIsAuthenticated(false);
    queryClient.clear();
    router.push('/auth');
  }, [queryClient, router]);

  useEffect(() => {
    let cancelled = false;

    const bootstrapAuth = async () => {
      const token = Cookies.get(config.tokenKey);
      const cachedUser = getCachedUser();
      const authenticated = Boolean(token);

      if (!cancelled) {
        setIsAuthenticated(authenticated);
        if (cachedUser) {
          setUser(cachedUser);
        } else if (!token) {
          setUser(null);
        }
        setLoading(false);
      }

      if (!token) {
        return;
      }

      try {
        const userData = await getMe();
        if (!cancelled) {
          setUser(userData);
          setIsAuthenticated(true);
          setAuthUserCookie(userData);
        }
      } catch (error: unknown) {
        const status = (error as { response?: { status?: number } })?.response?.status;
        if ((status === 401 || status === 403) && !cancelled) {
          if (!cachedUser) {
            clearAuthCookies();
            setUser(null);
            setIsAuthenticated(false);
            queryClient.clear();
          }
        }
      }
    };

    bootstrapAuth();

    return () => {
      cancelled = true;
    };
  }, [queryClient]);

  useEffect(() => {
    const onUserUpdated = (event: Event) => {
      const detail = (event as CustomEvent<User>).detail;
      if (detail) {
        setUser(detail);
        setIsAuthenticated(true);
      }
    };

    window.addEventListener(AUTH_USER_UPDATED_EVENT, onUserUpdated);
    return () => window.removeEventListener(AUTH_USER_UPDATED_EVENT, onUserUpdated);
  }, []);

  const login = React.useCallback(async (email: string, password: string, redirectUrl?: string) => {
    const response = await apiLogin({ email, password });

    if (response.requireOtp) {
      return response;
    }

    if (response.access_token && response.refresh_token && response.user) {
      setAuthTokens(response.access_token, response.refresh_token);
      setAuthUserCookie(response.user);
      setUser(response.user);
      setIsAuthenticated(true);
      router.push(redirectUrl || '/dashboard');
    }
    return response;
  }, [router]);

  const verifyOtp = React.useCallback(async (email: string, otp: string, redirectUrl?: string) => {
    const response = await apiVerifyOtp({ email, otp });

    setAuthTokens(response.access_token, response.refresh_token);
    setAuthUserCookie(response.user);
    setUser(response.user);
    setIsAuthenticated(true);
    router.push(redirectUrl || '/dashboard');
  }, [router]);

  const register = React.useCallback(async (email: string, password: string, fullName: string, _role?: string, googleId?: string, spotifyId?: string, avatar?: string, redirectUrl?: string, verificationToken?: string) => {
    const response = await apiRegister({ email, password, fullName, googleId, spotifyId, avatar, verificationToken });

    if (response.access_token && response.refresh_token) {
      setAuthTokens(response.access_token, response.refresh_token);
      setAuthUserCookie(response.user);
      setUser(response.user);
      setIsAuthenticated(true);
      router.push(redirectUrl || '/dashboard');
    } else {
      await login(email, password, redirectUrl);
    }
  }, [login, router]);

  const refreshUser = React.useCallback(async () => {
    if (!hasAuthToken()) return;

    try {
      const userData = await getMe();
      setUser(userData);
      setIsAuthenticated(true);
      setAuthUserCookie(userData);
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 401 || status === 403) {
        const cachedUser = getCachedUser();
        if (!cachedUser) {
          logout();
        }
      }
    }
  }, [logout]);

  const loginWithToken = React.useCallback(async (token: string, refreshToken?: string) => {
    setAuthTokens(token, refreshToken);

    const userData = await getMe();
    setUser(userData);
    setIsAuthenticated(true);
    setAuthUserCookie(userData);
    router.push('/dashboard');
  }, [router]);

  const resendOtp = React.useCallback(async (email: string) => {
    await apiResendOtp({ email });
  }, []);

  const value = React.useMemo(() => ({
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
    loginWithToken,
    forgotPassword: apiForgotPassword,
    resetPassword: apiResetPassword,
    verifyOtp,
    resendOtp,
  }), [user, loading, isAuthenticated, login, register, logout, refreshUser, loginWithToken, verifyOtp, resendOtp]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

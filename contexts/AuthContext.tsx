'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { User, login as apiLogin, register as apiRegister, getMe, forgotPassword as apiForgotPassword, resetPassword as apiResetPassword } from '@/lib/api/auth';
import { config } from '@/lib/config';
import { getErrorMessage } from '@/lib/api-client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, redirectUrl?: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, role?: string, googleId?: string, spotifyId?: string, avatar?: string, redirectUrl?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  loginWithToken: (token: string, refreshToken?: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<{ message: string }>;
  resetPassword: (token: string, password: string) => Promise<{ message: string }>;
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
        } catch (error) {
          // Token is invalid, remove it
          Cookies.remove(config.tokenKey);
          setUser(null);
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  const login = React.useCallback(async (email: string, password: string, redirectUrl?: string) => {
    try {
      const response = await apiLogin({ email, password });

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

  const register = React.useCallback(async (email: string, password: string, fullName: string, role?: string, googleId?: string, spotifyId?: string, avatar?: string, redirectUrl?: string) => {
    try {
      await apiRegister({ email, password, fullName, role, googleId, spotifyId, avatar });

      // After successful registration, log the user in
      await login(email, password, redirectUrl);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }, [login]);

  const logout = React.useCallback(() => {
    Cookies.remove(config.tokenKey);
    Cookies.remove('refresh_token');
    setUser(null);
    router.push('/auth');
  }, [router]);

  const refreshUser = React.useCallback(async () => {
    try {
      const userData = await getMe();
      setUser(userData);
    } catch (error) {
      // If refresh fails, logout
      logout();
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
  }), [user, loading, login, register, logout, refreshUser, loginWithToken]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


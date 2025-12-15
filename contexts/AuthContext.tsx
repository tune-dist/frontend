'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { User, login as apiLogin, register as apiRegister, getMe } from '@/lib/api/auth';
import { config } from '@/lib/config';
import { getErrorMessage } from '@/lib/api-client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, role?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
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

  const login = async (email: string, password: string) => {
    try {
      const response = await apiLogin({ email, password });

      // Store token in cookie
      Cookies.set(config.tokenKey, response.access_token, {
        expires: 7, // 7 days
        sameSite: 'lax',
      });

      setUser(response.user);
      router.push('/dashboard');
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  };

  const register = async (email: string, password: string, fullName: string, role?: string) => {
    try {
      await apiRegister({ email, password, fullName, role });

      // After successful registration, log the user in
      await login(email, password);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  };

  const logout = () => {
    Cookies.remove(config.tokenKey);
    setUser(null);
    router.push('/auth');
  };

  const refreshUser = async () => {
    try {
      const userData = await getMe();
      setUser(userData);
    } catch (error) {
      // If refresh fails, logout
      logout();
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


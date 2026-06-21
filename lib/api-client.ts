import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';
import { config } from './config';
import {
  PLAN_INACTIVE_CODE,
  PlanInactiveError,
  triggerPlanInactive,
} from './plan-inactive';
import { dispatchAuthUserUpdated } from './auth-session';
import type { User } from './api/auth';

type RetryableRequest = InternalAxiosRequestConfig & { _retry?: boolean };

// Bare client for token refresh — avoids interceptor loops and duplicate refresh calls.
const refreshClient = axios.create({
  baseURL: config.apiUrl,
  headers: { 'Content-Type': 'application/json' },
});

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: config.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (requestConfig: InternalAxiosRequestConfig) => {
    const token = Cookies.get(config.tokenKey);
    if (token && requestConfig.headers) {
      requestConfig.headers.Authorization = `Bearer ${token}`;
    }
    return requestConfig;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ code?: string; reason?: string; message?: string }>) => {
    const originalRequest = error.config as RetryableRequest;

    // Handle 403 from ActivePlanGuard (cancelled/halted/expired subscription).
    // Show the global subscribe-modal and reject with a tagged error so call
    // sites can skip their own toast.
    if (error.response?.status === 403 && error.response?.data?.code === PLAN_INACTIVE_CODE) {
      const payload = {
        reason: error.response.data.reason,
        message: error.response.data.message,
      };
      triggerPlanInactive(payload);
      return Promise.reject(new PlanInactiveError(payload));
    }

    // Handle 401 errors (unauthorized)
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/login')
    ) {
      if (isRefreshing) {
        originalRequest._retry = true;
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = 'Bearer ' + token;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refresh_token = Cookies.get('refresh_token');
      if (refresh_token) {
        try {
          const { data } = await refreshClient.post<{
            access_token: string;
            refresh_token: string;
            user?: User;
          }>(
            '/auth/refresh',
            { refresh_token },
          );

          const cookieOptions = {
            expires: 7,
            sameSite: 'lax' as const,
          };

          Cookies.set(config.tokenKey, data.access_token, cookieOptions);
          Cookies.set('refresh_token', data.refresh_token, cookieOptions);

          if (data.user) {
            Cookies.set('user', JSON.stringify(data.user), cookieOptions);
            dispatchAuthUserUpdated(data.user);
          }

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
          }

          processQueue(null, data.access_token);
          return apiClient(originalRequest);
        } catch (refreshError: any) {
          processQueue(refreshError, null);
          if (refreshError.response?.status === 401 || refreshError.response?.status === 403) {
            Cookies.remove(config.tokenKey);
            Cookies.remove('refresh_token');
            Cookies.remove('user');
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth')) {
              window.location.href = '/auth';
            }
          }
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      isRefreshing = false;
      processQueue(new Error('No refresh token available'), null);
      Cookies.remove(config.tokenKey);
      Cookies.remove('user');
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth')) {
        window.location.href = '/auth';
      }
      return Promise.reject(error);
    } else if (error.response?.status === 401) {
      // Session expired and refresh already failed or was skipped.
      Cookies.remove(config.tokenKey);
      Cookies.remove('refresh_token');
      Cookies.remove('user');
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth')) {
        window.location.href = '/auth';
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

// Helper to handle API errors
export const getErrorMessage = (error: unknown): string => {
  console.log('getErrorDebug:', error); // Debug log
  if (axios.isAxiosError(error)) {
    console.log('Is Axios Error:', true);
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;

    // Handle specific network errors
    if (!axiosError.response) {
      if (axiosError.code === 'ERR_NETWORK') {
        return 'Network connection error. Please check if the backend server is running.';
      }
      return axiosError.message || 'Unable to connect to the server. Please try again later.';
    }

    return axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'An error occurred';
  }
  console.log('Is Axios Error:', false);
  return 'An unexpected error occurred';
};


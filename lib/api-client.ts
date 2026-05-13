import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';
import { config } from './config';

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
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/refresh') && !originalRequest.url?.includes('/auth/login')) {
      
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = 'Bearer ' + token;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refresh_token = Cookies.get('refresh_token');
      if (refresh_token) {
        try {
          const { refreshToken: performRefresh } = await import('./api/auth');
          const data = await performRefresh(refresh_token);

          // Update tokens in cookies with same options as AuthContext
          const cookieOptions = {
            expires: 7,
            sameSite: 'lax' as const,
          };
          
          Cookies.set(config.tokenKey, data.access_token, cookieOptions);
          Cookies.set('refresh_token', data.refresh_token, cookieOptions);

          // Update authorization header and retry
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
          }
          
          processQueue(null, data.access_token);
          return apiClient(originalRequest);
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect
          processQueue(refreshError, null);
          Cookies.remove(config.tokenKey);
          Cookies.remove('refresh_token');
          Cookies.remove('user');
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth')) {
            window.location.href = '/auth';
          }
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        // No refresh token, clear access token and redirect
        Cookies.remove(config.tokenKey);
        Cookies.remove('user');
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth')) {
          window.location.href = '/auth';
        }
      }
    } else if (error.response?.status === 401 && !originalRequest.url?.includes('/auth/login')) {
      // If it was already a retry or a refresh request that failed, logout
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
    return axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'An error occurred';
  }
  console.log('Is Axios Error:', false);
  return 'An unexpected error occurred';
};


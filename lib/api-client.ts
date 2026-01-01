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

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refresh_token = Cookies.get('refresh_token');
      if (refresh_token) {
        try {
          const { refreshToken: performRefresh } = await import('./api/auth');
          const data = await performRefresh(refresh_token);

          // Update tokens in cookies
          Cookies.set(config.tokenKey, data.access_token);
          Cookies.set('refresh_token', data.refresh_token);

          // Update authorization header and retry
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
          }
          return apiClient(originalRequest);
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect
          Cookies.remove(config.tokenKey);
          Cookies.remove('refresh_token');
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth')) {
            window.location.href = '/auth';
          }
        }
      } else {
        // No refresh token, clear access token and redirect
        Cookies.remove(config.tokenKey);
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth')) {
          window.location.href = '/auth';
        }
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


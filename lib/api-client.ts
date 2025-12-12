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
  (error: AxiosError) => {
    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      Cookies.remove(config.tokenKey);
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


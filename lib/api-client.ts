import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';
import { config } from './config';
import {
  PLAN_INACTIVE_CODE,
  PlanInactiveError,
  triggerPlanInactive,
} from './plan-inactive';
import { dispatchAuthUserUpdated } from './auth-session';
import {
  clearAuthCookies,
  setAuthTokens,
  setAuthUserCookie,
} from './auth-cookies';
import type { User } from './api/auth';

type RetryableRequest = InternalAxiosRequestConfig & { _retry?: boolean };

const refreshClient = axios.create({
  baseURL: config.apiUrl,
  headers: { 'Content-Type': 'application/json' },
});

const apiClient: AxiosInstance = axios.create({
  baseURL: config.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

apiClient.interceptors.request.use(
  (requestConfig: InternalAxiosRequestConfig) => {
    const token = Cookies.get(config.tokenKey);
    if (token && requestConfig.headers) {
      requestConfig.headers.Authorization = `Bearer ${token}`;
    }
    return requestConfig;
  },
  (error) => Promise.reject(error),
);

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ code?: string; reason?: string; message?: string }>) => {
    const originalRequest = error.config as RetryableRequest;

    if (error.response?.status === 403 && error.response?.data?.code === PLAN_INACTIVE_CODE) {
      const payload = {
        reason: error.response.data.reason,
        message: error.response.data.message,
      };
      triggerPlanInactive(payload);
      return Promise.reject(new PlanInactiveError(payload));
    }

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/login')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refresh_token = Cookies.get('refresh_token');
      if (!refresh_token) {
        isRefreshing = false;
        processQueue(error, null);
        return Promise.reject(error);
      }

      try {
        const { data } = await refreshClient.post<{
          access_token: string;
          refresh_token: string;
          user?: User;
        }>('/auth/refresh', { refresh_token });

        setAuthTokens(data.access_token, data.refresh_token);

        if (data.user) {
          setAuthUserCookie(data.user);
          dispatchAuthUserUpdated(data.user);
        }

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        }

        processQueue(null, data.access_token);
        return apiClient(originalRequest);
      } catch (refreshError: unknown) {
        processQueue(refreshError, null);
        const status = (refreshError as { response?: { status?: number } })?.response?.status;
        if (status === 401 || status === 403) {
          clearAuthCookies();
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;

export { getErrorMessage } from './get-error-message';

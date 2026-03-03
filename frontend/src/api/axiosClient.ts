import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/authStore';

const baseURL = import.meta.env.VITE_API_BASE_URL || "/api";

const axiosClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

let refreshPromise: Promise<string | null> | null = null;

axiosClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: number };

    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    if (originalRequest.url?.includes('/auth/')) {
      return Promise.reject(error);
    }

    originalRequest._retry = originalRequest._retry || 0;

    if (originalRequest._retry >= 3) {
      useAuthStore.getState().clearAuthData();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    originalRequest._retry += 1;

    const { refreshToken } = useAuthStore.getState();

    if (!refreshToken) {
      useAuthStore.getState().clearAuthData();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    try {
      if (!refreshPromise) {
        refreshPromise = (async () => {
          try {
            const response = await axios.post(
              `${baseURL}/auth/refresh`,
              { refreshToken }
            );

            const authResponse = response.data.result;
            const { accessToken, refreshToken: newRefreshToken } = authResponse;

            useAuthStore.getState().updateTokens(accessToken, newRefreshToken);

            axiosClient.defaults.headers.common['Authorization'] =
              `Bearer ${accessToken}`;

            return accessToken;
          } catch (err) {
            useAuthStore.getState().clearAuthData();
            window.location.href = '/login';
            return null;
          } finally {
            refreshPromise = null;
          }
        })();
      }

      const newAccessToken = await refreshPromise;

      if (!newAccessToken) {
        return Promise.reject(error);
      }

      if (originalRequest.headers) {
        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`;
      }

      return axiosClient(originalRequest);

    } catch (err) {
      return Promise.reject(err);
    }
  }
);

export default axiosClient;
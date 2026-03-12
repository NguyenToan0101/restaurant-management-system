import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/authStore';

const baseURL = import.meta.env.VITE_API_BASE_URL || "/api";

const axiosClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  withCredentials: true, // Enable sending cookies
});

let refreshPromise: Promise<string | null> | null = null;

// Helper: chỉ là JWT thực khi bắt đầu bằng 'eyJ' (base64 header)
const isRealJwt = (token: string | null): boolean =>
  !!token && token.startsWith('eyJ');

axiosClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (isRealJwt(token) && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    // Không retry các endpoint auth (tránh vòng lặp)
    if (originalRequest.url?.includes('/auth/')) {
      console.log('[axiosClient] 401 on auth endpoint, not retrying:', originalRequest.url);
      return Promise.reject(error);
    }

    // Tránh retry 2 lần
    if (originalRequest._retry) {
      console.log('[axiosClient] Already retried, logging out');
      useAuthStore.getState().clearAuthData();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    console.log('[axiosClient] 401 detected, attempting token refresh for:', originalRequest.url);

    try {
      if (!refreshPromise) {
        refreshPromise = (async () => {
          try {
            // Determine which refresh endpoint to use based on session type
            const isStaff = !!useAuthStore.getState().staffInfo;
            const refreshEndpoint = isStaff ? '/auth/staff-refresh' : '/auth/refresh';
            
            console.log('[axiosClient] Calling refresh endpoint:', refreshEndpoint);

            // Refresh token có trong HttpOnly cookie, backend tự đọc
            // Backend sẽ set lại access_token cookie mới qua Set-Cookie
            const response = await axiosClient.post(
              refreshEndpoint,
              {}, // Empty body
              { withCredentials: true }
            );
            
            console.log('[axiosClient] Token refresh successful');
            
            // Update user/staff info from refresh response if available
            if (response.data?.result) {
              const result = response.data.result;
              if (result.user) {
                useAuthStore.getState().setAuthData({
                  accessToken: null,
                  refreshToken: null,
                  user: result.user,
                });
              } else if (result.staffInfo) {
                useAuthStore.getState().setStaffAuthData({
                  accessToken: null,
                  refreshToken: null,
                  staffInfo: result.staffInfo,
                });
              }
            }
            
            return 'refreshed';
          } catch (refreshError) {
            console.error('[axiosClient] Token refresh failed:', refreshError);
            useAuthStore.getState().clearAuthData();
            window.location.href = '/login';
            return null;
          } finally {
            refreshPromise = null;
          }
        })();
      }

      const result = await refreshPromise;

      if (!result) {
        return Promise.reject(error);
      }

      console.log('[axiosClient] Retrying original request:', originalRequest.url);

      // Retry request gốc - cookie mới đã được set bởi backend
      // Xóa Authorization header để backend dùng cookie
      if (originalRequest.headers) {
        delete originalRequest.headers.Authorization;
      }

      return axiosClient(originalRequest);

    } catch (err) {
      console.error('[axiosClient] Error in refresh flow:', err);
      return Promise.reject(err);
    }
  }
);

export default axiosClient;
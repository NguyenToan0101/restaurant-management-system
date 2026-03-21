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

// Helper: check if URL is a public endpoint that doesn't need authentication
const isPublicEndpoint = (url?: string): boolean => {
  if (!url) return false;
  const publicPaths = [
    '/public/',
    '/auth/login',
    '/auth/staff-login',
    '/auth/refresh',
    '/auth/staff-refresh',
    '/users/signup',
    '/users/mail',
    '/users/forgetpass',
    '/packages/active',
    '/waiter/orders',
    '/branch-menu-items/guest/',
    '/available-tables'
  ];
  // Check for exact match or path prefix match
  // Note: /reservations without any path after it is public (for customer booking)
  // but /reservations/* (with sub-paths) requires authentication
  return publicPaths.some(path => url.includes(path)) || 
         (url === '/reservations' || url.startsWith('/reservations?'));
};

axiosClient.interceptors.request.use(
  (config) => {
    // Don't add auth header for public endpoints
    if (!isPublicEndpoint(config.url)) {
      const token = useAuthStore.getState().accessToken;
      if (isRealJwt(token) && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
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

    // Check for authorization error (code 1108)
    if (error.response?.data && typeof error.response.data === 'object') {
      const errorData = error.response.data as { code?: number };
      if (errorData.code === 1108) {
        console.log('[axiosClient] Access denied (1108), redirecting to unauthorized page');
        window.location.href = '/unauthorized';
        return Promise.reject(error);
      }
    }

    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    // Don't retry for public endpoints - they shouldn't need auth
    if (isPublicEndpoint(originalRequest.url)) {
      console.log('[axiosClient] 401 on public endpoint, not retrying:', originalRequest.url);
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
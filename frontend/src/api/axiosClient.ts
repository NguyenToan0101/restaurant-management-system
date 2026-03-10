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
    // Chỉ gửi Authorization header khi token là JWT thực (không phải placeholder 'cookie')
    if (isRealJwt(token) && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
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
      return Promise.reject(error);
    }

    // Tránh retry 2 lần
    if (originalRequest._retry) {
      useAuthStore.getState().clearAuthData();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = (async () => {
          try {
            // Determine which refresh endpoint to use based on session type
            const isStaff = !!useAuthStore.getState().staffInfo;
            const refreshEndpoint = isStaff ? `${baseURL}/auth/staff-refresh` : `${baseURL}/auth/refresh`;

            // Refresh token có trong HttpOnly cookie, backend tự đọc
            // Backend sẽ set lại access_token cookie mới qua Set-Cookie
            await axios.post(
              refreshEndpoint,
              {}, // Empty body
              { withCredentials: true }
            );
            return 'refreshed';
          } catch {
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

      // Retry request gốc - cookie mới sẽ tự được gửi nớm withCredentials: true
      // Xóa Authorization header nếu có để backend dùng cookie
      if (originalRequest.headers) {
        delete originalRequest.headers.Authorization;
      }

      return axiosClient(originalRequest);

    } catch (err) {
      return Promise.reject(err);
    }
  }
);

export default axiosClient;
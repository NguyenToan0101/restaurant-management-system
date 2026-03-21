import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/api/authApi';

// Helper: check if current path is a public customer page
const isPublicCustomerPage = (): boolean => {
  const path = window.location.pathname;
  // Customer pages follow pattern: /:slug/home, /:slug/menu, /:slug/reservations, /:slug/checkout
  const publicPagePatterns = ['/home', '/menu', '/reservations', '/checkout'];
  return publicPagePatterns.some(pattern => path.includes(pattern));
};

export const useAuthInit = () => {
  const setAuthData = useAuthStore((state) => state.setAuthData);
  const clearAuthData = useAuthStore((state) => state.clearAuthData);
  const hasFetched = useRef(false);

  useEffect(() => {
    // Chỉ fetch một lần duy nhất khi app khởi động
    if (hasFetched.current) return;
    hasFetched.current = true;

    // Skip auth check for public customer pages
    if (isPublicCustomerPage()) {
      console.log('[useAuthInit] Skipping auth check for public customer page');
      return;
    }

    const initAuth = async () => {
      try {
        // Luôn gọi /auth/me khi app load để verify session hiện tại
        // Backend sẽ đọc từ HttpOnly cookie (access_token) nếu không có Authorization header
        const result = await authApi.getCurrentUser();

        if (result && (result.user || result.staffInfo)) {
          if (result.user) {
            setAuthData({
              accessToken: null,
              refreshToken: null,
              user: result.user,
            });
          }
          if (result.staffInfo) {
            useAuthStore.getState().setStaffAuthData({
              accessToken: null,
              refreshToken: null,
              staffInfo: result.staffInfo,
            });
          }
        } else {
          // Không có session hợp lệ
          clearAuthData();
        }
      } catch {
        // 401 = không có session hợp lệ, xóa dữ liệu cũ
        clearAuthData();
      }
    };

    initAuth();
  }, [setAuthData, clearAuthData]);
};

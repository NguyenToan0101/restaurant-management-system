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
  const setStaffAuthData = useAuthStore((state) => state.setStaffAuthData);
  const clearAuthData = useAuthStore((state) => state.clearAuthData);
  const hasFetched = useRef(false);

  useEffect(() => {
    // Chỉ fetch một lần duy nhất khi app khởi động
    if (hasFetched.current) return;
    hasFetched.current = true;

    // Skip auth check for public customer pages
    if (isPublicCustomerPage()) {
      return;
    }

    const initAuth = async () => {
      const currentState = useAuthStore.getState();
      
      // Nếu ĐÃ CÓ token trong localStorage → skip API call, tin tưởng localStorage
      // Token sẽ được validate khi gọi API đầu tiên (axiosClient tự động handle 401)
      if (currentState.accessToken && (currentState.user || currentState.staffInfo)) {
        return;
      }

      // Chỉ gọi /auth/me trong các trường hợp:
      // 1. Không có token trong localStorage (có thể là OAuth redirect)
      // 2. Có token nhưng không có user/staffInfo (data bị corrupt)
      try {
        const result = await authApi.getCurrentUser();

        if (result && (result.user || result.staffInfo)) {
          // IMPORTANT: /auth/me không trả về accessToken/refreshToken
          // Chỉ update user/staffInfo, giữ nguyên token đã có trong store
          if (result.user) {
            setAuthData({
              accessToken: currentState.accessToken || '', // Giữ token hiện tại hoặc empty
              refreshToken: currentState.refreshToken || '',
              user: result.user,
            });
          }
          if (result.staffInfo) {
            setStaffAuthData({
              accessToken: currentState.accessToken || '', // Giữ token hiện tại hoặc empty
              refreshToken: currentState.refreshToken || '',
              staffInfo: result.staffInfo,
            });
          }
        } else {
          // Không có session hợp lệ
          clearAuthData();
        }
      } catch (error) {
        // 401 = không có session hợp lệ, xóa dữ liệu cũ
        clearAuthData();
      }
    };

    initAuth();
  }, [setAuthData, setStaffAuthData, clearAuthData]);
};

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/api/authApi';

export const useAuthInit = () => {
  const setAuthData = useAuthStore((state) => state.setAuthData);
  const clearAuthData = useAuthStore((state) => state.clearAuthData);
  const hasFetched = useRef(false);

  useEffect(() => {
    // Chỉ fetch một lần duy nhất khi app khởi động
    if (hasFetched.current) return;
    hasFetched.current = true;

    const initAuth = async () => {
      try {
        // Luôn gọi /auth/me khi app load để verify session hiện tại
        // Backend sẽ đọc từ HttpOnly cookie (access_token) nếu không có Authorization header
        const user = await authApi.getCurrentUser();

        if (user) {
          setAuthData({
            // Không lưu JWT vào store - được quản lý qua HttpOnly cookie
            // Để null giúp axios interceptor không gửi Authorization header
            // và backend sẽ tự đọc token từ cookie
            accessToken: null,
            refreshToken: null,
            user: user,
          });
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

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthenticationResponse, UserDTO } from '@/types/dto';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserDTO | null;

  setAuthData: (authResponse: AuthenticationResponse) => void;
  clearAuthData: () => void;
  updateTokens: (accessToken: string, refreshToken: string) => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,

      setAuthData: (authResponse: AuthenticationResponse) => {
        set({
          accessToken: authResponse.accessToken,
          refreshToken: authResponse.refreshToken,
          user: authResponse.user,
        });
      },

      clearAuthData: () => {
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
        });
      },

      updateTokens: (accessToken: string, refreshToken: string) => {
        set({ accessToken, refreshToken });
      },

      isAuthenticated: () => {
        const state = get();
        // Authenticated khi có user data (đã verify với backend)
        // Token thực sự nằm trong HttpOnly cookie, không lưu trong store
        return !!state.user;
      },
    }),
    {
      name: 'auth-storage',
      // Chỉ persist user data để hiển thị UI nhanh
      // Tokens KHÔNG được persist - được quản lý qua HttpOnly cookie
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthenticationResponse, UserDTO, StaffAuthResponse, StaffInfo } from '@/types/dto';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserDTO | null;
  staffInfo: StaffInfo | null;

  setAuthData: (authResponse: AuthenticationResponse) => void;
  setStaffAuthData: (authResponse: StaffAuthResponse) => void;
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
      staffInfo: null,

      setAuthData: (authResponse: AuthenticationResponse) => {
        set({
          accessToken: authResponse.accessToken,
          refreshToken: authResponse.refreshToken,
          user: authResponse.user,
          staffInfo: null,
        });
      },

      setStaffAuthData: (authResponse: StaffAuthResponse) => {
        set({
          accessToken: authResponse.accessToken,
          refreshToken: authResponse.refreshToken,
          user: null,
          staffInfo: authResponse.staffInfo,
        });
      },

      clearAuthData: () => {
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          staffInfo: null,
        });
      },

      updateTokens: (accessToken: string, refreshToken: string) => {
        set({ accessToken, refreshToken });
      },

      isAuthenticated: () => {
        const state = get();
        // Authenticated khi có user data hoặc staff data
        // Token thực sự nằm trong HttpOnly cookie, không lưu trong store
        return !!state.user || !!state.staffInfo;
      },
    }),
    {
      name: 'auth-storage',
      // Chỉ persist user data để hiển thị UI nhanh
      // Tokens KHÔNG được persist - được quản lý qua HttpOnly cookie
      partialize: (state) => ({
        user: state.user,
        staffInfo: state.staffInfo,
      }),
    }
  )
);

import axiosClient from './axiosClient';
import type { ApiResponse, LoginRequest, AuthenticationResponse, LogoutRequest } from '@/types/dto';
import { useAuthStore } from '@/stores/authStore';

class AuthApi {
  async login(email: string, password: string): Promise<AuthenticationResponse> {
    const request: LoginRequest = { email, password };
    const response = await axiosClient.post<ApiResponse<AuthenticationResponse>>('/auth/login', request);
    
    useAuthStore.getState().setAuthData(response.data.result);
    
    return response.data.result;
  }

  async logout(): Promise<void> {
    const refreshToken = useAuthStore.getState().refreshToken;
    
    if (refreshToken) {
      const request: LogoutRequest = { refreshToken };
      await axiosClient.post<ApiResponse<void>>('/auth/logout', request);
    }
    
    useAuthStore.getState().clearAuthData();
  }

  isAuthenticated(): boolean {
    return useAuthStore.getState().isAuthenticated();
  }
}

export const authApi = new AuthApi();

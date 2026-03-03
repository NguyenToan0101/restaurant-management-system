import axiosClient from './axiosClient';
import type { ApiResponse, LoginRequest, AuthenticationResponse, LogoutRequest, GoogleAuthUrlResponse, GoogleCallbackRequest } from '@/types/dto';
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

  async getGoogleAuthUrl(): Promise<GoogleAuthUrlResponse> {
    const response = await axiosClient.get<ApiResponse<GoogleAuthUrlResponse>>('/auth/google/url');
    return response.data.result;
  }

  async googleCallback(code: string, state: string): Promise<AuthenticationResponse> {
    const request: GoogleCallbackRequest = { code, state };
    const response = await axiosClient.post<ApiResponse<AuthenticationResponse>>('/auth/google/callback', request);
    
    useAuthStore.getState().setAuthData(response.data.result);
    
    return response.data.result;
  }
}

export const authApi = new AuthApi();

import axiosClient from './axiosClient';
import type { ApiResponse, LoginRequest, AuthenticationResponse } from '@/types/dto';
import { useAuthStore } from '@/stores/authStore';

class AuthApi {
  async login(email: string, password: string): Promise<AuthenticationResponse> {
    const request: LoginRequest = { email, password };
    const response = await axiosClient.post<ApiResponse<AuthenticationResponse>>('/auth/login', request);

    const result = response.data.result;
    // Backend đã set token vào HttpOnly cookie
    // Chỉ lưu user data vào store (không lưu token vào memory/localStorage)
    useAuthStore.getState().setAuthData({
      accessToken: null,
      refreshToken: null,
      user: result.user,
    });

    return result;
  }

  async logout(): Promise<void> {
    // Logout will clear cookies automatically
    await axiosClient.post<ApiResponse<void>>('/auth/logout', {});
    useAuthStore.getState().clearAuthData();
  }

  isAuthenticated(): boolean {
    return useAuthStore.getState().isAuthenticated();
  }

  // Redirect to Spring Security OAuth2 authorization endpoint
  redirectToGoogleLogin(): void {
    // OAuth2 endpoints are at root level, not under /api
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
    const serverUrl = baseUrl.replace('/api', ''); // Remove /api suffix
    window.location.href = `${serverUrl}/oauth2/authorization/google`;
  }

  // Get current authenticated user
  async getCurrentUser(): Promise<any> {
    const response = await axiosClient.get<ApiResponse<any>>('/auth/me');
    return response.data.result;
  }
}

export const authApi = new AuthApi();

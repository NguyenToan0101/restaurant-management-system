import axiosClient from './axiosClient';
import type { ApiResponse, LoginRequest, AuthenticationResponse, StaffLoginRequest, StaffAuthResponse } from '@/types/dto';
import { useAuthStore } from '@/stores/authStore';

class AuthApi {
  async login(email: string, password: string): Promise<AuthenticationResponse> {
    const request: LoginRequest = { email, password };
    const response = await axiosClient.post<ApiResponse<AuthenticationResponse>>('/auth/login', request);

    const result = response.data.result;
    
    // Transform role from string to RoleDTO object for consistency
    const user = result.user;
    if (user && typeof user.role === 'string') {
      user.role = {
        name: user.role,
        description: user.role,
      };
    }
    
    // Backend đã set token vào HttpOnly cookie
    // Chỉ lưu user data vào store (không lưu token vào memory/localStorage)
    useAuthStore.getState().setAuthData({
      accessToken: null,
      refreshToken: null,
      user: user,
    });

    return result;
  }

  async staffLogin(username: string, password: string): Promise<StaffAuthResponse> {
    const request: StaffLoginRequest = { username, password };
    const response = await axiosClient.post<ApiResponse<StaffAuthResponse>>('/auth/staff-login', request);

    const result = response.data.result;
    
    // Backend đã set token vào HttpOnly cookie
    // Chỉ lưu staff info vào store (không lưu token vào memory/localStorage)
    useAuthStore.getState().setStaffAuthData({
      accessToken: null,
      refreshToken: null,
      staffInfo: result.staffInfo,
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
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    
    if (baseUrl) {
      // Use configured base URL
      const serverUrl = baseUrl.replace('/api', ''); // Remove /api suffix
      window.location.href = `${serverUrl}/oauth2/authorization/google`;
    } else {
      // In production, use same origin as frontend
      const serverUrl = window.location.origin;
      window.location.href = `${serverUrl}/oauth2/authorization/google`;
    }
  }

  // Get current authenticated user
  async getCurrentUser(): Promise<any> {
    const response = await axiosClient.get<ApiResponse<any>>('/auth/me');
    const user = response.data.result;
    
    // Transform role from string to RoleDTO object for consistency
    if (user && typeof user.role === 'string') {
      user.role = {
        name: user.role,
        description: user.role,
      };
    }
    
    return user;
  }
}

export const authApi = new AuthApi();

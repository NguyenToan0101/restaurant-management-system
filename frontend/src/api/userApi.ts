import axiosClient from './axiosClient';
import type { ApiResponse } from '@/types/dto/api-response.dto';
import type { 
  SignupRequest, 
  OTPMailRequest, 
  OTPValidateRequest 
} from '@/types/dto/request.dto';
import type { UserDTO } from '@/types/dto/user.dto';

export const userApi = {
  // Send OTP to email
  sendOTP: async (data: OTPMailRequest): Promise<ApiResponse<string>> => {
    const response = await axiosClient.post<ApiResponse<string>>(
      '/users/mail',
      data
    );
    return response.data;
  },

  // Validate OTP code
  validateOTP: async (data: OTPValidateRequest): Promise<ApiResponse<boolean>> => {
    const response = await axiosClient.post<ApiResponse<boolean>>(
      '/users/mail/otp',
      data
    );
    return response.data;
  },

  // Sign up new user
  signup: async (data: SignupRequest): Promise<ApiResponse<UserDTO>> => {
    const response = await axiosClient.post<ApiResponse<UserDTO>>(
      '/users/signup',
      data
    );
    return response.data;
  },
};

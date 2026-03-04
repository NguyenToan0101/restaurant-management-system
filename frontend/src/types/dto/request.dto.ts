export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface SignupRequest {
  email: string;
  username: string;
  password: string;
}

export interface OTPMailRequest {
  mail: string;
  name: string;
}

export interface OTPValidateRequest {
  email: string;
  otp: string;
}

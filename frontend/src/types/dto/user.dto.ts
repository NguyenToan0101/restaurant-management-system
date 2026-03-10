export interface RoleDTO {
  name: string;
  description: string;
}

export interface UserDTO {
  userId: string;
  email: string;
  username: string;
  role: RoleDTO;
  status?: string;
}

export interface AuthenticationResponse {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserDTO;
}

export interface StaffInfo {
  staffAccountId: string;
  username: string;
  role: string;
  branchId: string;
}

export interface StaffAuthResponse {
  accessToken: string | null;
  refreshToken: string | null;
  staffInfo: StaffInfo;
}

export interface GoogleAuthUrlResponse {
  authorizationUrl: string;
  state: string;
}

export interface GoogleCallbackRequest {
  code: string;
  state: string;
}

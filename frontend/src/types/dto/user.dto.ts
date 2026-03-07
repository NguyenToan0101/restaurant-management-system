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

export interface GoogleAuthUrlResponse {
  authorizationUrl: string;
  state: string;
}

export interface GoogleCallbackRequest {
  code: string;
  state: string;
}

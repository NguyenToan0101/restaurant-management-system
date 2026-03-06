export interface UserDTO {
  userId: string;
  email: string;
  username: string;
  phone: string;
  role: string;
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

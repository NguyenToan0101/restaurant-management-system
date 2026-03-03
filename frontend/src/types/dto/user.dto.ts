export interface UserDTO {
  userId: string;
  email: string;
  username: string;
  phone: string;
  role: string;
}

export interface AuthenticationResponse {
  accessToken: string;
  refreshToken: string;
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

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

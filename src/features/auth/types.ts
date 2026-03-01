export interface UserDto {
  id: string;
  fullName: string;
  role: string;
  clinicId: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserDto;
}

export interface UserResponse {
  accessToken: string;
  fullName: string;
  role: string;
}

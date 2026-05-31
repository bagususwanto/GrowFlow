export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: RoleName;
  isActive: boolean;
  permissions?: string[];
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: AuthUser;
}

export type RoleName = 'superadmin' | 'manager' | 'staff' | 'finance' | 'warehouse';

export interface UpdateProfileRequest {
  name: string;
}

export interface UpdatePasswordRequest {
  currentPassword?: string;
  newPassword: string;
}


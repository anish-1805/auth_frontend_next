export interface User {
  id: string;
  name: string;
  email: string;
  isEmailVerified: boolean;
  provider?: string;
  providerId?: string;
  avatar?: string;
  isSocialLogin?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface SignupRequestData {
  name: string;
  email: string;
  password: string;
}

export interface OTPVerificationData {
  email: string;
  otp: string;
}

export interface PasswordResetData {
  email: string;
  otp: string;
  newPassword: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
  data?: {
    token?: string;
    users?: User[];
    total?: number;
    page?: number;
    totalPages?: number;
    hasMore?: boolean;
    [key: string]: string | number | boolean | User[] | undefined;
  };
  error?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
}

// Base user interface with core required fields
export interface BaseUser {
  id: string;
  name: string;
  email: string;
}

// Extended user interface with authentication details
export interface User extends BaseUser {
  isEmailVerified: boolean;
  provider?: string;
  providerId?: string;
  avatar?: string;
  isSocialLogin?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Public user profile (for display purposes, no sensitive data)
export interface PublicUserProfile extends BaseUser {
  avatar?: string;
  createdAt?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

// Base credentials interface
export interface BaseCredentials {
  email: string;
  password: string;
}

// Login form extends base credentials
export type LoginFormData = BaseCredentials;

// Signup form extends base credentials with additional fields
export interface SignupFormData extends BaseCredentials {
  name: string;
  confirmPassword: string;
}

// Signup request (what gets sent to API) extends base credentials
export interface SignupRequestData extends BaseCredentials {
  name: string;
}

// Base OTP verification interface
export interface BaseOTPData {
  email: string;
  otp: string;
}

// OTP verification extends base
export type OTPVerificationData = BaseOTPData;

// Password reset extends OTP verification with new password
export interface PasswordResetData extends BaseOTPData {
  newPassword: string;
}

// Base API response interface
export interface BaseApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// Generic API response with data
export interface ApiResponse<T = unknown> extends BaseApiResponse {
  data?: T;
}

// Authentication response extends base with user data
export interface AuthResponse extends BaseApiResponse {
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
}

// Paginated response interface
export interface PaginatedResponse<T> extends BaseApiResponse {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasMore: boolean;
  };
}

// Base password data
export interface BasePasswordData {
  newPassword: string;
}

// Change password extends base with current password
export interface ChangePasswordData extends BasePasswordData {
  currentPassword: string;
}

// Update profile data (partial user update)
export type UpdateProfileData = Partial<Pick<BaseUser, 'name' | 'email'>>;

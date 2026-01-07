import api from '@/config/axios';
import {
  LoginFormData,
  SignupRequestData,
  AuthResponse,
  User,
  OTPVerificationData,
  PasswordResetData,
  ChangePasswordData,
  UpdateProfileData,
} from '@/interfaces/auth';
import { API_ENDPOINTS } from '@/constants/api';
import { AxiosError } from 'axios';

// Helper function to extract error message from Axios error
const getErrorMessage = (error: unknown, defaultMessage: string): string => {
  // Check if it's an AxiosError with response
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    return axiosError.response?.data?.message || defaultMessage;
  }
  // Check if it's a regular Error
  if (error instanceof Error) {
    return error.message;
  }
  // Fallback to default message
  return defaultMessage;
};

export class AuthService {
  // Login user
  static async login(data: LoginFormData): Promise<AuthResponse> {
    try {
      const response = await api.post(API_ENDPOINTS.LOGIN, data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Login failed'));
    }
  }

  // Signup user
  static async signup(data: SignupRequestData): Promise<AuthResponse> {
    try {
      const response = await api.post(API_ENDPOINTS.SIGNUP, data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Signup failed'));
    }
  }

  // Logout user
  static async logout(): Promise<void> {
    try {
      await api.post(API_ENDPOINTS.LOGOUT);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Logout failed'));
    }
  }

  // Check if user is authenticated
  static async checkAuth(): Promise<User | null> {
    try {
      const response = await api.get(API_ENDPOINTS.ME);
      return response.data.user;
    } catch (error) {
      // If 401, user is not authenticated
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 401) {
          return null;
        }
      }
      throw new Error(getErrorMessage(error, 'Authentication check failed'));
    }
  }

  // Refresh token
  static async refreshToken(): Promise<AuthResponse> {
    try {
      const response = await api.post(API_ENDPOINTS.REFRESH);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Token refresh failed'));
    }
  }

  // Verify signup OTP
  static async verifySignupOTP(data: OTPVerificationData): Promise<AuthResponse> {
    try {
      const response = await api.post(API_ENDPOINTS.VERIFY_SIGNUP_OTP, data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'OTP verification failed'));
    }
  }

  // Resend signup OTP
  static async resendSignupOTP(data: { email: string }): Promise<AuthResponse> {
    try {
      const response = await api.post(API_ENDPOINTS.RESEND_SIGNUP_OTP, data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to resend OTP'));
    }
  }

  // Forgot password - send OTP
  static async forgotPassword(data: { email: string }): Promise<AuthResponse> {
    try {
      const response = await api.post(API_ENDPOINTS.FORGOT_PASSWORD, data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to send reset code'));
    }
  }

  // Verify password reset OTP
  static async verifyPasswordResetOTP(data: OTPVerificationData): Promise<AuthResponse> {
    try {
      const response = await api.post(API_ENDPOINTS.VERIFY_PASSWORD_RESET_OTP, data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'OTP verification failed'));
    }
  }

  // Reset password
  static async resetPassword(data: PasswordResetData): Promise<AuthResponse> {
    try {
      const response = await api.post(API_ENDPOINTS.RESET_PASSWORD, data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Password reset failed'));
    }
  }

  // Change password
  static async changePassword(data: ChangePasswordData): Promise<AuthResponse> {
    try {
      const response = await api.put(API_ENDPOINTS.CHANGE_PASSWORD, data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Password change failed'));
    }
  }

  // Update profile
  static async updateProfile(data: UpdateProfileData): Promise<AuthResponse> {
    try {
      const response = await api.put(API_ENDPOINTS.UPDATE_PROFILE, data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Profile update failed'));
    }
  }

  // Google OAuth - Get auth URL
  static getGoogleAuthUrl(): string {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    return `${backendUrl}${API_ENDPOINTS.GOOGLE_AUTH}`;
  }

  // Handle OAuth callback
  static async handleOAuthCallback(): Promise<User | null> {
    try {
      const user = await this.checkAuth();
      return user;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'OAuth authentication failed'));
    }
  }

  // Get socket token
  static async getSocketToken(): Promise<string | null> {
    try {
      const response = await api.get(API_ENDPOINTS.SOCKET_TOKEN);
      return response.data.token;
    } catch (error) {
      console.error('Failed to get socket token:', error);
      return null;
    }
  }

  // Get all users with pagination
  static async getAllUsers(
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<{
    users: User[];
    total: number;
    page: number;
    totalPages: number;
    hasMore: boolean;
  }> {
    try {
      let url = `${API_ENDPOINTS.GET_ALL_USERS}?page=${page}&limit=${limit}`;
      if (search && search.trim()) {
        url += `&search=${encodeURIComponent(search.trim())}`;
      }
      const response = await api.get(url);
      // Backend returns pagination data nested under response.data.pagination
      const pagination = response.data.pagination || {};
      return {
        users: response.data.users || [],
        total: pagination.totalItems || 0,
        page: pagination.currentPage || page,
        totalPages: pagination.totalPages || 1,
        hasMore: pagination.hasMore || false,
      };
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to fetch users'));
    }
  }

  // Delete multiple users
  static async deleteUsers(userIds: string[]): Promise<{
    message: string;
    deletedCount: number;
    failedDeletions?: string[];
  }> {
    try {
      const response = await api.delete(API_ENDPOINTS.DELETE_USERS, {
        data: { userIds }
      });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to delete users'));
    }
  }
}

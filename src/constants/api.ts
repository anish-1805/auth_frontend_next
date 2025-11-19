export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
export const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3001';

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: '/api/auth/login',
  SIGNUP: '/api/auth/signup',
  LOGOUT: '/api/auth/logout',
  ME: '/api/auth/me',
  REFRESH: '/api/auth/refresh',

  // OTP endpoints
  VERIFY_SIGNUP_OTP: '/api/auth/verify-signup-otp',
  RESEND_SIGNUP_OTP: '/api/auth/resend-signup-otp',
  FORGOT_PASSWORD: '/api/auth/forgot-password',
  VERIFY_PASSWORD_RESET_OTP: '/api/auth/verify-password-reset-otp',
  RESET_PASSWORD: '/api/auth/reset-password',

  // Profile endpoints
  CHANGE_PASSWORD: '/api/auth/change-password',
  UPDATE_PROFILE: '/api/auth/profile',

  // OAuth endpoints
  GOOGLE_AUTH: '/api/auth/google',
  GOOGLE_CALLBACK: '/api/auth/google/callback',

  // Socket endpoint
  SOCKET_TOKEN: '/api/auth/socket-token',

  // User endpoints
  GET_ALL_USERS: '/api/auth/users',
} as const;

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  loginUser,
  signupUser,
  logoutUser,
  verifySignupOTP as verifyOTP,
  forgotPassword as sendForgotPassword,
  resetPassword as resetUserPassword,
} from '@/store/slices/authSlice';
import {
  selectUser,
  selectIsAuthenticated,
  selectIsLoading,
  selectAuthError,
  selectIsInitialized,
} from '@/store/selectors/authSelectors';
import {
  LoginFormData,
  SignupRequestData,
  OTPVerificationData,
  PasswordResetData,
} from '@/interfaces/auth';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectAuthError);
  const isInitialized = useAppSelector(selectIsInitialized);

  const login = async (credentials: LoginFormData) => {
    return dispatch(loginUser(credentials)).unwrap();
  };

  const signup = async (userData: SignupRequestData) => {
    return dispatch(signupUser(userData)).unwrap();
  };

  const logout = async () => {
    return dispatch(logoutUser()).unwrap();
  };

  const verifySignupOTP = async (data: OTPVerificationData) => {
    return dispatch(verifyOTP(data)).unwrap();
  };

  const forgotPassword = async (email: string) => {
    return dispatch(sendForgotPassword(email)).unwrap();
  };

  const resetPassword = async (data: PasswordResetData) => {
    return dispatch(resetUserPassword(data)).unwrap();
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    isInitialized,
    login,
    signup,
    logout,
    verifySignupOTP,
    forgotPassword,
    resetPassword,
  };
};

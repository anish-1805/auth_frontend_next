'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';
import * as yup from 'yup';
import { AuthService } from '@/services/authService';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import OTPInput from '@/components/OTPInput';
import Link from 'next/link';
import styles from '@/styles/AuthForms.module.css';

type ResetStep = 'otp' | 'password';

const passwordSchema = yup.object({
  newPassword: yup
    .string()
    .required('New password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('newPassword')], 'Passwords must match'),
});

type PasswordFormData = yup.InferType<typeof passwordSchema>;

export default function ResetPasswordView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetPassword } = useAuth();
  const [currentStep, setCurrentStep] = useState<ResetStep>('otp');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [verifiedOTP, setVerifiedOTP] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(true);

  const email = searchParams.get('email') || '';
  const OTP_EXPIRY_TIME = 300; // 5 minutes in seconds

  useEffect(() => {
    if (!email) {
      router.push(ROUTES.FORGOT_PASSWORD);
    }
  }, [email, router]);

  // Countdown timer effect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [countdown]);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    clearErrors,
  } = useForm<PasswordFormData>({
    resolver: yupResolver(passwordSchema),
    mode: 'onBlur',
  });

  const watchedValues = watch();

  useEffect(() => {
    if (currentStep === 'password') {
      if (!watchedValues.newPassword || watchedValues.newPassword.trim() === '') {
        clearErrors('newPassword');
      }
      if (!watchedValues.confirmPassword || watchedValues.confirmPassword.trim() === '') {
        clearErrors('confirmPassword');
      }

      if (serverError && (watchedValues.newPassword || watchedValues.confirmPassword)) {
        setServerError('');
      }
    }
  }, [
    watchedValues.newPassword,
    watchedValues.confirmPassword,
    clearErrors,
    serverError,
    currentStep,
  ]);

  // Handle OTP verification
  const handleOTPComplete = async (otp: string) => {
    setIsLoading(true);
    setError('');

    try {
      await AuthService.verifyPasswordResetOTP({ email, otp });

      setVerifiedOTP(otp);
      setCurrentStep('password');

      toast.success('✅ Code verified! Now create your new password.');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Invalid or expired code. Please try again.';
      setError(errorMessage);
      toast.error(`❌ ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendCode = async () => {
    if (!canResend) return;

    setIsResending(true);
    setError('');
    setCanResend(false);

    try {
      await AuthService.forgotPassword({ email });

      setCountdown(OTP_EXPIRY_TIME);

      toast.success('📧 New reset code sent to your email!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to resend reset code.';
      setError(errorMessage);
      setCanResend(true);
      toast.error(`⚠️ ${errorMessage}`);
    } finally {
      setIsResending(false);
    }
  };

  // Handle password reset
  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsLoading(true);
    setServerError('');

    try {
      await resetPassword({
        email,
        otp: verifiedOTP,
        newPassword: data.newPassword,
      });

      toast.success('🎉 Password reset successfully! You can now log in with your new password.');
      router.push(ROUTES.LOGIN);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to reset password. Please try again.';
      setServerError(errorMessage);

      if (
        errorMessage.toLowerCase().includes('expired') ||
        errorMessage.toLowerCase().includes('invalid')
      ) {
        toast.error('🔄 Reset code expired. Please request a new one.');
        setCurrentStep('otp');
        setVerifiedOTP('');
      } else {
        toast.error(`⚠️ ${errorMessage}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const goBackToOTP = () => {
    setCurrentStep('otp');
    setVerifiedOTP('');
    setServerError('');
    setError('');
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        {/* Progress indicator */}
        <div className={styles.progressIndicator}>
          <div
            className={`${styles.progressStep} ${currentStep === 'otp' ? styles.active : styles.completed}`}
          >
            <span className={styles.stepNumber}>1</span>
            <span className={styles.stepLabel}>Verify Code</span>
          </div>
          <div className={styles.progressLine}></div>
          <div
            className={`${styles.progressStep} ${currentStep === 'password' ? styles.active : ''}`}
          >
            <span className={styles.stepNumber}>2</span>
            <span className={styles.stepLabel}>New Password</span>
          </div>
        </div>

        {currentStep === 'otp' ? (
          // OTP Verification Step
          <>
            <div className={styles.authHeader}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔐</div>
              <h1>Enter Reset Code</h1>
              <p>We&apos;ve sent a 6-digit reset code to</p>
              <div className={styles.emailDisplay}>
                <strong>{email}</strong>
              </div>
            </div>

            <div className={styles.verificationContent}>
              <div className={styles.verificationInstructions}>
                <p>Enter the reset code to verify your identity:</p>
              </div>

              <OTPInput
                length={6}
                onComplete={handleOTPComplete}
                loading={isLoading}
                error={error}
                autoFocus={true}
              />

              <div className={styles.verificationActions}>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isResending || !canResend}
                  className={styles.resendButton}
                >
                  {isResending ? (
                    <>
                      <span className={styles.spinner}></span>
                      Sending...
                    </>
                  ) : !canResend && countdown > 0 ? (
                    <>
                      <span className={styles.resendIcon}>⏱️</span>
                      Resend in {Math.floor(countdown / 60)}:
                      {String(countdown % 60).padStart(2, '0')}
                    </>
                  ) : (
                    <>
                      <span className={styles.resendIcon}>🔄</span>
                      Resend Code
                    </>
                  )}
                </button>
              </div>

              <div className={styles.verificationHelp}>
                <div className={styles.helpSection}>
                  <h4>Didn&apos;t receive the code?</h4>
                  <ul>
                    <li>Check your spam/junk folder</li>
                    <li>Make sure {email} is correct</li>
                    <li>Wait a few minutes for delivery</li>
                    <li>Click &quot;Resend Code&quot; to get a new one</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        ) : (
          // Password Reset Step
          <>
            <div className={styles.authHeader}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔐</div>
              <h1>Create New Password</h1>
              <p>Enter a strong new password for your account</p>
              <div className={styles.emailDisplay}>
                <strong>{email}</strong>
              </div>
            </div>

            <form onSubmit={handleSubmit(onPasswordSubmit)} className={styles.authForm}>
              {serverError && (
                <div className={`${styles.errorMessage} ${styles.serverError}`}>
                  <span>⚠️</span> {serverError}
                </div>
              )}

              <div className={styles.formGroup}>
                <label htmlFor="newPassword" className={styles.formLabel}>
                  <span>🔒</span> New Password
                </label>
                <div className={styles.passwordInputContainer}>
                  <input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    className={`${styles.formInput} ${errors.newPassword ? styles.error : ''}`}
                    placeholder="Enter your new password"
                    {...register('newPassword')}
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {errors.newPassword && (
                  <span className={styles.errorMessage}>{errors.newPassword.message}</span>
                )}
                <div className={styles.passwordRequirements}>
                  <small>
                    Password must contain at least 8 characters with uppercase, lowercase, number,
                    and special character.
                  </small>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="confirmPassword" className={styles.formLabel}>
                  <span>🔒</span> Confirm New Password
                </label>
                <div className={styles.passwordInputContainer}>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className={`${styles.formInput} ${errors.confirmPassword ? styles.error : ''}`}
                    placeholder="Confirm your new password"
                    {...register('confirmPassword')}
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className={styles.errorMessage}>{errors.confirmPassword.message}</span>
                )}
              </div>

              <div className={styles.formActions}>
                <button type="button" onClick={goBackToOTP} className={styles.backButton}>
                  ← Back to Code
                </button>

                <button
                  type="submit"
                  className={styles.authButton}
                  disabled={isLoading || !isValid}
                  style={{ flex: 1 }}
                >
                  {isLoading ? (
                    <>
                      <span className={styles.spinner}></span>
                      Resetting...
                    </>
                  ) : (
                    <>
                      <span>🔐</span> Reset Password
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className={styles.passwordSecurityInfo}>
              <div className={styles.securityTips}>
                <h4>🛡️ Password Security Tips:</h4>
                <ul>
                  <li>Use a unique password you haven&apos;t used before</li>
                  <li>Consider using a password manager</li>
                  <li>Don&apos;t share your password with anyone</li>
                  <li>Enable two-factor authentication if available</li>
                </ul>
              </div>
            </div>
          </>
        )}

        <div className={styles.authFooter}>
          <p>
            Wrong email?{' '}
            <Link href={ROUTES.FORGOT_PASSWORD} className={styles.linkButton}>
              Try different email
            </Link>
          </p>
          <p style={{ marginTop: '8px' }}>
            Remember your password?{' '}
            <Link href={ROUTES.LOGIN} className={styles.authLink}>
              <span>🔐</span> Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

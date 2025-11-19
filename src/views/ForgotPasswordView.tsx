'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';
import * as yup from 'yup';
import { AuthService } from '@/services/authService';
import { ROUTES } from '@/constants/routes';
import Link from 'next/link';
import styles from '@/styles/AuthForms.module.css';

const forgotPasswordSchema = yup.object({
  email: yup.string().required('Email is required').email('Please enter a valid email address'),
});

type ForgotPasswordFormData = yup.InferType<typeof forgotPasswordSchema>;

export default function ForgotPasswordView() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ForgotPasswordFormData>({
    resolver: yupResolver(forgotPasswordSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setServerError('');

    try {
      await AuthService.forgotPassword(data);
      toast.success('📧 Password reset code sent to your email!');
      router.push(`${ROUTES.RESET_PASSWORD}?email=${encodeURIComponent(data.email)}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to send reset code. Please try again.';
      setServerError(errorMessage);
      toast.error(`⚠️ ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔑</div>
          <h1>Forgot Password?</h1>
          <p>Enter your email address and we&apos;ll send you a verification code.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.authForm}>
          {serverError && (
            <div className={`${styles.errorMessage} ${styles.serverError}`}>
              <span>⚠️</span> {serverError}
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.formLabel}>
              <span>📧</span> Email Address
            </label>
            <input
              id="email"
              type="email"
              className={`${styles.formInput} ${errors.email ? styles.error : ''}`}
              placeholder="Enter your registered email"
              {...register('email')}
            />
            {errors.email && <span className={styles.errorMessage}>{errors.email.message}</span>}
          </div>

          <button type="submit" className={styles.authButton} disabled={isLoading || !isValid}>
            {isLoading ? (
              <>
                <span className={styles.spinner}></span>
                Sending Reset Code...
              </>
            ) : (
              <>
                <span>📤</span> Send Reset Code
              </>
            )}
          </button>
        </form>

        <div className={styles.forgotPasswordInfo}>
          <div className={styles.infoSection}>
            <h4>What happens next?</h4>
            <ol>
              <li>We&apos;ll send a 6-digit code to your email</li>
              <li>Enter the code on the next page</li>
              <li>Create your new password</li>
              <li>Log in with your new password</li>
            </ol>
          </div>

          <div className={styles.securityNote}>
            <div className={styles.securityIcon}>🛡️</div>
            <div>
              <strong>Security Note:</strong>
              <p>The reset code will expire in 5 minutes for your security.</p>
            </div>
          </div>
        </div>

        <div className={styles.authFooter}>
          <p>
            Remember your password?{' '}
            <Link href={ROUTES.LOGIN} className={styles.authLink}>
              <span>🔐</span> Sign In
            </Link>
          </p>
          <p style={{ marginTop: '8px' }}>
            Don&apos;t have an account?{' '}
            <Link href={ROUTES.SIGNUP} className={styles.authLink}>
              <span>✨</span> Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

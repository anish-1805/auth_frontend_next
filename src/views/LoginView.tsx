'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';
import { loginSchema } from '@/validationSchemas/authSchemas';
import { useAuth } from '@/hooks/useAuth';
import { LoginFormData } from '@/interfaces/auth';
import { ROUTES } from '@/constants/routes';
import Link from 'next/link';
import GoogleLoginButton from '@/components/GoogleLoginButton';
import styles from '@/styles/AuthForms.module.css';

export default function LoginView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string>('');

  const redirect = searchParams.get('redirect') || ROUTES.DASHBOARD;

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    clearErrors,
    watch,
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    mode: 'onBlur',
  });

  const watchedValues = watch();

  useEffect(() => {
    const emailValue = watchedValues.email || '';
    const passwordValue = watchedValues.password || '';

    if (emailValue.trim() === '') {
      clearErrors('email');
    }
    if (passwordValue.trim() === '') {
      clearErrors('password');
    }

    if (serverError && (emailValue || passwordValue)) {
      setServerError('');
    }
  }, [watchedValues.email, watchedValues.password, clearErrors, serverError]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setServerError('');

    try {
      await login(data);
      toast.success('Login successful! Welcome back!');
      router.push(redirect);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Login failed. Please check your credentials.';

      if (
        errorMessage.toLowerCase().includes('password') ||
        errorMessage.toLowerCase().includes('invalid email or password') ||
        errorMessage.toLowerCase().includes('credentials')
      ) {
        toast.error('❌ Wrong password! Please check your credentials and try again.');
      } else if (errorMessage.toLowerCase().includes('email')) {
        toast.error('📧 Email not found! Please check your email address.');
      } else {
        toast.error(`⚠️ ${errorMessage}`);
      }

      setServerError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <h1>Welcome Back</h1>
          <p>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.authForm}>
          {serverError && (
            <div className={`${styles.errorMessage} ${styles.serverError}`}>{serverError}</div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.formLabel}>
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className={`${styles.formInput} ${errors.email ? styles.error : ''}`}
              placeholder="Enter your email"
              {...register('email')}
            />
            {errors.email && <span className={styles.errorMessage}>{errors.email.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.formLabel}>
              Password
            </label>
            <input
              id="password"
              type="password"
              className={`${styles.formInput} ${errors.password ? styles.error : ''}`}
              placeholder="Enter your password"
              {...register('password')}
            />
            {errors.password && (
              <span className={styles.errorMessage}>{errors.password.message}</span>
            )}
          </div>

          <div className={styles.formOptions}>
            <Link href={ROUTES.FORGOT_PASSWORD} className={styles.forgotPasswordLink}>
              <span>🔑</span> Forgot your password?
            </Link>
          </div>

          <button type="submit" className={styles.authButton} disabled={isLoading || !isValid}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>

          <div className={styles.authDivider}>
            <span>OR</span>
          </div>

          <GoogleLoginButton mode="login" isLoading={isLoading} />
        </form>

        <div className={styles.authFooter}>
          <p>
            Don&apos;t have an account?{' '}
            <Link href={ROUTES.SIGNUP} className={styles.authLink}>
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

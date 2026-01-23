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
import { useTranslation } from '@/hooks/useTranslation';
import styles from '@/styles/AuthForms.module.css';

export default function LoginView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const { t } = useTranslation();
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
      toast.success(t('messages.loginSuccess'));
      router.push(redirect);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t('messages.loginFailed');

      if (
        errorMessage.toLowerCase().includes('password') ||
        errorMessage.toLowerCase().includes('invalid email or password') ||
        errorMessage.toLowerCase().includes('credentials')
      ) {
        toast.error(t('messages.wrongPassword'));
      } else if (errorMessage.toLowerCase().includes('email')) {
        toast.error(t('messages.emailNotFound'));
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
          <h1>{t('auth.welcomeBack')}</h1>
          <p>{t('auth.signInToAccount')}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.authForm}>
          {serverError && (
            <div className={`${styles.errorMessage} ${styles.serverError}`}>{serverError}</div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.formLabel}>
              {t('auth.email')}
            </label>
            <input
              id="email"
              type="email"
              className={`${styles.formInput} ${errors.email ? styles.error : ''}`}
              placeholder={t('placeholders.email')}
              {...register('email')}
            />
            {errors.email && <span className={styles.errorMessage}>{errors.email.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.formLabel}>
              {t('auth.password')}
            </label>
            <input
              id="password"
              type="password"
              className={`${styles.formInput} ${errors.password ? styles.error : ''}`}
              placeholder={t('placeholders.password')}
              {...register('password')}
            />
            {errors.password && (
              <span className={styles.errorMessage}>{errors.password.message}</span>
            )}
          </div>

          <div className={styles.formOptions}>
            <Link href={ROUTES.FORGOT_PASSWORD} className={styles.forgotPasswordLink}>
              <span>🔑</span> {t('auth.forgotPassword')}
            </Link>
          </div>

          <button type="submit" className={styles.authButton} disabled={isLoading || !isValid}>
            {isLoading ? t('auth.signingIn') : t('auth.login')}
          </button>

          <div className={styles.authDivider}>
            <span>{t('common.or')}</span>
          </div>

          <GoogleLoginButton mode="login" isLoading={isLoading} />
        </form>

        <div className={styles.authFooter}>
          <p>
            {t('auth.dontHaveAccount')}{' '}
            <Link href={ROUTES.SIGNUP} className={styles.authLink}>
              {t('auth.signup')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

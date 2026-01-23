'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';
import { signupSchema } from '@/validationSchemas/authSchemas';
import { AuthService } from '@/services/authService';
import { SignupFormData } from '@/interfaces/auth';
import { ROUTES } from '@/constants/routes';
import Link from 'next/link';
import GoogleLoginButton from '@/components/GoogleLoginButton';
import { useTranslation } from '@/hooks/useTranslation';
import styles from '@/styles/AuthForms.module.css';

export default function SignupView() {
  const router = useRouter();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    clearErrors,
    watch,
  } = useForm<SignupFormData>({
    resolver: yupResolver(signupSchema),
    mode: 'onBlur',
  });

  const watchedValues = watch();

  useEffect(() => {
    const nameValue = watchedValues.name || '';
    const emailValue = watchedValues.email || '';
    const passwordValue = watchedValues.password || '';
    const confirmPasswordValue = watchedValues.confirmPassword || '';

    if (nameValue.trim() === '') clearErrors('name');
    if (emailValue.trim() === '') clearErrors('email');
    if (passwordValue.trim() === '') clearErrors('password');
    if (confirmPasswordValue.trim() === '') clearErrors('confirmPassword');

    if (serverError && (nameValue || emailValue || passwordValue || confirmPasswordValue)) {
      setServerError('');
    }
  }, [
    watchedValues.name,
    watchedValues.email,
    watchedValues.password,
    watchedValues.confirmPassword,
    clearErrors,
    serverError,
  ]);

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    setServerError('');

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...signupData } = data;
      const response = await AuthService.signup(signupData);

      if (response.success) {
        reset();
        toast.success(t('messages.signupSuccess'));
        router.push(`${ROUTES.VERIFY_EMAIL}?email=${encodeURIComponent(signupData.email)}`);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t('messages.signupFailed');

      if (
        errorMessage.toLowerCase().includes('email') &&
        errorMessage.toLowerCase().includes('exists')
      ) {
        toast.error(t('messages.emailExists'));
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
          <h1>{t('auth.createAccount')}</h1>
          <p>{t('auth.signUpToGetStarted')}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.authForm}>
          {serverError && (
            <div className={`${styles.errorMessage} ${styles.serverError}`}>{serverError}</div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.formLabel}>
              {t('auth.name')}
            </label>
            <input
              id="name"
              type="text"
              className={`${styles.formInput} ${errors.name ? styles.error : ''}`}
              placeholder={t('placeholders.name')}
              {...register('name')}
            />
            {errors.name && <span className={styles.errorMessage}>{errors.name.message}</span>}
          </div>

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
              placeholder={t('placeholders.newPassword')}
              {...register('password')}
            />
            {errors.password && (
              <span className={styles.errorMessage}>{errors.password.message}</span>
            )}
            <div className={styles.passwordRequirements}>
              <small>
                {t('validation.passwordRequirements')}
              </small>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className={styles.formLabel}>
              {t('auth.confirmPassword')}
            </label>
            <input
              id="confirmPassword"
              type="password"
              className={`${styles.formInput} ${errors.confirmPassword ? styles.error : ''}`}
              placeholder={t('placeholders.confirmPassword')}
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <span className={styles.errorMessage}>{errors.confirmPassword.message}</span>
            )}
          </div>

          <button type="submit" className={styles.authButton} disabled={isLoading || !isValid}>
            {isLoading ? t('auth.creatingAccount') : t('auth.signup')}
          </button>

          <div className={styles.authDivider}>
            <span>{t('common.or')}</span>
          </div>

          <GoogleLoginButton mode="signup" isLoading={isLoading} />
        </form>

        <div className={styles.authFooter}>
          <p>
            {t('auth.alreadyHaveAccount')}{' '}
            <Link href={ROUTES.LOGIN} className={styles.authLink}>
              {t('auth.login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

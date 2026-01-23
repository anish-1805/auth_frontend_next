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
import { useTranslation } from '@/hooks/useTranslation';
import styles from '@/styles/AuthForms.module.css';

const forgotPasswordSchema = yup.object({
  email: yup.string().required('Email is required').email('Invalid email address'),
});

type ForgotPasswordFormData = yup.InferType<typeof forgotPasswordSchema>;

export default function ForgotPasswordView() {
  const router = useRouter();
  const { t } = useTranslation();
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
      toast.success(t('messages.passwordResetCodeSent'));
      router.push(`${ROUTES.RESET_PASSWORD}?email=${encodeURIComponent(data.email)}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t('messages.passwordResetFailed');
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
          <h1>{t('auth.forgotPasswordTitle')}</h1>
          <p>{t('forgotPassword.description')}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.authForm}>
          {serverError && (
            <div className={`${styles.errorMessage} ${styles.serverError}`}>
              <span>⚠️</span> {serverError}
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.formLabel}>
              <span>📧</span> {t('auth.email')}
            </label>
            <input
              id="email"
              type="email"
              className={`${styles.formInput} ${errors.email ? styles.error : ''}`}
              placeholder={t('forgotPassword.emailPlaceholder')}
              {...register('email')}
            />
            {errors.email && <span className={styles.errorMessage}>{errors.email.message}</span>}
          </div>

          <button type="submit" className={styles.authButton} disabled={isLoading || !isValid}>
            {isLoading ? (
              <>
                <span className={styles.spinner}></span>
                {t('auth.sendingResetCode')}
              </>
            ) : (
              <>
                <span>📤</span> {t('auth.sendResetCode')}
              </>
            )}
          </button>
        </form>

        <div className={styles.forgotPasswordInfo}>
          <div className={styles.infoSection}>
            <h4>{t('forgotPassword.whatHappensNext')}</h4>
            <ol>
              <li>{t('forgotPassword.step1')}</li>
              <li>{t('forgotPassword.step2')}</li>
              <li>{t('forgotPassword.step3')}</li>
              <li>{t('forgotPassword.step4')}</li>
            </ol>
          </div>

          <div className={styles.securityNote}>
            <div className={styles.securityIcon}>🛡️</div>
            <div>
              <strong>{t('forgotPassword.securityNote')}</strong>
              <p>{t('forgotPassword.codeExpiry')}</p>
            </div>
          </div>
        </div>

        <div className={styles.authFooter}>
          <p>
            {t('auth.rememberPassword')}{' '}
            <Link href={ROUTES.LOGIN} className={styles.authLink}>
              <span>🔐</span> {t('auth.login')}
            </Link>
          </p>
          <p style={{ marginTop: '8px' }}>
            {t('auth.dontHaveAccount')}{' '}
            <Link href={ROUTES.SIGNUP} className={styles.authLink}>
              <span>✨</span> {t('auth.signup')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

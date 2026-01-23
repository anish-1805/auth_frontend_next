'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { AuthService } from '@/services/authService';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { useTranslation } from '@/hooks/useTranslation';
import styles from '@/styles/AuthForms.module.css';

export default function EmailVerificationView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifySignupOTP } = useAuth();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(true);

  const email = searchParams.get('email') || '';
  const OTP_EXPIRY_TIME = 300;

  useEffect(() => {
    if (!email) {
      router.push(ROUTES.SIGNUP);
    }
  }, [email, router]);

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

  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }

    if (newOtp.every((digit) => digit !== '')) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleVerify = async (otpValue: string) => {
    setIsLoading(true);
    setError('');

    try {
      await verifySignupOTP({ email, otp: otpValue });
      toast.success(t('messages.emailVerified'));
      router.push(ROUTES.DASHBOARD);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t('messages.emailVerificationFailed');
      setError(errorMessage);
      toast.error(`❌ ${errorMessage}`);
      setOtp(['', '', '', '', '', '']);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    setIsResending(true);
    setError('');
    setCanResend(false);

    try {
      await AuthService.resendSignupOTP({ email });
      setCountdown(OTP_EXPIRY_TIME);
      toast.success(t('messages.otpSent'));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t('messages.otpResendFailed');
      setError(errorMessage);
      setCanResend(true);
      toast.error(`⚠️ ${errorMessage}`);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📧</div>
          <h1>{t('emailVerification.title')}</h1>
          <p>{t('emailVerification.sentCodeTo')}</p>
          <div style={{ fontWeight: 'bold', color: '#2a5298', marginTop: '8px' }}>{email}</div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '20px' }}>
            {t('emailVerification.enterCode')}
          </p>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOTPChange(index, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Backspace' && !digit && index > 0) {
                    const prevInput = document.getElementById(`otp-${index - 1}`);
                    prevInput?.focus();
                  }
                }}
                className={styles.formInput}
                style={{
                  width: '50px',
                  height: '50px',
                  textAlign: 'center',
                  fontSize: '24px',
                  fontWeight: 'bold',
                }}
                disabled={isLoading}
              />
            ))}
          </div>

          {error && (
            <div className={styles.errorMessage} style={{ textAlign: 'center', marginTop: '16px' }}>
              {error}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleResendOTP}
          disabled={isResending || !canResend}
          className={styles.authButton}
          style={{ marginTop: '16px' }}
        >
          {isResending
            ? t('emailVerification.resending')
            : !canResend && countdown > 0
              ? `${t('auth.resendIn')} ${Math.floor(countdown / 60)}:${String(countdown % 60).padStart(2, '0')}`
              : t('emailVerification.resendButton')}
        </button>

        <div className={styles.authFooter}>
          <p>
            {t('auth.wrongEmail')}{' '}
            <button
              type="button"
              onClick={() => router.push(ROUTES.SIGNUP)}
              className={styles.authLink}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {t('auth.signUpAgain')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

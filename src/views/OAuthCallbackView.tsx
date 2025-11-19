'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { useAppDispatch } from '@/store/hooks';
import { checkAuth } from '@/store/slices/authSlice';
import { ROUTES } from '@/constants/routes';
import styles from '@/styles/AuthForms.module.css';

export default function OAuthCallbackView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const authStatus = searchParams.get('auth');
      const error = searchParams.get('error');

      if (error) {
        const errorMessage =
          error === 'oauth_failed'
            ? 'Google authentication failed. Please try again.'
            : decodeURIComponent(error);

        toast.error(`❌ ${errorMessage}`);
        router.push(ROUTES.LOGIN);
        return;
      }

      if (authStatus === 'success') {
        try {
          await dispatch(checkAuth()).unwrap();
          toast.success('🎉 Successfully logged in with Google!');
          router.push(ROUTES.DASHBOARD);
        } catch {
          toast.error('Failed to authenticate. Please try again.');
          router.push(ROUTES.LOGIN);
        }
      } else {
        router.push(ROUTES.LOGIN);
      }
    };

    handleOAuthCallback();
  }, [searchParams, router, dispatch]);

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <h1>Authenticating...</h1>
          <p>Please wait while we complete your Google sign-in</p>
        </div>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div className={styles.spinner}></div>
        </div>
      </div>
    </div>
  );
}

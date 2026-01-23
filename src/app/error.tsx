'use client';

import { useEffect } from 'react';
import styles from '@/styles/ErrorBoundary.module.css';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error boundary caught:', error);
    
    // Log to error reporting service in production
    if (process.env.NODE_ENV === 'production') {
      // Example: logErrorToService(error);
    }
  }, [error]);

  return (
    <div className={styles.errorContainer}>
      <div className={styles.errorCard}>
        <div className={styles.errorIcon}>⚠️</div>
        <h2 className={styles.errorTitle}>Oops! Something went wrong</h2>
        <p className={styles.errorMessage}>
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>

        {process.env.NODE_ENV === 'development' && error.digest && (
          <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '16px' }}>
            Error ID: {error.digest}
          </p>
        )}

        {process.env.NODE_ENV === 'development' && error.stack && (
          <details className={styles.errorDetails}>
            <summary>Error Details (Development Only)</summary>
            <pre className={styles.errorStack}>{error.stack}</pre>
          </details>
        )}

        <div className={styles.errorActions}>
          <button onClick={reset} className={styles.retryButton}>
            Try Again
          </button>
          <button
            onClick={() => (window.location.href = '/')}
            className={styles.homeButton}
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import styles from '@/styles/LoadingSpinner.module.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  fullPage?: boolean;
  message?: string;
}

export default function LoadingSpinner({
  size = 'medium',
  fullPage = false,
  message,
}: LoadingSpinnerProps) {
  const spinnerContent = (
    <div className={styles.spinnerContainer}>
      <div className={`${styles.spinner} ${styles[size]}`}></div>
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );

  if (fullPage) {
    return <div className={styles.fullPage}>{spinnerContent}</div>;
  }

  return spinnerContent;
}

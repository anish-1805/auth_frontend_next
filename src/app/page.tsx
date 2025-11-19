'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace(ROUTES.DASHBOARD);
  }, [router]);

  return (
    <div className="loading-container">
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Redirecting...</p>
      </div>
    </div>
  );
}

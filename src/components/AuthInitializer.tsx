'use client';

import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { checkAuth } from '@/store/slices/authSlice';
import { selectIsInitialized } from '@/store/selectors/authSelectors';

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const isInitialized = useAppSelector(selectIsInitialized);
  const authCheckRef = useRef(false);

  useEffect(() => {
    // Only check auth once on mount, don't retry on failure
    // Use ref to prevent double calls in React Strict Mode
    if (!isInitialized && !authCheckRef.current) {
      authCheckRef.current = true;
      dispatch(checkAuth()).catch(() => {
        // Silently fail - user is just not authenticated
        // Middleware will redirect to login if needed
      });
    }
  }, [dispatch, isInitialized]);

  return <>{children}</>;
}

'use client';

import { useEffect, useState } from 'react';

/**
 * Returns a debounced value that updates only after the provided delay.
 * Useful for deferring expensive operations like API calls or filtering.
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

'use client';

import { useEffect, useRef, useCallback, ReactNode } from 'react';

interface InfiniteScrollProps {
  children: ReactNode;
  loadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  loader?: ReactNode;
  endMessage?: ReactNode;
  threshold?: number;
  className?: string;
}

export default function InfiniteScroll({
  children,
  loadMore,
  hasMore,
  isLoading,
  loader,
  endMessage,
  threshold = 100,
  className = '',
}: InfiniteScrollProps) {
  const observerTarget = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasMore && !isLoading) {
        loadMore();
      }
    },
    [hasMore, isLoading, loadMore]
  );

  useEffect(() => {
    const element = observerTarget.current;
    if (!element) return;

    const option = {
      root: null,
      rootMargin: `${threshold}px`,
      threshold: 0,
    };

    const observer = new IntersectionObserver(handleObserver, option);
    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [handleObserver, threshold]);

  return (
    <div className={className}>
      {children}

      {hasMore && (
        <div ref={observerTarget} style={{ height: '20px', margin: '20px 0' }}>
          {isLoading && (loader || <div style={{ textAlign: 'center' }}>Loading...</div>)}
        </div>
      )}

      {!hasMore && !isLoading && endMessage && (
        <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>{endMessage}</div>
      )}
    </div>
  );
}

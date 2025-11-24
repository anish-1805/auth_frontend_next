'use client';

import { useEffect, useRef, useCallback, ReactNode } from 'react';
import type { PaginationData, PaginationActions } from './types';

interface InfiniteScrollPaginationProps {
  children: ReactNode;
  data: PaginationData;
  actions: PaginationActions;
  loader?: ReactNode;
  endMessage?: ReactNode;
  threshold?: number;
  className?: string;
}

function InfiniteScrollPagination({
  children,
  data,
  actions,
  loader,
  endMessage,
  threshold = 100,
  className = '',
}: InfiniteScrollPaginationProps) {
  const observerTarget = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && data.hasMore && !data.isLoading) {
        actions.loadMore();
      }
    },
    [data.hasMore, data.isLoading, actions]
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

      {data.hasMore && (
        <div ref={observerTarget} style={{ height: '20px', margin: '20px 0' }}>
          {data.isLoading && (loader || <div style={{ textAlign: 'center' }}>Loading...</div>)}
        </div>
      )}

      {!data.hasMore && !data.isLoading && endMessage && (
        <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
          {endMessage}
        </div>
      )}
    </div>
  );
}

export default InfiniteScrollPagination;

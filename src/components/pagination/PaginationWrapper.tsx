'use client';

import { ReactNode, Suspense, lazy } from 'react';
import type { PaginationConfig, PaginationData, PaginationActions } from './types';

// Re-export types for convenience
export type { PaginationType, PaginationConfig, PaginationData, PaginationActions } from './types';

// Lazy load pagination components
const InfiniteScrollPagination = lazy(() => import('./InfiniteScrollPagination'));
const TabsPagination = lazy(() => import('./TabsPagination'));

interface PaginationWrapperProps<T = unknown> {
  children: ReactNode;
  config: PaginationConfig;
  data: PaginationData<T>;
  actions: PaginationActions;
  loader?: ReactNode;
  endMessage?: ReactNode;
  emptyMessage?: ReactNode;
  className?: string;
}

export default function PaginationWrapper<T = unknown>({
  children,
  config,
  data,
  actions,
  loader,
  endMessage,
  emptyMessage,
  className = '',
}: PaginationWrapperProps<T>) {
  // Show empty message if no items and not loading
  if (data.items.length === 0 && !data.isLoading && emptyMessage) {
    return <div className={className}>{emptyMessage}</div>;
  }

  // Default loading fallback
  const loadingFallback = (
    <div className={className} style={{ padding: '2rem', textAlign: 'center' }}>
      <div>Loading pagination...</div>
    </div>
  );

  // Render based on pagination type
  switch (config.type) {
    case 'infinite':
      return (
        <Suspense fallback={loadingFallback}>
          <InfiniteScrollPagination
            data={data}
            actions={actions}
            loader={loader}
            endMessage={endMessage}
            className={className}
          >
            {children}
          </InfiniteScrollPagination>
        </Suspense>
      );

    case 'tabs':
      return (
        <Suspense fallback={loadingFallback}>
          <TabsPagination
            data={data}
            actions={actions}
            config={config}
            loader={loader}
            className={className}
          >
            {children}
          </TabsPagination>
        </Suspense>
      );

    default:
      return <div className={className}>{children}</div>;
  }
}

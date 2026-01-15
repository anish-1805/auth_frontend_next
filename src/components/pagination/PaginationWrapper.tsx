'use client';

import { ReactNode } from 'react';
import InfiniteScrollPagination from './InfiniteScrollPagination';
import TabsPagination from './TabsPagination';
import type { PaginationConfig, PaginationData, PaginationActions } from './types';

// Re-export types for convenience
export type { PaginationType, PaginationConfig, PaginationData, PaginationActions } from './types';

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

  // Render based on pagination type
  switch (config.type) {
    case 'infinite':
      return (
        <InfiniteScrollPagination
          data={data}
          actions={actions}
          loader={loader}
          endMessage={endMessage}
          className={className}
        >
          {children}
        </InfiniteScrollPagination>
      );

    case 'tabs':
      return (
        <TabsPagination
          data={data}
          actions={actions}
          config={config}
          loader={loader}
          className={className}
        >
          {children}
        </TabsPagination>
      );

    default:
      return <div className={className}>{children}</div>;
  }
}

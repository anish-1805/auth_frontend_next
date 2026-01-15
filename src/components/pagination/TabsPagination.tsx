'use client';

import { ReactNode, useState } from 'react';
import type { PaginationData, PaginationActions, PaginationConfig } from './types';
import styles from '@/styles/TabsPagination.module.css';

interface TabsPaginationProps {
  children: ReactNode;
  data: PaginationData;
  actions: PaginationActions;
  config: PaginationConfig;
  loader?: ReactNode;
  className?: string;
}

function TabsPagination({
  children,
  data,
  actions,
  config,
  loader,
  className = '',
}: TabsPaginationProps) {
  const [jumpToPage, setJumpToPage] = useState('');

  const handleJumpToPage = () => {
    const pageNum = parseInt(jumpToPage);
    if (pageNum >= 1 && pageNum <= data.totalPages) {
      actions.goToPage(pageNum);
      setJumpToPage('');
    }
  };

  const getVisiblePages = () => {
    const current = data.currentPage;
    const total = data.totalPages;
    const delta = 2; // Number of pages to show on each side of current page

    let start = Math.max(1, current - delta);
    let end = Math.min(total, current + delta);

    // Adjust if we're near the beginning or end
    if (current <= delta + 1) {
      end = Math.min(total, 2 * delta + 1);
    }
    if (current >= total - delta) {
      start = Math.max(1, total - 2 * delta);
    }

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className={className}>
      {/* Content */}
      <div className={styles.content}>
        {data.isLoading && loader ? (
          <div className={styles.loaderContainer}>{loader}</div>
        ) : (
          children
        )}
      </div>

      {/* Pagination Controls */}
      {data.totalPages > 1 && (
        <div className={styles.paginationContainer}>
          {/* Page Info */}
          {config.showPageInfo !== false && (
            <div className={styles.pageInfo}>
              Showing page {data.currentPage} of {data.totalPages} ({data.totalItems} total items)
            </div>
          )}

          {/* Pagination Controls */}
          <div className={styles.paginationControls}>
            {/* Previous Button */}
            <button
              onClick={actions.prevPage}
              disabled={data.currentPage === 1 || data.isLoading}
              className={`${styles.pageButton} ${styles.prevNext}`}
            >
              ← Previous
            </button>

            {/* First page */}
            {visiblePages[0] > 1 && (
              <>
                <button
                  onClick={() => actions.goToPage(1)}
                  disabled={data.isLoading}
                  className={styles.pageButton}
                >
                  1
                </button>
                {visiblePages[0] > 2 && <span className={styles.ellipsis}>...</span>}
              </>
            )}

            {/* Visible page numbers */}
            {visiblePages.map((page) => (
              <button
                key={page}
                onClick={() => actions.goToPage(page)}
                disabled={data.isLoading}
                className={`${styles.pageButton} ${page === data.currentPage ? styles.active : ''}`}
              >
                {page}
              </button>
            ))}

            {/* Last page */}
            {visiblePages[visiblePages.length - 1] < data.totalPages && (
              <>
                {visiblePages[visiblePages.length - 1] < data.totalPages - 1 && (
                  <span className={styles.ellipsis}>...</span>
                )}
                <button
                  onClick={() => actions.goToPage(data.totalPages)}
                  disabled={data.isLoading}
                  className={styles.pageButton}
                >
                  {data.totalPages}
                </button>
              </>
            )}

            {/* Next Button */}
            <button
              onClick={actions.nextPage}
              disabled={data.currentPage === data.totalPages || data.isLoading}
              className={`${styles.pageButton} ${styles.prevNext}`}
            >
              Next →
            </button>
          </div>

          {/* Jump to Page */}
          {config.showJumpToPage && data.totalPages > 5 && (
            <div className={styles.jumpToPage}>
              <span>Go to page:</span>
              <input
                type="number"
                min="1"
                max={data.totalPages}
                value={jumpToPage}
                onChange={(e) => setJumpToPage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleJumpToPage()}
                className={styles.jumpInput}
                placeholder="Page"
              />
              <button
                onClick={handleJumpToPage}
                disabled={data.isLoading}
                className={styles.jumpButton}
              >
                Go
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default TabsPagination;

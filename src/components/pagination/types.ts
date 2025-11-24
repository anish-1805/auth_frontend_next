export type PaginationType = 'infinite' | 'tabs';

export interface PaginationConfig {
  type: PaginationType;
  itemsPerPage?: number;
  showPageInfo?: boolean;
  showJumpToPage?: boolean;
}

export interface PaginationData<T = any> {
  items: T[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
  hasMore: boolean;
  isLoading: boolean;
}

export interface PaginationActions {
  loadMore: () => void;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  refresh: () => void;
}

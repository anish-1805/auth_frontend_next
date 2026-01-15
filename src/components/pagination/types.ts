export type PaginationType = 'infinite' | 'tabs';

// Base pagination configuration
export interface BasePaginationConfig {
  itemsPerPage?: number;
}

// Extended pagination config with display options
export interface PaginationConfig extends BasePaginationConfig {
  type: PaginationType;
  showPageInfo?: boolean;
  showJumpToPage?: boolean;
}

// Generic pagination data with type safety
export interface PaginationData<T> {
  items: T[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
  hasMore: boolean;
  isLoading: boolean;
}

// Base pagination actions
export interface BasePaginationActions {
  refresh: () => void;
}

// Extended pagination actions with navigation
export interface PaginationActions extends BasePaginationActions {
  loadMore: () => void;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
}

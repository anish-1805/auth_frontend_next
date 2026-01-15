# Pagination System

A modular pagination system that supports both infinite scroll and tabs pagination modes.

## Components

### PaginationWrapper

Main wrapper component that switches between pagination types.

### InfiniteScrollPagination

Provides infinite scroll functionality with intersection observer.

### TabsPagination

Provides traditional page-based navigation with page numbers, jump-to-page, and navigation controls.

## Usage

```tsx
import {
  PaginationWrapper,
  PaginationConfig,
  PaginationData,
  PaginationActions,
} from '@/components/pagination';

// Configuration
const paginationConfig: PaginationConfig = {
  type: 'tabs', // or 'infinite'
  itemsPerPage: 10,
  showPageInfo: true,
  showJumpToPage: true,
};

// Data structure
const paginationData: PaginationData = {
  items: yourDataArray,
  currentPage: 1,
  totalItems: 100,
  totalPages: 10,
  hasMore: true,
  isLoading: false,
};

// Actions
const paginationActions: PaginationActions = {
  loadMore: () => {
    /* load more items */
  },
  goToPage: (page) => {
    /* go to specific page */
  },
  nextPage: () => {
    /* go to next page */
  },
  prevPage: () => {
    /* go to previous page */
  },
  refresh: () => {
    /* refresh current data */
  },
};

// Usage
<PaginationWrapper
  config={paginationConfig}
  data={paginationData}
  actions={paginationActions}
  loader={<div>Loading...</div>}
  endMessage={<div>All items loaded</div>}
  emptyMessage={<div>No items found</div>}
>
  {/* Your content here */}
  <YourDataComponent items={paginationData.items} />
</PaginationWrapper>;
```

## Switching Between Pagination Types

You can easily switch between pagination types by changing the `type` in the configuration:

```tsx
const [paginationType, setPaginationType] = useState<PaginationType>('tabs');

const config: PaginationConfig = {
  type: paginationType,
  // ... other config
};

// Toggle component
<select
  value={paginationType}
  onChange={(e) => setPaginationType(e.target.value as PaginationType)}
>
  <option value="tabs">Tabs Pagination</option>
  <option value="infinite">Infinite Scroll</option>
</select>;
```

## Features

### Tabs Pagination

- Page navigation with previous/next buttons
- Numbered page buttons with smart ellipsis
- Jump to specific page functionality
- Page information display
- Responsive design

### Infinite Scroll

- Intersection Observer for performance
- Configurable threshold
- Loading states
- End message when all items are loaded

## Configuration Options

```tsx
interface PaginationConfig {
  type: 'infinite' | 'tabs';
  itemsPerPage?: number; // Items per page (for tabs mode)
  showPageInfo?: boolean; // Show page information
  showJumpToPage?: boolean; // Show jump to page input
}
```

## Data Interface

```tsx
interface PaginationData<T = any> {
  items: T[]; // Current items to display
  currentPage: number; // Current page number
  totalItems: number; // Total number of items
  totalPages: number; // Total number of pages
  hasMore: boolean; // Whether more items are available
  isLoading: boolean; // Loading state
}
```

## Actions Interface

```tsx
interface PaginationActions {
  loadMore: () => void; // Load more items (infinite scroll)
  goToPage: (page: number) => void; // Go to specific page
  nextPage: () => void; // Go to next page
  prevPage: () => void; // Go to previous page
  refresh: () => void; // Refresh current data
}
```

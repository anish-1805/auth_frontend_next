'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { useAuth } from '@/hooks/useAuth';
import { useDebounce } from '@/hooks/useDebounce';
import { AuthService } from '@/services/authService';
import { User } from '@/interfaces/auth';
import { formatDate } from '@/utilities/formatDate';
import { ROUTES } from '@/constants/routes';
import { PaginationWrapper, PaginationConfig, PaginationData, PaginationActions, PaginationType } from '@/components/pagination';
import styles from '@/styles/DashboardTable.module.css';

export default function DashboardView() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [authTypeFilter, setAuthTypeFilter] = useState<'all' | 'oauth' | 'local'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [paginationType, setPaginationType] = useState<PaginationType>('tabs');
  const itemsPerPage = 10;
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const initialLoadRef = useRef(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Initial load
  useEffect(() => {
    if (!initialLoadRef.current) {
      initialLoadRef.current = true;
      loadInitialUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter when search or filters change
  useEffect(() => {
    filterAndSortUsers(debouncedSearchTerm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, authTypeFilter, statusFilter, users]);

  // Clear selection when filters change
  useEffect(() => {
    clearSelection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, authTypeFilter, statusFilter, paginationType]);

  const loadInitialUsers = async () => {
    try {
      setIsLoading(true);
      const response = await AuthService.getAllUsers(1, itemsPerPage);
      setUsers(response.users);
      setTotal(response.total);
      setHasMore(response.hasMore);
      setTotalPages(Math.ceil(response.total / itemsPerPage));
      setPage(1);
    } catch (error) {
      toast.error('Failed to fetch users');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreUsers = useCallback(async () => {
    if (isLoading || !hasMore) return;

    try {
      setIsLoading(true);
      const nextPage = page + 1;
      const response = await AuthService.getAllUsers(nextPage, itemsPerPage);
      setUsers((prev) => [...prev, ...response.users]);
      setHasMore(response.hasMore);
      setPage(nextPage);
    } catch (error) {
      toast.error('Failed to load more users');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [page, hasMore, isLoading]);

  const loadUsersForPage = useCallback(async (pageNum: number) => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      const response = await AuthService.getAllUsers(pageNum, itemsPerPage);
      setUsers(response.users);
      setTotal(response.total);
      setHasMore(response.hasMore);
      setTotalPages(Math.ceil(response.total / itemsPerPage));
      setPage(pageNum);
    } catch (error) {
      toast.error('Failed to load users');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const filterAndSortUsers = (term = '') => {
    let filtered = users;

    // Filter by search term
    if (term) {
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(term.toLowerCase()) ||
          u.email.toLowerCase().includes(term.toLowerCase())
      );
    }

    // Filter by auth type
    if (authTypeFilter !== 'all') {
      filtered = filtered.filter((u) => {
        if (authTypeFilter === 'oauth') return u.isSocialLogin;
        if (authTypeFilter === 'local') return !u.isSocialLogin;
        return true;
      });
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((u) => {
        if (statusFilter === 'verified') return u.isEmailVerified;
        if (statusFilter === 'unverified') return !u.isEmailVerified;
        return true;
      });
    }

    setFilteredUsers(filtered);
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      router.push(ROUTES.LOGIN);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setAuthTypeFilter('all');
    setStatusFilter('all');
  };

  // Selection handlers
  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(user => user.id)));
    }
  };

  const clearSelection = () => {
    setSelectedUsers(new Set());
  };

  // Delete handlers
  const handleDeleteSelected = async () => {
    if (selectedUsers.size === 0) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedUsers.size} user(s)? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setIsDeleting(true);
      const userIdsArray = Array.from(selectedUsers);
      const result = await AuthService.deleteUsers(userIdsArray);
      
      toast.success(`Successfully deleted ${result.deletedCount} user(s)`);
      
      if (result.failedDeletions && result.failedDeletions.length > 0) {
        toast.warning(`Failed to delete ${result.failedDeletions.length} user(s)`);
      }

      // Clear selection and refresh data
      clearSelection();
      
      // Refresh current page or go back if current page is empty
      if (paginationType === 'tabs') {
        const remainingUsers = filteredUsers.length - result.deletedCount;
        if (remainingUsers === 0 && page > 1) {
          loadUsersForPage(page - 1);
        } else {
          loadUsersForPage(page);
        }
      } else {
        loadInitialUsers();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete users');
      console.error('Delete error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const hasActiveFilters =
    searchTerm !== '' || authTypeFilter !== 'all' || statusFilter !== 'all';

  // Pagination configuration
  const paginationConfig: PaginationConfig = {
    type: paginationType,
    itemsPerPage,
    showPageInfo: true,
    showJumpToPage: true,
  };

  // Pagination data
  const paginationData: PaginationData = {
    items: filteredUsers,
    currentPage: page,
    totalItems: total,
    totalPages,
    hasMore: hasMore && !hasActiveFilters,
    isLoading,
  };

  // Pagination actions
  const paginationActions: PaginationActions = {
    loadMore: loadMoreUsers,
    goToPage: loadUsersForPage,
    nextPage: () => {
      if (page < totalPages && !isLoading) {
        loadUsersForPage(page + 1);
      }
    },
    prevPage: () => {
      if (page > 1 && !isLoading) {
        loadUsersForPage(page - 1);
      }
    },
    refresh: () => {
      if (paginationType === 'tabs') {
        loadUsersForPage(page);
      } else {
        loadInitialUsers();
      }
    },
  };

  const handleImageError = (userId: string) => {
    setImageErrors((prev) => new Set(prev).add(userId));
  };

  const shouldShowAvatar = (u: User) => {
    return u.avatar && !imageErrors.has(u.id) && u.avatar.startsWith('http');
  };

  return (
    <div className={styles.dashboardContainer}>
      {/* Header */}
      <div className={styles.dashboardHeader}>
        <div className={styles.headerLeft}>
          <h1>Dashboard</h1>
          <p className={styles.userCount}>Welcome back, {user?.name}!</p>
        </div>
        <button onClick={handleLogout} className={styles.logoutButton}>
          Logout
        </button>
      </div>

      {/* Current User Info Card */}
      <div className={styles.userInfoCard}>
        <div className={styles.userInfoHeader}>
          <h2>Your Profile</h2>
        </div>
        <div className={styles.userInfoContent}>
          <div className={styles.userInfoAvatar}>
            {user?.avatar && user.avatar.startsWith('http') ? (
              <Image
                src={user.avatar}
                alt={user.name}
                width={80}
                height={80}
                className={styles.profileAvatar}
                onError={() => {
                  // Fallback handled by conditional rendering
                }}
              />
            ) : (
              <div className={styles.profileAvatarPlaceholder}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className={styles.userInfoDetails}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Name:</span>
              <span className={styles.infoValue}>{user?.name}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Email:</span>
              <span className={styles.infoValue}>{user?.email}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Account Type:</span>
              <span
                className={`${styles.badge} ${user?.isSocialLogin ? styles.badgeOAuth : styles.badgeLocal}`}
              >
                {user?.isSocialLogin ? 'OAuth' : 'Local'}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Status:</span>
              <span
                className={`${styles.badge} ${user?.isEmailVerified ? styles.badgeVerified : styles.badgeNotVerified}`}
              >
                {user?.isEmailVerified ? '✓ Verified' : '✗ Not Verified'}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Member Since:</span>
              <span className={styles.infoValue}>{formatDate(user?.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* All Users Section Header */}
      <div className={styles.sectionHeader}>
        <div className={styles.sectionHeaderLeft}>
          <h2>
            All Users ({paginationType === 'tabs' && !hasActiveFilters 
              ? `${Math.min(page * itemsPerPage, total)} of ${total}`
              : filteredUsers.length + (filteredUsers.length !== total ? ` of ${total}` : '')
            })
          </h2>
          {selectedUsers.size > 0 && (
            <span className={styles.selectionInfo}>
              {selectedUsers.size} user(s) selected
            </span>
          )}
        </div>
        {selectedUsers.size > 0 && (
          <div className={styles.bulkActions}>
            <button
              onClick={clearSelection}
              className={styles.clearSelectionButton}
              disabled={isDeleting}
            >
              Clear Selection
            </button>
            <button
              onClick={handleDeleteSelected}
              className={styles.deleteButton}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : `Delete Selected (${selectedUsers.size})`}
            </button>
          </div>
        )}
      </div>

      {/* Search, Filters, and Sort */}
      <div className={styles.searchSection}>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value.trim())}
          className={styles.searchInput}
        />

        <select
          value={authTypeFilter}
          onChange={(e) => setAuthTypeFilter(e.target.value as 'all' | 'oauth' | 'local')}
          className={styles.filterSelect}
        >
          <option value="all">All Auth Types</option>
          <option value="oauth">OAuth Only</option>
          <option value="local">Local Only</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | 'verified' | 'unverified')}
          className={styles.filterSelect}
        >
          <option value="all">All Status</option>
          <option value="verified">Verified Only</option>
          <option value="unverified">Unverified Only</option>
        </select>

        {hasActiveFilters && (
          <button onClick={clearFilters} className={styles.clearFiltersButton}>
            Clear Filters
          </button>
        )}

        <div className={styles.paginationToggle}>
          <label htmlFor="pagination-type">Pagination Type:</label>
          <select
            id="pagination-type"
            value={paginationType}
            onChange={(e) => {
              setPaginationType(e.target.value as PaginationType);
              // Reset to first page when switching pagination types
              if (e.target.value === 'tabs' && paginationType === 'infinite') {
                loadUsersForPage(1);
              }
            }}
            className={styles.filterSelect}
          >
            <option value="tabs">Tabs Pagination</option>
            <option value="infinite">Infinite Scroll</option>
          </select>
        </div>
      </div>

      {/* Users Table with Modular Pagination */}
      <div className={styles.tableContainer}>
        <PaginationWrapper
          config={paginationConfig}
          data={paginationData}
          actions={paginationActions}
          loader={
            <div className={styles.loadMoreContainer}>
              <div className={styles.spinner}></div>
              <span style={{ marginLeft: '10px' }}>Loading users...</span>
            </div>
          }
          endMessage={<div className={styles.endMessage}>All users loaded</div>}
          emptyMessage={<div className={styles.noUsers}>No users found</div>}
          className={styles.paginationWrapper}
        >
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.checkboxColumn}>
                  <input
                    type="checkbox"
                    checked={filteredUsers.length > 0 && selectedUsers.size === filteredUsers.length}
                    onChange={handleSelectAll}
                    className={styles.selectAllCheckbox}
                    disabled={filteredUsers.length === 0}
                  />
                </th>
                <th>User</th>
                <th>Email</th>
                <th>Auth Type</th>
                <th>Status</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id} className={selectedUsers.has(u.id) ? styles.selectedRow : ''}>
                  <td className={styles.checkboxColumn}>
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(u.id)}
                      onChange={() => handleSelectUser(u.id)}
                      className={styles.userCheckbox}
                    />
                  </td>
                  <td>
                    <div className={styles.userCell}>
                      {shouldShowAvatar(u) ? (
                        <Image
                          src={u.avatar!}
                          alt={u.name}
                          width={40}
                          height={40}
                          className={styles.avatar}
                          onError={() => handleImageError(u.id)}
                        />
                      ) : (
                        <div className={styles.avatarPlaceholder}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className={styles.userInfo}>
                        <div className={styles.userName}>{u.name}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={styles.userEmail}>{u.email}</span>
                  </td>
                  <td>
                    <span
                      className={`${styles.badge} ${
                        u.isSocialLogin ? styles.badgeOAuth : styles.badgeLocal
                      }`}
                    >
                      {u.isSocialLogin ? 'OAuth' : 'Local'}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`${styles.badge} ${
                        u.isEmailVerified ? styles.badgeVerified : styles.badgeNotVerified
                      }`}
                    >
                      {u.isEmailVerified ? '✓ Verified' : '✗ Not Verified'}
                    </span>
                  </td>
                  <td>
                    <span className={styles.dateText}>{formatDate(u.createdAt)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </PaginationWrapper>
      </div>
    </div>
  );
}

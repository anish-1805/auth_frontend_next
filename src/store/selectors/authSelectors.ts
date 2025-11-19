import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../index';

// Base selector (internal use only)
const getAuthState = (state: RootState) => state.auth;

// Memoized selectors
export const selectUser = createSelector([getAuthState], (auth) => auth.user);

export const selectIsAuthenticated = createSelector([getAuthState], (auth) => auth.isAuthenticated);

export const selectIsLoading = createSelector([getAuthState], (auth) => auth.isLoading);

export const selectAuthError = createSelector([getAuthState], (auth) => auth.error);

export const selectIsInitialized = createSelector([getAuthState], (auth) => auth.isInitialized);

export const selectAuthState = createSelector([getAuthState], (auth) => auth);

export const selectUserName = createSelector([selectUser], (user) => user?.name || '');

export const selectUserEmail = createSelector([selectUser], (user) => user?.email || '');

export const selectIsAuthReady = createSelector(
  [selectIsInitialized, selectIsLoading],
  (isInitialized, isLoading) => isInitialized && !isLoading
);

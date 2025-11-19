import { configureStore } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import { secureStorage } from '@/utils/secureStorage';
import authReducer from './slices/authSlice';

// Create a noop storage for SSR
const createNoopStorage = () => {
  return {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getItem(_key: string): Promise<string | null> {
      return Promise.resolve(null);
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setItem(_key: string, value: string): Promise<string> {
      return Promise.resolve(value);
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    removeItem(_key: string): Promise<void> {
      return Promise.resolve();
    },
  };
};

// Create secure storage adapter for redux-persist
const createSecureStorage = () => {
  return {
    getItem: (key: string) => {
      return Promise.resolve(secureStorage.getItem(key));
    },
    setItem: (key: string, value: string) => {
      secureStorage.setItem(key, value);
      return Promise.resolve(value);
    },
    removeItem: (key: string) => {
      secureStorage.removeItem(key);
      return Promise.resolve();
    },
  };
};

const storage = typeof window !== 'undefined' ? createSecureStorage() : createNoopStorage();

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], // Only persist auth state
};

const persistedReducer = persistReducer(persistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

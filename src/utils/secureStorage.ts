/**
 * Secure Storage Utility
 *
 * Provides encrypted localStorage operations using AES encryption.
 * All data is encrypted before storage and decrypted on retrieval.
 *
 * Features:
 * - AES encryption for sensitive data
 * - Automatic JSON serialization/deserialization
 * - Type-safe API
 */

import CryptoJS from 'crypto-js';

// Storage configuration
const STORAGE_PREFIX = 'secure_';
const ENCRYPTION_KEY =
  process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'default-encryption-key-change-in-production';

/**
 * Encrypts data using AES encryption
 */
const encrypt = (data: string): string => {
  return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
};

/**
 * Decrypts AES encrypted data
 */
const decrypt = (encryptedData: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

/**
 * Secure Storage API
 */
export const secureStorage = {
  /**
   * Store encrypted data in localStorage
   * @param key - Storage key (will be prefixed)
   * @param value - Value to store (will be JSON stringified and encrypted)
   */
  setItem: <T>(key: string, value: T): void => {
    try {
      if (typeof window === 'undefined') return;

      const jsonString = JSON.stringify(value);
      const encryptedData = encrypt(jsonString);
      localStorage.setItem(STORAGE_PREFIX + key, encryptedData);
    } catch (error) {
      console.error('Error storing encrypted data:', error);
    }
  },

  /**
   * Retrieve and decrypt data from localStorage
   * @param key - Storage key (will be prefixed)
   * @returns Decrypted and parsed value, or null if not found
   */
  getItem: <T>(key: string): T | null => {
    try {
      if (typeof window === 'undefined') return null;

      const encryptedData = localStorage.getItem(STORAGE_PREFIX + key);
      if (!encryptedData) return null;

      const decryptedData = decrypt(encryptedData);
      return JSON.parse(decryptedData) as T;
    } catch (error) {
      console.error('Error retrieving encrypted data:', error);
      return null;
    }
  },

  /**
   * Remove item from localStorage
   * @param key - Storage key (will be prefixed)
   */
  removeItem: (key: string): void => {
    try {
      if (typeof window === 'undefined') return;

      localStorage.removeItem(STORAGE_PREFIX + key);
    } catch (error) {
      console.error('Error removing encrypted data:', error);
    }
  },

  /**
   * Clear all secure storage items
   */
  clear: (): void => {
    try {
      if (typeof window === 'undefined') return;

      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(STORAGE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing encrypted data:', error);
    }
  },

  /**
   * Check if a key exists in secure storage
   * @param key - Storage key (will be prefixed)
   */
  hasItem: (key: string): boolean => {
    try {
      if (typeof window === 'undefined') return false;

      return localStorage.getItem(STORAGE_PREFIX + key) !== null;
    } catch (error) {
      console.error('Error checking encrypted data:', error);
      return false;
    }
  },
};

export default secureStorage;

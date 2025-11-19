import axios from 'axios';
import { API_BASE_URL } from '@/constants/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for httpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - simplified to avoid infinite loops
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Just pass through errors without auto-retry
    // The app will handle authentication state properly
    return Promise.reject(error);
  }
);

export default axiosInstance;

import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';
import { API_BASE_URL } from '@/utils/constants';
import { ApiError } from '@/types';
import { authConfig } from '@/config/auth';
import * as authService from '@/services/authService';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// List of public endpoints that don't require authentication
const PUBLIC_ENDPOINTS = [
  '/published-events',
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
];

// Helper function to check if URL is public
const isPublicEndpoint = (url?: string): boolean => {
  if (!url) return false;
  return PUBLIC_ENDPOINTS.some(endpoint => url.startsWith(endpoint));
};

// Request interceptor - Add JWT token (skip for public endpoints)
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Skip auth for public endpoints
    if (isPublicEndpoint(config.url)) {
      return config;
    }

    // Get token from localStorage
    let token = localStorage.getItem(authConfig.storage.accessToken);

    // Check if token needs refresh
    if (token && authService.shouldRefreshToken(token)) {
      const refreshTokenValue = authService.getRefreshToken();
      if (refreshTokenValue) {
        try {
          const response = await authService.refreshToken(refreshTokenValue);
          authService.setStoredTokens(response.accessToken, response.refreshToken);
          token = response.accessToken;
          // Also update user info
          const user = authService.parseUserFromToken(response.accessToken);
          authService.setStoredUser(user);
        } catch (error) {
          // Refresh failed, clear tokens and redirect to login
          authService.logout();
          window.location.href = '/login';
          return Promise.reject(new Error('Session expired'));
        }
      }
    }

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: unknown) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<{ message?: string; error?: string; errors?: Record<string, string[]> }>) => {
    const apiError: ApiError = {
      message: error.message || 'An error occurred',
      status: error.response?.status,
    };

    // Handle 401 Unauthorized - Token expired or invalid (skip for public endpoints)
    if (error.response?.status === 401 && !isPublicEndpoint(error.config?.url)) {
      // Clear tokens and redirect to login
      authService.logout();
      window.location.href = '/login';
    }

    // Handle validation errors (400)
    if (error.response?.status === 400 && error.response.data) {
      const data = error.response.data as any;
      console.log('[API Error] 400 Bad Request Details:', {
        url: error.config?.url,
        data: data
      });

      // Check for various error message formats from backend
      if (data.error) {
        apiError.message = data.error;
      } else if (data.message) {
        apiError.message = data.message;
      } else if (data.errors) {
        apiError.errors = data.errors;
        // Get first error message
        const firstError = Object.values(data.errors)[0];
        if (Array.isArray(firstError) && firstError.length > 0) {
          apiError.message = firstError[0];
        }
      }
    }

    // Handle 404 Not Found
    if (error.response?.status === 404) {
      const data = error.response.data as any;
      if (data?.message) {
        apiError.message = data.message;
      } else if (data?.error) {
        apiError.message = data.error;
      } else {
        apiError.message = 'Resource not found';
      }
    }

    // Handle 500 Internal Server Error
    if (error.response?.status === 500) {
      const data = error.response.data as any;
      if (data?.error) {
        apiError.message = data.error;
      } else if (data?.message) {
        apiError.message = data.message;
      } else {
        apiError.message = 'Internal server error. Please try again later.';
      }
    }

    // Handle other error responses
    if (error.response?.data) {
      const data = error.response.data as any;

      // Try to extract error message in order of priority
      if (data.error && typeof data.error === 'string') {
        apiError.message = data.error;
      } else if (data.message && typeof data.message === 'string') {
        apiError.message = data.message;
      }
    }

    return Promise.reject(apiError);
  }
);

export default apiClient;
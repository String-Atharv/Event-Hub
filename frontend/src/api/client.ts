import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';
import { API_BASE_URL } from '@/utils/constants';
import { ApiError } from '@/types';

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
];

// Helper function to check if URL is public
const isPublicEndpoint = (url?: string): boolean => {
  if (!url) return false;
  return PUBLIC_ENDPOINTS.some(endpoint => url.startsWith(endpoint));
};

// Request interceptor - Add JWT token from Keycloak (skip for public endpoints)
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Skip auth for public endpoints
    if (isPublicEndpoint(config.url)) {
      return config;
    }

    // Get token from localStorage (set by Keycloak integration)
    const token = localStorage.getItem('keycloak_token');

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
      // Clear token and redirect to Keycloak login
      localStorage.removeItem('keycloak_token');
      localStorage.removeItem('keycloak_user');
      // Import dynamically to avoid circular dependency
      import('@/services/keycloakService').then(({ redirectToKeycloakLogin }) => {
        redirectToKeycloakLogin();
      });
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
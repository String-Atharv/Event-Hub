// JWT Authentication Configuration

export const authConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  endpoints: {
    login: '/auth/login',
    staffLogin: '/auth/staff/login',
    register: '/auth/register',
    refresh: '/auth/refresh',
  },
  storage: {
    accessToken: 'auth_access_token',
    refreshToken: 'auth_refresh_token',
    user: 'auth_user',
  },
  // Refresh token when less than 1 minute remaining
  tokenRefreshThreshold: 60 * 1000,
};

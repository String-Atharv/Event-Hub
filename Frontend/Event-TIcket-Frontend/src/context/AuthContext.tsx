import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User } from '@/types';
import * as authService from '@/services/authService';
import { authConfig } from '@/config/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithCredentials: (email: string, password: string) => Promise<{ redirectTo: string }>;
  loginAsStaff: (email: string, password: string) => Promise<{ redirectTo: string }>;
  registerUser: (name: string, email: string, password: string) => Promise<{ redirectTo: string }>;
  setAuth: (user: User | null, token: string | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = authService.getAccessToken();
        const storedUser = authService.getStoredUser();

        if (storedToken && storedUser) {
          // Check if token is expired
          if (authService.isTokenExpired(storedToken)) {
            const refreshTokenValue = authService.getRefreshToken();
            if (refreshTokenValue) {
              try {
                // Try to refresh the token
                const response = await authService.refreshToken(refreshTokenValue);
                const newUser = authService.parseUserFromToken(response.accessToken);
                authService.setStoredTokens(response.accessToken, response.refreshToken);
                authService.setStoredUser(newUser);
                setToken(response.accessToken);
                setUser(newUser);
              } catch {
                // Refresh failed, clear auth
                authService.logout();
                setToken(null);
                setUser(null);
              }
            } else {
              // No refresh token, clear auth
              authService.logout();
              setToken(null);
              setUser(null);
            }
          } else {
            // Token still valid
            setToken(storedToken);
            setUser(storedUser);
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        authService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const setAuth = useCallback((newUser: User | null, newToken: string | null) => {
    setUser(newUser);
    setToken(newToken);

    if (newToken && newUser) {
      localStorage.setItem(authConfig.storage.accessToken, newToken);
      localStorage.setItem(authConfig.storage.user, JSON.stringify(newUser));
    } else {
      localStorage.removeItem(authConfig.storage.accessToken);
      localStorage.removeItem(authConfig.storage.user);
    }
  }, []);

  const loginWithCredentials = useCallback(async (email: string, password: string): Promise<{ redirectTo: string }> => {
    const response = await authService.login(email, password);

    // Parse user from token
    const parsedUser = authService.parseUserFromToken(response.accessToken);

    // Store tokens and user
    authService.setStoredTokens(response.accessToken, response.refreshToken);
    authService.setStoredUser(parsedUser);

    // Update state
    setToken(response.accessToken);
    setUser(parsedUser);

    // Get redirect path based on roles
    const redirectTo = authService.getPostLoginRedirect(parsedUser.roles);

    return { redirectTo };
  }, []);

  const loginAsStaff = useCallback(async (email: string, password: string): Promise<{ redirectTo: string }> => {
    const response = await authService.loginAsStaff(email, password);

    // Parse user from token
    const parsedUser = authService.parseUserFromToken(response.accessToken);

    // Store tokens and user
    authService.setStoredTokens(response.accessToken, response.refreshToken);
    authService.setStoredUser(parsedUser);

    // Update state
    setToken(response.accessToken);
    setUser(parsedUser);

    // Get redirect path based on roles
    const redirectTo = authService.getPostLoginRedirect(parsedUser.roles);

    return { redirectTo };
  }, []);

  const registerUser = useCallback(async (name: string, email: string, password: string): Promise<{ redirectTo: string }> => {
    const response = await authService.register(name, email, password);

    // Parse user from token
    const parsedUser = authService.parseUserFromToken(response.accessToken);

    // Store tokens and user
    authService.setStoredTokens(response.accessToken, response.refreshToken);
    authService.setStoredUser(parsedUser);

    // Update state
    setToken(response.accessToken);
    setUser(parsedUser);

    // Get redirect path based on roles
    const redirectTo = authService.getPostLoginRedirect(parsedUser.roles);

    return { redirectTo };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    authService.logout();
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    loginWithCredentials,
    loginAsStaff,
    registerUser,
    setAuth,
    logout,
  };

  // Show loading state while initializing
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-netflix-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

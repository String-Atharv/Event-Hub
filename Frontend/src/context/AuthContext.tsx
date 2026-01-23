import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { logoutFromKeycloak, redirectToKeycloakLogin } from '@/services/keycloakService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User | null, token: string | null) => void;
  login: () => void;          // ✅ ADD THIS
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize auth state from localStorage (set by Keycloak callback)
  useEffect(() => {
    const storedToken = localStorage.getItem('keycloak_token');
    const storedUser = localStorage.getItem('keycloak_user');

    if (storedToken) {
      setToken(storedToken);
    }

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse user data:', error);
      }
    }

    setIsInitialized(true);
  }, []);

  const setAuth = (newUser: User | null, newToken: string | null) => {
    setUser(newUser);
    setToken(newToken);

    if (newToken) {
      localStorage.setItem('keycloak_token', newToken);
    } else {
      localStorage.removeItem('keycloak_token');
    }

    if (newUser) {
      localStorage.setItem('keycloak_user', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('keycloak_user');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    logoutFromKeycloak();
  };

  const login = () => {
    console.log('Redirecting to Keycloak...');
    redirectToKeycloakLogin();
  };


  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    setAuth,
    login,
    logout,
  };

  // Don't render children until auth state is initialized
  if (!isInitialized) {
    return null; // or a loading spinner
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


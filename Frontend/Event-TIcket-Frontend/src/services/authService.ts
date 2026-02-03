import { authConfig } from '@/config/auth';
import { User } from '@/types';
import { parseJwt } from '@/utils/jwt';
import { ROLES } from '@/utils/roles';

// DTO Types matching backend
interface AuthenticationResponse {
    access_token: string;
    refresh_token: string;
    token_type?: string;
    expires_in?: number;
}

interface LoginRequest {
    identifier: string;
    password: string;
}

interface RegisterRequest {
    name: string;
    email: string;
    password: string;
}

interface ApiError {
    message: string;
    timestamp?: string;
    status?: number;
}

/**
 * Login user with email and password
 */
export const login = async (email: string, password: string): Promise<{ accessToken: string; refreshToken: string }> => {
    const response = await fetch(`${authConfig.apiBaseUrl}${authConfig.endpoints.login}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier: email, password } as LoginRequest),
    });

    if (!response.ok) {
        const error: ApiError = await response.json().catch(() => ({ message: 'Login failed' }));
        throw new Error(error.message || 'Invalid email or password');
    }

    const data: AuthenticationResponse = await response.json();

    // Convert snake_case to camelCase for internal use
    return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
    };
};

/**
 * Login staff with email and password
 */
export const loginAsStaff = async (email: string, password: string): Promise<{ accessToken: string; refreshToken: string }> => {
    const url = `${authConfig.apiBaseUrl}${authConfig.endpoints.staffLogin}`;
    console.log(`[authService] loginAsStaff called for ${email}, waiting for staff login at ${url}`); // DEBUG

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier: email, password } as LoginRequest),
    });

    console.log(`[authService] loginAsStaff response status: ${response.status}`); // DEBUG

    if (!response.ok) {
        const error: ApiError = await response.json().catch(() => ({ message: 'Staff login failed' }));
        console.error('[authService] Staff login failed:', error); // DEBUG
        throw new Error(error.message || 'Invalid staff credentials');
    }

    const data: AuthenticationResponse = await response.json();

    // Convert snake_case to camelCase for internal use
    return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
    };
};

/**
 * Register a new user
 */
export const register = async (name: string, email: string, password: string): Promise<{ accessToken: string; refreshToken: string }> => {
    const response = await fetch(`${authConfig.apiBaseUrl}${authConfig.endpoints.register}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password } as RegisterRequest),
    });

    if (!response.ok) {
        const error: ApiError = await response.json().catch(() => ({ message: 'Registration failed' }));
        throw new Error(error.message || 'Registration failed');
    }

    const data: AuthenticationResponse = await response.json();

    // Convert snake_case to camelCase for internal use
    return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
    };
};

/**
 * Refresh the access token using the refresh token
 */
export const refreshToken = async (currentRefreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
    const response = await fetch(`${authConfig.apiBaseUrl}${authConfig.endpoints.refresh}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentRefreshToken}`,
        },
        body: JSON.stringify({ refreshToken: currentRefreshToken }),
    });

    if (!response.ok) {
        throw new Error('Token refresh failed');
    }

    const data: AuthenticationResponse = await response.json();

    // Convert snake_case to camelCase for internal use
    return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
    };
};

/**
 * Clear all auth tokens from localStorage
 */
export const logout = (): void => {
    localStorage.removeItem(authConfig.storage.accessToken);
    localStorage.removeItem(authConfig.storage.refreshToken);
    localStorage.removeItem(authConfig.storage.user);
};

/**
 * Store tokens in localStorage
 */
export const setStoredTokens = (accessToken: string, refreshTokenValue: string): void => {
    localStorage.setItem(authConfig.storage.accessToken, accessToken);
    localStorage.setItem(authConfig.storage.refreshToken, refreshTokenValue);
};

/**
 * Get stored tokens from localStorage
 */
export const getStoredTokens = (): { accessToken: string | null; refreshToken: string | null } => {
    return {
        accessToken: localStorage.getItem(authConfig.storage.accessToken),
        refreshToken: localStorage.getItem(authConfig.storage.refreshToken),
    };
};

/**
 * Get stored access token
 */
export const getAccessToken = (): string | null => {
    return localStorage.getItem(authConfig.storage.accessToken);
};

/**
 * Get stored refresh token
 */
export const getRefreshToken = (): string | null => {
    return localStorage.getItem(authConfig.storage.refreshToken);
};

/**
 * Store user info in localStorage
 */
export const setStoredUser = (user: User): void => {
    localStorage.setItem(authConfig.storage.user, JSON.stringify(user));
};

/**
 * Get stored user from localStorage
 */
export const getStoredUser = (): User | null => {
    const storedUser = localStorage.getItem(authConfig.storage.user);
    if (storedUser) {
        try {
            return JSON.parse(storedUser);
        } catch {
            return null;
        }
    }
    return null;
};

/**
 * Check if the access token is expired or about to expire
 */
export const isTokenExpired = (token: string): boolean => {
    const decoded = parseJwt(token);
    if (!decoded || !decoded.exp) {
        return true;
    }

    const expirationTime = decoded.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();

    // Consider token expired if within threshold
    return currentTime >= expirationTime - authConfig.tokenRefreshThreshold;
};

/**
 * Check if the token needs refresh (expired or close to expiring)
 */
export const shouldRefreshToken = (token: string): boolean => {
    return isTokenExpired(token);
};

/**
 * Parse user information from JWT access token
 * Maps JWT claims to User type
 */
export const parseUserFromToken = (accessToken: string): User => {
    const decoded = parseJwt(accessToken);
    console.log('[authService] Decoded JWT payload:', decoded); // DEBUG

    if (!decoded) {
        throw new Error('Invalid token');
    }

    // Extract roles from token - Spring Security format
    // The 'roles' claim can be either a string or an array
    let roles: string[] = [];

    if (decoded.roles) {
        // Handle both string and array formats
        if (typeof decoded.roles === 'string') {
            roles = [decoded.roles];
        } else if (Array.isArray(decoded.roles)) {
            roles = decoded.roles;
        }
    } else if (decoded.authorities) {
        if (typeof decoded.authorities === 'string') {
            roles = [decoded.authorities];
        } else if (Array.isArray(decoded.authorities)) {
            roles = decoded.authorities;
        }
    } else if (decoded.role) {
        // Handle single 'role' claim
        if (typeof decoded.role === 'string') {
            roles = [decoded.role];
        } else if (Array.isArray(decoded.role)) {
            roles = decoded.role;
        }
    }

    console.log('[authService] Extracted roles (before normalization):', roles); // DEBUG

    // Ensure roles have ROLE_ prefix for consistency
    roles = roles.map(role => {
        if (role.startsWith('ROLE_')) {
            return role;
        }
        return `ROLE_${role.toUpperCase()}`;
    });

    console.log('[authService] Final roles (after normalization):', roles); // DEBUG

    return {
        id: decoded.userId?.toString() || decoded.sub || '',
        email: decoded.sub || decoded.email || '',
        name: decoded.name || decoded.sub?.split('@')[0] || '',
        username: decoded.sub?.split('@')[0] || '',
        roles: roles,
    };
};

/**
 * Get the redirect path based on user roles after login
 */
export const getPostLoginRedirect = (roles: string[]): string => {
    // STAFF takes absolute precedence - they go to validation page
    if (roles.includes(ROLES.STAFF)) {
        return '/staff/validation';
    }
    // Organisers go to dashboard
    if (roles.includes(ROLES.ORGANISER)) {
        return '/dashboard';
    }
    // Everyone else → browse page
    return '/';
};

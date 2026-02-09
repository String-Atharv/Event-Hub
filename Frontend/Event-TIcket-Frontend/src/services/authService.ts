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
    identifier?: string;
    email?: string;
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
    console.log(`[authService] Attempting login to: ${authConfig.apiBaseUrl}${authConfig.endpoints.login}`);

    const response = await fetch(`${authConfig.apiBaseUrl}${authConfig.endpoints.login}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier: email, email, password } as LoginRequest),
    });

    console.log(`[authService] Login response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
        let errorMessage = 'Invalid email or password';
        try {
            const error: ApiError = await response.json();
            console.error('[authService] Login error response:', error);
            errorMessage = error.message || errorMessage;
        } catch (e) {
            console.error('[authService] Could not parse error response JSON');
        }
        throw new Error(errorMessage);
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
    console.log(`[authService] Attempting register to: ${authConfig.apiBaseUrl}${authConfig.endpoints.register}`);

    const response = await fetch(`${authConfig.apiBaseUrl}${authConfig.endpoints.register}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password } as RegisterRequest),
    });

    console.log(`[authService] Register response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
        let errorMessage = 'Registration failed';
        try {
            const error: ApiError = await response.json();
            console.error('[authService] Register error response:', error);
            errorMessage = error.message || errorMessage;
        } catch (e) {
            console.error('[authService] Could not parse error response JSON');
        }
        throw new Error(errorMessage);
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
    // The 'roles' claim can be either a string or an array of strings/objects
    // The backend may also return a comma-separated string like "ROLE_ORGANISER,ROLE_ATTENDEE"
    let RawRoles: any[] = [];

    if (decoded.roles) {
        RawRoles = Array.isArray(decoded.roles) ? decoded.roles : [decoded.roles];
    } else if (decoded.authorities) {
        RawRoles = Array.isArray(decoded.authorities) ? decoded.authorities : [decoded.authorities];
    } else if (decoded.role) {
        RawRoles = Array.isArray(decoded.role) ? decoded.role : [decoded.role];
    }

    // First pass: convert items to strings
    let rolesStrings: string[] = RawRoles.map(item => {
        if (typeof item === 'string') return item;
        if (typeof item === 'object' && item !== null) {
            return item.authority || item.role || item.name || JSON.stringify(item);
        }
        return String(item);
    });

    // Second pass: split comma-separated role strings
    // Backend may return "ROLE_ORGANISER,ROLE_ATTENDEE" as a single string
    let roles: string[] = rolesStrings.flatMap(roleStr => {
        if (roleStr.includes(',')) {
            return roleStr.split(',').map(r => r.trim());
        }
        return [roleStr];
    });

    console.log('[authService] Extracted roles (after splitting commas):', roles); // DEBUG

    // Ensure roles have ROLE_ prefix for consistency
    roles = roles.map(role => {
        const r = role.toUpperCase();
        if (r.startsWith('ROLE_')) {
            return r;
        }
        return `ROLE_${r}`;
    });

    console.log('[authService] Final roles (after normalization):', roles); // DEBUG

    return {
        id: decoded.userId?.toString() || decoded.sub || '',
        email: decoded.sub || decoded.email || '',
        name: (decoded.name as string) || (decoded.sub as string)?.split('@')[0] || '',
        username: (decoded.sub as string)?.split('@')[0] || '',
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

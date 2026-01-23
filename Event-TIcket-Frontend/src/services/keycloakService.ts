import { keycloakConfig, keycloakEndpoints } from '@/config/keycloak';

// Generate a random state for CSRF protection
const generateState = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Generate PKCE code verifier and challenge
const generateCodeVerifier = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

const generateCodeChallenge = async (verifier: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

/**
 * Redirect user to Keycloak login page
 */
export const redirectToKeycloakLogin = async (options?: { prompt?: string }): Promise<void> => {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();

  // 🔥 FIX: Store in localStorage instead of sessionStorage
  localStorage.setItem('kc_state', state);
  localStorage.setItem('kc_code_verifier', codeVerifier);

  // Generate code challenge
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  const searchParamsObj: Record<string, string> = {
    client_id: keycloakConfig.clientId,
    redirect_uri: keycloakConfig.redirectUri,
    response_type: 'code',
    scope: 'openid profile email',
    state: state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  };

  // Add optional prompt parameter (e.g., 'login')
  if (options?.prompt) {
    searchParamsObj.prompt = options.prompt;
  }

  const params = new URLSearchParams(searchParamsObj);

  console.log('Redirecting to Keycloak with state:', state);
  window.location.href = `${keycloakEndpoints.authorization}?${params.toString()}`;
};

/**
 * Exchange authorization code for access token
 */
export const exchangeCodeForToken = async (code: string, state: string): Promise<string> => {
  console.log('Exchanging code for token, received state:', state);

  // 🔥 FIX: Get from localStorage
  const storedState = localStorage.getItem('kc_state');
  console.log('Stored state:', storedState);

  if (state !== storedState) {
    console.error('State mismatch! Received:', state, 'Expected:', storedState);
    throw new Error('Invalid state parameter - possible CSRF attack');
  }

  const codeVerifier = localStorage.getItem('kc_code_verifier');
  if (!codeVerifier) {
    throw new Error('Code verifier not found');
  }

  // Clean up localStorage
  localStorage.removeItem('kc_state');
  localStorage.removeItem('kc_code_verifier');

  // Exchange code for token
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: keycloakConfig.clientId,
    code: code,
    redirect_uri: keycloakConfig.redirectUri,
    code_verifier: codeVerifier,
  });

  console.log('Requesting token from Keycloak...');
  const response = await fetch(keycloakEndpoints.token, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Token exchange failed:', error);
    throw new Error(error.error_description || 'Failed to exchange code for token');
  }

  const data = await response.json();
  console.log('Token received successfully');
  return data.access_token;
};

/**
 * Get user info from Keycloak
 */
export const getUserInfo = async (accessToken: string): Promise<any> => {
  const response = await fetch(keycloakEndpoints.userInfo, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get user info');
  }

  return response.json();
};

/**
 * Logout from Keycloak
 */
export const logoutFromKeycloak = (): void => {
  const params = new URLSearchParams({
    client_id: keycloakConfig.clientId,
    post_logout_redirect_uri: window.location.origin,
  });

  // Clear local storage
  localStorage.removeItem('keycloak_token');
  localStorage.removeItem('keycloak_user');
  localStorage.removeItem('kc_state');
  localStorage.removeItem('kc_code_verifier');

  // Redirect to Keycloak logout
  window.location.href = `${keycloakEndpoints.logout}?${params.toString()}`;
};

/**
 * Login with Keycloak
 */
export const loginWithKeycloak = () => {
  redirectToKeycloakLogin();
};
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { exchangeCodeForToken, getUserInfo } from '@/services/keycloakService';
import { useAuth } from '@/hooks/useAuth';
import { User } from '@/types';
import { parseJwt } from '@/utils/jwt';
import { ROLES } from '@/utils/roles';

/**
 * Determine the redirect path based on effective role
 * Role precedence: STAFF > All others to browse page
 */
const getPostLoginRedirect = (roles: string[]): string => {
  // STAFF takes absolute precedence - they go to validation page
  if (roles.includes(ROLES.STAFF)) {
    return '/staff/validation';
  }
  // Everyone else (ORGANISER, ATTENDEE, or unknown) → browse page
  // Organisers can access their dashboard via the profile dropdown
  return '/';
};

export const Callback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const errorParam = searchParams.get('error');

      console.log('Callback received:', { code: !!code, state, error: errorParam });

      // Handle Keycloak errors
      if (errorParam) {
        setError(`Authentication failed: ${errorParam}`);
        setTimeout(() => {
          navigate('/');
        }, 3000);
        return;
      }

      // Validate required parameters
      if (!code) {
        console.error('Missing authorization code');
        setError('Missing authorization code');
        setTimeout(() => {
          navigate('/');
        }, 3000);
        return;
      }

      if (!state) {
        console.error('Missing state parameter');
        setError('Missing state parameter');
        setTimeout(() => {
          navigate('/');
        }, 3000);
        return;
      }

      try {
        console.log('Exchanging code for token...');
        // Exchange authorization code for access token
        const accessToken = await exchangeCodeForToken(code, state);
        console.log('Token received, fetching user info...');

        // Get user info from Keycloak
        const userInfo = await getUserInfo(accessToken);
        console.log('User info received:', userInfo);

        // Decode token to get roles
        const decodedToken = parseJwt(accessToken);
        const roles: string[] = decodedToken?.realm_access?.roles || [];

        console.log('User roles from token:', roles);

        // Map Keycloak user info to our User type
        const user: User = {
          id: userInfo.sub,
          email: userInfo.email || '',
          name: userInfo.name || userInfo.preferred_username || '',
          username: userInfo.preferred_username || '',
          roles: roles,
        };

        // Store token and user
        setAuth(user, accessToken);

        // 🔒 ROLE-BASED REDIRECT: Immediately send user to correct destination
        const redirectPath = getPostLoginRedirect(roles);
        console.log(`Authentication successful. Effective redirect: ${redirectPath}`);

        // Navigate immediately - no intermediate page
        navigate(redirectPath, { replace: true });

      } catch (err) {
        console.error('Callback error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, setAuth]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirecting to home page...</p>
          <div className="mt-6">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-red-600 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <svg className="mx-auto h-12 w-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Completing authentication...</h2>
        <p className="text-gray-600 mb-6">Please wait while we log you in</p>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
        </div>
      </div>
    </div>
  );
};
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { isStaff } from '@/utils/roles';

interface GlobalRouteGuardProps {
    children: React.ReactNode;
}

/**
 * Global Route Guard that enforces STAFF isolation.
 * 
 * RULE: If user has STAFF role, they can ONLY access routes starting with /staff
 * All other routes redirect to /staff/validation
 * 
 * This guard should wrap the entire router to catch:
 * - Direct URL entry
 * - Browser back/forward navigation
 * - Any programmatic navigation attempts
 */
export const GlobalRouteGuard = ({ children }: GlobalRouteGuardProps) => {
    const { user, isAuthenticated } = useAuth();
    const location = useLocation();

    // Not authenticated - let individual routes handle this
    if (!isAuthenticated || !user) {
        return <>{children}</>;
    }

    const userIsStaff = isStaff(user);
    const currentPath = location.pathname;

    // 🔒 STAFF ISOLATION RULE:
    // If user has STAFF role, ONLY allow /staff/* routes
    if (userIsStaff) {
        // Allow: /staff/validation, /staff/*, /callback, /unauthorized
        const allowedPaths = ['/staff', '/callback', '/unauthorized'];
        const isAllowed = allowedPaths.some(path => currentPath.startsWith(path));

        if (!isAllowed) {
            console.log(`[GlobalRouteGuard] Staff user blocked from ${currentPath}, redirecting to /staff/validation`);
            return <Navigate to="/staff/validation" replace />;
        }
    }

    return <>{children}</>;
};

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { isStaff, isOrganiser } from '@/utils/roles';

interface RoleProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles: string[];
}

/**
 * Role-based route protection with STAFF PRIORITY RULE:
 * - If user has ROLE_STAFF (even with other roles), they are ONLY allowed on staff routes
 * - ORGANISER routes are blocked for any user with ROLE_STAFF
 */
export const RoleProtectedRoute = ({ children, allowedRoles }: RoleProtectedRouteProps) => {
    const { user, isAuthenticated } = useAuth();
    const location = useLocation();

    // Not authenticated - redirect to login/home
    if (!isAuthenticated || !user) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    const userRoles = user.roles || [];
    const userIsStaff = isStaff(user);
    const userIsOrganiser = isOrganiser(user);

    // 🔒 STAFF PRIORITY RULE:
    // If user has ROLE_STAFF (regardless of other roles), they are ONLY allowed on STAFF routes
    // Any attempt to access ORGANISER routes while having STAFF role → redirect to staff validation
    if (userIsStaff) {
        // Staff trying to access organiser-only routes
        if (allowedRoles.includes('ROLE_ORGANISER') && !allowedRoles.includes('ROLE_STAFF')) {
            return <Navigate to="/staff/validation" replace />;
        }
    }

    // Standard role check for the route
    const hasRequiredRole = userRoles.some(role => allowedRoles.includes(role));

    if (!hasRequiredRole) {
        // Determine redirect based on user's role
        if (userIsStaff) {
            return <Navigate to="/staff/validation" replace />;
        } else if (userIsOrganiser) {
            return <Navigate to="/dashboard" replace />;
        } else {
            return <Navigate to="/" replace />;
        }
    }

    return <>{children}</>;
};

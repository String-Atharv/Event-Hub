import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { isStaff } from '@/utils/roles';

interface StaffProtectedRouteProps {
    children: React.ReactNode;
}

/**
 * Route guard that ONLY allows STAFF role.
 * - STAFF → renders children
 * - ORGANISER / ATTENDEE / unauthenticated → redirects to /unauthorized
 */
export const StaffProtectedRoute = ({ children }: StaffProtectedRouteProps) => {
    const { user, isAuthenticated } = useAuth();

    // Not authenticated → redirect to home
    if (!isAuthenticated || !user) {
        return <Navigate to="/" replace />;
    }

    // Not a staff member → redirect to unauthorized
    if (!isStaff(user)) {
        return <Navigate to="/unauthorized" replace />;
    }

    // Staff user → render children
    return <>{children}</>;
};

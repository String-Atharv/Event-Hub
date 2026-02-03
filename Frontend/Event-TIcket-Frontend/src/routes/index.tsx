import { createBrowserRouter, RouterProvider, Outlet, Navigate, useLocation } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleProtectedRoute } from './RoleProtectedRoute';
import { StaffProtectedRoute } from './StaffProtectedRoute';
import { PageContainer } from '@/components/layout/PageContainer';
import { StaffLayout } from '@/components/layout/StaffLayout';
import { useAuth } from '@/hooks/useAuth';
import { isStaff } from '@/utils/roles';

// Public Pages
import { BrowseEvents } from '@/pages/public/BrowseEvents';
import { PublishedEventDetails } from '@/pages/public/PublishedEventDetails';
import { EventTicketsPage } from '@/pages/public/EventTicketsPage';
import { MyTickets } from '@/pages/public/MyTickets';

// Auth Pages
import { Login } from '@/pages/auth/Login';
import { Register } from '@/pages/auth/Register';

// Organiser Pages
import { Dashboard } from '@/pages/organiser/Dashboard';
import { EventList } from '@/pages/organiser/Events/EventList';
import { EventCreate } from '@/pages/organiser/Events/EventCreate';
import { EventEdit } from '@/pages/organiser/Events/EventEdit';
import { EventDetails } from '@/pages/organiser/Events/EventDetails';
import { EventTickets } from '@/pages/organiser/Events/EventTickets';
import { EventStats } from '@/pages/organiser/EventStats';
import { Analytics } from '@/pages/organiser/Analytics';
import { Settings } from '@/pages/organiser/Settings';
import { StaffManagement } from '@/pages/organiser/StaffManagement';
import { EventStaffManagement } from '@/pages/organiser/EventStaffManagement';
import { EventDashboard } from '@/pages/organiser/EventDashboard';
import { EventAnalyticsDashboard } from '@/pages/organiser/EventAnalyticsDashboard';

// Staff Pages
import { StaffValidation } from '@/pages/staff/StaffValidation';

// Shared Pages
import { NotFound } from '@/pages/shared/NotFound';
import { Unauthorized } from '@/pages/shared/Unauthorized';

/**
 * Global Route Guard Component
 * Enforces STAFF isolation at the root level
 */
const GlobalRouteGuard = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  // If authenticated and user is STAFF
  if (isAuthenticated && user && isStaff(user)) {
    const currentPath = location.pathname;

    // Allow: /staff/*, /login, /register, /unauthorized
    const allowedPaths = ['/staff', '/login', '/register', '/unauthorized'];
    const isAllowed = allowedPaths.some(path => currentPath.startsWith(path));

    if (!isAllowed) {
      console.log(`[GlobalRouteGuard] Staff user blocked from ${currentPath}`);
      return <Navigate to="/staff/validation" replace />;
    }
  }

  return <Outlet />;
};

/**
 * Staff Blocker - Prevents staff from accessing non-staff public routes
 */
const BlockStaffFromPublic = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAuth();

  if (isAuthenticated && user && isStaff(user)) {
    return <Navigate to="/staff/validation" replace />;
  }

  return <>{children}</>;
};

/**
 * Auth Route Guard - Redirects authenticated users away from auth pages
 */
const AuthRouteGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated && user) {
    // Redirect based on role
    if (isStaff(user)) {
      return <Navigate to="/staff/validation" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const router = createBrowserRouter([
  {
    // Root layout with GlobalRouteGuard
    element: <GlobalRouteGuard />,
    children: [
      // ===== AUTH PAGES =====
      {
        path: '/login',
        element: <AuthRouteGuard><Login /></AuthRouteGuard>,
      },
      {
        path: '/register',
        element: <AuthRouteGuard><Register /></AuthRouteGuard>,
      },

      // ===== PUBLIC PAGES (blocked for STAFF) =====
      {
        path: '/',
        element: <BlockStaffFromPublic><BrowseEvents /></BlockStaffFromPublic>,
      },
      {
        path: '/published-events/:id',
        element: <BlockStaffFromPublic><PublishedEventDetails /></BlockStaffFromPublic>,
      },
      {
        path: '/published-events/:id/tickets',
        element: <BlockStaffFromPublic><EventTicketsPage /></BlockStaffFromPublic>,
      },

      // ===== UNAUTHORIZED =====
      {
        path: '/unauthorized',
        element: <Unauthorized />,
      },

      // ===== ATTENDEE PAGES (blocked for STAFF) =====
      {
        path: '/my-tickets',
        element: (
          <BlockStaffFromPublic>
            <ProtectedRoute><MyTickets /></ProtectedRoute>
          </BlockStaffFromPublic>
        ),
      },

      // ===== ORGANISER REDIRECT =====
      {
        path: '/organiser',
        element: (
          <BlockStaffFromPublic>
            <ProtectedRoute><Navigate to="/dashboard" replace /></ProtectedRoute>
          </BlockStaffFromPublic>
        ),
      },

      // ===== ORGANISER-ONLY ROUTES (blocked for STAFF via RoleProtectedRoute) =====
      {
        element: (
          <RoleProtectedRoute allowedRoles={['ROLE_ORGANISER']}>
            <PageContainer />
          </RoleProtectedRoute>
        ),
        children: [
          { path: '/dashboard', element: <Dashboard /> },
          { path: '/events/:eventId/dashboard', element: <EventDashboard /> },
          { path: '/events', element: <EventList /> },
          { path: '/events/create', element: <EventCreate /> },
          { path: '/events/:id', element: <EventDetails /> },
          { path: '/events/:id/edit', element: <EventEdit /> },
          { path: '/events/:id/tickets', element: <EventTickets /> },
          { path: '/event-stats', element: <EventStats /> },
          { path: '/analytics', element: <Analytics /> },
          { path: '/settings', element: <Settings /> },
          { path: '/staff', element: <StaffManagement /> },
          { path: '/events/:eventId/staff', element: <EventStaffManagement /> },
          { path: '/events/:eventId/analytics', element: <EventAnalyticsDashboard /> },
        ],
      },

      // ===== STAFF-ONLY ROUTES (ISOLATED EXPERIENCE) =====
      {
        element: (
          <StaffProtectedRoute>
            <StaffLayout />
          </StaffProtectedRoute>
        ),
        children: [
          {
            path: '/staff/validation',
            element: <StaffValidation />,
          },
        ],
      },

      // ===== 404 =====
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);

export const AppRoutes = () => {
  return <RouterProvider router={router} />;
};
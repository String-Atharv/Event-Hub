import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { isOrganiser, isStaff } from '@/utils/roles';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar = ({ isOpen = true, onClose }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const userIsStaff = isStaff(user);
  const userIsOrganiser = isOrganiser(user);

  // 🔒 STAFF PRIORITY RULE:
  // If user has ROLE_STAFF (even alongside ROLE_ORGANISER), they ONLY see staff items

  const navItems = [
    // ===== ORGANISER-ONLY ITEMS (hidden if user has STAFF role) =====
    { label: 'Dashboard', path: '/dashboard', show: userIsOrganiser && !userIsStaff },
    { label: 'Events', path: '/events', show: userIsOrganiser && !userIsStaff },
    { label: 'Event Stats', path: '/event-stats', show: userIsOrganiser && !userIsStaff },
    { label: 'Staff Management', path: '/staff', show: userIsOrganiser && !userIsStaff },
    { label: 'Settings', path: '/settings', show: userIsOrganiser && !userIsStaff },

    // ===== STAFF ITEMS (shown if user has STAFF role, regardless of other roles) =====
    { label: 'Validate Tickets', path: '/staff/validation', show: userIsStaff },
  ];

  // Determine portal title based on STAFF priority
  const portalTitle = userIsStaff ? 'Staff Portal' : userIsOrganiser ? 'Organiser Portal' : 'Portal';

  /**
   * Handle Staff Portal access
   * Logs out and redirects to login for staff credentials
   */
  const handleStaffPortalAccess = () => {
    console.log('[Sidebar] Staff Portal access clicked - logging out');
    logout();
    navigate('/login');
  };

  const handleLinkClick = () => {
    // Close sidebar on mobile when link is clicked
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-gray-50 dark:bg-netflix-dark border-r dark:border-gray-800 
          min-h-screen flex flex-col transition-all duration-300
          transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        `}
      >
        {/* Mobile close button */}
        <div className="lg:hidden flex justify-end p-4">
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close sidebar"
          >
            <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="p-4 flex-1">
          <div className="mb-6 px-4">
            <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {portalTitle}
            </h2>
            {userIsStaff && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Ticket Validation Only
              </p>
            )}
          </div>
          <ul className="space-y-2">
            {navItems.filter(item => item.show).map((item) => {
              const isActive = location.pathname === item.path ||
                (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={handleLinkClick}
                    className={`block px-4 py-3 rounded-lg transition-colors ${isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}

            {/* ===== STAFF PORTAL ACCESS (for Organisers only) ===== */}
            {userIsOrganiser && !userIsStaff && (
              <>
                {/* Divider */}
                <li className="my-4">
                  <hr className="border-gray-200 dark:border-gray-700" />
                </li>
                {/* Staff Portal Button */}
                <li>
                  <button
                    onClick={handleStaffPortalAccess}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left bg-purple-600 text-white hover:bg-purple-700 rounded-lg transition-colors shadow-sm"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                      />
                    </svg>
                    <span className="font-medium">Staff Portal</span>
                  </button>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 px-4">
                    Access ticket validation
                  </p>
                </li>
              </>
            )}
          </ul>
        </nav>
      </aside>
    </>
  );
};

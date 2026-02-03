import { Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/common/ThemeToggle';

/**
 * Minimal layout for STAFF users.
 * Staff experience a single-purpose ticket scanning application.
 * No navigation, no browse, no tickets - just validation.
 */
export const StaffLayout = () => {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-netflix-black transition-colors duration-300">
            {/* Minimal Header */}
            <header className="bg-white dark:bg-netflix-dark shadow-sm border-b dark:border-gray-800 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-14 sm:h-16">
                        {/* Logo / Title */}
                        <div className="flex items-center min-w-0">
                            <div className="flex-shrink-0 flex items-center">
                                <span className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400">EventHub</span>
                                <span className="ml-1 sm:ml-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium hidden xs:inline">Staff</span>
                            </div>
                        </div>

                        {/* User Info & Logout */}
                        <div className="flex items-center gap-2 sm:gap-4">
                            <ThemeToggle />
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[120px]">{user?.name || user?.username || 'Staff'}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Ticket Validation</p>
                            </div>
                            <button
                                onClick={logout}
                                className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content - No sidebar, full width */}
            <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="fixed bottom-0 left-0 right-0 bg-white dark:bg-netflix-dark border-t dark:border-gray-800 py-3 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-xs text-gray-400 dark:text-gray-400">
                        Staff Validation Terminal • Scan or search tickets to validate entry
                    </p>
                </div>
            </footer>
        </div>
    );
};

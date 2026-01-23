import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/common/Button';
import { ThemeToggle } from '@/components/common/ThemeToggle';

export const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white dark:bg-netflix-dark shadow-sm border-b dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">
              Event Platform
            </Link>
          </div>

          <nav className="flex items-center space-x-4">
            <ThemeToggle />
            {user && (
              <>
                <span className="text-sm text-gray-700 dark:text-gray-300">{user.name || user.email}</span>
                <Button variant="outline" size="sm" onClick={logout}>
                  Logout
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

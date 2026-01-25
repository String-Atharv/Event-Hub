import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export const PageContainer = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Close sidebar when route changes (mobile navigation)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const handleMenuClick = () => {
    setIsSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-netflix-black transition-colors duration-300">
      <Header onMenuClick={handleMenuClick} />
      <div className="flex">
        <Sidebar isOpen={isSidebarOpen} onClose={handleSidebarClose} />
        <main className="flex-1 p-4 sm:p-6 lg:ml-0 pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

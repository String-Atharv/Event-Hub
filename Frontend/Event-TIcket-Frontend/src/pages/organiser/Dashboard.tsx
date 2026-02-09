import { Link } from 'react-router-dom';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { useAuth } from '@/hooks/useAuth';
import { DashboardOverview } from '@/components/organiser/analytics/DashboardOverview';

export const Dashboard = () => {
  const { user } = useAuth();

  const recentEvents: any[] = [];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome Section - Glassmorphism Style */}
      <div className="rounded-xl sm:rounded-2xl overflow-hidden relative">
        {/* Pure Glassmorphism Background - minimal gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-teal-500/5 dark:from-cyan-400/10 dark:to-teal-400/10"></div>
        <div className="absolute inset-0 backdrop-blur-2xl bg-white/50 dark:bg-gray-800/50"></div>

        {/* Very subtle accent glow - just a hint of color */}
        <div className="absolute top-0 left-1/4 w-32 h-16 bg-cyan-400/10 dark:bg-cyan-400/15 rounded-full blur-3xl"></div>

        {/* Glass border effect */}
        <div className="absolute inset-0 rounded-xl sm:rounded-2xl ring-1 ring-gray-200/50 dark:ring-white/10 shadow-lg shadow-gray-200/20 dark:shadow-black/20"></div>

        {/* Content */}
        <div className="relative p-4 sm:p-6 lg:p-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 text-gray-800 dark:text-white">
            <span className="bg-gradient-to-r from-cyan-600 to-teal-600 dark:from-cyan-400 dark:to-teal-400 bg-clip-text text-transparent">Welcome back,</span> {user?.name || 'Organiser'}!
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300">
            Manage your events and track your ticket sales from one place.
          </p>
        </div>
      </div>

      {/* Analytics Overview - Fetches real data from /api/v1/analytics/complete */}
      <DashboardOverview />



      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {/* Recent Events */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex justify-between items-center gap-3 mb-3 sm:mb-4 md:mb-6">
              <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 dark:text-white">Recent Events</h2>
              <Link to="/events">
                <button className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl font-medium text-gray-400 bg-white/5 backdrop-blur-md border border-gray-400/30 hover:border-gray-400/60 hover:bg-white/10 transition-all duration-300 text-xs sm:text-sm">
                  View All
                </button>
              </Link>
            </div>

            {recentEvents.length === 0 ? (
              <div className="text-center py-6 sm:py-8 md:py-12">
                <svg className="mx-auto h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="mt-2 text-xs sm:text-sm font-medium text-gray-900 dark:text-white">No events</h3>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3 md:space-y-4">
                {recentEvents.map((event) => (
                  <div key={event.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 p-2 sm:p-3 md:p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex-1">
                      <h3 className="font-medium text-sm sm:text-base text-gray-900 dark:text-white">{event.title}</h3>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1">{event.venue} • {event.startDate}</p>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Badge variant={event.status === 'PUBLISHED' ? 'success' : 'warning'}>
                        {event.status}
                      </Badge>
                      <Link to={`/events/${event.id}`}>
                        <button className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl font-medium text-gray-400 bg-white/5 backdrop-blur-md border border-gray-400/30 hover:border-gray-400/60 hover:bg-white/10 transition-all duration-300 text-xs sm:text-sm">
                          View
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Quick Actions - Full width buttons on mobile */}
        <div className="space-y-3 sm:space-y-4 md:space-y-6">
          <Card>
            <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 md:mb-6">Quick Actions</h2>
            <div className="space-y-2 sm:space-y-3">
              <Link to="/events/create" className="block">
                <button className="w-full px-4 sm:px-6 py-3 sm:py-3.5 rounded-xl font-semibold text-cyan-400 bg-white/10 dark:bg-white/5 backdrop-blur-md border border-cyan-400/30 hover:border-cyan-400/60 hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 flex items-center justify-center gap-2 text-sm sm:text-base">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create New Event
                </button>
              </Link>

              <Link to="/events" className="block">
                <button className="w-full px-4 sm:px-6 py-3 sm:py-3.5 rounded-xl font-medium text-indigo-400 bg-indigo-500/10 backdrop-blur-md border border-indigo-400/30 hover:border-indigo-400/60 hover:bg-indigo-500/20 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/20 flex items-center justify-center gap-2 text-sm sm:text-base">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  View All Events
                </button>
              </Link>

              <Link to="/event-stats" className="block">
                <button className="w-full px-4 sm:px-6 py-3 sm:py-3.5 rounded-xl font-medium text-purple-400 bg-purple-500/10 backdrop-blur-md border border-purple-400/30 hover:border-purple-400/60 hover:bg-purple-500/20 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 flex items-center justify-center gap-2 text-sm sm:text-base">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  View Event Stats
                </button>
              </Link>
            </div>
          </Card>

          {/* Help Section */}
          <Card className="bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800">
            <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white mb-1 sm:mb-2">Need Help?</h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
              Need so help question?
            </p>
            <button className="w-full px-3 sm:px-4 py-2 rounded-xl font-medium text-gray-600 dark:text-gray-300 bg-white/50 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-gray-600/30 hover:border-gray-400 dark:hover:border-gray-500/60 hover:bg-white/70 dark:hover:bg-white/10 transition-all duration-300 text-xs sm:text-sm">
              Get Support
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
};

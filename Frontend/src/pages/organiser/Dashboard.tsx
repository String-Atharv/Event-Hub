import { Link } from 'react-router-dom';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { useAuth } from '@/hooks/useAuth';
import { DashboardOverview } from '@/components/organiser/analytics/DashboardOverview';

export const Dashboard = () => {
  const { user } = useAuth();

  const recentEvents: any[] = [];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">
          Welcome back, {user?.name || 'Organiser'}!
        </h1>
        <p className="text-blue-100 text-lg">
          Manage your events and track your ticket sales from one place.
        </p>
      </div>

      {/* Analytics Overview - Fetches real data from /api/v1/analytics/complete */}
      <DashboardOverview />



      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Events */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Events</h2>
              <Link to="/events">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>

            {recentEvents.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No events</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating your first event.</p>
                <div className="mt-6">
                  <Link to="/events/create">
                    <Button>Create Event</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {recentEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">{event.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{event.venue} • {event.startDate}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant={event.status === 'PUBLISHED' ? 'success' : 'warning'}>
                        {event.status}
                      </Badge>
                      <Link to={`/events/${event.id}`}>
                        <Button variant="outline" size="sm">View</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
            <div className="space-y-3">
              <Link to="/events/create" className="block">
                <Button className="w-full" size="lg">
                  <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create New Event
                </Button>
              </Link>

              <Link to="/events" className="block">
                <Button variant="outline" className="w-full" size="lg">
                  <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  View All Events
                </Button>
              </Link>

              <Link to="/analytics" className="block">
                <Button variant="outline" className="w-full" size="lg">
                  <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  View Analytics
                </Button>
              </Link>
            </div>
          </Card>

          {/* Help Section */}
          <Card className="mt-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Need Help?</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Check out our guides or contact support for assistance.
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Get Support
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

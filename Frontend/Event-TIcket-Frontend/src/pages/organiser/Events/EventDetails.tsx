import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Spinner } from '@/components/feedback/Spinner';
import { eventsApi } from '@/api/endpoints/events';
import { formatDate, formatCurrency } from '@/utils/formatters';

export const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const eventData = await eventsApi.getById(id);
        console.log('Fetched event data:', eventData);
        setEvent(eventData);
      } catch (err: any) {
        console.error('Failed to fetch event:', err);
        setError(err.message || 'Failed to load event');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const getStatusVariant = (status: string): 'success' | 'warning' | 'danger' | 'info' | 'default' => {
    switch (status) {
      case 'PUBLISHED':
        return 'success';
      case 'DRAFT':
        return 'warning';
      case 'CANCELLED':
        return 'danger';
      case 'COMPLETED':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatEventDate = (dateString?: string): string => {
    if (!dateString) return 'Not set';

    try {
      const date = new Date(dateString);

      if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateString);
        return 'Invalid date';
      }

      return formatDate(date, 'PPp');
    } catch (error) {
      console.error('Date formatting error:', error, dateString);
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <Spinner />
      </div>
    );
  }

  if (error || !event) {
    return (
      <Card>
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">Failed to load event</p>
          <p className="text-gray-500">{error || 'Event not found'}</p>
          <Link to="/events">
            <button className="mt-4 px-4 py-2 rounded-xl font-medium text-gray-400 bg-white/5 backdrop-blur-md border border-gray-400/30 hover:border-gray-400/60 hover:bg-white/10 transition-all duration-300">
              Back to Events
            </button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="pb-20 md:pb-0">
      {/* Header - Hidden on mobile, actions are in bottom bar */}
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Event Details</h1>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex gap-2">
          <Link to={`/events/${id}/edit`}>
            <button className="px-4 py-2 rounded-xl font-medium text-indigo-400 bg-indigo-500/10 backdrop-blur-md border border-indigo-400/30 hover:border-indigo-400/60 hover:bg-indigo-500/20 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/20 text-sm">
              Edit
            </button>
          </Link>
          <Link to={`/events/${id}/staff`}>
            <button className="px-4 py-2 rounded-xl font-medium text-emerald-400 bg-emerald-500/10 backdrop-blur-md border border-emerald-400/30 hover:border-emerald-400/60 hover:bg-emerald-500/20 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20 text-sm">
              Manage Staff
            </button>
          </Link>
          <Link to={`/events/${id}/analytics`}>
            <button className="px-4 py-2 rounded-xl font-medium text-cyan-400 bg-cyan-500/10 backdrop-blur-md border border-cyan-400/30 hover:border-cyan-400/60 hover:bg-cyan-500/20 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 text-sm">
              Dashboard
            </button>
          </Link>
        </div>
      </div>

      <Card className="p-3 sm:p-4 md:p-6">
        <div className="space-y-4 sm:space-y-5 md:space-y-6">
          {/* Event Title and Status */}
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 text-gray-900 dark:text-white">{event.name}</h2>
            <div className="flex flex-wrap gap-2">
              <Badge variant={getStatusVariant(event.eventStatus)}>{event.eventStatus}</Badge>
              <Badge variant={getStatusVariant(event.eventType)}>{event.eventType}</Badge>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-0.5 sm:mb-1">Description:</h3>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">{event.description}</p>
          </div>

          {/* Start Date */}
          <div>
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-0.5 sm:mb-1">Start Date:</h3>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">{formatEventDate(event.startTime)}</p>
          </div>

          {/* End Date */}
          <div>
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-0.5 sm:mb-1">End Date:</h3>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">{formatEventDate(event.endTime)}</p>
          </div>

          {/* Venue */}
          <div>
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-0.5 sm:mb-1">Venue:</h3>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">{event.venue}</p>
          </div>

          {/* Sales Start Date */}
          <div>
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-0.5 sm:mb-1">Sales Start Date:</h3>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">{formatEventDate(event.salesStartDate)}</p>
          </div>

          {/* Sales End Date */}
          <div>
            <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-0.5 sm:mb-1">Sales End Date:</h3>
            <p className="text-sm sm:text-base text-gray-900 dark:text-white">{formatEventDate(event.salesEndDate)}</p>
          </div>

          {/* Ticket Types */}
          {event.ticketTypes && event.ticketTypes.length > 0 && (
            <div className="border-t pt-4 sm:pt-5 md:pt-6 border-gray-200 dark:border-gray-700">
              <h3 className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">Ticket Types</h3>
              <div className="space-y-2 sm:space-y-3">
                {event.ticketTypes.map((ticket: any, index: number) => (
                  <div
                    key={ticket.id || index}
                    className="p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm sm:text-base md:text-lg text-gray-900 dark:text-white">{ticket.name}</h4>
                        {ticket.description && (
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">{ticket.description}</p>
                        )}
                      </div>
                      <div className="text-right ml-3 flex-shrink-0">
                        <p className="text-base sm:text-lg md:text-xl font-bold text-blue-600 dark:text-blue-400">
                          {formatCurrency(ticket.price)}
                        </p>
                        {ticket.totalAvailable !== undefined && (
                          <p className="text-[10px] sm:text-xs md:text-sm text-gray-500 dark:text-gray-400">
                            {ticket.totalAvailable} available
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Mobile Bottom Action Bar - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white/90 dark:bg-netflix-dark/90 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 p-3 z-50">
        <div className="flex gap-2 max-w-lg mx-auto">
          <Link to={`/events/${id}/edit`} className="flex-1">
            <button className="w-full px-3 py-2.5 rounded-xl font-medium text-indigo-400 bg-indigo-500/10 backdrop-blur-md border border-indigo-400/30 hover:border-indigo-400/60 hover:bg-indigo-500/20 transition-all duration-300 text-xs sm:text-sm flex items-center justify-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
          </Link>
          <Link to={`/events/${id}/staff`} className="flex-1">
            <button className="w-full px-3 py-2.5 rounded-xl font-medium text-emerald-400 bg-emerald-500/10 backdrop-blur-md border border-emerald-400/30 hover:border-emerald-400/60 hover:bg-emerald-500/20 transition-all duration-300 text-xs sm:text-sm flex items-center justify-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Manage Staff
            </button>
          </Link>
          <Link to={`/events/${id}/analytics`} className="flex-1">
            <button className="w-full px-3 py-2.5 rounded-xl font-medium text-cyan-400 bg-cyan-500/10 backdrop-blur-md border border-cyan-400/30 hover:border-cyan-400/60 hover:bg-cyan-500/20 transition-all duration-300 text-xs sm:text-sm flex items-center justify-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Dashboard
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};
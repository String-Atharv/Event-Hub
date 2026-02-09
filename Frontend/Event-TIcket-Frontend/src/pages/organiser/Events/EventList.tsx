import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Spinner } from '@/components/feedback/Spinner';
import { eventsApi, ListEventResponseDto } from '@/api/endpoints/events';
import { formatDate } from '@/utils/formatters';

export const EventList = () => {
  const [events, setEvents] = useState<ListEventResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const response = await eventsApi.getAll();
        setEvents(response.content || []);
        setTotalPages(response.totalPages || 0);
      } catch (err: any) {
        console.error('Failed to fetch events:', err);
        setError(err.message || 'Failed to load events');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [page]);

  // Filter events based on search query
  const filteredEvents = events.filter(event =>
    event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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

  const formatEventDate = (dateString: string): string => {
    if (!dateString) return 'Date not set';
    try {
      return formatDate(dateString, 'MMM dd, yyyy • HH:mm');
    } catch (error) {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="text-center py-8 sm:py-12">
          <p className="text-red-600 mb-4 text-sm sm:text-base">Failed to load events</p>
          <p className="text-gray-500 text-xs sm:text-sm">{error}</p>
          <button
            className="mt-4 px-4 py-2 rounded-xl font-medium text-gray-400 bg-white/5 backdrop-blur-md border border-gray-400/30 hover:border-gray-400/60 hover:bg-white/10 transition-all duration-300 text-sm"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </Card>
    );
  }

  return (
    <div className="pb-20 md:pb-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3 sm:mb-4 md:mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Events</h1>

        {/* Desktop Create Event Button - Hidden on mobile */}
        <Link to="/events/create" className="hidden md:block">
          <button className="px-5 py-2.5 rounded-xl font-medium text-cyan-400 bg-cyan-500/10 backdrop-blur-md border border-cyan-400/30 hover:border-cyan-400/60 hover:bg-cyan-500/20 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Event
          </button>
        </Link>
      </div>

      {/* Search Bar - Responsive */}
      <div className="relative mb-4 sm:mb-6">
        <input
          type="text"
          placeholder="Search events by name, venue..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 sm:pl-10 pr-10 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 dark:bg-netflix-gray dark:text-white rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors duration-300 placeholder:text-gray-400"
        />
        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {filteredEvents.length === 0 ? (
        <Card className="p-4 sm:p-6">
          <div className="text-center py-6 sm:py-12">
            <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              {searchQuery ? 'No events found' : 'No events'}
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {searchQuery ? 'Try adjusting your search query.' : 'Get started by creating your first event.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-3 text-xs sm:text-sm text-cyan-500 hover:text-cyan-400 transition-colors"
              >
                Clear search
              </button>
            )}
          </div>
        </Card>
      ) : (
        <>
          {/* Section Header */}
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white">
              All Events
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-normal ml-2">
                ({filteredEvents.length})
              </span>
            </h2>
          </div>

          {/* Mobile: Vertical Stacked Cards / Desktop: Grid */}
          {/* Mobile Vertical Stack - Professional Layout */}
          <div className="md:hidden space-y-3 mb-4">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="p-4 hover:shadow-lg transition-shadow">
                {/* Top Row: Name + Status */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white line-clamp-2 flex-1">
                    {event.name}
                  </h3>
                  <Badge variant={getStatusVariant(event.eventStatus)} className="flex-shrink-0">
                    {event.eventStatus}
                  </Badge>
                </div>

                {/* Event Type Badge */}
                <div className="mb-3">
                  <Badge variant="info" className="text-[10px]">
                    {event.eventType}
                  </Badge>
                </div>

                {/* Event Details - Clean Layout */}
                <div className="space-y-2 mb-3">
                  {/* Location */}
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <svg className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="line-clamp-1">{event.venue}</span>
                  </div>

                  {/* Date & Time */}
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <svg className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{formatEventDate(event.startTime)}</span>
                  </div>
                </div>

                {/* Ticket Types - Inline with Price Highlight */}
                {event.ticketTypes && event.ticketTypes.length > 0 && (
                  <div className="flex items-center justify-between py-3 border-t border-gray-200 dark:border-gray-700 mb-3">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {event.ticketTypes.length} ticket type{event.ticketTypes.length > 1 ? 's' : ''}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">From</span>
                      <span className="text-base font-bold text-cyan-600 dark:text-cyan-400">
                        ₹{Math.min(...event.ticketTypes.map(t => t.price))}
                      </span>
                    </div>
                  </div>
                )}

                {/* Action Button - Full Width */}
                <Link to={`/events/${event.id}`} className="block">
                  <button className="w-full py-2.5 rounded-xl font-medium text-cyan-400 bg-cyan-500/10 border border-cyan-400/30 hover:border-cyan-400/60 hover:bg-cyan-500/20 transition-all duration-300 text-sm flex items-center justify-center gap-2">
                    <span>View Details</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </Link>
              </Card>
            ))}
          </div>

          {/* Desktop Grid Layout */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 lg:gap-6 mb-4 sm:mb-6 md:mb-8">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="p-4 md:p-5 hover:shadow-lg transition-shadow">
                {/* Event Name */}
                <h3 className="text-lg md:text-xl font-semibold mb-2 line-clamp-1 text-gray-900 dark:text-white">
                  {event.name}
                </h3>

                {/* Status Badges */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <Badge variant={getStatusVariant(event.eventStatus)}>{event.eventStatus}</Badge>
                  <Badge variant={getStatusVariant(event.eventType)}>{event.eventType}</Badge>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {event.description}
                </p>

                {/* Event Info */}
                <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="line-clamp-1">{event.venue}</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{formatEventDate(event.startTime)}</span>
                  </div>
                </div>

                {/* Ticket Types Summary */}
                {event.ticketTypes && event.ticketTypes.length > 0 && (
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700 mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Ticket Types:</span>
                      <span className="text-sm text-blue-600 dark:text-blue-400">{event.ticketTypes.length}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {event.ticketTypes.slice(0, 2).map((ticketType, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-2 py-1 rounded">
                          {ticketType.name} - ₹{ticketType.price}
                        </span>
                      ))}
                      {event.ticketTypes.length > 2 && (
                        <span className="text-xs text-gray-500">
                          +{event.ticketTypes.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* View Details Button */}
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <Link to={`/events/${event.id}`}>
                    <button className="w-full px-4 py-2.5 rounded-xl font-medium text-gray-400 bg-white/5 backdrop-blur-md border border-gray-400/30 hover:border-gray-400/60 hover:bg-white/10 transition-all duration-300 text-sm">
                      View Details
                    </button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 sm:gap-3">
              <button
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl font-medium text-gray-400 bg-white/5 backdrop-blur-md border border-gray-400/30 hover:border-gray-400/60 hover:bg-white/10 transition-all duration-300 disabled:opacity-50 text-xs sm:text-sm"
                disabled={page === 0}
                onClick={() => setPage(prev => prev - 1)}
              >
                Previous
              </button>
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 px-2">
                {page + 1} / {totalPages}
              </span>
              <button
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl font-medium text-gray-400 bg-white/5 backdrop-blur-md border border-gray-400/30 hover:border-gray-400/60 hover:bg-white/10 transition-all duration-300 disabled:opacity-50 text-xs sm:text-sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(prev => prev + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Mobile Floating Action Button (FAB) - Fixed at bottom right */}
      <Link
        to="/events/create"
        className="md:hidden fixed bottom-6 right-4 z-50"
      >
        <button className="w-14 h-14 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 transition-all duration-300 flex items-center justify-center active:scale-95">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </Link>
    </div>
  );
};
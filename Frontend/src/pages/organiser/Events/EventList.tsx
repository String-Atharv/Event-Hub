import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/common/Button';
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

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const response = await eventsApi.getAll();
        setEvents(response.content || []); // Use response.content (array of events)
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
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">Failed to load events</p>
          <p className="text-gray-500">{error}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Events</h1>
        <Link to="/events/create">
          <Button>Create Event</Button>
        </Link>
      </div>

      {events.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No events</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating your first event.</p>
            <div className="mt-6">
              <Link to="/events/create">
                <Button>Create Event</Button>
              </Link>
            </div>
          </div>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {events.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow flex flex-col h-full">
                <div className="flex-1">
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold mb-2 line-clamp-1">{event.name}</h3>
                    <Badge variant={getStatusVariant(event.eventStatus)}>{event.eventStatus}</Badge> <Badge variant={getStatusVariant(event.eventType)}>{event.eventType}</Badge>
                  </div>
                  <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                  
                  <div className="space-y-2 text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="line-clamp-1">{event.venue}</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{formatEventDate(event.startTime)}</span>
                    </div>
                    
                    {/* Display ticket types summary */}
                    {event.ticketTypes && event.ticketTypes.length > 0 && (
                      <div className="pt-2 border-t">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Ticket Types:</span>
                          <span className="text-blue-600">{event.ticketTypes.length}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {event.ticketTypes.slice(0, 2).map((ticketType, idx) => (
                            <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {ticketType.name} - ${ticketType.price}
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
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <Link to={`/events/${event.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      View Details
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage(prev => prev - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {page + 1} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(prev => prev + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/feedback/Spinner';
import { eventsApi } from '@/api/endpoints/events';
import { formatDate, formatCurrency } from '@/utils/formatters';

export const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const eventData = await eventsApi.getById(id);
        console.log('Fetched event data:', eventData); // Debug log
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

  const handleDelete = async () => {
    if (!id || !window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      setIsDeleting(true);
      await eventsApi.delete(id);
      navigate('/events');
    } catch (err: any) {
      console.error('Failed to delete event:', err);
      alert(err.message || 'Failed to delete event');
    } finally {
      setIsDeleting(false);
    }
  };

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

  // Safe date formatter that handles backend format
  const formatEventDate = (dateString?: string): string => {
    if (!dateString) return 'Not set';

    try {
      // Backend returns: "2025-01-29T22:37:00"
      // This is already in ISO format, just format it nicely
      const date = new Date(dateString);

      if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateString);
        return 'Invalid date';
      }

      return formatDate(date, 'PPp'); // Jan 29, 2025 at 10:37 PM
    } catch (error) {
      console.error('Date formatting error:', error, dateString);
      return dateString; // Fallback to raw string
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
            <Button className="mt-4">Back to Events</Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Event Details</h1>
        <div className="flex space-x-2">
          <Link to={`/events/${id}/edit`}>
            <Button variant="outline">Edit</Button>
          </Link>
          <Link to={`/events/${id}/tickets`}>
            <Button variant="outline">Manage Tickets</Button>
          </Link>
          <Link to={`/events/${id}/analytics`}>
            <Button>Dashboard</Button>
          </Link>
          <Link to={`/events/${id}/staff`}>
            <Button variant="outline">Manage Staff</Button>
          </Link>
          <Button variant="danger" onClick={handleDelete} isLoading={isDeleting}>
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <div className="space-y-6">
          {/* Event Title and Status */}
          <div>
            <h2 className="text-2xl font-semibold mb-2">{event.name}</h2>
            <Badge variant={getStatusVariant(event.eventStatus)}>{event.eventStatus}</Badge> <Badge variant={getStatusVariant(event.eventType)}>{event.eventType}</Badge>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-medium text-gray-700 mb-1">Description</h3>
            <p className="text-gray-600">{event.description}</p>
          </div>

          {/* Event Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-4">
            <div>
              <h3 className="font-medium text-gray-700 mb-1">Start Date</h3>
              <p className="text-gray-900">{formatEventDate(event.startTime)}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700 mb-1">End Date</h3>
              <p className="text-gray-900">{formatEventDate(event.endTime)}</p>
            </div>
          </div>

          {/* Venue */}
          <div className="border-t pt-4">
            <h3 className="font-medium text-gray-700 mb-1">Venue</h3>
            <p className="text-gray-600">{event.venue}</p>
          </div>

          {/* Sales Period */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-4">
            <div>
              <h3 className="font-medium text-gray-700 mb-1">Sales Start Date</h3>
              <p className="text-gray-900">{formatEventDate(event.salesStartDate)}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700 mb-1">Sales End Date</h3>
              <p className="text-gray-900">{formatEventDate(event.salesEndDate)}</p>
            </div>
          </div>

          {/* Ticket Types */}
          {event.ticketTypes && event.ticketTypes.length > 0 && (
            <div className="border-t pt-6">
              <h3 className="font-medium text-gray-700 mb-3">Ticket Types</h3>
              <div className="space-y-3">
                {event.ticketTypes.map((ticket: any, index: number) => (
                  <div
                    key={ticket.id || index}
                    className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-lg">{ticket.name}</h4>
                        {ticket.description && (
                          <p className="text-sm text-gray-600 mt-1">{ticket.description}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-blue-600">
                          {formatCurrency(ticket.price)}
                        </p>
                        {ticket.totalAvailable !== undefined && (
                          <p className="text-sm text-gray-500">
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
    </div>
  );
};
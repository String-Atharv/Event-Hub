import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { publishedEventsApi, PublishedEventDto } from '@/api/endpoints/publishedEvents';
import { ticketsApi } from '@/api/endpoints/tickets';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/hooks/useAuth';

export const PublishedEventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const [event, setEvent] = useState<PublishedEventDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchasingTicketType, setPurchasingTicketType] = useState<number | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const eventData = await publishedEventsApi.getById(id);
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

  const handlePurchase = async (ticketTypeId: number) => {
    if (!isAuthenticated) {
      // Redirect to login
      login();
      return;
    }

    try {
      setPurchasingTicketType(ticketTypeId);
      setError(null);

      // Purchase ticket
      await ticketsApi.purchaseTicket(ticketTypeId);

      // Show success message
      setPurchaseSuccess(true);

      // Redirect to my tickets after 2 seconds
      setTimeout(() => {
        navigate('/my-tickets');
      }, 2000);
    } catch (err: any) {
      console.error('Failed to purchase ticket:', err);
      setError(err.message || 'Failed to purchase ticket');
    } finally {
      setPurchasingTicketType(null);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
  };

  const isSalesActive = (event: PublishedEventDto): boolean => {
    const now = new Date();
    const salesStart = event.salesStartDate ? new Date(event.salesStartDate) : null;
    const salesEnd = event.salesEndDate ? new Date(event.salesEndDate) : null;

    if (salesStart && now < salesStart) return false;
    if (salesEnd && now > salesEnd) return false;
    return true;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-red-600"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h2>
          <p className="text-gray-500 mb-6">{error || 'The event you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  const salesActive = isSalesActive(event);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-red-600">EventHub</Link>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              ← Back to Events
            </button>
          </div>
        </div>
      </header>

      {/* Success Message */}
      {purchaseSuccess && (
        <div className="bg-green-50 border-b border-green-200 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-green-800 font-semibold">Ticket purchased successfully!</p>
                <p className="text-green-600 text-sm">Redirecting to your tickets...</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && !purchaseSuccess && (
        <div className="bg-red-50 border-b border-red-200 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Event Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 h-80 relative">
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{event.name}</h1>
            <div className="flex items-center text-white text-lg">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {event.venue}
            </div>
          </div>
        </div>
      </div>

      {/* Event Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4">About the Event</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">Event Schedule</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-green-600 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-gray-900">Event Starts</h3>
                    <p className="text-gray-600">{formatDateTime(event.startTime)}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-red-600 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-gray-900">Event Ends</h3>
                    <p className="text-gray-600">{formatDateTime(event.endTime)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Tickets */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-2xl font-bold mb-4">Tickets</h2>

              {!salesActive && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 text-sm font-medium">
                    {event.salesStartDate && new Date() < new Date(event.salesStartDate)
                      ? `Sales start on ${new Date(event.salesStartDate).toLocaleDateString()}`
                      : 'Ticket sales have ended'}
                  </p>
                </div>
              )}

              <div className="space-y-4">
                {event.ticketTypes.map((ticket) => {
                  const isSoldOut = ticket.totalAvailable !== undefined && ticket.totalAvailable <= 0;
                  const isPurchasing = purchasingTicketType === ticket.id;

                  return (
                    <div key={ticket.id} className="border border-gray-200 rounded-lg p-4 hover:border-red-500 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg">{ticket.name}</h3>
                        <span className="text-2xl font-bold text-red-600">₹{ticket.price}</span>
                      </div>

                      {ticket.totalAvailable !== undefined && (
                        <p className="text-sm text-gray-500 mb-3">
                          {isSoldOut ? (
                            <span className="text-red-600 font-semibold">Sold Out</span>
                          ) : (
                            `${ticket.totalAvailable} tickets available`
                          )}
                        </p>
                      )}

                      <Button
                        onClick={() => handlePurchase(ticket.id)}
                        disabled={!salesActive || isSoldOut || isPurchasing || purchaseSuccess}
                        isLoading={isPurchasing}
                        className="w-full"
                      >
                        {isSoldOut
                          ? 'Sold Out'
                          : !salesActive
                          ? 'Not Available'
                          : isPurchasing
                          ? 'Processing...'
                          : isAuthenticated
                          ? 'Buy Now'
                          : 'Login to Buy'}
                      </Button>
                    </div>
                  );
                })}
              </div>

              {event.salesStartDate && event.salesEndDate && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold text-gray-900 mb-2">Sales Period</h3>
                  <p className="text-sm text-gray-600">
                    From: {new Date(event.salesStartDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    Until: {new Date(event.salesEndDate).toLocaleDateString()}
                  </p>
                </div>
              )}

              {isAuthenticated && (
                <div className="mt-6 pt-6 border-t">
                  <Link
                    to="/my-tickets"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                    View Your Tickets →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
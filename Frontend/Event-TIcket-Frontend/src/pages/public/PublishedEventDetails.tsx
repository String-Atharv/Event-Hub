import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { publishedEventsApi, PublishedEventDto } from '@/api/endpoints/publishedEvents';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { getEventImage } from '@/utils/eventImages';

export const PublishedEventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<PublishedEventDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const isSalesActive = (event: PublishedEventDto): boolean => {
    const now = new Date();
    const salesStart = event.salesStartDate ? new Date(event.salesStartDate) : null;
    const salesEnd = event.salesEndDate ? new Date(event.salesEndDate) : null;

    if (salesStart && now < salesStart) return false;
    if (salesEnd && now > salesEnd) return false;
    return true;
  };

  const getLowestPrice = () => {
    if (!event?.ticketTypes.length) return null;
    const availableTickets = event.ticketTypes.filter(t => t.totalAvailable === undefined || t.totalAvailable > 0);
    if (availableTickets.length === 0) return null;
    return Math.min(...availableTickets.map(t => t.price));
  };

  const hasAvailableTickets = () => {
    if (!event?.ticketTypes.length) return false;
    return event.ticketTypes.some(t => t.totalAvailable === undefined || t.totalAvailable > 0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-netflix-black flex justify-center items-center transition-colors duration-300">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 dark:border-gray-700 border-t-cyan-500"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-netflix-black flex flex-col justify-center items-center transition-colors duration-300">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Event Not Found</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{error || 'The event you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  const salesActive = isSalesActive(event);
  const lowestPrice = getLowestPrice();

  // Get consistent image based on event ID and type
  const posterUrl = getEventImage(event.id, event.eventType);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-netflix-black transition-colors duration-300">
      {/* Header */}
      <header className="bg-white/80 dark:bg-netflix-dark/80 backdrop-blur-sm fixed top-0 left-0 right-0 z-50 border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-xl font-bold text-gray-900 dark:text-white">
              <span className="text-cyan-500 dark:text-cyan-400">Event</span>Hub
            </Link>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Events
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Backdrop */}
      <div className="relative pt-16">
        {/* Blurred Background Image */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center blur-2xl opacity-20 dark:opacity-30 scale-110"
            style={{ backgroundImage: `url(${posterUrl})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 via-gray-50/80 to-gray-50 dark:from-netflix-black/50 dark:via-netflix-black/80 dark:to-netflix-black" />
        </div>

        {/* Hero Content */}
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-center sm:items-start">
            {/* Event Poster */}
            <div className="flex-shrink-0 mx-auto sm:mx-0">
              <div className="relative w-48 sm:w-56 md:w-64 rounded-xl overflow-hidden shadow-2xl ring-1 ring-gray-200 dark:ring-white/10">
                <img
                  src={posterUrl}
                  alt={event.name}
                  className="w-full aspect-[2/3] object-cover"
                />
                {/* Optional badge overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                  <span className="text-xs font-medium text-gray-300">{event.eventType || 'Event'}</span>
                </div>
              </div>
            </div>

            {/* Event Info */}
            <div className="flex-1 w-full text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                {event.name}
              </h1>

              {/* Event Metadata */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-gray-600 dark:text-gray-300 text-sm mb-4">
                <span>{formatDate(event.startTime)}</span>
                <span className="text-gray-400 dark:text-gray-600">•</span>
                <span>{formatTime(event.startTime)}</span>
                {event.eventType && (
                  <>
                    <span className="text-gray-400 dark:text-gray-600">•</span>
                    <span className="capitalize">{event.eventType}</span>
                  </>
                )}
              </div>

              {/* Venue */}
              <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-500 dark:text-gray-400 mb-6">
                <svg className="w-5 h-5 text-cyan-500 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{event.venue}</span>
              </div>

              {/* Price Tag */}
              {lowestPrice !== null && (
                <div className="mb-6 text-center sm:text-left">
                  <span className="text-gray-500 dark:text-gray-400 text-sm">Starting from </span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">₹{lowestPrice}</span>
                </div>
              )}

              {/* Book Tickets Button */}
              <div className="flex flex-col sm:flex-row gap-3 items-center sm:items-start">
                <button
                  onClick={() => navigate(`/published-events/${id}/tickets`)}
                  disabled={!salesActive || !hasAvailableTickets()}
                  className={`px-8 py-3 rounded-lg font-semibold text-lg transition-all w-full sm:w-auto
                    ${salesActive && hasAvailableTickets()
                      ? 'bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50'
                      : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    }`}
                >
                  {!salesActive
                    ? 'Coming Soon'
                    : !hasAvailableTickets()
                      ? 'Sold Out'
                      : 'Book tickets'}
                </button>
              </div>

              {/* Sales Period Info */}
              {!salesActive && event.salesStartDate && new Date() < new Date(event.salesStartDate) && (
                <p className="text-yellow-600 dark:text-yellow-400 text-sm mt-3">
                  Sales start on {formatDate(event.salesStartDate)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* About the Event */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-netflix-dark/50 rounded-xl p-6 sm:p-8 border border-gray-200 dark:border-gray-800 shadow-sm transition-colors duration-300">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">About the event</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
            {event.description}
          </p>
        </div>
      </div>

      {/* Event Schedule */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white dark:bg-netflix-dark/50 rounded-xl p-6 sm:p-8 border border-gray-200 dark:border-gray-800 shadow-sm transition-colors duration-300">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6">Event Schedule</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Starts</p>
                <p className="text-gray-900 dark:text-white font-semibold">{formatDate(event.startTime)}</p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{formatTime(event.startTime)}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Ends</p>
                <p className="text-gray-900 dark:text-white font-semibold">{formatDate(event.endTime)}</p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{formatTime(event.endTime)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Venue Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-white dark:bg-netflix-dark/50 rounded-xl p-6 sm:p-8 border border-gray-200 dark:border-gray-800 shadow-sm transition-colors duration-300">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">Venue</h2>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-cyan-100 dark:bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-900 dark:text-white font-semibold text-lg">{event.venue}</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">View on map</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
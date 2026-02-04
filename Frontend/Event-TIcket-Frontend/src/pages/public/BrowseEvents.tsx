import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { publishedEventsApi, PublishedEventDto } from '@/api/endpoints/publishedEvents';
import { ProfileDropdown } from '@/components/common/ProfileDropdown';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { useAuth } from '@/hooks/useAuth';
import { getEventImage } from '@/utils/eventImages';

// Event type categories
const EVENT_CATEGORIES = [
  { id: 'PERFORMANCES', label: 'Performances', icon: '🎭' },
  { id: 'EXPERIENCES', label: 'Experiences', icon: '✨' },
  { id: 'PARTIES', label: 'Parties', icon: '🎉' },
  { id: 'SPORTS', label: 'Sports', icon: '⚽' },
  { id: 'CONFERENCES', label: 'Conferences', icon: '💼' },
];

export const BrowseEvents = () => {
  const { isAuthenticated } = useAuth();

  const [allEvents, setAllEvents] = useState<PublishedEventDto[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<PublishedEventDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const navigate = useNavigate();

  // Autocomplete state
  const [suggestions, setSuggestions] = useState<PublishedEventDto[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchEvents();
  }, [page]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchEvents = async (search?: string) => {
    try {
      setIsLoading(true);
      const response = await publishedEventsApi.getAll(page, 100, search);
      setAllEvents(response.content || []);
      setFilteredEvents(response.content || []);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch autocomplete suggestions
  const fetchSuggestions = async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      setIsSearching(true);
      const response = await publishedEventsApi.getAll(0, 5, query);
      setSuggestions(response.content || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search input change with debounce
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer for debounced search
    debounceTimerRef.current = setTimeout(() => {
      fetchSuggestions(value);
      // Also filter local events
      if (value.trim()) {
        const filtered = allEvents.filter(event =>
          event.name.toLowerCase().includes(value.toLowerCase()) ||
          event.venue.toLowerCase().includes(value.toLowerCase()) ||
          event.description.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredEvents(filtered);
      } else {
        setFilteredEvents(allEvents);
      }
    }, 300);
  };

  // Handle search form submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    setPage(0);
    fetchEvents(searchTerm);
  };

  // Handle suggestion click
  const handleSuggestionClick = (event: PublishedEventDto) => {
    setShowSuggestions(false);
    navigate(`/published-events/${event.id}`);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm('');
    setSuggestions([]);
    setShowSuggestions(false);
    setPage(0);
    setFilteredEvents(allEvents);
  };

  // Group events by category
  const getEventsByCategory = (categoryId: string) => {
    return filteredEvents.filter(event => event.eventType === categoryId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const day = date.getDate();
    return `${day} ${month}`;
  };

  const getMinPrice = (event: PublishedEventDto) => {
    if (!event.ticketTypes || event.ticketTypes.length === 0) return null;
    const prices = event.ticketTypes.map(t => t.price);
    return Math.min(...prices);
  };

  // Highlight matching text in suggestions
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;

    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="font-bold text-cyan-600 dark:text-cyan-500">{part}</span>
      ) : (
        <span key={index}>{part}</span>
      )
    );
  };

  const EventCard = ({ event }: { event: PublishedEventDto }) => {
    const minPrice = getMinPrice(event);
    const eventImage = getEventImage(event.id, event.eventType);
    return (
      <Link
        to={`/published-events/${event.id}`}
        className="group cursor-pointer flex-shrink-0 w-[260px] sm:w-[280px] md:w-[300px]"
      >
        <div className="bg-white dark:bg-netflix-dark rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-800">
          <div className="h-64 relative overflow-hidden">
            <img
              src={eventImage}
              alt={event.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all"></div>
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <span className="text-xs text-cyan-400 font-medium uppercase tracking-wider">
                {event.eventType || 'Event'}
              </span>
              <h3 className="text-white font-bold text-lg line-clamp-2 mb-1">
                {event.name}
              </h3>
            </div>
          </div>

          <div className="p-4">
            <div className="flex items-start mb-2">
              <svg className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm text-gray-600 dark:text-gray-300 line-clamp-1">{event.venue}</span>
            </div>

            <div className="flex items-center mb-3">
              <svg className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {formatDate(event.startTime)}
              </span>
            </div>

            {minPrice !== null && (
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                <span className="text-xs text-gray-500 dark:text-gray-400">Starting from</span>
                <span className="text-lg font-bold text-cyan-600 dark:text-cyan-500">₹{minPrice}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-netflix-black transition-colors duration-300 relative">
      {/* Subtle Background Gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-gradient-to-bl from-cyan-500/5 to-transparent rounded-full blur-3xl dark:from-cyan-600/10"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-gradient-to-tr from-teal-500/5 to-transparent rounded-full blur-3xl dark:from-teal-600/10"></div>
      </div>

      {/* Header */}
      <header className="bg-white/90 dark:bg-netflix-dark/90 backdrop-blur-sm shadow-sm sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          {/* Top row: Logo + Auth */}
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                <span className="text-cyan-600 dark:text-cyan-500">Event</span>Hub
              </div>
            </Link>

            {/* Desktop Search Bar - hidden on mobile */}
            <div className="hidden md:block flex-1 max-w-2xl mx-8" ref={searchRef}>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit(e)}
                  placeholder="Search for Events, Venues..."
                  className="w-full px-4 py-2.5 pl-12 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-netflix-gray dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent transition-colors duration-300"
                />

                <svg
                  className="absolute left-4 top-3 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>

                {searchTerm && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}

                {isSearching && (
                  <div className="absolute right-10 top-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-cyan-600"></div>
                  </div>
                )}

                {/* Autocomplete Suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full mt-2 w-full bg-white dark:bg-netflix-dark rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto z-50">
                    {suggestions.map((event) => (
                      <button
                        key={event.id}
                        onClick={() => handleSuggestionClick(event)}
                        className="w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-800 last:border-b-0 text-left transition-colors"
                      >
                        <div className="flex items-start space-x-3">
                          <img
                            src={getEventImage(event.id, event.eventType)}
                            alt={event.name}
                            className="w-12 h-12 rounded object-cover flex-shrink-0"
                          />

                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                              {highlightMatch(event.name, searchTerm)}
                            </h3>
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                              <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span className="truncate">{highlightMatch(event.venue, searchTerm)}</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}

                    <button
                      onClick={handleSearchSubmit}
                      className="w-full px-4 py-3 text-center text-cyan-600 dark:text-cyan-500 font-medium hover:bg-cyan-50 dark:hover:bg-cyan-900/30 transition-colors"
                    >
                      View all results for "{searchTerm}"
                    </button>
                  </div>
                )}

                {showSuggestions && searchTerm && suggestions.length === 0 && !isSearching && (
                  <div className="absolute top-full mt-2 w-full bg-white dark:bg-netflix-dark rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 text-center text-gray-500 dark:text-gray-400 z-50">
                    No events found for "{searchTerm}"
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <ThemeToggle />
              {isAuthenticated ? (
                <>
                  <ProfileDropdown />
                </>
              ) : (
                <Link
                  to="/login"
                  className="px-3 sm:px-5 py-2 bg-cyan-600 hover:bg-cyan-600 text-white rounded-lg transition-colors font-medium text-xs sm:text-sm shadow-lg shadow-cyan-700/30"
                >
                  <span className="hidden sm:inline">Login / Sign up</span>
                  <span className="sm:hidden">Login</span>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="md:hidden mt-3">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit(e)}
                placeholder="Search events..."
                className="w-full px-4 py-2.5 pl-10 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-netflix-gray dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent transition-colors duration-300 text-sm"
              />
              <svg className="absolute left-3 top-3 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchTerm && (
                <button onClick={handleClearSearch} className="absolute right-3 top-3 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Hero Banner */}
        <div className="mb-6 sm:mb-8 rounded-xl sm:rounded-2xl overflow-hidden relative">
          {/* Pure Glassmorphism Background - minimal gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-teal-500/5 dark:from-cyan-400/10 dark:to-teal-400/10"></div>
          <div className="absolute inset-0 backdrop-blur-2xl bg-white/50 dark:bg-gray-800/50"></div>

          {/* Very subtle accent glow - just a hint of color */}
          <div className="absolute top-0 left-1/4 w-32 h-16 bg-cyan-400/10 dark:bg-cyan-400/15 rounded-full blur-3xl"></div>

          {/* Glass border effect */}
          <div className="absolute inset-0 rounded-xl sm:rounded-2xl ring-1 ring-gray-200/50 dark:ring-white/10 shadow-lg shadow-gray-200/20 dark:shadow-black/20"></div>

          {/* Content */}
          <div className="relative p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-gray-800 dark:text-white">
              <span className="bg-gradient-to-r from-cyan-600 to-teal-600 dark:from-cyan-400 dark:to-teal-400 bg-clip-text text-transparent">Discover</span> Amazing Events
            </h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
              Find the best events happening around you
            </p>
            {searchTerm && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Showing results for:</span>
                <span className="font-semibold bg-white/60 dark:bg-white/10 text-gray-800 dark:text-white px-3 py-1 rounded-full text-sm border border-gray-200/50 dark:border-white/20 backdrop-blur-sm">
                  {searchTerm}
                </span>
                <button
                  onClick={handleClearSearch}
                  className="text-sm text-cyan-600 dark:text-cyan-400 hover:underline"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 dark:border-gray-700 border-t-cyan-600"></div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-20">
            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No events found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchTerm ? `No events match "${searchTerm}"` : 'No events available at the moment'}
            </p>
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-600 transition-colors shadow-lg shadow-cyan-700/30"
              >
                View All Events
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Events by Category - Horizontal Scroll */}
            {EVENT_CATEGORIES.map((category) => {
              const categoryEvents = getEventsByCategory(category.id);

              if (categoryEvents.length === 0) return null;

              return (
                <div key={category.id} className="mb-8 sm:mb-12">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                      <span className="text-2xl sm:text-3xl mr-2">{category.icon}</span>
                      {category.label}
                    </h2>
                    <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      {categoryEvents.length} event{categoryEvents.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Horizontal Scrollable Container */}
                  <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                    <div className="flex space-x-3 sm:space-x-4" style={{ minWidth: 'min-content' }}>
                      {categoryEvents.map((event) => (
                        <EventCard key={event.id} event={event} />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </main>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};
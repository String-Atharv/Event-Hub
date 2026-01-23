import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { publishedEventsApi, PublishedEventDto } from '@/api/endpoints/publishedEvents';
import { ProfileDropdown } from '@/components/common/ProfileDropdown';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { useAuth } from '@/hooks/useAuth';

// Event type categories
const EVENT_CATEGORIES = [
  { id: 'PERFORMANCES', label: 'Performances', icon: '🎭' },
  { id: 'EXPERIENCES', label: 'Experiences', icon: '✨' },
  { id: 'PARTIES', label: 'Parties', icon: '🎉' },
  { id: 'SPORTS', label: 'Sports', icon: '⚽' },
  { id: 'CONFERENCES', label: 'Conferences', icon: '💼' },
];

export const BrowseEvents = () => {
  const { isAuthenticated, login } = useAuth();
  const [allEvents, setAllEvents] = useState<PublishedEventDto[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<PublishedEventDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  // Removed unused totalPages state
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
      const response = await publishedEventsApi.getAll(page, 100, search); // Fetch more events
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

  const getGradient = (index: number) => {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    ];
    return gradients[index % gradients.length];
  };

  // Highlight matching text in suggestions
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;

    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="font-bold text-blue-600">{part}</span>
      ) : (
        <span key={index}>{part}</span>
      )
    );
  };

  // Event Card Component
  const EventCard = ({ event, index }: { event: PublishedEventDto; index: number }) => {
    const minPrice = getMinPrice(event);
    return (
      <Link
        to={`/published-events/${event.id}`}
        className="group cursor-pointer flex-shrink-0"
        style={{ width: '280px' }}
      >
        <div className="bg-white dark:bg-netflix-dark rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div
            className="h-64 relative overflow-hidden"
            style={{ background: getGradient(index) }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all"></div>
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
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
              <div className="flex items-center justify-between pt-3 border-t dark:border-gray-700">
                <span className="text-xs text-gray-500 dark:text-gray-400">Starting from</span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">₹{minPrice}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-netflix-black transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-netflix-dark shadow-sm sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">EventHub</div>
            </Link>

            {/* Search Bar with Autocomplete */}
            <div className="flex-1 max-w-2xl mx-8" ref={searchRef}>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit(e)}
                  placeholder="Search for Events, Venues..."
                  className="w-full px-4 py-2.5 pl-12 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-netflix-gray dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300"
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
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}

                {isSearching && (
                  <div className="absolute right-10 top-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-blue-600"></div>
                  </div>
                )}

                {/* Autocomplete Suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50">
                    {suggestions.map((event, index) => (
                      <button
                        key={event.id}
                        onClick={() => handleSuggestionClick(event)}
                        className="w-full px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 text-left transition-colors"
                      >
                        <div className="flex items-start space-x-3">
                          <div
                            className="w-12 h-12 rounded flex-shrink-0"
                            style={{ background: getGradient(index) }}
                          ></div>

                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {highlightMatch(event.name, searchTerm)}
                            </h3>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
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
                      className="w-full px-4 py-3 text-center text-blue-600 font-medium hover:bg-blue-50 transition-colors"
                    >
                      View all results for "{searchTerm}"
                    </button>
                  </div>
                )}

                {showSuggestions && searchTerm && suggestions.length === 0 && !isSearching && (
                  <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 p-4 text-center text-gray-500 z-50">
                    No events found for "{searchTerm}"
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <ThemeToggle />
              {isAuthenticated ? (
                <>
                  <ProfileDropdown />
                </>
              ) : (
                <button
                  onClick={login}
                  className="px-5 py-2 border border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors font-medium text-sm"
                >
                  Login / Sign up
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Banner */}
        <div className="mb-8 rounded-2xl overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
          <h1 className="text-4xl font-bold mb-2">Discover Amazing Events</h1>
          <p className="text-lg opacity-90">Find the best events happening around you</p>
          {searchTerm && (
            <div className="mt-4 flex items-center space-x-2">
              <span className="text-sm opacity-90">Showing results for:</span>
              <span className="font-semibold bg-white/20 px-3 py-1 rounded-full">{searchTerm}</span>
              <button
                onClick={handleClearSearch}
                className="text-sm underline hover:no-underline"
              >
                Clear search
              </button>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-20">
            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? `No events match "${searchTerm}"` : 'No events available at the moment'}
            </p>
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                <div key={category.id} className="mb-12">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                      <span className="text-3xl mr-2">{category.icon}</span>
                      {category.label}
                    </h2>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {categoryEvents.length} event{categoryEvents.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Horizontal Scrollable Container */}
                  <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                    <div className="flex space-x-4" style={{ minWidth: 'min-content' }}>
                      {categoryEvents.map((event, index) => (
                        <EventCard key={event.id} event={event} index={index} />
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
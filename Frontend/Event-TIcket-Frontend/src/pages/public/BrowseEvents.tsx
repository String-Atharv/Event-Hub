import { useState, useEffect, useRef, useMemo } from 'react';
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
  const [featuredIndex, setFeaturedIndex] = useState(0);
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

  // Get featured events - random mix from different categories for spotlight section
  const featuredEvents = useMemo(() => {
    if (allEvents.length === 0) return [];

    // Get one event from each category (if available) for variety
    const featured: PublishedEventDto[] = [];
    const usedIds = new Set<string>();

    EVENT_CATEGORIES.forEach(category => {
      const categoryEvents = allEvents.filter(e => e.eventType === category.id && !usedIds.has(e.id));
      if (categoryEvents.length > 0) {
        const randomEvent = categoryEvents[Math.floor(Math.random() * categoryEvents.length)];
        featured.push(randomEvent);
        usedIds.add(randomEvent.id);
      }
    });

    // If we don't have enough, add more random events
    if (featured.length < 5 && allEvents.length > featured.length) {
      const remaining = allEvents.filter(e => !usedIds.has(e.id));
      const needed = Math.min(5 - featured.length, remaining.length);
      for (let i = 0; i < needed; i++) {
        featured.push(remaining[i]);
      }
    }

    return featured;
  }, [allEvents]);

  // Auto-rotate featured carousel
  useEffect(() => {
    if (featuredEvents.length <= 1) return;

    const interval = setInterval(() => {
      setFeaturedIndex(prev => (prev + 1) % featuredEvents.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [featuredEvents.length]);

  // Featured Carousel Card Component - Large horizontal card for spotlight
  const FeaturedCard = ({ event, isActive }: { event: PublishedEventDto; isActive?: boolean }) => {
    const minPrice = getMinPrice(event);
    const eventImage = getEventImage(event.id, event.eventType);

    return (
      <Link
        to={`/published-events/${event.id}`}
        className={`block flex-shrink-0 w-[85vw] sm:w-[70vw] md:w-[50vw] lg:w-[40vw] transition-all duration-300 ${isActive ? 'scale-100 opacity-100' : 'scale-95 opacity-70'}`}
      >
        <div className="relative h-48 sm:h-56 md:h-64 lg:h-72 rounded-2xl overflow-hidden shadow-xl group">
          <img
            src={eventImage}
            alt={event.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

          {/* Event type badge */}
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
            <span className="px-2 py-1 sm:px-3 sm:py-1.5 bg-cyan-600/90 backdrop-blur-sm text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-full">
              {event.eventType || 'Event'}
            </span>
          </div>

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 md:p-6">
            <h3 className="text-white font-bold text-lg sm:text-xl md:text-2xl mb-1 sm:mb-2 line-clamp-2 drop-shadow-lg">
              {event.name}
            </h3>
            <div className="flex items-center gap-4 text-white/90 text-sm sm:text-base">
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{formatDate(event.startTime)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <span className="line-clamp-1">{event.venue}</span>
              </div>
            </div>
            {minPrice !== null && (
              <div className="mt-2 sm:mt-3 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <span className="text-white/80 text-xs sm:text-sm">From</span>
                <span className="text-white font-bold text-base sm:text-lg">₹{minPrice}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  };

  // Updated EventCard with BIGGER sizes for mobile - matching BookMyShow style
  const EventCard = ({ event }: { event: PublishedEventDto }) => {
    const minPrice = getMinPrice(event);
    const eventImage = getEventImage(event.id, event.eventType);
    return (
      <Link
        to={`/published-events/${event.id}`}
        className="group cursor-pointer flex-shrink-0 w-[44vw] sm:w-[200px] md:w-[260px] lg:w-[280px]"
      >
        <div className="bg-white dark:bg-netflix-dark rounded-xl sm:rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-800">
          {/* Image - Much taller on mobile for better visibility */}
          <div className="h-56 sm:h-52 md:h-56 relative overflow-hidden">
            <img
              src={eventImage}
              alt={event.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all"></div>
            <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-3 md:p-4 bg-gradient-to-t from-black/90 to-transparent">
              <span className="text-[10px] sm:text-xs text-cyan-400 font-semibold uppercase tracking-wider">
                {event.eventType || 'Event'}
              </span>
              <h3 className="text-white font-bold text-sm sm:text-sm md:text-base lg:text-lg line-clamp-2 mt-0.5">
                {event.name}
              </h3>
            </div>
          </div>

          {/* Info section - Better spacing on mobile */}
          <div className="p-3 sm:p-3 md:p-4">
            <div className="flex items-start mb-2 sm:mb-2">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 dark:text-gray-400 mr-1.5 sm:mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs sm:text-xs md:text-sm text-gray-600 dark:text-gray-300 line-clamp-1">{event.venue}</span>
            </div>

            <div className="flex items-center mb-2 sm:mb-2 md:mb-3">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 dark:text-gray-400 mr-1.5 sm:mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs sm:text-xs md:text-sm text-gray-600 dark:text-gray-300">
                {formatDate(event.startTime)}
              </span>
            </div>

            {minPrice !== null && (
              <div className="flex items-center justify-between pt-2 sm:pt-2 md:pt-3 border-t border-gray-100 dark:border-gray-700">
                <span className="text-[10px] sm:text-[10px] md:text-xs text-gray-500 dark:text-gray-400">Starting from</span>
                <span className="text-base sm:text-base md:text-lg font-bold text-cyan-600 dark:text-cyan-500">₹{minPrice}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  };

  // Get special events for the "Specials" section - select top events from different categories
  const specialEvents = useMemo(() => {
    if (allEvents.length === 0) return [];

    // Pick 4-6 events to feature in the specials section
    const specials: PublishedEventDto[] = [];
    const usedIds = new Set<string>();

    // Get events not already in featured
    const availableEvents = allEvents.filter(e => !featuredEvents.some(f => f.id === e.id));

    // Try to get 2 from each major category for variety
    ['PERFORMANCES', 'EXPERIENCES', 'PARTIES'].forEach(category => {
      const categoryEvents = availableEvents.filter(e => e.eventType === category && !usedIds.has(e.id));
      const count = Math.min(2, categoryEvents.length);
      for (let i = 0; i < count; i++) {
        specials.push(categoryEvents[i]);
        usedIds.add(categoryEvents[i].id);
      }
    });

    return specials.slice(0, 6); // Max 6 specials
  }, [allEvents, featuredEvents]);

  // Special Event Card - Large poster-style like Hotstar Specials
  const SpecialEventCard = ({ event, isNew }: { event: PublishedEventDto; isNew?: boolean }) => {
    const eventImage = getEventImage(event.id, event.eventType);
    const minPrice = getMinPrice(event);

    return (
      <Link
        to={`/published-events/${event.id}`}
        className="group cursor-pointer flex-shrink-0 w-[45vw] sm:w-[220px] md:w-[280px] lg:w-[300px]"
      >
        <div className="relative h-[60vw] sm:h-[300px] md:h-[380px] lg:h-[420px] rounded-xl overflow-hidden shadow-xl group-hover:shadow-2xl transition-all duration-300 transform group-hover:-translate-y-1">
          {/* Full poster image */}
          <img
            src={eventImage}
            alt={event.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>

          {/* Badge for new/trending */}
          {isNew && (
            <div className="absolute top-3 left-3">
              <span className="px-2 py-1 bg-gradient-to-r from-red-600 to-orange-500 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-md shadow-lg">
                Trending
              </span>
            </div>
          )}

          {/* Event type badge */}
          <div className="absolute top-3 right-3">
            <span className="px-2 py-1 bg-cyan-600/90 backdrop-blur-sm text-white text-[10px] sm:text-xs font-semibold uppercase tracking-wider rounded-md">
              {event.eventType || 'Event'}
            </span>
          </div>

          {/* Content at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
            <h3 className="text-white font-bold text-base sm:text-lg md:text-xl line-clamp-2 drop-shadow-lg mb-1">
              {event.name}
            </h3>
            <p className="text-white/70 text-xs sm:text-sm line-clamp-1 mb-2">
              {event.venue}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-white/80 text-xs sm:text-sm">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{formatDate(event.startTime)}</span>
              </div>
              {minPrice !== null && (
                <span className="text-cyan-400 font-bold text-sm sm:text-base">₹{minPrice}</span>
              )}
            </div>
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

      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Hero Banner */}
        <div className="mb-4 sm:mb-6 md:mb-8 rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden relative">
          {/* Pure Glassmorphism Background - minimal gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-teal-500/5 dark:from-cyan-400/10 dark:to-teal-400/10"></div>
          <div className="absolute inset-0 backdrop-blur-2xl bg-white/50 dark:bg-gray-800/50"></div>

          {/* Very subtle accent glow - just a hint of color */}
          <div className="absolute top-0 left-1/4 w-32 h-16 bg-cyan-400/10 dark:bg-cyan-400/15 rounded-full blur-3xl"></div>

          {/* Glass border effect */}
          <div className="absolute inset-0 rounded-lg sm:rounded-xl md:rounded-2xl ring-1 ring-gray-200/50 dark:ring-white/10 shadow-lg shadow-gray-200/20 dark:shadow-black/20"></div>

          {/* Content */}
          <div className="relative p-4 sm:p-6 md:p-8">
            <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 text-gray-800 dark:text-white">
              <span className="bg-gradient-to-r from-cyan-600 to-teal-600 dark:from-cyan-400 dark:to-teal-400 bg-clip-text text-transparent">Discover</span> Amazing Events
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300">
              Find the best events happening around you
            </p>
            {searchTerm && (
              <div className="mt-2 sm:mt-4 flex flex-wrap items-center gap-2">
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Showing results for:</span>
                <span className="font-semibold bg-white/60 dark:bg-white/10 text-gray-800 dark:text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm border border-gray-200/50 dark:border-white/20 backdrop-blur-sm">
                  {searchTerm}
                </span>
                <button
                  onClick={handleClearSearch}
                  className="text-xs sm:text-sm text-cyan-600 dark:text-cyan-400 hover:underline"
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
            {/* Featured Spotlight Section - BookMyShow Style */}
            {featuredEvents.length > 0 && !searchTerm && (
              <div className="mb-6 sm:mb-8 md:mb-10">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                    <span className="text-xl sm:text-2xl md:text-3xl mr-2">🔥</span>
                    Spotlight
                  </h2>
                  <div className="flex items-center gap-1.5">
                    {featuredEvents.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setFeaturedIndex(idx)}
                        className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-300 ${idx === featuredIndex
                          ? 'bg-cyan-600 dark:bg-cyan-500 scale-110'
                          : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                          }`}
                        aria-label={`Go to slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Featured Carousel */}
                <div className="overflow-x-auto pb-3 sm:pb-4 -mx-3 px-3 sm:-mx-4 sm:px-4 scrollbar-hide">
                  <div
                    className="flex gap-3 sm:gap-4 transition-transform duration-500 ease-out"
                    style={{
                      transform: `translateX(-${featuredIndex * (window.innerWidth < 640 ? 88 : 72)}vw)`,
                      minWidth: 'min-content'
                    }}
                  >
                    {featuredEvents.map((event, idx) => (
                      <FeaturedCard key={event.id} event={event} isActive={idx === featuredIndex} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* EventHub Specials Section - Hotstar-style large poster cards */}
            {specialEvents.length > 0 && !searchTerm && (
              <div className="mb-6 sm:mb-8 md:mb-10">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                    <span className="text-xl sm:text-2xl md:text-3xl mr-2">⭐</span>
                    EventHub Specials
                  </h2>
                  <span className="text-[10px] sm:text-xs md:text-sm text-gray-500 dark:text-gray-400">
                    {specialEvents.length} event{specialEvents.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Large Poster Cards - Horizontal Scroll */}
                <div className="overflow-x-auto pb-3 sm:pb-4 -mx-3 px-3 sm:-mx-4 sm:px-4 scrollbar-hide">
                  <div className="flex gap-3 sm:gap-4" style={{ minWidth: 'min-content' }}>
                    {specialEvents.map((event, idx) => (
                      <SpecialEventCard key={event.id} event={event} isNew={idx < 2} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Events by Category - Horizontal Scroll */}
            {EVENT_CATEGORIES.map((category) => {
              const categoryEvents = getEventsByCategory(category.id);

              if (categoryEvents.length === 0) return null;

              return (
                <div key={category.id} className="mb-6 sm:mb-8 md:mb-12">
                  <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
                    <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                      <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl mr-1.5 sm:mr-2">{category.icon}</span>
                      {category.label}
                    </h2>
                    <span className="text-[10px] sm:text-xs md:text-sm text-gray-500 dark:text-gray-400">
                      {categoryEvents.length} event{categoryEvents.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Horizontal Scrollable Container */}
                  <div className="overflow-x-auto pb-2 sm:pb-4 -mx-4 px-4 scrollbar-hide">
                    <div className="flex space-x-2 sm:space-x-3 md:space-x-4" style={{ minWidth: 'min-content' }}>
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
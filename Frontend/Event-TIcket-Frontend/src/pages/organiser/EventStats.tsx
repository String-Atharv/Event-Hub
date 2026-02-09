import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsApi } from '@/api/endpoints/analytics';
import { OrganiserCompleteAnalyticsDto, EventAnalyticsDto } from '@/types/analytics';
import { Card } from '@/components/common/Card';
import { Spinner } from '@/components/feedback/Spinner';

export const EventStats = () => {
    const [analytics, setAnalytics] = useState<OrganiserCompleteAnalyticsDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const data = await analyticsApi.getCompleteAnalytics();
            setAnalytics(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PUBLISHED': return 'bg-green-100 text-green-800';
            case 'DRAFT': return 'bg-yellow-100 text-yellow-800';
            case 'CANCELLED': return 'bg-red-100 text-red-800';
            case 'COMPLETED': return 'bg-cyan-100 text-cyan-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredEvents = analytics?.eventAnalytics.filter(event =>
        event.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.venue.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    // Group events by type
    const groupEventsByType = (events: EventAnalyticsDto[]) => {
        const grouped: { [key: string]: EventAnalyticsDto[] } = {};
        events.forEach(event => {
            const type = event.eventType || 'Other';
            if (!grouped[type]) {
                grouped[type] = [];
            }
            grouped[type].push(event);
        });
        return grouped;
    };

    const groupedEvents = groupEventsByType(filteredEvents);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Spinner size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center">
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-xl">
                    <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-lg font-medium">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6 md:space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Event Stats</h1>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1">
                        View performance statistics for all your events
                    </p>
                </div>

                {/* Search */}
                <div className="relative w-full md:w-80">
                    <input
                        type="text"
                        placeholder="Search events..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 dark:bg-netflix-gray dark:text-white rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors duration-300"
                    />
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            {/* Summary Stats - Glass Cards - 2x2 on mobile */}
            {analytics && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                    {/* Total Events - Indigo Glass */}
                    <div className="p-3 sm:p-4 md:p-5 rounded-xl bg-indigo-500/10 backdrop-blur-md border border-indigo-400/30 hover:border-indigo-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10">
                        <p className="text-[10px] sm:text-xs md:text-sm font-medium text-indigo-400">Total Events</p>
                        <p className="text-lg sm:text-2xl md:text-3xl font-bold mt-0.5 sm:mt-1 text-white">{analytics.totalEvents}</p>
                        <p className="text-[9px] sm:text-xs text-indigo-300/70 mt-0.5 sm:mt-1 truncate">
                            {analytics.publishedEvents} published · {analytics.draftEvents} drafts
                        </p>
                    </div>
                    {/* Total Revenue - Emerald Glass */}
                    <div className="p-3 sm:p-4 md:p-5 rounded-xl bg-emerald-500/10 backdrop-blur-md border border-emerald-400/30 hover:border-emerald-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10">
                        <p className="text-[10px] sm:text-xs md:text-sm font-medium text-emerald-400">Total Revenue</p>
                        <p className="text-lg sm:text-2xl md:text-3xl font-bold mt-0.5 sm:mt-1 text-white">₹{analytics.totalRevenue.toLocaleString()}</p>
                    </div>
                    {/* Tickets Sold - Cyan Glass */}
                    <div className="p-3 sm:p-4 md:p-5 rounded-xl bg-cyan-500/10 backdrop-blur-md border border-cyan-400/30 hover:border-cyan-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10">
                        <p className="text-[10px] sm:text-xs md:text-sm font-medium text-cyan-400">Tickets Sold</p>
                        <p className="text-lg sm:text-2xl md:text-3xl font-bold mt-0.5 sm:mt-1 text-white">{analytics.totalTicketsSold.toLocaleString()}</p>
                    </div>
                    {/* Avg. Attendance - Orange/Amber Glass */}
                    <div className="p-3 sm:p-4 md:p-5 rounded-xl bg-orange-500/10 backdrop-blur-md border border-orange-400/30 hover:border-orange-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10">
                        <p className="text-[10px] sm:text-xs md:text-sm font-medium text-orange-400">Avg. Attendance</p>
                        <p className="text-lg sm:text-2xl md:text-3xl font-bold mt-0.5 sm:mt-1 text-white">{analytics.averageAttendanceRate.toFixed(1)}%</p>
                    </div>
                </div>
            )}

            {/* Events List - Vertical on Mobile, Grid with Horizontal Scroll on Desktop */}
            <div className="space-y-3 sm:space-y-4">
                {filteredEvents.length === 0 ? (
                    <Card className="p-8 sm:p-12 text-center bg-white dark:bg-netflix-dark">
                        <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 dark:text-gray-600 mx-auto mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm sm:text-lg text-gray-500 dark:text-gray-400">No events found</p>
                        {searchQuery && (
                            <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 mt-1">Try adjusting your search query</p>
                        )}
                    </Card>
                ) : (
                    <>
                        {/* Mobile: Vertical Stacked List */}
                        <div className="md:hidden space-y-3">
                            {filteredEvents.map((event) => (
                                <EventCard key={event.eventId} event={event} formatDate={formatDate} getStatusColor={getStatusColor} />
                            ))}
                        </div>

                        {/* Desktop: Grouped by Type with Horizontal Scroll */}
                        <div className="hidden md:block space-y-6">
                            {Object.entries(groupedEvents).map(([eventType, events]) => (
                                <div key={eventType} className="space-y-3">
                                    {/* Section Header */}
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                            <span className="px-3 py-1 text-xs font-medium rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-400">
                                                {eventType}
                                            </span>
                                            <span className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                                                ({events.length} event{events.length !== 1 ? 's' : ''})
                                            </span>
                                        </h2>
                                    </div>

                                    {/* Horizontal Scrolling Container */}
                                    <div className="relative -mx-6 lg:-mx-8 px-6 lg:px-8">
                                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
                                            {events.map((event) => (
                                                <div key={event.eventId} className="flex-shrink-0 w-[360px] snap-start">
                                                    <EventCard event={event} formatDate={formatDate} getStatusColor={getStatusColor} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div >
    );
};

interface EventCardProps {
    event: EventAnalyticsDto;
    formatDate: (date: string) => string;
    getStatusColor: (status: string) => string;
}

const EventCard = ({ event, formatDate, getStatusColor }: EventCardProps) => {
    const totalCapacity = event.ticketTypeAnalytics.reduce((sum, t) => sum + t.totalAvailable, 0);
    const ticketsSoldPercentage = totalCapacity > 0 ? Math.round((event.totalTicketsSold / totalCapacity) * 100) : 0;

    return (
        <Link to={`/events/${event.eventId}/analytics`}>
            <Card className="p-4 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-indigo-200 dark:hover:border-indigo-700 cursor-pointer group bg-white dark:bg-netflix-dark">
                {/* Event Name */}
                <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-2">
                    {event.eventName}
                </h3>

                {/* Status Badges */}
                <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${getStatusColor(event.eventStatus)}`}>
                        {event.eventStatus}
                    </span>
                    {event.eventType && (
                        <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                            {event.eventType}
                        </span>
                    )}
                </div>

                {/* Date */}
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    Date: {formatDate(event.startTime)}
                </p>

                {/* Stats Grid - 3 columns */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">Revenue</p>
                        <p className="text-sm font-bold text-green-500">₹{event.totalRevenue.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">Tickets</p>
                        <p className="text-sm font-bold text-cyan-500">{event.totalTicketsSold}</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">Attendance</p>
                        <p className="text-sm font-bold text-white">{event.overallAttendanceRate.toFixed(0)}%</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3">
                    <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                        <span>Tickets Sold</span>
                        <span>{event.totalTicketsSold} / {totalCapacity}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div
                            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${ticketsSoldPercentage}%` }}
                        />
                    </div>
                </div>
            </Card>
        </Link>
    );
};

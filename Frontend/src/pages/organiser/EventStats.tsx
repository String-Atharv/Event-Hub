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
            case 'COMPLETED': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredEvents = analytics?.eventAnalytics.filter(event =>
        event.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.venue.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

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
                <div className="bg-red-50 text-red-600 p-6 rounded-xl">
                    <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-lg font-medium">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Event Stats</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
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
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-netflix-gray dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-300"
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            {/* Summary Stats */}
            {analytics && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="p-5 bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                        <p className="text-sm font-medium text-indigo-100">Total Events</p>
                        <p className="text-3xl font-bold mt-1">{analytics.totalEvents}</p>
                        <p className="text-xs text-indigo-200 mt-1">
                            {analytics.publishedEvents} published · {analytics.draftEvents} drafts
                        </p>
                    </Card>
                    <Card className="p-5 bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                        <p className="text-sm font-medium text-green-100">Total Revenue</p>
                        <p className="text-3xl font-bold mt-1">₹{analytics.totalRevenue.toLocaleString()}</p>
                    </Card>
                    <Card className="p-5 bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
                        <p className="text-sm font-medium text-blue-100">Tickets Sold</p>
                        <p className="text-3xl font-bold mt-1">{analytics.totalTicketsSold.toLocaleString()}</p>
                    </Card>
                    <Card className="p-5 bg-gradient-to-br from-orange-500 to-red-500 text-white">
                        <p className="text-sm font-medium text-orange-100">Avg. Attendance</p>
                        <p className="text-3xl font-bold mt-1">{analytics.averageAttendanceRate.toFixed(1)}%</p>
                    </Card>
                </div>
            )}

            {/* Events List */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">All Events</h2>

                {filteredEvents.length === 0 ? (
                    <Card className="p-12 text-center">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-lg text-gray-500">No events found</p>
                        {searchQuery && (
                            <p className="text-sm text-gray-400 mt-1">Try adjusting your search query</p>
                        )}
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredEvents.map((event) => (
                            <EventCard key={event.eventId} event={event} formatDate={formatDate} getStatusColor={getStatusColor} />
                        ))}
                    </div>
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
            <Card className="p-6 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-indigo-200 cursor-pointer group">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {event.eventName}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getStatusColor(event.eventStatus)}`}>
                                {event.eventStatus}
                            </span>
                            {event.eventType && (
                                <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                    {event.eventType}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-600 transition-colors">
                        <svg className="w-5 h-5 text-indigo-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </div>

                {/* Event Details */}
                <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {event.venue}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDate(event.startTime)}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Revenue</p>
                        <p className="text-lg font-bold text-green-600">₹{event.totalRevenue.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Tickets</p>
                        <p className="text-lg font-bold text-blue-600">{event.totalTicketsSold}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Attendance</p>
                        <p className="text-lg font-bold text-purple-600">{event.overallAttendanceRate.toFixed(0)}%</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <span>Tickets Sold</span>
                        <span>{event.totalTicketsSold} / {totalCapacity}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${ticketsSoldPercentage}%` }}
                        />
                    </div>
                </div>
            </Card>
        </Link>
    );
};

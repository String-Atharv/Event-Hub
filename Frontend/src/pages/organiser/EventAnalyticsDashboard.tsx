import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { analyticsApi } from '@/api/endpoints/analytics';
import { EventAnalyticsDto, EventAttendee } from '@/types/analytics';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/feedback/Spinner';

export const EventAnalyticsDashboard = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const [analytics, setAnalytics] = useState<EventAnalyticsDto | null>(null);
    const [attendees, setAttendees] = useState<EventAttendee[]>([]);
    const [loading, setLoading] = useState(true);
    const [attendeesLoading, setAttendeesLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showAttendeesModal, setShowAttendeesModal] = useState(false);

    // Search and filter state
    const [searchName, setSearchName] = useState('');
    const [selectedTicketType, setSelectedTicketType] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    useEffect(() => {
        if (eventId) {
            fetchAnalytics();
        }
    }, [eventId]);

    useEffect(() => {
        if (eventId && showAttendeesModal) {
            fetchAttendees();
        }
    }, [searchName, selectedTicketType, currentPage, showAttendeesModal]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const data = await analyticsApi.getEventAnalytics(eventId!);
            setAnalytics(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    const fetchAttendees = async () => {
        try {
            setAttendeesLoading(true);
            const data = await analyticsApi.getEventAttendees(eventId!, {
                name: searchName || undefined,
                ticketTypeId: selectedTicketType || undefined,
                page: currentPage,
                size: 10
            });
            setAttendees(data.content);
            setTotalPages(data.totalPages);
            setTotalElements(data.totalElements);
        } catch (err: any) {
            console.error('Failed to load attendees:', err);
        } finally {
            setAttendeesLoading(false);
        }
    };

    const handleSearch = () => {
        setCurrentPage(0);
        fetchAttendees();
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Spinner size="lg" />
            </div>
        );
    }

    if (error || !analytics) {
        return (
            <div className="p-8 text-center text-red-600">
                {error || 'Event not found'}
            </div>
        );
    }

    const totalCapacity = analytics.ticketTypeAnalytics.reduce((sum, t) => sum + t.totalAvailable, 0);
    const remainingTickets = totalCapacity - analytics.totalTicketsSold;
    const ticketsSoldPercentage = totalCapacity > 0 ? Math.round((analytics.totalTicketsSold / totalCapacity) * 100) : 0;
    const attendeesPercentage = analytics.totalTicketsSold > 0
        ? Math.round((analytics.totalAttendeesValidated / analytics.totalTicketsSold) * 100)
        : 0;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{analytics.eventName}</h1>
                    <div className="flex items-center gap-3 mt-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${analytics.eventStatus === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                            analytics.eventStatus === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                            }`}>
                            {analytics.eventStatus}
                        </span>
                        {analytics.eventType && (
                            <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                {analytics.eventType}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex gap-3">
                    <Link to={`/events/${eventId}/edit`}>
                        <Button variant="outline">Edit</Button>
                    </Link>
                    <Link to={`/events/${eventId}/tickets`}>
                        <Button variant="outline">Manage Tickets</Button>
                    </Link>
                    <Link to={`/events/${eventId}/staff`}>
                        <Button variant="outline">Manage Staff</Button>
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Revenue */}
                <Card className="p-6 border-l-4 border-green-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Revenue</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">₹{analytics.totalRevenue.toLocaleString()}</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </Card>

                {/* Tickets Sold */}
                <Card className="p-6 border-l-4 border-blue-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Tickets Sold</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                {analytics.totalTicketsSold} / {totalCapacity}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">{remainingTickets} remaining</p>
                        </div>
                        <div className="flex flex-col items-end">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                </svg>
                            </div>
                            <span className="text-sm font-medium text-blue-600 mt-2">{ticketsSoldPercentage}%</span>
                        </div>
                    </div>
                    <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${ticketsSoldPercentage}%` }}
                        />
                    </div>
                </Card>

                {/* Current Attendees */}
                <Card className="p-6 border-l-4 border-purple-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Current Attendees</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.totalAttendeesValidated}</p>
                            <p className="text-sm text-gray-500 mt-1">{attendeesPercentage}% of ticket holders</p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                    </div>
                    <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${attendeesPercentage}%` }}
                        />
                    </div>
                </Card>
            </div>

            {/* Ticket Performance Table */}
            <Card className="overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Ticket Performance</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sold / Cap</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {analytics.ticketTypeAnalytics.map((ticket) => {
                                const isSelling = ticket.ticketsSold < ticket.totalAvailable;
                                return (
                                    <tr key={ticket.ticketTypeId}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {ticket.ticketTypeName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {ticket.ticketsSold} / {ticket.totalAvailable}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-medium rounded ${isSelling ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {isSelling ? 'Selling' : 'Sold Out'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                                            ₹{ticket.revenue.toLocaleString()}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* View Attendees Button Card */}
            <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900">Event Attendees</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                {analytics.totalAttendeesValidated} checked-in attendees
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={() => setShowAttendeesModal(true)}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300"
                    >
                        <span className="flex items-center gap-2">
                            View Attendees
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </span>
                    </Button>
                </div>
            </Card>

            {/* Attendees Modal */}
            {showAttendeesModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                        onClick={() => setShowAttendeesModal(false)}
                    />

                    {/* Modal */}
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl transform transition-all">
                            {/* Modal Header */}
                            <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-2xl">
                                <div>
                                    <h3 className="text-xl font-bold text-white">Event Attendees</h3>
                                    <p className="text-indigo-100 text-sm mt-1">{totalElements} total attendees</p>
                                </div>
                                <button
                                    onClick={() => setShowAttendeesModal(false)}
                                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Filters */}
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex gap-4 flex-wrap">
                                {/* Filter by Ticket Type */}
                                <select
                                    value={selectedTicketType}
                                    onChange={(e) => {
                                        setSelectedTicketType(e.target.value);
                                        setCurrentPage(0);
                                    }}
                                    className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                >
                                    <option value="">All Ticket Types</option>
                                    {analytics.ticketTypeAnalytics.map((ticket) => (
                                        <option key={ticket.ticketTypeId} value={ticket.ticketTypeId}>
                                            {ticket.ticketTypeName}
                                        </option>
                                    ))}
                                </select>

                                {/* Search Input */}
                                <div className="relative flex-1 min-w-[250px]">
                                    <input
                                        type="text"
                                        placeholder="Search by name..."
                                        value={searchName}
                                        onChange={(e) => setSearchName(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>

                            {/* Attendees Table */}
                            <div className="max-h-[60vh] overflow-y-auto">
                                {attendeesLoading ? (
                                    <div className="p-12 flex justify-center">
                                        <Spinner size="lg" />
                                    </div>
                                ) : attendees.length === 0 ? (
                                    <div className="p-12 text-center">
                                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <p className="text-gray-500 text-lg">No attendees found</p>
                                        <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filter</p>
                                    </div>
                                ) : (
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50 sticky top-0">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User Name</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ticket Type</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Check-in Date</th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Method</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-100">
                                            {attendees.map((attendee) => (
                                                <tr key={attendee.validationId} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mr-4 shadow-sm">
                                                                <span className="text-sm font-bold text-white">
                                                                    {attendee.attendeeName.charAt(0).toUpperCase()}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-semibold text-gray-900">{attendee.attendeeName}</p>
                                                                <p className="text-xs text-gray-500">{attendee.attendeeEmail}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                        {attendee.ticketType}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                        {formatDate(attendee.validatedAt)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-3 py-1.5 text-xs font-medium rounded-full ${attendee.validationMethod === 'QR'
                                                            ? 'bg-blue-100 text-blue-700'
                                                            : 'bg-gray-100 text-gray-700'
                                                            }`}>
                                                            {attendee.validationMethod}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>

                            {/* Pagination Footer */}
                            {totalPages > 1 && (
                                <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center bg-gray-50 rounded-b-2xl">
                                    <p className="text-sm text-gray-600">
                                        Showing <span className="font-semibold">{currentPage * 10 + 1}</span> to <span className="font-semibold">{Math.min((currentPage + 1) * 10, totalElements)}</span> of <span className="font-semibold">{totalElements}</span> attendees
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(p => p - 1)}
                                            disabled={currentPage === 0}
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(p => p + 1)}
                                            disabled={currentPage >= totalPages - 1}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

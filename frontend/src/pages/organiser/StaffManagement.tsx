import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsApi, ListEventResponseDto } from '@/api/endpoints/events';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { format } from 'date-fns';

export const StaffManagement = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState<ListEventResponseDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        const fetchEvents = async () => {
            setIsLoading(true);
            try {
                const response = await eventsApi.getAll(page, 10);
                setEvents(response.content);
                setTotalPages(response.totalPages);
            } catch (err) {
                console.error('Failed to fetch events:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchEvents();
    }, [page]);

    const formatDate = (dateStr: string) => {
        try {
            return format(new Date(dateStr), 'PPp');
        } catch {
            return dateStr;
        }
    };

    const getStatusBadge = (status: string) => {
        const statusStyles: Record<string, string> = {
            DRAFT: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
            PUBLISHED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
            COMPLETED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        };
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Staff Management</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Select an event to manage its staff members
                    </p>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 dark:border-gray-700 border-t-blue-600"></div>
                </div>
            ) : events.length === 0 ? (
                <Card className="p-8 text-center">
                    <div className="text-gray-500 dark:text-gray-400 mb-4">
                        <svg className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-lg font-medium text-gray-900 dark:text-white">No events found</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Create an event first to manage staff</p>
                    </div>
                    <Button variant="primary" onClick={() => navigate('/events/create')}>
                        Create Event
                    </Button>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {events.map((event) => (
                        <Card
                            key={event.id}
                            className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => navigate(`/events/${event.id}/staff`)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{event.name}</h3>
                                        {getStatusBadge(event.eventStatus)}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                        <p>
                                            <span className="font-medium">Date:</span> {formatDate(event.startTime)}
                                        </p>
                                        <p>
                                            <span className="font-medium">Venue:</span> {event.venue}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/events/${event.id}/staff`);
                                        }}
                                    >
                                        Manage Staff
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Page {page + 1} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.max(0, p - 1))}
                            disabled={page === 0}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => p + 1)}
                            disabled={page >= totalPages - 1}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

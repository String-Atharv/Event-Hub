import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { publishedEventsApi, PublishedEventDto } from '@/api/endpoints/publishedEvents';
import { ticketsApi } from '@/api/endpoints/tickets';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/common/ThemeToggle';

export const EventTicketsPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
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
            navigate('/login');
            return;
        }

        try {
            setPurchasingTicketType(ticketTypeId);
            setError(null);

            await ticketsApi.purchaseTicket(ticketTypeId);
            setPurchaseSuccess(true);

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

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
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

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-netflix-black flex justify-center items-center transition-colors duration-300">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 dark:border-gray-700 border-t-cyan-500"></div>
            </div>
        );
    }

    if (error && !event) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-netflix-black flex flex-col justify-center items-center transition-colors duration-300">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Event Not Found</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
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

    if (!event) return null;

    const salesActive = isSalesActive(event);
    const posterUrl = event.imageUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=600&fit=crop';

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-netflix-black transition-colors duration-300">
            {/* Header */}
            <header className="bg-white dark:bg-netflix-dark border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 transition-colors duration-300">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate(`/published-events/${id}`)}
                                className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <div>
                                <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{event.name}</h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {formatDate(event.startTime)} • {formatTime(event.startTime)}
                                </p>
                            </div>
                        </div>
                        <ThemeToggle />
                    </div>
                </div>
            </header>

            {/* Success Message */}
            {purchaseSuccess && (
                <div className="bg-green-50 dark:bg-green-500/20 border-b border-green-200 dark:border-green-500/30 py-4 transition-colors duration-300">
                    <div className="max-w-4xl mx-auto px-4">
                        <div className="flex items-center gap-3">
                            <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <p className="text-green-800 dark:text-green-400 font-semibold">Ticket purchased successfully!</p>
                                <p className="text-green-600 dark:text-green-300 text-sm">Redirecting to your tickets...</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && !purchaseSuccess && (
                <div className="bg-red-50 dark:bg-red-500/20 border-b border-red-200 dark:border-red-500/30 py-4 transition-colors duration-300">
                    <div className="max-w-4xl mx-auto px-4">
                        <div className="flex items-center gap-3">
                            <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-red-800 dark:text-red-400">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Event Summary Card */}
            <div className="max-w-4xl mx-auto px-4 py-6">
                <div className="bg-white dark:bg-netflix-dark rounded-xl p-4 border border-gray-200 dark:border-gray-800 flex gap-4 mb-6 shadow-sm transition-colors duration-300">
                    <img
                        src={posterUrl}
                        alt={event.name}
                        className="w-20 h-28 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                        <h2 className="font-semibold text-gray-900 dark:text-white truncate">{event.name}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{event.venue}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(event.startTime)}</p>
                    </div>
                </div>

                {/* Sales Status */}
                {!salesActive && (
                    <div className="bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/30 rounded-lg p-4 mb-6 transition-colors duration-300">
                        <p className="text-yellow-800 dark:text-yellow-400 font-medium">
                            {event.salesStartDate && new Date() < new Date(event.salesStartDate)
                                ? `Sales start on ${formatDate(event.salesStartDate)}`
                                : 'Ticket sales have ended'}
                        </p>
                    </div>
                )}

                {/* Ticket Types */}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select Tickets</h3>
                <div className="space-y-4">
                    {event.ticketTypes.map((ticket) => {
                        const isSoldOut = ticket.totalAvailable !== undefined && ticket.totalAvailable <= 0;
                        const isPurchasing = purchasingTicketType === ticket.id;

                        return (
                            <div
                                key={ticket.id}
                                className={`bg-white dark:bg-netflix-dark rounded-xl p-5 border transition-all shadow-sm ${isSoldOut
                                    ? 'border-gray-200 dark:border-gray-800 opacity-60'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-cyan-400 dark:hover:border-cyan-500/50'
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900 dark:text-white text-lg">{ticket.name}</h4>
                                        {ticket.totalAvailable !== undefined && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                {isSoldOut ? (
                                                    <span className="text-red-600 dark:text-red-400">Sold Out</span>
                                                ) : (
                                                    `${ticket.totalAvailable} tickets available`
                                                )}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{ticket.price}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handlePurchase(ticket.id)}
                                    disabled={!salesActive || isSoldOut || isPurchasing || purchaseSuccess}
                                    className={`w-full mt-4 py-3 rounded-lg font-semibold transition-all ${!salesActive || isSoldOut || purchaseSuccess
                                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                        : isPurchasing
                                            ? 'bg-cyan-600 text-white'
                                            : 'bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg shadow-cyan-500/20'
                                        }`}
                                >
                                    {isSoldOut
                                        ? 'Sold Out'
                                        : !salesActive
                                            ? 'Not Available'
                                            : isPurchasing
                                                ? 'Processing...'
                                                : purchaseSuccess
                                                    ? 'Purchased!'
                                                    : isAuthenticated
                                                        ? 'Buy Now'
                                                        : 'Login to Buy'}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* View Tickets Link */}
                {isAuthenticated && (
                    <div className="mt-8 text-center">
                        <Link
                            to="/my-tickets"
                            className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 text-sm font-medium inline-flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                            </svg>
                            View Your Tickets
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

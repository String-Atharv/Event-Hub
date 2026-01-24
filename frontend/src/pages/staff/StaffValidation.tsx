import { useState, useEffect } from 'react';
import { staffValidationApi } from '@/api/endpoints/staff';
import {
    TicketValidationResponse,
    StaffValidationStats,
} from '@/types';
import { Card } from '@/components/common/Card';
import { QRScanner } from '@/components/QRScanner';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';

export const StaffValidation = () => {
    const { user } = useAuth();
    const [validationResult, setValidationResult] = useState<TicketValidationResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Stats & History
    const [stats, setStats] = useState<StaffValidationStats | null>(null);
    const [history, setHistory] = useState<TicketValidationResponse[]>([]);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const data = await staffValidationApi.getMyStats();
            setStats(data);
        } catch (err) {
            console.error('Failed to fetch stats', err);
        }
    };

    const handleValidationComplete = (result: TicketValidationResponse) => {
        setValidationResult(result);
        setError(null);
        // Add to history
        setHistory(prev => [result, ...prev].slice(0, 50));
        // Refresh stats
        fetchStats();
    };

    const handleError = (errorMessage: string) => {
        setError(errorMessage);
        setValidationResult(null);
    };

    // Calculate validated count from local history + stats
    const validatedCount = stats?.validatedCount ?? history.length;

    return (
        <div className="max-w-4xl mx-auto space-y-6 p-4">
            {/* Header & Stats */}
            <div className="bg-white dark:bg-netflix-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors duration-300">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ticket Validation</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Event: <span className="font-semibold text-gray-900 dark:text-white">
                            {stats ? (stats.eventName || 'Unknown Event') : 'Loading Event...'}
                        </span>
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                            <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                Attendees Validated: {validatedCount}
                            </span>
                            <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">by {user?.username || user?.name || 'Staff'}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column: Scanner Component */}
                <div>
                    <QRScanner
                        onValidationComplete={handleValidationComplete}
                        onError={handleError}
                        validatedHistory={history}
                    />
                </div>

                {/* Right Column: Result Card Only */}
                <div className="space-y-6">
                    {/* Result Card */}
                    {(validationResult || error) && (
                        <Card className={`p-6 border-l-4 ${validationResult?.message === 'Ticket validated successfully'
                            ? 'border-l-green-500 dark:border-l-green-400 shadow-md bg-white dark:bg-netflix-dark'
                            : 'border-l-red-500 dark:border-l-red-400 shadow-md bg-white dark:bg-netflix-dark'
                            }`}>
                            {validationResult ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-bold text-green-700 dark:text-green-400">Valid Ticket</h2>
                                        <span className="p-2 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 rounded-full">
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </span>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Attendee</p>
                                            <p className="font-bold text-lg text-gray-900 dark:text-white">{validationResult.attendeeName}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Type</p>
                                                <p className="font-semibold text-gray-900 dark:text-white">{validationResult.ticketTypeName}</p>
                                            </div>
                                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Time</p>
                                                <p className="font-medium text-gray-900 dark:text-white">{format(new Date(), 'h:mm a')}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-center text-sm text-green-600 dark:text-green-400 font-medium">
                                        {validationResult.message}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3 text-center py-4">
                                    <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </div>
                                    <h2 className="text-lg font-bold text-red-800 dark:text-red-400">Validation Failed</h2>
                                    <p className="text-red-600 dark:text-red-300">{error}</p>
                                </div>
                            )}
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

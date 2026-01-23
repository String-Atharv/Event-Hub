import { useEffect, useState } from 'react';
import { analyticsApi } from '@/api/endpoints/analytics';
import { OrganiserCompleteAnalyticsDto } from '@/types/analytics';
import { MetricCard } from './MetricCard';
import { Spinner } from '@/components/feedback/Spinner';

export const DashboardOverview = () => {
    const [analytics, setAnalytics] = useState<OrganiserCompleteAnalyticsDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchAnalytics();

        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchAnalytics, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchAnalytics = async () => {
        try {
            setError(null);
            console.log('Fetching analytics summary...');
            const data = await analyticsApi.getCompleteAnalytics();
            console.log('Received analytics data:', data);
            setAnalytics(data);
        } catch (err: any) {
            console.error('Failed to fetch analytics:', err);
            setError(err.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Spinner /></div>;

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 text-center text-red-600">
                <p>Failed to load analytics: {error}</p>
                <button
                    onClick={() => { setLoading(true); fetchAnalytics(); }}
                    className="mt-2 text-sm font-medium underline hover:text-red-800"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <MetricCard
                title="Total Events"
                value={analytics?.totalEvents || 0}
                icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                }
                description={`${analytics?.publishedEvents || 0} published`}
            />
            <MetricCard
                title="Total Tickets Sold"
                value={analytics?.totalTicketsSold || 0}
                icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                }
            />
            <MetricCard
                title="Total Revenue"
                value={`₹${analytics?.totalRevenue?.toLocaleString() || 0}`}
                icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                }
                highlight
            />
            <MetricCard
                title="Total Attendees"
                value={analytics?.totalAttendeesValidated || 0}
                icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                }
                description={`${analytics?.averageAttendanceRate?.toFixed(1) || 0}% avg rate`}
            />
        </div>
    );
};

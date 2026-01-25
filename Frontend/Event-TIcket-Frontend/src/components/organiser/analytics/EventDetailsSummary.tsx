import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { analyticsApi } from '@/api/endpoints/analytics';
import { EventAnalyticsDto } from '@/types/analytics';
import { Spinner } from '@/components/feedback/Spinner';
import { DrillDownSection } from './DrillDownSection';
import { AnalyticsPanel } from './AnalyticsPanel';
import { Card } from '@/components/common/Card';

interface SummaryCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    clickable?: boolean;
}

const SummaryCard = ({ title, value, subtitle, icon, onClick, clickable }: SummaryCardProps) => (
    <Card
        className={`p-6 shadow-sm transition-all ${clickable ? 'cursor-pointer hover:shadow-md hover:border-gray-300' : ''}`}
        onClick={onClick}
    >
        <div className="flex justify-between items-start">
            <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
                {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
                {clickable && <p className="text-xs text-blue-600 mt-3 font-medium">Click to see breakdown</p>}
            </div>
            {icon && (
                <div className="p-3 bg-gray-100 rounded-lg text-gray-600">
                    {icon}
                </div>
            )}
        </div>
    </Card>
);

export const EventDetailsSummary = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const [analytics, setAnalytics] = useState<EventAnalyticsDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedDrillDown, setSelectedDrillDown] = useState<'revenue' | 'attendees' | 'tickets' | null>(null);
    const [showAnalytics, setShowAnalytics] = useState(false);

    useEffect(() => {
        if (eventId) {
            fetchEventAnalytics();

            // Auto-refresh every 30 seconds
            const interval = setInterval(fetchEventAnalytics, 30000);
            return () => clearInterval(interval);
        }
    }, [eventId]);

    const fetchEventAnalytics = async () => {
        try {
            const data = await analyticsApi.getEventAnalytics(eventId!);
            setAnalytics(data);
        } catch (error) {
            console.error('Failed to fetch event analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Spinner /></div>;

    return (
        <div className="space-y-6 mb-8">
            {/* Summary Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SummaryCard
                    title="Total Revenue"
                    value={`₹${analytics?.totalRevenue?.toLocaleString() || 0}`}
                    icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                    onClick={() => setSelectedDrillDown('revenue')}
                    clickable
                />
                <SummaryCard
                    title="Total Attendees"
                    value={analytics?.totalAttendeesValidated || 0}
                    subtitle={`${analytics?.overallAttendanceRate?.toFixed(1) || 0}% attendance rate`}
                    icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    }
                    onClick={() => setSelectedDrillDown('attendees')}
                    clickable
                />
                <SummaryCard
                    title="Total Tickets Sold"
                    value={analytics?.totalTicketsSold || 0}
                    icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                        </svg>
                    }
                    onClick={() => setSelectedDrillDown('tickets')}
                    clickable
                />
            </div>

            {/* Analytics Button */}
            <div className="flex justify-start">
                <button
                    onClick={() => setShowAnalytics(!showAnalytics)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center shadow-sm"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    {showAnalytics ? 'Hide Full Analytics' : 'Show Full Analytics'}
                </button>
            </div>

            {/* Drill-down Modal/Section */}
            {selectedDrillDown && (
                <DrillDownSection
                    type={selectedDrillDown}
                    analytics={analytics}
                    onClose={() => setSelectedDrillDown(null)}
                />
            )}

            {/* Full Analytics Panel */}
            {showAnalytics && (
                <AnalyticsPanel analytics={analytics} />
            )}
        </div>
    );
};

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { organiserDashboardApi } from '@/api/endpoints/organiser';
import { eventsApi, EventCreatedResponseDto } from '@/api/endpoints/events';
import {
    EventValidationStats,
    TicketTypeAttendance,
    StaffValidationStats,
} from '@/types';
import { Card } from '@/components/common/Card';
import { Spinner } from '@/components/feedback/Spinner';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

import { StaffDetailModal } from '@/components/modals/StaffDetailModal';
import { EventDetailsSummary } from '@/components/organiser/analytics/EventDetailsSummary';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const EventDashboard = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const [event, setEvent] = useState<EventCreatedResponseDto | null>(null);
    const [stats, setStats] = useState<EventValidationStats | null>(null);
    const [ticketStats, setTicketStats] = useState<TicketTypeAttendance[]>([]);
    const [staffStats, setStaffStats] = useState<StaffValidationStats[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal State
    const [selectedStaff, setSelectedStaff] = useState<StaffValidationStats | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!eventId) return;

            try {
                setIsLoading(true);
                setError(null);
                const [eventData, statsData, ticketData, staffData] = await Promise.all([
                    eventsApi.getById(eventId),
                    organiserDashboardApi.getEventStats(eventId),
                    organiserDashboardApi.getTicketTypeStats(eventId),
                    organiserDashboardApi.getStaffStats(eventId),
                ]);

                setEvent(eventData);
                setStats(statsData);
                setTicketStats(ticketData);
                setStaffStats(staffData);
            } catch (err: any) {
                console.error('Failed to fetch dashboard data', err);
                setError(err.message || 'Failed to load dashboard data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [eventId]);

    if (isLoading) return <div className="flex justify-center p-12"><Spinner size="lg" /></div>;
    if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
    if (!stats) return <div className="p-8 text-center">No data available</div>;



    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Event Dashboard</h1>
                <p className="text-gray-600 text-lg">{event?.name}</p>
            </div>

            {/* Section 1: Analytics Overview */}
            <EventDetailsSummary />

            {/* Section 2: Ticket Type Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-6 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                        </svg>
                        Attendance by Ticket Type
                    </h3>
                    <div className="space-y-4">
                        {ticketStats.map((type, index) => (
                            <div key={type.ticketTypeId} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium text-gray-700">{type.ticketTypeName}</span>
                                    <span className="text-gray-600 font-medium">{type.validatedCount} checked in</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-1000 ease-out"
                                        style={{
                                            width: `${Math.min(100, (type.validatedCount / (stats.totalTicketsSold || 1)) * 100)}%`,
                                            backgroundColor: COLORS[index % COLORS.length]
                                        }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Staff Performance Chart */}
                <Card className="p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-6 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Staff Performance
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={staffStats} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis
                                    dataKey="staffUsername"
                                    tick={{ fontSize: 12, fill: '#6B7280' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    allowDecimals={false}
                                    tick={{ fontSize: 12, fill: '#6B7280' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: '#F3F4F6' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Bar dataKey="validatedCount" fill="#4F46E5" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Section 3: Staff List */}
            <Card className="overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900">Staff Validation Details</h3>
                    <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded border">Ordered by Activity</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff Member</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Validations</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {staffStats.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-8 text-center text-gray-500">No staff activity yet</td>
                                </tr>
                            ) : (
                                staffStats
                                    .sort((a, b) => b.validatedCount - a.validatedCount)
                                    .map((staff) => (
                                        <tr
                                            key={staff.staffUserId}
                                            className="hover:bg-gray-50 transition-colors cursor-pointer"
                                            onClick={() => {
                                                setSelectedStaff(staff);
                                                setIsModalOpen(true);
                                            }}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                <div className="flex items-center">
                                                    <div className="h-8 w-8 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center mr-3 font-bold text-xs">
                                                        {staff.staffUsername.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    {staff.staffUsername}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {staff.staffUsername}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    {staff.validatedCount}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Detail Modal */}
            {selectedStaff && (
                <StaffDetailModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    eventId={eventId || ''}
                    staffUserId={selectedStaff.staffUserId}
                    staffName={selectedStaff.staffUsername}
                />
            )}
        </div>
    );
};

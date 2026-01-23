import { EventAnalyticsDto } from '@/types/analytics';

interface AnalyticsPanelProps {
    analytics: EventAnalyticsDto | null;
}

interface MetricBoxProps {
    label: string;
    value: string | number;
}

const MetricBox = ({ label, value }: MetricBoxProps) => (
    <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
);

export const AnalyticsPanel = ({ analytics }: AnalyticsPanelProps) => {
    if (!analytics) return null;

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
            <h2 className="text-2xl font-bold">Complete Event Analytics</h2>

            {/* Overall Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricBox label="Tickets Sold" value={analytics.totalTicketsSold} />
                <MetricBox label="Revenue" value={`₹${analytics.totalRevenue.toLocaleString()}`} />
                <MetricBox label="Attendees" value={analytics.totalAttendeesValidated} />
                <MetricBox label="Attendance Rate" value={`${analytics.overallAttendanceRate.toFixed(1)}%`} />
            </div>

            {/* Ticket Type Table */}
            <div>
                <h3 className="text-xl font-semibold mb-4">Ticket Type Breakdown</h3>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-100 border-b">
                                <th className="p-3 text-left font-medium text-gray-700">Ticket Type</th>
                                <th className="p-3 text-right font-medium text-gray-700">Price</th>
                                <th className="p-3 text-right font-medium text-gray-700">Sold</th>
                                <th className="p-3 text-right font-medium text-gray-700">Revenue</th>
                                <th className="p-3 text-right font-medium text-gray-700">Validated</th>
                                <th className="p-3 text-right font-medium text-gray-700">Rate</th>
                                <th className="p-3 text-right font-medium text-gray-700">Remaining</th>
                            </tr>
                        </thead>
                        <tbody>
                            {analytics.ticketTypeAnalytics.map((type) => (
                                <tr key={type.ticketTypeId} className="border-b hover:bg-gray-50">
                                    <td className="p-3 font-semibold">{type.ticketTypeName}</td>
                                    <td className="p-3 text-right">₹{type.ticketPrice}</td>
                                    <td className="p-3 text-right">{type.ticketsSold}</td>
                                    <td className="p-3 text-right text-green-600 font-medium">₹{type.revenue.toLocaleString()}</td>
                                    <td className="p-3 text-right">{type.validatedCount}</td>
                                    <td className="p-3 text-right">{type.attendanceRate.toFixed(1)}%</td>
                                    <td className="p-3 text-right">{type.totalAvailable - type.ticketsSold}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

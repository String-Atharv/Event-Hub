import { EventAnalyticsDto } from '@/types/analytics';

interface DrillDownProps {
    type: 'revenue' | 'attendees' | 'tickets';
    analytics: EventAnalyticsDto | null;
    onClose: () => void;
}

export const DrillDownSection = ({ type, analytics, onClose }: DrillDownProps) => {
    const renderContent = () => {
        if (!analytics) return null;

        switch (type) {
            case 'revenue':
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold">Revenue Breakdown by Ticket Type</h3>
                        {analytics.ticketTypeAnalytics.map((ticketType) => (
                            <div key={ticketType.ticketTypeId} className="flex justify-between p-4 bg-gray-50 rounded">
                                <span className="font-semibold">{ticketType.ticketTypeName}</span>
                                <div className="text-right">
                                    <div className="text-green-600 font-bold">
                                        ₹{ticketType.revenue.toLocaleString()}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {ticketType.ticketsSold} tickets × ₹{ticketType.ticketPrice}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div className="border-t pt-4 flex justify-between font-bold text-lg">
                            <span>Total Revenue</span>
                            <span className="text-green-600">₹{analytics.totalRevenue.toLocaleString()}</span>
                        </div>
                    </div>
                );

            case 'attendees':
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold">Attendees by Ticket Type</h3>
                        {analytics.ticketTypeAnalytics.map((ticketType) => (
                            <div key={ticketType.ticketTypeId} className="flex justify-between p-4 bg-gray-50 rounded">
                                <span className="font-semibold">{ticketType.ticketTypeName}</span>
                                <div className="text-right">
                                    <div className="font-bold">
                                        {ticketType.validatedCount} / {ticketType.ticketsSold}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {ticketType.attendanceRate.toFixed(1)}% attendance
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div className="border-t pt-4 flex justify-between font-bold text-lg">
                            <span>Total Attendees</span>
                            <span>{analytics.totalAttendeesValidated}</span>
                        </div>
                    </div>
                );

            case 'tickets':
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold">Tickets Sold by Type</h3>
                        {analytics.ticketTypeAnalytics.map((ticketType) => (
                            <div key={ticketType.ticketTypeId} className="flex justify-between p-4 bg-gray-50 rounded">
                                <span className="font-semibold">{ticketType.ticketTypeName}</span>
                                <div className="text-right">
                                    <div className="font-bold">{ticketType.ticketsSold} sold</div>
                                    <div className="text-sm text-gray-600">
                                        {ticketType.totalAvailable - ticketType.ticketsSold} remaining
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        out of {ticketType.totalAvailable || 'unlimited'}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div className="border-t pt-4 flex justify-between font-bold text-lg">
                            <span>Total Tickets Sold</span>
                            <span>{analytics.totalTicketsSold}</span>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                <button
                    onClick={onClose}
                    className="float-right text-gray-600 hover:text-gray-800 p-1"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                {renderContent()}
            </div>
        </div>
    );
};

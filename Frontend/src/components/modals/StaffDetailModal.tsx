import { useState, useEffect } from 'react';
import { organiserDashboardApi } from '@/api/endpoints/organiser';
import { ValidationHistory } from '@/types';
import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/feedback/Spinner';
import { format } from 'date-fns';

interface StaffDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    eventId: string;
    staffUserId: string;
    staffName: string;
}

export const StaffDetailModal = ({ isOpen, onClose, eventId, staffUserId, staffName }: StaffDetailModalProps) => {
    const [history, setHistory] = useState<ValidationHistory[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isOpen && eventId && staffUserId) {
            const fetchHistory = async () => {
                try {
                    setIsLoading(true);
                    const response = await organiserDashboardApi.getStaffValidationDetails(eventId, staffUserId);
                    // Handle pagination if response is wrapped, or direct array
                    // Assuming the API might return Page<ValidationHistory> or ValidationHistory[]
                    // We'll safely check for .content
                    setHistory(Array.isArray(response) ? response : (response as any).content || []);
                } catch (err) {
                    console.error('Failed to fetch staff history', err);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchHistory();
        }
    }, [isOpen, eventId, staffUserId]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">

                {/* Header */}
                <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-900">Validation History: <span className="text-blue-600">{staffName}</span></h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {isLoading ? (
                        <div className="flex justify-center py-8"><Spinner size="md" /></div>
                    ) : history.length === 0 ? (
                        <p className="text-center text-gray-500">No validations found for this staff member.</p>
                    ) : (
                        <div className="space-y-4">
                            {history.map((record) => (
                                <div key={record.validationId} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
                                    <div>
                                        <p className="font-medium text-gray-900">{record.attendeeName}</p>
                                        <p className="text-sm text-gray-500">{record.attendeeEmail} • {record.ticketTypeName}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${record.validationStatus === 'VALID' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {record.validationStatus}
                                        </span>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {format(new Date(record.validatedAt), 'PP p')}
                                        </p>
                                        <p className="text-xs text-gray-400 uppercase tracking-wider">{record.validationMethod}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
                    <Button variant="outline" onClick={onClose}>Close</Button>
                </div>

            </div>
        </div>
    );
};

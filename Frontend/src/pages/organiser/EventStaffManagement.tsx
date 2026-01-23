import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { staffApi } from '@/api/endpoints/staff';
import { eventsApi, EventCreatedResponseDto } from '@/api/endpoints/events';
import {
    StaffGenerationRequest,
    StaffGenerationResponse,
    StaffMemberDto,
} from '@/types';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Card } from '@/components/common/Card';
import { format } from 'date-fns';

// Tab type
type TabType = 'generate' | 'manage';

export const EventStaffManagement = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const [activeTab, setActiveTab] = useState<TabType>('generate');
    const [event, setEvent] = useState<EventCreatedResponseDto | null>(null);
    const [staffMembers, setStaffMembers] = useState<StaffMemberDto[]>([]);
    const [generatedResponse, setGeneratedResponse] = useState<StaffGenerationResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingStaff, setIsLoadingStaff] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showActiveOnly, setShowActiveOnly] = useState(false);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // Action states
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [resetPasswordResult, setResetPasswordResult] = useState<{ userId: string; password: string } | null>(null);
    const [confirmResetUserId, setConfirmResetUserId] = useState<string | null>(null);
    const [extendHours, setExtendHours] = useState<{ userId: string; hours: number } | null>(null);

    // ... (lines 38-113)

    // Reset password - Open Confirmation
    const handleResetPassword = (userId: string) => {
        setConfirmResetUserId(userId);
    };

    // Execute Reset Logic
    const executeResetPassword = async () => {
        if (!eventId || !confirmResetUserId) return;

        setActionLoading(confirmResetUserId);
        try {
            const result = await staffApi.resetStaffPassword(eventId, confirmResetUserId);
            // Close confirm modal
            setConfirmResetUserId(null);
            // Show result modal
            setResetPasswordResult({ userId: confirmResetUserId, password: result.newPassword });
        } catch (err: any) {
            alert(err.message || 'Failed to reset password');
            setConfirmResetUserId(null);
        } finally {
            setActionLoading(null);
        }
    };

    const { register, handleSubmit, formState: { errors }, reset } = useForm<StaffGenerationRequest>({
        defaultValues: {
            count: 5,
            validityHours: 48,
        },
    });

    // Fetch event details
    useEffect(() => {
        if (eventId) {
            eventsApi.getById(eventId).then(setEvent).catch(console.error);
        }
    }, [eventId]);

    // Fetch staff members
    const fetchStaffMembers = async () => {
        if (!eventId) return;

        setIsLoadingStaff(true);
        try {
            const response = showActiveOnly
                ? await staffApi.getActiveEventStaff(eventId, page, 20)
                : await staffApi.getEventStaff(eventId, page, 20);

            setStaffMembers(response.content);
            setTotalPages(response.totalPages);
            setTotalElements(response.totalElements);
        } catch (err: any) {
            console.error('Failed to fetch staff:', err);
        } finally {
            setIsLoadingStaff(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'manage') {
            fetchStaffMembers();
        }
    }, [eventId, activeTab, page, showActiveOnly]);

    // Generate staff accounts
    const onSubmitGenerate = async (data: StaffGenerationRequest) => {
        if (!eventId) return;

        try {
            setIsLoading(true);
            setError(null);
            setGeneratedResponse(null);

            const response = await staffApi.generateStaffForEvent(eventId, data);
            setGeneratedResponse(response);
            reset();
        } catch (err: any) {
            setError(err.message || 'Failed to generate staff accounts');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    // Delete staff member
    const handleDeleteStaff = async (userId: string, username: string) => {
        if (!eventId) return;
        if (!confirm(`Are you sure you want to delete staff member "${username}"?`)) return;

        setActionLoading(userId);
        try {
            await staffApi.deleteStaffMember(eventId, userId);
            await fetchStaffMembers();
        } catch (err: any) {
            alert(err.message || 'Failed to delete staff member');
        } finally {
            setActionLoading(null);
        }
    };



    // Extend validity
    const handleExtendValidity = async () => {
        if (!eventId || !extendHours) return;

        setActionLoading(extendHours.userId);
        try {
            const result = await staffApi.extendStaffValidity(eventId, extendHours.userId, extendHours.hours);
            alert(`Validity extended until ${format(new Date(result.newValidUntil), 'PPpp')}`);
            setExtendHours(null);
            await fetchStaffMembers();
        } catch (err: any) {
            alert(err.message || 'Failed to extend validity');
        } finally {
            setActionLoading(null);
        }
    };

    const formatDateTime = (dateStr: string) => {
        try {
            return format(new Date(dateStr), 'PPpp');
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
                    {event && (
                        <p className="text-gray-600 mt-1">
                            Event: <span className="font-medium">{event.name}</span>
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                        {totalElements} Staff Members
                    </span>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="flex space-x-8">
                    <button
                        onClick={() => setActiveTab('generate')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'generate'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Generate Staff
                    </button>
                    <button
                        onClick={() => setActiveTab('manage')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'manage'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Manage Staff
                    </button>
                </nav>
            </div>

            {/* Generate Tab */}
            {activeTab === 'generate' && (
                <div className="max-w-2xl space-y-6">
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Generate Staff Accounts</h2>
                        <p className="text-gray-600 mb-6">
                            Create multiple staff accounts at once with specified validity periods.
                            Staff members can verify tickets and manage event check-ins.
                        </p>

                        <form onSubmit={handleSubmit(onSubmitGenerate)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Number of Accounts"
                                    type="number"
                                    {...register('count', {
                                        required: 'Count is required',
                                        min: { value: 1, message: 'Minimum 1 account' },
                                        max: { value: 50, message: 'Maximum 50 accounts at once' },
                                    })}
                                    error={errors.count?.message}
                                />
                                <Input
                                    label="Validity (Hours)"
                                    type="number"
                                    {...register('validityHours', {
                                        required: 'Validity is required',
                                        min: { value: 1, message: 'Minimum 1 hour' },
                                        max: { value: 720, message: 'Maximum 30 days (720 hours)' },
                                    })}
                                    error={errors.validityHours?.message}
                                />
                            </div>

                            <div className="pt-4">
                                <Button type="submit" variant="primary" isLoading={isLoading}>
                                    Generate Accounts
                                </Button>
                            </div>
                        </form>

                        {error && (
                            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
                                {error}
                            </div>
                        )}
                    </Card>

                    {/* Generated Credentials Display */}
                    {generatedResponse && (
                        <Card className="p-6 bg-green-50 border-green-200">
                            <h3 className="text-lg font-bold text-green-800 mb-2">
                                ✓ {generatedResponse.staffCount} Account(s) Generated Successfully
                            </h3>
                            <p className="text-green-700 mb-4">
                                Valid from <strong>{formatDateTime(generatedResponse.validFrom)}</strong> until{' '}
                                <strong>{formatDateTime(generatedResponse.validUntil)}</strong>
                            </p>
                            <p className="text-sm text-green-600 mb-4">
                                <strong>Important:</strong> Save these credentials securely. Passwords will not be shown again.
                            </p>

                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {generatedResponse.credentials.map((cred, index) => (
                                    <div
                                        key={cred.staffUserId}
                                        className="bg-white p-4 rounded-lg border border-green-100"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-500">
                                                Staff #{index + 1}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                            <div>
                                                <span className="text-gray-500">Username:</span>
                                                <p className="font-mono font-medium">{cred.username}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Password:</span>
                                                <p className="font-mono font-bold text-green-700">{cred.password}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </div>
            )}

            {/* Manage Tab */}
            {activeTab === 'manage' && (
                <div className="space-y-4">
                    {/* Filters */}
                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={showActiveOnly}
                                onChange={(e) => {
                                    setShowActiveOnly(e.target.checked);
                                    setPage(0);
                                }}
                                className="rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-700">Show active only</span>
                        </label>
                        <Button variant="outline" size="sm" onClick={fetchStaffMembers} isLoading={isLoadingStaff}>
                            Refresh
                        </Button>
                    </div>

                    {/* Staff Table */}
                    <div className="bg-white rounded-lg border overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valid Until</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {isLoadingStaff ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                            Loading...
                                        </td>
                                    </tr>
                                ) : staffMembers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                            No staff members found
                                        </td>
                                    </tr>
                                ) : (
                                    staffMembers.map((staff) => (
                                        <tr key={staff.id} className={staff.isExpired ? 'bg-gray-50' : ''}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <p className="font-mono text-sm font-medium text-gray-900">{staff.username}</p>
                                                    <p className="text-xs text-gray-500">{staff.email}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {staff.isExpired ? (
                                                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                                                        Expired
                                                    </span>
                                                ) : staff.isActive ? (
                                                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                                                        Inactive
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDateTime(staff.validUntil)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {staff.lastLogin ? formatDateTime(staff.lastLogin) : 'Never'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                <button
                                                    onClick={() => setExtendHours({ userId: staff.staffUserId, hours: 24 })}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    disabled={actionLoading === staff.staffUserId}
                                                >
                                                    Extend
                                                </button>
                                                <button
                                                    onClick={() => handleResetPassword(staff.staffUserId)}
                                                    className="text-yellow-600 hover:text-yellow-900"
                                                    disabled={actionLoading === staff.staffUserId}
                                                >
                                                    Reset
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteStaff(staff.staffUserId, staff.username)}
                                                    className="text-red-600 hover:text-red-900"
                                                    disabled={actionLoading === staff.staffUserId}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500">
                                Showing page {page + 1} of {totalPages}
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
            )}

            {/* Reset Password Confirmation Modal */}
            {confirmResetUserId && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-bold mb-4">Reset Password?</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to reset the password for this staff member?
                            The old password will stop working immediately.
                        </p>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setConfirmResetUserId(null)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white"
                                onClick={executeResetPassword}
                                isLoading={!!actionLoading}
                            >
                                Confirm Reset
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {resetPasswordResult && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-bold mb-4 text-green-700">New Password Generated</h3>
                        <p className="text-gray-600 mb-4">
                            Please copy and share this password with the staff member.
                            <br />
                            <span className="text-sm text-red-500">It will not be shown again.</span>
                        </p>
                        <div className="bg-gray-100 p-4 rounded-lg mb-6 border border-gray-200 text-center">
                            <p className="font-mono text-xl font-bold tracking-wider select-all">
                                {resetPasswordResult.password}
                            </p>
                        </div>
                        <Button
                            variant="primary"
                            className="w-full"
                            onClick={() => setResetPasswordResult(null)}
                        >
                            Done
                        </Button>
                    </div>
                </div>
            )}

            {/* Extend Validity Modal */}
            {extendHours && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-bold mb-4">Extend Validity Period</h3>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Extend by (hours)
                            </label>
                            <input
                                type="number"
                                value={extendHours.hours}
                                onChange={(e) =>
                                    setExtendHours({ ...extendHours, hours: parseInt(e.target.value) || 0 })
                                }
                                min={1}
                                max={720}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setExtendHours(null)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                className="flex-1"
                                onClick={handleExtendValidity}
                                isLoading={actionLoading === extendHours.userId}
                            >
                                Extend
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

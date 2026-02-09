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
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                    <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white truncate">Staff Management</h1>
                    {event && (
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1 truncate">
                            Event: <span className="font-medium">{event.name}</span>
                        </p>
                    )}
                </div>
                <div className="flex-shrink-0">
                    <span className="px-2 sm:px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-full text-[10px] sm:text-xs font-medium whitespace-nowrap">
                        {totalElements} Staff Members
                    </span>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-800">
                <nav className="flex space-x-4 sm:space-x-8">
                    <button
                        onClick={() => setActiveTab('generate')}
                        className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors ${activeTab === 'generate'
                            ? 'border-violet-500 text-violet-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                    >
                        Generate Staff
                    </button>
                    <button
                        onClick={() => setActiveTab('manage')}
                        className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors ${activeTab === 'manage'
                            ? 'border-violet-500 text-violet-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
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
                        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Generate Staff Accounts</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
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
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-6 py-3 rounded-xl font-medium text-violet-400 bg-violet-500/10 backdrop-blur-md border border-violet-400/30 hover:border-violet-400/60 hover:bg-violet-500/20 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/20 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            Generate Accounts
                                        </>
                                    )}
                                </button>
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
                        <Card className="p-6 bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/50">
                            <h3 className="text-lg font-bold text-green-800 dark:text-green-400 mb-2">
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
                                        className="bg-white dark:bg-netflix-gray p-4 rounded-lg border border-green-100 dark:border-green-900/30"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                Staff #{index + 1}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                            <div>
                                                <span className="text-gray-500 dark:text-gray-400">Email:</span>
                                                <p className="font-mono font-medium text-gray-900 dark:text-white">{cred.email}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 dark:text-gray-400">Password:</span>
                                                <p className="font-mono font-bold text-green-700 dark:text-green-400">{cred.password}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </div>
            )
            }

            {/* Manage Tab */}
            {
                activeTab === 'manage' && (
                    <div className="space-y-3 sm:space-y-4">
                        {/* Filters */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={showActiveOnly}
                                    onChange={(e) => {
                                        setShowActiveOnly(e.target.checked);
                                        setPage(0);
                                    }}
                                    className="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-netflix-gray"
                                />
                                <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">Show active only</span>
                            </label>
                            <button
                                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl font-medium text-gray-400 bg-white/5 backdrop-blur-md border border-gray-400/30 hover:border-gray-400/60 hover:bg-white/10 transition-all duration-300 text-xs sm:text-sm disabled:opacity-50"
                                onClick={fetchStaffMembers}
                                disabled={isLoadingStaff}
                            >
                                {isLoadingStaff ? 'Refreshing...' : 'Refresh'}
                            </button>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden space-y-3">
                            {isLoadingStaff ? (
                                <div className="text-center py-8 text-gray-500 text-sm">Loading...</div>
                            ) : staffMembers.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 text-sm">No staff members found</div>
                            ) : (
                                staffMembers.map((staff) => (
                                    <Card key={staff.id} className={`p-3 ${staff.isExpired ? 'opacity-60' : ''}`}>
                                        {/* Header Row - Account & Status */}
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-sm text-violet-400 truncate">
                                                    {staff.username}
                                                </p>
                                            </div>
                                            <div className="flex-shrink-0 ml-2">
                                                {staff.isExpired ? (
                                                    <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400">
                                                        Status: Expired
                                                    </span>
                                                ) : staff.isActive ? (
                                                    <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                                                        Status: Active
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                                                        Status: Inactive
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Valid Until */}
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                                            Valid Until: {formatDateTime(staff.validUntil)}
                                        </p>

                                        {/* Action Buttons - 3 columns */}
                                        <div className="grid grid-cols-3 gap-2">
                                            <button
                                                onClick={() => setExtendHours({ userId: staff.staffUserId, hours: 24 })}
                                                className="px-2 py-2 rounded-lg text-xs font-medium text-gray-400 bg-transparent border border-gray-600 hover:border-blue-500/50 hover:text-blue-400 hover:bg-blue-500/10 hover:shadow-sm hover:shadow-blue-500/20 transition-all duration-200 disabled:opacity-50 active:scale-95"
                                                disabled={actionLoading === staff.staffUserId}
                                            >
                                                Extend
                                            </button>
                                            <button
                                                onClick={() => handleResetPassword(staff.staffUserId)}
                                                className="px-2 py-2 rounded-lg text-xs font-medium text-gray-400 bg-transparent border border-gray-600 hover:border-amber-500/50 hover:text-amber-400 hover:bg-amber-500/10 hover:shadow-sm hover:shadow-amber-500/20 transition-all duration-200 disabled:opacity-50 active:scale-95"
                                                disabled={actionLoading === staff.staffUserId}
                                            >
                                                Reset
                                            </button>
                                            <button
                                                onClick={() => handleDeleteStaff(staff.staffUserId, staff.username)}
                                                className="px-2 py-2 rounded-lg text-xs font-medium text-gray-400 bg-transparent border border-gray-600 hover:border-red-500/50 hover:text-red-400 hover:bg-red-500/10 hover:shadow-sm hover:shadow-red-500/20 transition-all duration-200 disabled:opacity-50 active:scale-95"
                                                disabled={actionLoading === staff.staffUserId}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </Card>
                                ))
                            )}
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden md:block bg-white dark:bg-netflix-dark rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                                <thead className="bg-gray-50 dark:bg-netflix-gray">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Staff Account</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Valid Until</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Login</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-netflix-dark divide-y divide-gray-200 dark:divide-gray-800">
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
                                            <tr key={staff.id} className={staff.isExpired ? 'bg-gray-50 dark:bg-netflix-gray/20' : 'hover:bg-gray-50 dark:hover:bg-netflix-gray/10'}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <p className="font-medium text-sm text-gray-900 dark:text-white">{staff.email}</p>
                                                        <p className="font-mono text-xs text-gray-500 dark:text-gray-400">{staff.username}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {staff.isExpired ? (
                                                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400">
                                                            Expired
                                                        </span>
                                                    ) : staff.isActive ? (
                                                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                                                            Active
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                                                            Inactive
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    {formatDateTime(staff.validUntil)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    {staff.lastLogin ? formatDateTime(staff.lastLogin) : 'Never'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                    <button
                                                        onClick={() => setExtendHours({ userId: staff.staffUserId, hours: 24 })}
                                                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                                                        disabled={actionLoading === staff.staffUserId}
                                                    >
                                                        Extend
                                                    </button>
                                                    <button
                                                        onClick={() => handleResetPassword(staff.staffUserId)}
                                                        className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-900 dark:hover:text-yellow-300"
                                                        disabled={actionLoading === staff.staffUserId}
                                                    >
                                                        Reset
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteStaff(staff.staffUserId, staff.username)}
                                                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
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
                                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                    Page {page + 1} / {totalPages}
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl font-medium text-gray-400 bg-white/5 backdrop-blur-md border border-gray-400/30 hover:border-gray-400/60 hover:bg-white/10 transition-all duration-300 disabled:opacity-50 text-xs sm:text-sm"
                                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                                        disabled={page === 0}
                                    >
                                        Previous
                                    </button>
                                    <button
                                        className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl font-medium text-gray-400 bg-white/5 backdrop-blur-md border border-gray-400/30 hover:border-gray-400/60 hover:bg-white/10 transition-all duration-300 disabled:opacity-50 text-xs sm:text-sm"
                                        onClick={() => setPage((p) => p + 1)}
                                        disabled={page >= totalPages - 1}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )
            }

            {/* Reset Password Confirmation Modal */}
            {
                confirmResetUserId && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-netflix-dark rounded-lg p-6 max-w-md w-full mx-4 border border-gray-200 dark:border-gray-800">
                            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Reset Password?</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Are you sure you want to reset the password for this staff member?
                                The old password will stop working immediately.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    className="flex-1 px-4 py-2.5 rounded-xl font-medium text-gray-400 bg-white/5 backdrop-blur-md border border-gray-400/30 hover:border-gray-400/60 hover:bg-white/10 transition-all duration-300"
                                    onClick={() => setConfirmResetUserId(null)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="flex-1 px-4 py-2.5 rounded-xl font-medium text-amber-400 bg-amber-500/10 backdrop-blur-md border border-amber-400/30 hover:border-amber-400/60 hover:bg-amber-500/20 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/20 disabled:opacity-50"
                                    onClick={executeResetPassword}
                                    disabled={!!actionLoading}
                                >
                                    {actionLoading ? 'Resetting...' : 'Confirm Reset'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Success Modal */}
            {
                resetPasswordResult && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-netflix-dark rounded-lg p-6 max-w-md w-full mx-4 border border-gray-200 dark:border-gray-800">
                            <h3 className="text-lg font-bold mb-4 text-green-700 dark:text-green-400">New Password Generated</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Please copy and share this password with the staff member.
                                <br />
                                <span className="text-sm text-red-500">It will not be shown again.</span>
                            </p>
                            <div className="bg-gray-100 dark:bg-netflix-gray p-4 rounded-lg mb-6 border border-gray-200 dark:border-gray-700 text-center">
                                <p className="font-mono text-xl font-bold tracking-wider select-all text-gray-900 dark:text-white">
                                    {resetPasswordResult.password}
                                </p>
                            </div>
                            <button
                                className="w-full px-4 py-2.5 rounded-xl font-medium text-emerald-400 bg-emerald-500/10 backdrop-blur-md border border-emerald-400/30 hover:border-emerald-400/60 hover:bg-emerald-500/20 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20"
                                onClick={() => setResetPasswordResult(null)}
                            >
                                Done
                            </button>
                        </div>
                    </div>
                )
            }

            {/* Extend Validity Modal */}
            {
                extendHours && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-netflix-dark rounded-lg p-6 max-w-md w-full mx-4 border border-gray-200 dark:border-gray-800">
                            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Extend Validity Period</h3>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-netflix-gray text-gray-900 dark:text-white"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    className="flex-1 px-4 py-2.5 rounded-xl font-medium text-gray-400 bg-white/5 backdrop-blur-md border border-gray-400/30 hover:border-gray-400/60 hover:bg-white/10 transition-all duration-300"
                                    onClick={() => setExtendHours(null)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="flex-1 px-4 py-2.5 rounded-xl font-medium text-violet-400 bg-violet-500/10 backdrop-blur-md border border-violet-400/30 hover:border-violet-400/60 hover:bg-violet-500/20 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/20 disabled:opacity-50"
                                    onClick={handleExtendValidity}
                                    disabled={actionLoading === extendHours.userId}
                                >
                                    {actionLoading === extendHours.userId ? 'Extending...' : 'Extend'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

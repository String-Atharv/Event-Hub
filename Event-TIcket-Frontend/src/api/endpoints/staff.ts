import apiClient from '../client';
import {
    StaffGenerationRequest,
    StaffGenerationResponse,
    StaffMemberDto,
    PaginatedResponse,
    PasswordResetResponse,
    ExtendValidityResponse,
    TicketValidationResponse,
    TicketSearchResult,
    StaffValidationStats,
    ValidationHistory,
} from '@/types';

// ============================================================
// ORGANISER APIs (for managing staff)
// These endpoints are for organisers to manage their staff
// ============================================================
export const staffApi = {
    /**
     * Generate staff accounts for a specific event
     */
    generateStaffForEvent: async (
        eventId: string,
        data: StaffGenerationRequest
    ): Promise<StaffGenerationResponse> => {
        const response = await apiClient.post<StaffGenerationResponse>(
            `/staff/events/${eventId}/generate`,
            data
        );
        return response.data;
    },

    /**
     * Get all staff members for an event (paginated)
     */
    getEventStaff: async (
        eventId: string,
        page: number = 0,
        size: number = 20
    ): Promise<PaginatedResponse<StaffMemberDto>> => {
        const response = await apiClient.get<PaginatedResponse<StaffMemberDto>>(
            `/staff/events/${eventId}`,
            { params: { page, size } }
        );
        return response.data;
    },

    /**
     * Get active staff members for an event (paginated)
     */
    getActiveEventStaff: async (
        eventId: string,
        page: number = 0,
        size: number = 20
    ): Promise<PaginatedResponse<StaffMemberDto>> => {
        const response = await apiClient.get<PaginatedResponse<StaffMemberDto>>(
            `/staff/events/${eventId}/active`,
            { params: { page, size } }
        );
        return response.data;
    },

    /**
     * Delete a staff member from an event
     */
    deleteStaffMember: async (eventId: string, userId: string): Promise<void> => {
        await apiClient.delete(`/staff/events/${eventId}/users/${userId}`);
    },

    /**
     * Reset password for a staff member
     */
    resetStaffPassword: async (
        eventId: string,
        userId: string
    ): Promise<PasswordResetResponse> => {
        const response = await apiClient.post<PasswordResetResponse>(
            `/staff/events/${eventId}/users/${userId}/reset-password`,
            {}
        );
        return response.data;
    },

    /**
     * Extend validity period for a staff member
     */
    extendStaffValidity: async (
        eventId: string,
        userId: string,
        hours: number
    ): Promise<ExtendValidityResponse> => {
        const response = await apiClient.post<ExtendValidityResponse>(
            `/staff/events/${eventId}/users/${userId}/extend-validity`,
            null,
            { params: { hours } }
        );
        return response.data;
    },
};

// ============================================================
// STAFF VALIDATION APIs (for staff members only)
// These endpoints require ROLE_STAFF
// Frontend guards prevent unauthorized calls for better UX
// ============================================================

/**
 * Helper to check if current user has STAFF role
 * Returns boolean based on stored user data
 */
const checkStaffRole = (): boolean => {
    try {
        const storedUser = localStorage.getItem('keycloak_user');
        if (!storedUser) return false;

        const user = JSON.parse(storedUser);
        return user?.roles?.includes('ROLE_STAFF') === true;
    } catch {
        return false;
    }
};

/**
 * Error thrown when non-staff user tries to call staff-only API
 */
class UnauthorizedRoleError extends Error {
    constructor() {
        super('You are not authorised to access staff validation features.');
        this.name = 'UnauthorizedRoleError';
    }
}

export const staffValidationApi = {
    /**
     * Validate ticket by QR code scan
     * POST /api/v1/staff/validation/scan
     * ⚠️ STAFF ROLE REQUIRED
     */
    validateByQR: async (qrCode: string): Promise<TicketValidationResponse> => {
        // Frontend guard: prevent API call if user is not STAFF
        if (!checkStaffRole()) {
            throw new UnauthorizedRoleError();
        }

        console.log('[API] Validating by QR with payload:', { qrCode });

        const response = await apiClient.post<TicketValidationResponse>(
            '/staff/validation/scan',
            { qrCode }
        );
        return response.data;
    },

    /**
     * Validate ticket manually by QR code (publicCode)
     * POST /api/v1/staff/validation/manual
     * Request body: { "qrCode": "STRING" }
     * ⚠️ STAFF ROLE REQUIRED
     */
    validateManually: async (qrCode: string): Promise<TicketValidationResponse> => {
        // Frontend guard: prevent API call if user is not STAFF
        if (!checkStaffRole()) {
            throw new UnauthorizedRoleError();
        }

        console.log('[API] Validating manually with payload:', { qrCode });

        const response = await apiClient.post<TicketValidationResponse>(
            '/staff/validation/manual',
            { qrCode }
        );
        return response.data;
    },

    /**
     * Search for ticket before manual validation
     * GET /api/v1/staff/validation/search?qrCode={qrCode}
     * ⚠️ STAFF ROLE REQUIRED
     */
    searchTicket: async (qrCode: string): Promise<TicketSearchResult[]> => {
        // Frontend guard: prevent API call if user is not STAFF
        if (!checkStaffRole()) {
            throw new UnauthorizedRoleError();
        }

        const response = await apiClient.get<TicketSearchResult[]>(
            '/staff/validation/search',
            { params: { qrCode } }
        );
        return response.data;
    },

    /**
     * Get staff's own validation statistics
     * GET /api/v1/staff/validation/stats
     * ⚠️ STAFF ROLE REQUIRED
     */
    getMyStats: async (): Promise<StaffValidationStats> => {
        // Frontend guard: prevent API call if user is not STAFF
        if (!checkStaffRole()) {
            throw new UnauthorizedRoleError();
        }

        const response = await apiClient.get<StaffValidationStats>(
            '/staff/validation/stats'
        );
        return response.data;
    },

    /**
     * Get list of attendees validated by this staff member
     * GET /api/v1/staff/validation/my-validations
     * ⚠️ STAFF ROLE REQUIRED
     */
    getMyValidatedAttendees: async (
        page: number = 0,
        size: number = 20
    ): Promise<PaginatedResponse<ValidationHistory>> => {
        // Frontend guard: prevent API call if user is not STAFF
        if (!checkStaffRole()) {
            throw new UnauthorizedRoleError();
        }

        const response = await apiClient.get<PaginatedResponse<ValidationHistory>>(
            '/staff/validation/my-validations',
            { params: { page, size } }
        );
        return response.data;
    },
};

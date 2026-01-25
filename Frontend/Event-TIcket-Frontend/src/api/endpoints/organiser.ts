import apiClient from '../client';
import {
    PaginatedResponse,
    EventValidationStats,
    TicketTypeAttendance,
    StaffValidationStats,
    ValidationHistory,
} from '@/types';

export const organiserDashboardApi = {
    /**
     * Get overall event validation statistics
     * GET /api/v1/organiser/events/{eventId}/dashboard/stats
     */
    getEventStats: async (eventId: string): Promise<EventValidationStats> => {
        const response = await apiClient.get<EventValidationStats>(
            `/organiser/events/${eventId}/dashboard/stats`
        );
        return response.data;
    },

    /**
     * Get validations per ticket type
     * GET /api/v1/organiser/events/{eventId}/dashboard/ticket-types
     */
    getTicketTypeStats: async (eventId: string): Promise<TicketTypeAttendance[]> => {
        const response = await apiClient.get<TicketTypeAttendance[]>(
            `/organiser/events/${eventId}/dashboard/ticket-types`
        );
        return response.data;
    },

    /**
     * Get validations per staff member
     * GET /api/v1/organiser/events/{eventId}/dashboard/staff
     */
    getStaffStats: async (eventId: string): Promise<StaffValidationStats[]> => {
        const response = await apiClient.get<StaffValidationStats[]>(
            `/organiser/events/${eventId}/dashboard/staff`
        );
        return response.data;
    },

    /**
     * Get detailed attendee list validated by specific staff
     * GET /api/v1/organiser/events/{eventId}/dashboard/staff/{staffUserId}/validations
     */
    getStaffValidationDetails: async (
        eventId: string,
        staffUserId: string,
        page: number = 0,
        size: number = 20
    ): Promise<PaginatedResponse<ValidationHistory>> => {
        const response = await apiClient.get<PaginatedResponse<ValidationHistory>>(
            `/organiser/events/${eventId}/dashboard/staff/${staffUserId}/validations`,
            { params: { page, size } }
        );
        return response.data;
    },
};

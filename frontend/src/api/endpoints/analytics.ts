import apiClient from '../client';
import {
    AnalyticsSummary,
    OrganiserCompleteAnalyticsDto,
    EventAnalyticsDto,
    TicketTypePerformanceDto,
    EventAttendeesResponse
} from '@/types/analytics';

export interface GetEventAttendeesParams {
    name?: string;
    userId?: string;
    ticketTypeId?: string;
    page?: number;
    size?: number;
}

export const analyticsApi = {
    getSummary: async (): Promise<AnalyticsSummary> => {
        const response = await apiClient.get<AnalyticsSummary>('/analytics/summary');
        return response.data;
    },

    getCompleteAnalytics: async (): Promise<OrganiserCompleteAnalyticsDto> => {
        const response = await apiClient.get<OrganiserCompleteAnalyticsDto>('/analytics/complete');
        return response.data;
    },

    getEventAnalytics: async (eventId: string): Promise<EventAnalyticsDto> => {
        const response = await apiClient.get<EventAnalyticsDto>(`/analytics/events/${eventId}`);
        return response.data;
    },

    getTicketTypePerformance: async (): Promise<TicketTypePerformanceDto[]> => {
        const response = await apiClient.get<TicketTypePerformanceDto[]>('/analytics/ticket-types/performance');
        return response.data;
    },

    getEventAttendees: async (eventId: string, params?: GetEventAttendeesParams): Promise<EventAttendeesResponse> => {
        const response = await apiClient.get<EventAttendeesResponse>(
            `/organiser/events/${eventId}/dashboard/attendees`,
            { params }
        );
        return response.data;
    }
};

/**
 * Backend API Endpoints Registry
 * 
 * This file serves as a central registry for all backend API routes.
 * Using constants for endpoint paths prevents typos and makes it easier 
 * to handle API versioning or base path changes.
 */

export const API_ENDPOINTS = {
    // Authentication
    AUTH: {
        REGISTER: '/auth/register',
        LOGIN: '/auth/login',
        REFRESH: '/auth/refresh',
        ME: '/auth/me',
        LOGOUT: '/auth/logout',
    },

    // Roles & Permissions
    ROLES: {
        PROMOTE_ORGANISER: '/roles/promote-to-organiser',
        IS_ORGANISER: '/roles/is-organiser',
        AVAILABLE: '/roles/available',
        ME: '/roles/me',
    },

    // Events (Organiser Managed)
    EVENTS: {
        ALL: '/events/listEvent',
        ONE: (id: string) => `/events/getEvent/${id}`,
        CREATE: '/events/createEvent',
        UPDATE: (id: string) => `/events/updateEvent/${id}`,
        DELETE: (id: string) => `/events/${id}`,
        DELETE_TICKET_TYPE: (eventId: string, ticketTypeId: string) => `/events/${eventId}/ticket-types/${ticketTypeId}`,
        STATUS: (id: string) => `/events/${id}/status`,
        VENUE: (id: string) => `/events/${id}/venue`,
        IMAGE: (id: string) => `/events/${id}/image`,
        ANALYTICS: (id: string) => `/events/${id}/analytics`,
    },

    // Published Events (Public Facing)
    PUBLISHED_EVENTS: {
        ALL: '/published-events',
        ONE: (id: string) => `/published-events/${id}`,
    },

    // Tickets
    TICKETS: {
        PURCHASE: (ticketTypeId: number | string) => `/tickets/purchase/${ticketTypeId}`,
        LIST_MY: '/tickets',
        GET_DETAILS: (ticketId: string) => `/tickets/${ticketId}`,
        QR_DETAILS: (ticketId: string) => `/tickets/${ticketId}/qr`,
        GENERATE_QR: (ticketId: string) => `/tickets/${ticketId}/qr`,
        SCAN_QR: '/tickets/scanQr',
        CANCEL: (ticketId: string) => `/tickets/${ticketId}/cancel`,
    },

    // Analytics (Organiser Analytics)
    ANALYTICS: {
        SUMMARY: '/analytics/summary',
        COMPLETE: '/analytics/complete',
        EVENT: (eventId: string) => `/analytics/events/${eventId}`,
        TICKET_PERFORMANCE: '/analytics/ticket-types/performance',
        COMPARE: '/analytics/events/compare',
        PUBLISHED: '/analytics/published',
    },

    // Organiser Dashboard Specifics
    ORGANISER: {
        OVERVIEW: '/organiser/overview',
        REVENUE_TREND: '/organiser/revenue-trend',
        EVENT_STATS: (eventId: string) => `/organiser/events/${eventId}/stats`,
        EVENT_ATTENDEES: (eventId: string) => `/organiser/events/${eventId}/attendees`,
        DASHBOARD_ATTENDEES: (eventId: string) => `/organiser/events/${eventId}/dashboard/attendees`,
        DASHBOARD_STATS: (eventId: string) => `/organiser/events/${eventId}/dashboard/stats`,
        TICKET_TYPES: (eventId: string) => `/organiser/events/${eventId}/dashboard/ticket-types`,
        STAFF: (eventId: string) => `/organiser/events/${eventId}/dashboard/staff`,
        STAFF_VALIDATIONS: (eventId: string, staffUserId: string) => `/organiser/events/${eventId}/dashboard/staff/${staffUserId}/validations`,
        REVENUE: (eventId: string) => `/organiser/events/${eventId}/dashboard/revenue`,
    },

    // Staff Management & Validation
    STAFF: {
        GENERATE: (eventId: string) => `/staff/events/${eventId}/generate`,
        LIST: (eventId: string) => `/staff/events/${eventId}`,
        ACTIVE: (eventId: string) => `/staff/events/${eventId}/active`,
        DELETE: (eventId: string, userId: string) => `/staff/events/${eventId}/users/${userId}`,
        RESET_PASSWORD: (eventId: string, userId: string) => `/staff/events/${eventId}/users/${userId}/reset-password`,
        EXTEND_VALIDITY: (eventId: string, userId: string) => `/staff/events/${eventId}/users/${userId}/extend-validity`,
        STATS: (eventId: string) => `/staff/events/${eventId}/stats`,

        // Staff-only validation endpoints (ROLE_STAFF required)
        VALIDATION_SCAN: '/staff/validation/scan',
        VALIDATION_MANUAL: '/staff/validation/manual',
        VALIDATION_SEARCH: '/staff/validation/search',
        VALIDATION_STATS: '/staff/validation/stats',
        VALIDATION_HISTORY: '/staff/validation/my-validations',
    },
} as const;

export type ApiEndpoints = typeof API_ENDPOINTS;

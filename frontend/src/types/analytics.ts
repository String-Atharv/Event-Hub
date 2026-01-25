export interface TicketTypeAnalyticsDto {
    ticketTypeId: string;
    ticketTypeName: string;
    ticketPrice: number;
    totalAvailable: number;
    ticketsSold: number;
    revenue: number;
    validatedCount: number;
    attendanceRate: number;
}

export interface EventAnalyticsDto {
    eventId: string;
    eventName: string;
    eventStatus: string;
    eventType: string | null;
    venue: string;
    startTime: string;
    endTime: string;
    totalTicketsSold: number;
    totalRevenue: number;
    totalAttendeesValidated: number;
    overallAttendanceRate: number;
    ticketTypeAnalytics: TicketTypeAnalyticsDto[];
}

export interface OrganiserCompleteAnalyticsDto {
    organiserId: string;
    organiserName: string;
    organiserEmail: string;
    totalEvents: number;
    publishedEvents: number;
    draftEvents: number;
    totalTicketsSold: number;
    totalRevenue: number;
    totalAttendeesValidated: number;
    averageAttendanceRate: number;
    eventAnalytics: EventAnalyticsDto[];
    mostRevenueEvent: EventAnalyticsDto | null;
    mostTicketsSoldEvent: EventAnalyticsDto | null;
    bestAttendanceRateEvent: EventAnalyticsDto | null;
}

export interface AnalyticsSummary {
    organiserId: string;
    organiserName: string;
    totalEvents: number;
    publishedEvents: number;
    draftEvents: number;
    totalTicketsSold: number;
    totalRevenue: number;
    totalAttendeesValidated: number;
    averageAttendanceRate: number;
}

export interface TicketTypePerformanceDto {
    ticketTypeName: string;
    totalSold: number;
    totalRevenue: number;
    totalValidated: number;
    averagePrice: number;
    numberOfEvents: number;
}

export interface EventAttendee {
    validationId: string;
    validatedAt: string;
    validationMethod: 'QR' | 'MANUAL';
    attendeeId: string;
    attendeeName: string;
    attendeeEmail: string;
    ticketId: string;
    ticketType: string;
    ticketPrice: number;
}

export interface EventAttendeesResponse {
    content: EventAttendee[];
    totalElements: number;
    totalPages: number;
}

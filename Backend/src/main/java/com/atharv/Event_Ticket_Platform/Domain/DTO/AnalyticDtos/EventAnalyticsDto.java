package com.atharv.Event_Ticket_Platform.Domain.DTO.AnalyticDtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EventAnalyticsDto {
    private
    UUID eventId;
    private String eventName;
    private String eventStatus;
    private String eventType;
    private String venue;
    private LocalDateTime startTime;
    private LocalDateTime endTime;

    // Overall event metrics
    private Long totalTicketsSold;
    private Double totalRevenue;
    private Long totalAttendeesValidated;
    private Double overallAttendanceRate;

    // Breakdown by ticket type
    private List<TicketTypeAnalyticsDto> ticketTypeAnalytics;
}

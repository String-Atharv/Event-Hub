package com.atharv.Event_Ticket_Platform.Domain.DTO.AnalyticDtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class OrganiserCompleteAnalyticsDto {
    private UUID organiserId;
    private String organiserName;
    private String organiserEmail;

    private Integer totalEvents;
    private Integer publishedEvents;
    private Integer draftEvents;
    private Long totalTicketsSold;
    private Double totalRevenue;
    private Long totalAttendeesValidated;
    private Double averageAttendanceRate;

    private List<EventAnalyticsDto> eventAnalytics;

    private EventAnalyticsDto mostRevenueEvent;
    private EventAnalyticsDto mostTicketsSoldEvent;
    private EventAnalyticsDto bestAttendanceRateEvent;
}

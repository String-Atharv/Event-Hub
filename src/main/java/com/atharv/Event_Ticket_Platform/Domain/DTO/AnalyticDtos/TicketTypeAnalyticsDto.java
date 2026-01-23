package com.atharv.Event_Ticket_Platform.Domain.DTO.AnalyticDtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
 public class TicketTypeAnalyticsDto {
    private Integer ticketTypeId;
    private String ticketTypeName;
    private Double price;
    private Integer totalAvailable;
    private Long ticketsSold;
    private Double revenue;
    private Long attendeesValidated;
    private Double attendanceRate; // (validated / sold) * 100
    private Integer remainingTickets;
}
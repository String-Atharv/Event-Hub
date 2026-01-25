package com.atharv.Event_Ticket_Platform.Domain.DTO.AnalyticDtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TicketTypePerformanceDto {
    private String ticketTypeName;
    private Long totalSold;
    private Double totalRevenue;
    private Long totalValidated;
    private Double averagePrice;
    private Integer numberOfEvents; // How many events use this ticket type
}


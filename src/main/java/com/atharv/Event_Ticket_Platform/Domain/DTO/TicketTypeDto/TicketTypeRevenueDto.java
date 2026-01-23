package com.atharv.Event_Ticket_Platform.Domain.DTO.TicketTypeDto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @AllArgsConstructor @NoArgsConstructor @Builder
public class TicketTypeRevenueDto {
    private Integer ticketTypeId;
    private String ticketTypeName;
    private long ticketsSold;
    private double revenue;
    private double averagePrice;
}

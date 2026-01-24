package com.atharv.Event_Ticket_Platform.Domain.DTO.TicketTypeDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @AllArgsConstructor @NoArgsConstructor
public class TicketTypeDetails {
    private Integer id;
    private String name;
    private Double price;
}

package com.atharv.Event_Ticket_Platform.Domain.DTO.TicketTypeDto;

import com.atharv.Event_Ticket_Platform.Domain.Entity.Event;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @AllArgsConstructor @NoArgsConstructor
public class TicketTypeDtoForTicketPurchase {
    private Integer id;
    private String name;
    private Integer totalAvailable;
    private Double price;

}

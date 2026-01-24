package com.atharv.Event_Ticket_Platform.Domain.DTO.TicketDtos;

import com.atharv.Event_Ticket_Platform.Domain.DTO.EventDtos.EventDtoForTicketPurchase;
import com.atharv.Event_Ticket_Platform.Domain.DTO.TicketTypeDto.TicketTypeDtoForTicketPurchase;
import com.atharv.Event_Ticket_Platform.Domain.Entity.TicketType;
import com.atharv.Event_Ticket_Platform.Domain.Enum.TicketStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data @AllArgsConstructor @NoArgsConstructor
public class TicketPurchasedDto {
    private UUID id;
    private Double price;
    private TicketStatus status;
    private TicketTypeDtoForTicketPurchase ticketType;
    private EventDtoForTicketPurchase event;
}

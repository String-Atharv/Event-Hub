package com.atharv.Event_Ticket_Platform.Domain.DTO.EventDtos;

import com.atharv.Event_Ticket_Platform.Domain.Entity.Event;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data @AllArgsConstructor @NoArgsConstructor
public class EventDtoForTicketPurchase {
    private UUID id;
    private String name;
    private LocalDateTime startTime;
    private LocalDateTime endTime;

}

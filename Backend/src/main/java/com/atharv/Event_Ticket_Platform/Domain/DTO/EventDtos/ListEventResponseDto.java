package com.atharv.Event_Ticket_Platform.Domain.DTO.EventDtos;

import com.atharv.Event_Ticket_Platform.Domain.DTO.TicketTypeDto.ListEventTicketTypeResponseDto;
import com.atharv.Event_Ticket_Platform.Domain.Entity.TicketType;
import com.atharv.Event_Ticket_Platform.Domain.Enum.EventStatus;
import com.atharv.Event_Ticket_Platform.Domain.Enum.EventType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data @AllArgsConstructor @NoArgsConstructor
public class ListEventResponseDto {
    private UUID id;
    private String name;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String venue;
    private LocalDateTime salesStartDate;
    private LocalDateTime salesEndDate;
    private EventType eventType;
    private EventStatus eventStatus;
    private List<ListEventTicketTypeResponseDto> ticketTypes=new ArrayList<>();
}

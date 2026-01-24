package com.atharv.Event_Ticket_Platform.Domain.DTO.EventDtos;

import com.atharv.Event_Ticket_Platform.Domain.DTO.TicketTypeDto.UpdatedTicketTypeResponseDto;
import com.atharv.Event_Ticket_Platform.Domain.Entity.TicketType;
import com.atharv.Event_Ticket_Platform.Domain.Enum.EventType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data @NoArgsConstructor @AllArgsConstructor
public class UpdatedEventResponseDto {
    private UUID id;
    private String name;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private EventType eventType;
    private String venue;
    private LocalDateTime salesStartDate;
    private LocalDateTime salesEndDate;
    private List<UpdatedTicketTypeResponseDto> ticketTypes;

}

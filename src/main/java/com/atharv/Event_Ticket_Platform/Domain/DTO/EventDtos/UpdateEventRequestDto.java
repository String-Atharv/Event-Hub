package com.atharv.Event_Ticket_Platform.Domain.DTO.EventDtos;

import com.atharv.Event_Ticket_Platform.Domain.DTO.TicketTypeDto.UpdateTicketTypeRequestDto;

import com.atharv.Event_Ticket_Platform.Domain.Enum.EventType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data @AllArgsConstructor @NoArgsConstructor
public class UpdateEventRequestDto {
    private String name;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String venue;
    private LocalDateTime salesStartDate;
    private LocalDateTime salesEndDate;
    private EventType eventType;
    private List<UpdateTicketTypeRequestDto> ticketTypes=new ArrayList<>();

}

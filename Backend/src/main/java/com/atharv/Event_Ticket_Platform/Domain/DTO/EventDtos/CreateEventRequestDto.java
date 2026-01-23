package com.atharv.Event_Ticket_Platform.Domain.DTO.EventDtos;

import com.atharv.Event_Ticket_Platform.Domain.DTO.TicketTypeDto.CreateTicketTypeRequestDto;
import com.atharv.Event_Ticket_Platform.Domain.Enum.EventType;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateEventRequestDto {

    @NotBlank(message = "event name is required")
    private String name;


    private LocalDateTime startTime;
    private LocalDateTime endTime;
    @NotBlank(message = "venue name is required")
    private String venue;

    private LocalDateTime salesStartDate;
    private LocalDateTime salesEndDate;

    private EventType eventType;

    private String description;
    private List<CreateTicketTypeRequestDto> ticketTypes = new ArrayList<>();


}

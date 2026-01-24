package com.atharv.Event_Ticket_Platform.Domain.Requests;

import com.atharv.Event_Ticket_Platform.Domain.Enum.EventStatus;
import com.atharv.Event_Ticket_Platform.Domain.Enum.EventType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateEventRequest {

    private String name;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String venue;
    private EventType eventType;
    private LocalDateTime salesStartDate;
    private LocalDateTime salesEndDate;
    private String description;
    private List<CreateTicketTypeRequest> ticketTypes = new ArrayList<>();


}

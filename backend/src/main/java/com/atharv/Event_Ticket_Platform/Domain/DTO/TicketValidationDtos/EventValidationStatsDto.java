package com.atharv.Event_Ticket_Platform.Domain.DTO.TicketValidationDtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder @AllArgsConstructor @NoArgsConstructor
public class EventValidationStatsDto {
    private UUID eventId;
    private String eventName;
    private long totalTicketsSold;
    private long totalValidated;
    private long remainingAttendees;
}

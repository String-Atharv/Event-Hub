package com.atharv.Event_Ticket_Platform.Domain.DTO.TicketDtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TicketValidationResponseDto {
    private UUID validationId;
    private UUID ticketId;
    private String ticketTypeName;
    private String attendeeName;
    private String attendeeEmail;
    private String eventName;
    private LocalDateTime validatedAt;
    private String validatedBy; // Staff username
    private String message;
}


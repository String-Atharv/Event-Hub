package com.atharv.Event_Ticket_Platform.Domain.DTO.TicketValidationDtos;

import com.atharv.Event_Ticket_Platform.Domain.Entity.Staff;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Response DTO when staff successfully validates a ticket
 */
@Data @AllArgsConstructor @NoArgsConstructor
@Builder
public class TicketValidationResponseDto {
    private UUID validationId;
    private UUID ticketId;
    private String ticketTypeName;
    private String attendeeName;
    private String attendeeEmail;
    private String eventName;
    private LocalDateTime validatedAt;
    private String validatedBy;  Staff username;
    private String message;
}
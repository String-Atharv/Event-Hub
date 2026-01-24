package com.atharv.Event_Ticket_Platform.Domain.DTO.TicketValidationDtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for displaying validation history
 * Shows recent validations performed by staff
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ValidationHistoryDto {
    private UUID validationId;
    private UUID ticketId;
    private String ticketTypeName;
    private String attendeeName;
    private String attendeeEmail;
    private String validationMethod; // QR or MANUAL
    private String validationStatus; // VALID, INVALID, etc.
    private LocalDateTime validatedAt;
    private String qrCode; // For display purposes (last 4 chars)
}
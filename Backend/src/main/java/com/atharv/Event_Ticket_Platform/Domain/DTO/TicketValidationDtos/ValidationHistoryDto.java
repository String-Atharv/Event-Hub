package com.atharv.Event_Ticket_Platform.Domain.DTO.TicketValidationDtos;

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
public class ValidationHistoryDto {
    private UUID validationId;
    private UUID ticketId;
    private String ticketTypeName;
    private String attendeeName;
    private String attendeeEmail;
    private String validationMethod;
    private String validationStatus;
    private LocalDateTime validatedAt;
    private String qrCode;
}

package com.atharv.Event_Ticket_Platform.Domain.DTO.TicketValidationDtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder @NoArgsConstructor @AllArgsConstructor
public class TicketTypeAttendanceDto {
    private Integer ticketTypeId;
    private String ticketTypeName;
    private long validatedCount;
}


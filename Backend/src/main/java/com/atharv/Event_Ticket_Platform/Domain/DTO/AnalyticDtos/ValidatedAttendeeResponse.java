package com.atharv.Event_Ticket_Platform.Domain.DTO.AnalyticDtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
@AllArgsConstructor
public class ValidatedAttendeeResponse {

    private UUID validationId;
    private LocalDateTime validatedAt;
    private String validationMethod;

    private UUID attendeeId;
    private String attendeeName;
    private String attendeeEmail;

    private UUID ticketId;
    private String ticketType;
    private double ticketPrice;
}

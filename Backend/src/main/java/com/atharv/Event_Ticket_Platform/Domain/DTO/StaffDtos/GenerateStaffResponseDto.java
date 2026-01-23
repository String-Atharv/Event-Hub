package com.atharv.Event_Ticket_Platform.Domain.DTO.StaffDtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class GenerateStaffResponseDto {
    private String message;
    private UUID organiserId;
    private UUID eventId;
    private Integer staffCount;
    private Integer validityHours;
    private LocalDateTime validFrom;
    private LocalDateTime validUntil;
    private List<StaffCredentialWithPasswordDto> credentials;
}

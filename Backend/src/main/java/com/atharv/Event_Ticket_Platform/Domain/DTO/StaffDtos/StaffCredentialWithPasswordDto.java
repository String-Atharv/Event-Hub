package com.atharv.Event_Ticket_Platform.Domain.DTO.StaffDtos;

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
public class StaffCredentialWithPasswordDto {
    private UUID staffUserId;
    private String username;
    private String password; // Only returned during generation
    private String email;
    private LocalDateTime validFrom;
    private LocalDateTime validUntil;
}
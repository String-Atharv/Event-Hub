package com.atharv.Event_Ticket_Platform.Domain.DTO.StaffDtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;


@Data @AllArgsConstructor @NoArgsConstructor @Builder
public class StaffCredentialsDto {
    private Long id;
    private UUID staffUserId;
    private String username;
    private String email;
    private Boolean isActive;
    private LocalDateTime validFrom;
    private LocalDateTime validUntil;
    private Boolean isExpired;
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;
}
package com.atharv.Event_Ticket_Platform.Security.Dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Authentication Request DTO
 * Used for both user and staff login
 * Identifier can be email (for users) or username (for staff)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthenticationRequest {

    @NotBlank(message = "Email or username is required")
    private String identifier; // Email for users, Username for staff

    @NotBlank(message = "Password is required")
    private String password;
}
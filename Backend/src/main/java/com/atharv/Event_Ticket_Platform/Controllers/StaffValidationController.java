package com.atharv.Event_Ticket_Platform.Controllers;

import com.atharv.Event_Ticket_Platform.Domain.DTO.TicketValidationDtos.*;
import com.atharv.Event_Ticket_Platform.Domain.Entity.Ticket;
import com.atharv.Event_Ticket_Platform.Domain.Entity.TicketValidation;
import com.atharv.Event_Ticket_Platform.Security.UserPrincipal;
import com.atharv.Event_Ticket_Platform.Service.ServiceImpl.StaffTicketValidationService;
import com.atharv.Event_Ticket_Platform.Service.ServiceImpl.ValidationStatsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/staff/validation")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('STAFF')")
public class StaffValidationController {

    private final StaffTicketValidationService validationService;
    private final ValidationStatsService statsService;

    @PostMapping("/scan")
    public ResponseEntity<?> validateTicketByQR(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody Map<String, String> request
    ) {
        UUID staffUserId = userPrincipal.getUserId();
        String qrCode = request.get("qrCode");

        log.info("Staff {} scanning QR code: {}", staffUserId, qrCode);

        if (qrCode == null || qrCode.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Invalid request",
                    "message", "QR code is required"
            ));
        }

        try {
            TicketValidation validation = validationService.validateTicketByStaff(
                    qrCode.trim().toUpperCase(),
                    staffUserId
            );

            Ticket ticket = validation.getTicket();

            TicketValidationResponseDto response = TicketValidationResponseDto.builder()
                    .validationId(validation.getId())
                    .ticketId(ticket.getId())
                    .ticketTypeName(ticket.getTicketType().getName())
                    .attendeeName(ticket.getPurchaser().getName())
                    .attendeeEmail(ticket.getPurchaser().getEmail())
                    .eventName(ticket.getTicketType().getEvent().getName())
                    .validatedAt(validation.getValidatedAt())
                    .validatedBy(userPrincipal.getUsername())
                    .message("✅ Valid ticket! Entry granted.")
                    .build();

            return ResponseEntity.ok(response);

        } catch (IllegalStateException e) {
            log.warn("Validation failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Validation failed",
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Unexpected error during validation: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Validation error",
                    "message", "An unexpected error occurred. Please try again."
            ));
        }
    }

    @PostMapping("/manual")
    public ResponseEntity<?> validateTicketManually(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody Map<String, String> request
    ) {
        UUID staffUserId = userPrincipal.getUserId();
        String qrCode = request.get("qrCode");

        log.info("Staff {} attempting manual validation with QR code: {}", staffUserId, qrCode);

        if (qrCode == null || qrCode.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Invalid request",
                    "message", "QR code is required"
            ));
        }

        try {
            TicketValidation validation = validationService.validateTicketManually(
                    qrCode.trim().toUpperCase(),
                    staffUserId
            );

            Ticket ticket = validation.getTicket();

            TicketValidationResponseDto response = TicketValidationResponseDto.builder()
                    .validationId(validation.getId())
                    .ticketId(ticket.getId())
                    .ticketTypeName(ticket.getTicketType().getName())
                    .attendeeName(ticket.getPurchaser().getName())
                    .attendeeEmail(ticket.getPurchaser().getEmail())
                    .eventName(ticket.getTicketType().getEvent().getName())
                    .validatedAt(validation.getValidatedAt())
                    .validatedBy(userPrincipal.getUsername())
                    .message("✅ Ticket validated manually. Entry granted.")
                    .build();

            return ResponseEntity.ok(response);

        } catch (IllegalStateException e) {
            log.warn("Manual validation failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Validation failed",
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Unexpected error during manual validation: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Validation error",
                    "message", "An unexpected error occurred. Please try again."
            ));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchTicket(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam String qrCode
    ) {
        UUID staffUserId = userPrincipal.getUserId();

        if (qrCode == null || qrCode.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Invalid request",
                    "message", "QR code is required"
            ));
        }

        try {
            Ticket ticket = validationService.searchTicketForValidation(
                    qrCode.trim().toUpperCase(),
                    staffUserId
            );

            return ResponseEntity.ok(Map.of(
                    "ticketId", ticket.getId(),
                    "attendeeName", ticket.getPurchaser().getName(),
                    "attendeeEmail", ticket.getPurchaser().getEmail(),
                    "ticketType", ticket.getTicketType().getName(),
                    "eventName", ticket.getTicketType().getEvent().getName(),
                    "status", ticket.getStatus().name(),
                    "price", ticket.getPrice()
            ));

        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Ticket not found",
                    "message", e.getMessage()
            ));
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getMyValidationStats(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        UUID staffUserId = userPrincipal.getUserId();

        try {
            var stats = statsService.getStaffPersonalStats(staffUserId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Failed to get stats: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/my-history")
    public ResponseEntity<?> getMyValidationHistory(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            Pageable pageable
    ) {
        UUID staffUserId = userPrincipal.getUserId();

        try {
            Page<ValidationHistoryDto> history = statsService.getStaffValidationHistory(
                    staffUserId,
                    pageable
            );
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            log.error("Failed to get validation history: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/stats/by-ticket-type")
    public ResponseEntity<?> getMyStatsByTicketType(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        UUID staffUserId = userPrincipal.getUserId();

        try {
            var stats = statsService.getStaffValidationsByTicketType(staffUserId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Failed to get ticket type stats: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/my-credentials")
    public ResponseEntity<?> getMyCredentials(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        UUID staffUserId = userPrincipal.getUserId();

        try {
            var credentials = statsService.getStaffCredentialInfo(staffUserId);
            return ResponseEntity.ok(credentials);
        } catch (Exception e) {
            log.error("Failed to get credential info: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
}

package com.atharv.Event_Ticket_Platform.Controllers;

import com.atharv.Event_Ticket_Platform.Domain.DTO.TicketValidationDtos.*;
import com.atharv.Event_Ticket_Platform.Domain.Entity.Ticket;
import com.atharv.Event_Ticket_Platform.Domain.Entity.TicketValidation;
import com.atharv.Event_Ticket_Platform.Service.ServiceImpl.StaffTicketValidationService;
import com.atharv.Event_Ticket_Platform.Service.ServiceImpl.ValidationStatsService;
import com.atharv.Event_Ticket_Platform.util.UserFromJwt;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

/**
 * 🔒 Staff-only endpoints for ticket validation
 * Staff can ONLY access these endpoints after logging in with their credentials
 */
@RestController
@RequestMapping("/api/v1/staff/validation")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('STAFF')")
public class StaffValidationController {

    private final StaffTicketValidationService validationService;
    private final ValidationStatsService statsService;

    /**
     * ✅ Staff scans QR code to validate ticket
     * POST /api/v1/staff/validation/scan
     *
     * Request Body:
     * {
     *   "qrCode": "ABC12345"
     * }
     */
    @PostMapping("/scan")
    public ResponseEntity<?> validateTicketByQR(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody Map<String, String> request
    ) {
        UUID staffUserId = UserFromJwt.parseUserId(jwt);
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
                    .validatedBy(jwt.getClaimAsString("preferred_username"))
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

    /**
     * ✅ CORRECTED: Staff validates ticket manually by typing QR code
     * POST /api/v1/staff/validation/manual
     *
     * Use case: Attendee verbally provides QR code (e.g., "ABC12345")
     *
     * Request Body:
     * {
     *   "qrCode": "ABC12345"
     * }
     *
     * ⚠️ IMPORTANT: This still validates QR expiry and status!
     */
    @PostMapping("/manual")
    public ResponseEntity<?> validateTicketManually(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody Map<String, String> request
    ) {
        UUID staffUserId = UserFromJwt.parseUserId(jwt);
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
                    .validatedBy(jwt.getClaimAsString("preferred_username"))
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

    /**
     * ✅ CORRECTED: Search for ticket before manual validation
     * GET /api/v1/staff/validation/search?qrCode={qrCode}
     *
     * Staff can verify ticket details before validating manually
     */
    @GetMapping("/search")
    public ResponseEntity<?> searchTicket(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam String qrCode
    ) {
        UUID staffUserId = UserFromJwt.parseUserId(jwt);

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

    /**
     * ✅ Get MY validation statistics as a staff member
     * GET /api/v1/staff/validation/stats
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getMyValidationStats(@AuthenticationPrincipal Jwt jwt) {
        UUID staffUserId = UserFromJwt.parseUserId(jwt);

        try {
            var stats = statsService.getStaffPersonalStats(staffUserId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Failed to get stats: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 🆕 Get my recent validation history (paginated)
     * GET /api/v1/staff/validation/my-history
     */
    @GetMapping("/my-history")
    public ResponseEntity<?> getMyValidationHistory(
            @AuthenticationPrincipal Jwt jwt,
            Pageable pageable
    ) {
        UUID staffUserId = UserFromJwt.parseUserId(jwt);

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

    /**
     * 🆕 Get my validations grouped by ticket type
     * GET /api/v1/staff/validation/stats/by-ticket-type
     */
    @GetMapping("/stats/by-ticket-type")
    public ResponseEntity<?> getMyStatsByTicketType(@AuthenticationPrincipal Jwt jwt) {
        UUID staffUserId = UserFromJwt.parseUserId(jwt);

        try {
            var stats = statsService.getStaffValidationsByTicketType(staffUserId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Failed to get ticket type stats: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 🆕 Get my credential information
     * GET /api/v1/staff/validation/my-credentials
     */
    @GetMapping("/my-credentials")
    public ResponseEntity<?> getMyCredentials(@AuthenticationPrincipal Jwt jwt) {
        UUID staffUserId = UserFromJwt.parseUserId(jwt);

        try {
            var credentials = statsService.getStaffCredentialInfo(staffUserId);
            return ResponseEntity.ok(credentials);
        } catch (Exception e) {
            log.error("Failed to get credential info: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
}
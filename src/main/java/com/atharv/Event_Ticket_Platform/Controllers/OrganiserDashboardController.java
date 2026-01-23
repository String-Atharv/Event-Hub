package com.atharv.Event_Ticket_Platform.Controllers;

import com.atharv.Event_Ticket_Platform.Domain.DTO.AnalyticDtos.ValidatedAttendeeResponse;
import com.atharv.Event_Ticket_Platform.Service.ServiceImpl.AnalyticsService;
import com.atharv.Event_Ticket_Platform.Service.ServiceImpl.ValidationStatsService;
import com.atharv.Event_Ticket_Platform.util.UserFromJwt;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

/**
 * 🆕 Organiser Dashboard Controller with Revenue Tracking
 * Provides endpoints for organisers to view event validation statistics,
 * track staff performance, and monitor revenue
 */
@RestController
@RequestMapping("/api/v1/organiser/events/{eventId}/dashboard")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ORGANISER')")
public class OrganiserDashboardController {

    private final ValidationStatsService statsService;

    /**
     * ✅ Get overall event validation and revenue statistics
     * GET /api/v1/organiser/events/{eventId}/dashboard/stats
     *
     * Response:
     * {
     *   "eventId": "uuid",
     *   "eventName": "Summer Music Festival",
     *   "totalTicketsSold": 500,
     *   "totalValidated": 342,
     *   "remainingAttendees": 158,
     *   "totalRevenue": 25000.00,
     *   "revenueByTicketType": [
     *     {
     *       "ticketTypeId": 1,
     *       "ticketTypeName": "VIP",
     *       "ticketsSold": 100,
     *       "revenue": 10000.00,
     *       "averagePrice": 100.00
     *     },
     *     {
     *       "ticketTypeId": 2,
     *       "ticketTypeName": "General Admission",
     *       "ticketsSold": 400,
     *       "revenue": 15000.00,
     *       "averagePrice": 37.50
     *     }
     *   ]
     * }
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getEventDashboardStats(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID eventId
    ) {
        UUID organiserId = UserFromJwt.parseUserId(jwt);
        log.info("Organiser {} requesting dashboard stats for event {}", organiserId, eventId);

        try {
            var stats = statsService.getEventDashboardStats(eventId);
            return ResponseEntity.ok(stats);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Failed to get stats",
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Error getting dashboard stats: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get validation count per ticket type
     * GET /api/v1/organiser/events/{eventId}/dashboard/ticket-types
     *
     * Response:
     * [
     *   {
     *     "ticketTypeId": 1,
     *     "ticketTypeName": "VIP",
     *     "validatedCount": 45
     *   },
     *   {
     *     "ticketTypeId": 2,
     *     "ticketTypeName": "General Admission",
     *     "validatedCount": 297
     *   }
     * ]
     */
    @GetMapping("/ticket-types")
    public ResponseEntity<?> getValidationsByTicketType(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID eventId
    ) {
        UUID organiserId = UserFromJwt.parseUserId(jwt);
        log.info("Organiser {} requesting ticket type stats for event {}", organiserId, eventId);

        try {
            var stats = statsService.getValidatedAttendeesPerTicketType(eventId, organiserId);
            return ResponseEntity.ok(stats);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Failed to get ticket type stats",
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Error getting ticket type stats: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get validation count per staff member
     * GET /api/v1/organiser/events/{eventId}/dashboard/staff
     *
     * Response:
     * [
     *   {
     *     "staffUserId": "uuid",
     *     "staffUsername": "staff_abc123",
     *     "validatedCount": 78
     *   },
     *   {
     *     "staffUserId": "uuid",
     *     "staffUsername": "staff_xyz789",
     *     "validatedCount": 65
     *   }
     * ]
     */
    @GetMapping("/staff")
    public ResponseEntity<?> getValidationsByStaff(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID eventId
    ) {
        UUID organiserId = UserFromJwt.parseUserId(jwt);
        log.info("Organiser {} requesting staff stats for event {}", organiserId, eventId);

        try {
            var stats = statsService.getAllStaffStatsForEvent(eventId, organiserId);
            return ResponseEntity.ok(stats);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Failed to get staff stats",
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Error getting staff stats: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get detailed list of attendees validated by a specific staff member
     * GET /api/v1/organiser/events/{eventId}/dashboard/staff/{staffUserId}/validations
     *
     * Response (paginated):
     * {
     *   "content": [
     *     {
     *       "validationId": "uuid",
     *       "ticketId": "uuid",
     *       "ticketTypeName": "VIP",
     *       "attendeeName": "John Doe",
     *       "attendeeEmail": "john@example.com",
     *       "validationMethod": "QR",
     *       "validationStatus": "VALID",
     *       "validatedAt": "2026-01-20T14:30:00"
     *     }
     *   ],
     *   "totalElements": 78,
     *   "totalPages": 4
     * }
     */
    @GetMapping("/staff/{staffUserId}/validations")
    public ResponseEntity<?> getAttendeesValidatedByStaff(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID eventId,
            @PathVariable UUID staffUserId,
            Pageable pageable
    ) {
        UUID organiserId = UserFromJwt.parseUserId(jwt);
        log.info("Organiser {} requesting validation details for staff {} in event {}",
                organiserId, staffUserId, eventId);

        try {
            var validations = statsService.getAttendeesValidatedByStaff(
                    eventId, staffUserId, organiserId, pageable
            );
            return ResponseEntity.ok(validations);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Failed to get validation details",
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Error getting validation details: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 🆕 Get revenue summary for the event
     * GET /api/v1/organiser/events/{eventId}/dashboard/revenue
     *
     * This is an alias/shortcut to get just the revenue data
     */
    @GetMapping("/revenue")
    public ResponseEntity<?> getRevenueStats(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID eventId
    ) {
        UUID organiserId = UserFromJwt.parseUserId(jwt);
        log.info("Organiser {} requesting revenue stats for event {}", organiserId, eventId);

        try {
            var stats = statsService.getEventDashboardStats(eventId);

            // Extract only revenue-related data
            Map<String, Object> revenueStats = Map.of(
                    "eventId", stats.get("eventId"),
                    "eventName", stats.get("eventName"),
                    "totalRevenue", stats.get("totalRevenue"),
                    "revenueByTicketType", stats.get("revenueByTicketType")
            );

            return ResponseEntity.ok(revenueStats);
        } catch (Exception e) {
            log.error("Error getting revenue stats: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    private final AnalyticsService analyticsService;

    /**
     * Get list of attendees who have been validated for an event
     * GET /api/v1/organiser/events/{eventId}/dashboard/attendees
     */
    @GetMapping("/attendees")
    public ResponseEntity<?> getValidatedAttendees(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID eventId,
            Pageable pageable
    ) {
        UUID organiserId = UserFromJwt.parseUserId(jwt);
        log.info("Organiser {} requesting validated attendees for event {}",
                organiserId, eventId);

        try {
            Page<Map<String, Object>> attendees = analyticsService.getValidatedAttendees(
                    eventId,
                    organiserId,
                    pageable
            );
            return ResponseEntity.ok(attendees);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Failed to get attendees",
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Error getting validated attendees: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
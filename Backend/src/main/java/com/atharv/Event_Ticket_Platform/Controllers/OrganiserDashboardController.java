package com.atharv.Event_Ticket_Platform.Controllers;

import com.atharv.Event_Ticket_Platform.Security.UserPrincipal;
import com.atharv.Event_Ticket_Platform.Service.ServiceImpl.AnalyticsService;
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
@RequestMapping("/api/v1/organiser/events/{eventId}/dashboard")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ORGANISER')")
public class OrganiserDashboardController {

    private final ValidationStatsService statsService;

    @GetMapping("/stats")
    public ResponseEntity<?> getEventDashboardStats(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable UUID eventId
    ) {
        UUID organiserId = userPrincipal.getUserId();
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

    @GetMapping("/ticket-types")
    public ResponseEntity<?> getValidationsByTicketType(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable UUID eventId
    ) {
        UUID organiserId = userPrincipal.getUserId();
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

    @GetMapping("/staff")
    public ResponseEntity<?> getValidationsByStaff(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable UUID eventId
    ) {
        UUID organiserId = userPrincipal.getUserId();
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

    @GetMapping("/staff/{staffUserId}/validations")
    public ResponseEntity<?> getAttendeesValidatedByStaff(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable UUID eventId,
            @PathVariable UUID staffUserId,
            Pageable pageable
    ) {
        UUID organiserId = userPrincipal.getUserId();
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

    @GetMapping("/revenue")
    public ResponseEntity<?> getRevenueStats(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable UUID eventId
    ) {
        UUID organiserId = userPrincipal.getUserId();
        log.info("Organiser {} requesting revenue stats for event {}", organiserId, eventId);

        try {
            var stats = statsService.getEventDashboardStats(eventId);

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

    @GetMapping("/attendees")
    public ResponseEntity<?> getValidatedAttendees(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable UUID eventId,
            Pageable pageable
    ) {
        UUID organiserId = userPrincipal.getUserId();
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

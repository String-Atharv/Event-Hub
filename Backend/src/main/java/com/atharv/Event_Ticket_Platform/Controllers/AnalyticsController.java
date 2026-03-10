package com.atharv.Event_Ticket_Platform.Controllers;

import com.atharv.Event_Ticket_Platform.Security.UserPrincipal;
import com.atharv.Event_Ticket_Platform.Service.ServiceImpl.AnalyticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;


@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ORGANISER')")
public class AnalyticsController {
    private final AnalyticsService analyticsService;

    @GetMapping("/complete")
    public ResponseEntity<?> getCompleteAnalytics(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        UUID organiserId = userPrincipal.getUserId();
        log.info("Organiser {} requesting complete analytics", organiserId);

        try {
            var analytics = analyticsService.getCompleteOrganiserAnalytics(organiserId);
            return ResponseEntity.ok(analytics);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Failed to get analytics",
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Error getting complete analytics: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Internal server error",
                    "message", "Failed to fetch analytics"
            ));
        }
    }

    @GetMapping("/published")
    public ResponseEntity<?> getPublishedEventsAnalytics(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        UUID organiserId = userPrincipal.getUserId();
        log.info("Organiser {} requesting published events analytics", organiserId);

        try {
            var analytics = analyticsService.getPublishedEventsAnalytics(organiserId);
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            log.error("Error getting published events analytics: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/events/{eventId}")
    public ResponseEntity<?> getEventAnalytics(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable UUID eventId
    ) {
        UUID organiserId = userPrincipal.getUserId();
        log.info("Organiser {} requesting analytics for event {}", organiserId, eventId);

        try {
            var analytics = analyticsService.getEventAnalytics(eventId, organiserId);
            return ResponseEntity.ok(analytics);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Failed to get event analytics",
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Error getting event analytics: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/ticket-types/performance")
    public ResponseEntity<?> getTicketTypePerformance(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        UUID organiserId = userPrincipal.getUserId();
        log.info("Organiser {} requesting ticket type performance", organiserId);

        try {
            var performance = analyticsService.getTicketTypePerformanceAcrossEvents(organiserId);
            return ResponseEntity.ok(performance);
        } catch (Exception e) {
            log.error("Error getting ticket type performance: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/events/compare")
    public ResponseEntity<?> compareEvents(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody Map<String, List<String>> request
    ) {
        UUID organiserId = userPrincipal.getUserId();

        List<String> eventIdStrings = request.get("eventIds");
        if (eventIdStrings == null || eventIdStrings.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Invalid request",
                    "message", "eventIds array is required"
            ));
        }

        try {
            List<UUID> eventIds = eventIdStrings.stream()
                    .map(UUID::fromString)
                    .toList();

            log.info("Organiser {} comparing {} events", organiserId, eventIds.size());

            var comparison = analyticsService.compareEvents(organiserId, eventIds);
            return ResponseEntity.ok(comparison);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Invalid event ID format",
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Error comparing events: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/summary")
    public ResponseEntity<?> getAnalyticsSummary(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        UUID organiserId = userPrincipal.getUserId();
        log.info("Organiser {} requesting analytics summary", organiserId);

        try {
            var fullAnalytics = analyticsService.getCompleteOrganiserAnalytics(organiserId);

            Map<String, Object> summary = Map.of(
                    "organiserId", fullAnalytics.getOrganiserId(),
                    "organiserName", fullAnalytics.getOrganiserName(),
                    "totalEvents", fullAnalytics.getTotalEvents(),
                    "publishedEvents", fullAnalytics.getPublishedEvents(),
                    "draftEvents", fullAnalytics.getDraftEvents(),
                    "totalTicketsSold", fullAnalytics.getTotalTicketsSold(),
                    "totalRevenue", fullAnalytics.getTotalRevenue(),
                    "totalAttendeesValidated", fullAnalytics.getTotalAttendeesValidated(),
                    "averageAttendanceRate", fullAnalytics.getAverageAttendanceRate()
            );

            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            log.error("Error getting analytics summary: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
}

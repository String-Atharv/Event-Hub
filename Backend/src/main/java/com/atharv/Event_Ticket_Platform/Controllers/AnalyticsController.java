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

import static org.aspectj.weaver.tools.cache.SimpleCacheFactory.path;

/**
 * 📊 Analytics Controller
 * Provides comprehensive analytics endpoints for organizers
 */
@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ORGANISER')")
public class AnalyticsController {
    private final AnalyticsService analyticsService;

    /**
     * ✅ Get complete analytics across ALL events
     * GET /api/v1/analytics/complete
     * <p>
     * Returns:
     * {
     * "organiserId": "uuid",
     * "organiserName": "John Smith",
     * "totalEvents": 5,
     * "publishedEvents": 3,
     * "draftEvents": 2,
     * "totalTicketsSold": 1500,
     * "totalRevenue": 75000.00,
     * "totalAttendeesValidated": 1200,
     * "averageAttendanceRate": 80.0,
     * "eventAnalytics": [
     * {
     * "eventId": "uuid",
     * "eventName": "Summer Festival",
     * "totalTicketsSold": 500,
     * "totalRevenue": 25000.00,
     * "totalAttendeesValidated": 400,
     * "overallAttendanceRate": 80.0,
     * "ticketTypeAnalytics": [
     * {
     * "ticketTypeId": 1,
     * "ticketTypeName": "VIP",
     * "price": 100.00,
     * "ticketsSold": 100,
     * "revenue": 10000.00,
     * "attendeesValidated": 95,
     * "attendanceRate": 95.0,
     * "remainingTickets": 0
     * },
     * {
     * "ticketTypeId": 2,
     * "ticketTypeName": "General",
     * "price": 50.00,
     * "ticketsSold": 400,
     * "revenue": 15000.00,
     * "attendeesValidated": 305,
     * "attendanceRate": 76.25,
     * "remainingTickets": 100
     * }
     * ]
     * }
     * ],
     * "mostRevenueEvent": {...},
     * "mostTicketsSoldEvent": {...},
     * "bestAttendanceRateEvent": {...}
     * }
     */
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

    /**
     * ✅ Get analytics for only published events
     * GET /api/v1/analytics/published
     * <p>
     * Same structure as /complete but only for published events
     */
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

    /**
     * ✅ Get analytics for a specific event
     * GET /api/v1/analytics/events/{eventId}
     * <p>
     * Returns detailed analytics for one event including:
     * - Total tickets sold
     * - Total revenue
     * - Total attendees validated
     * - Breakdown per ticket type
     * <p>
     * Response:
     * {
     * "eventId": "uuid",
     * "eventName": "Summer Festival",
     * "eventStatus": "PUBLISHED",
     * "totalTicketsSold": 500,
     * "totalRevenue": 25000.00,
     * "totalAttendeesValidated": 400,
     * "overallAttendanceRate": 80.0,
     * "ticketTypeAnalytics": [...]
     * }
     */
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

    /**
     * 🆕 Get ticket type performance across ALL events
     * GET /api/v1/analytics/ticket-types/performance
     * <p>
     * Shows which ticket type names perform best overall
     * <p>
     * Response:
     * [
     * {
     * "ticketTypeName": "VIP",
     * "totalSold": 500,
     * "totalRevenue": 50000.00,
     * "totalValidated": 475,
     * "averagePrice": 100.00,
     * "numberOfEvents": 3
     * },
     * {
     * "ticketTypeName": "General Admission",
     * "totalSold": 1000,
     * "totalRevenue": 25000.00,
     * "totalValidated": 800,
     * "averagePrice": 25.00,
     * "numberOfEvents": 5
     * }
     * ]
     */
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

    /**
     * 🆕 Compare multiple events side-by-side
     * POST /api/v1/analytics/events/compare
     * <p>
     * Request Body:
     * {
     * "eventIds": ["uuid1", "uuid2", "uuid3"]
     * }
     * <p>
     * Response:
     * {
     * "events": [
     * {
     * "eventId": "uuid1",
     * "eventName": "Event 1",
     * "totalTicketsSold": 500,
     * "totalRevenue": 25000.00,
     * ...
     * },
     * ...
     * ],
     * "comparisonCount": 3,
     * "organiserId": "uuid"
     * }
     */
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

    /**
     * 🆕 Get summary statistics (lightweight endpoint)
     * GET /api/v1/analytics/summary
     * <p>
     * Quick overview without full event breakdown
     * <p>
     * Response:
     * {
     * "totalEvents": 5,
     * "totalTicketsSold": 1500,
     * "totalRevenue": 75000.00,
     * "totalAttendeesValidated": 1200,
     * "averageAttendanceRate": 80.0
     * }
     */
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
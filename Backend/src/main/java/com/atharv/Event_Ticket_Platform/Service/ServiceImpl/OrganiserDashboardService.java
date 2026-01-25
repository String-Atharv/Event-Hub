package com.atharv.Event_Ticket_Platform.Service.ServiceImpl;

import com.atharv.Event_Ticket_Platform.Domain.Entity.*;
import com.atharv.Event_Ticket_Platform.Domain.Enum.EventStatus;
import com.atharv.Event_Ticket_Platform.Repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 🆕 Dedicated service for Organizer Dashboard statistics
 * Provides real-time metrics for organizers
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OrganiserDashboardService {

    private final EventRepo eventRepo;
    private final TicketsRepo ticketsRepo;
    private final UserRepo userRepo;

    /**
     * ✅ Get complete organizer dashboard overview
     * Shows ALL events, revenue, tickets sold, etc.
     */
    public Map<String, Object> getOrganiserOverview(UUID organiserId) {
        log.info("Fetching organiser overview for: {}", organiserId);

        User organiser = userRepo.findById(organiserId)
                .orElseThrow(() -> new IllegalStateException("Organiser not found"));

        List<Event> allEvents = organiser.getOrganisedEvents();

        // Filter published events
        List<Event> publishedEvents = allEvents.stream()
                .filter(e -> e.getEventStatus() == EventStatus.PUBLISHED)
                .collect(Collectors.toList());

        // Filter draft events
        List<Event> draftEvents = allEvents.stream()
                .filter(e -> e.getEventStatus() == EventStatus.DRAFT)
                .collect(Collectors.toList());

        // Calculate total metrics across ALL events
        long totalTicketsSold = 0;
        double totalRevenue = 0.0;
        long totalAttendees = 0;

        for (Event event : allEvents) {
            long ticketsSold = ticketsRepo.countByTicketType_Event_Id(event.getId());
            totalTicketsSold += ticketsSold;

            // Calculate revenue for this event
            List<Ticket> tickets = ticketsRepo.findAllByEventId(event.getId());
            double eventRevenue = tickets.stream()
                    .mapToDouble(Ticket::getPrice)
                    .sum();
            totalRevenue += eventRevenue;

            // Count attendees who actually showed up
            totalAttendees += event.getAttendees().size();
        }

        Map<String, Object> stringObjectMap = Map.ofEntries(
                Map.entry("organiserId", organiserId),
                Map.entry("organiserName", organiser.getName()),
                Map.entry("organiserEmail", organiser.getEmail()),
                Map.entry("totalEvents", allEvents.size()),
                Map.entry("publishedEvents", publishedEvents.size()),
                Map.entry("draftEvents", draftEvents.size()),
                Map.entry("totalTicketsSold", totalTicketsSold),
                Map.entry("totalRevenue", totalRevenue),
                Map.entry("totalAttendees", totalAttendees),
                Map.entry("averageRevenuePerEvent",
                        allEvents.isEmpty() ? 0 : totalRevenue / allEvents.size()),
                Map.entry("averageTicketsPerEvent",
                        allEvents.isEmpty() ? 0 : (double) totalTicketsSold / allEvents.size())
        );

        return stringObjectMap;
    }

    /**
     * ✅ Get individual event statistics
     * Shows detailed metrics for a specific event
     */
    public Map<String, Object> getEventStatistics(UUID eventId, UUID organiserId) {
        Event event = eventRepo.findById(eventId)
                .orElseThrow(() -> new IllegalStateException("Event not found"));

        // Verify ownership
        if (!event.getOrganiser().getId().equals(organiserId)) {
            throw new IllegalStateException("You don't have permission to view this event");
        }

        // Count tickets sold
        long ticketsSold = ticketsRepo.countByTicketType_Event_Id(eventId);

        // Calculate revenue
        List<Ticket> tickets = ticketsRepo.findAllByEventId(eventId);
        double revenue = tickets.stream()
                .mapToDouble(Ticket::getPrice)
                .sum();

        // Count attendees who showed up
        long attendeesCount = event.getAttendees().size();

        // Get ticket type breakdown
        List<Map<String, Object>> ticketTypeBreakdown = event.getTicketTypes().stream()
                .map(ticketType -> {
                    long sold = ticketType.getTicket().size();
                    double typeRevenue = ticketType.getTicket().stream()
                            .mapToDouble(Ticket::getPrice)
                            .sum();

                    return Map.<String, Object>of(
                            "ticketTypeId", ticketType.getId(),
                            "ticketTypeName", ticketType.getName(),
                            "price", ticketType.getPrice(),
                            "totalAvailable", ticketType.getTotalAvailable(),
                            "sold", sold,
                            "revenue", typeRevenue,
                            "remaining", ticketType.getTotalAvailable() != null ?
                                    ticketType.getTotalAvailable() : 0
                    );
                })
                .collect(Collectors.toList());

        return Map.ofEntries(
                Map.entry("eventId", event.getId()),
                Map.entry("eventName", event.getName()),
                Map.entry("eventStatus", event.getEventStatus().name()),
                Map.entry("ticketsSold", ticketsSold),
                Map.entry("revenue", revenue),
                Map.entry("attendeesCount", attendeesCount),
                Map.entry(
                        "attendanceRate",
                        ticketsSold > 0 ? (double) attendeesCount / ticketsSold * 100 : 0
                ),
                Map.entry("ticketTypeBreakdown", ticketTypeBreakdown),
                Map.entry("startTime", event.getStartTime()),
                Map.entry("endTime", event.getEndTime()),
                Map.entry("venue", event.getVenue())
        );

    }

    /**
     * ✅ Get list of attendees for an event
     * Shows who actually showed up (validated tickets)
     */
    public List<Map<String, Object>> getEventAttendees(UUID eventId, UUID organiserId) {
        Event event = eventRepo.findById(eventId)
                .orElseThrow(() -> new IllegalStateException("Event not found"));

        if (!event.getOrganiser().getId().equals(organiserId)) {
            throw new IllegalStateException("You don't have permission to view this event");
        }

        return event.getAttendees().stream()
                .map(attendee -> Map.<String, Object>of(
                        "userId", attendee.getId(),
                        "name", attendee.getName(),
                        "email", attendee.getEmail()
                ))
                .collect(Collectors.toList());
    }

    /**
     * 🆕 Get revenue trend over time
     * Useful for charts/graphs
     */
    public Map<String, Object> getRevenueTrend(UUID organiserId) {
        User organiser = userRepo.findById(organiserId)
                .orElseThrow(() -> new IllegalStateException("Organiser not found"));

        List<Map<String, Object>> eventRevenues = organiser.getOrganisedEvents().stream()
                .map(event -> {
                    List<Ticket> tickets = ticketsRepo.findAllByEventId(event.getId());
                    double revenue = tickets.stream()
                            .mapToDouble(Ticket::getPrice)
                            .sum();

                    return Map.<String, Object>of(
                            "eventId", event.getId(),
                            "eventName", event.getName(),
                            "eventDate", event.getStartTime(),
                            "revenue", revenue,
                            "ticketsSold", tickets.size()
                    );
                })
                .sorted((a, b) -> ((LocalDateTime) a.get("eventDate"))
                        .compareTo((LocalDateTime) b.get("eventDate")))
                .collect(Collectors.toList());

        double totalRevenue = eventRevenues.stream()
                .mapToDouble(e -> (Double) e.get("revenue"))
                .sum();

        return Map.of(
                "totalRevenue", totalRevenue,
                "eventCount", eventRevenues.size(),
                "revenueByEvent", eventRevenues
        );
    }
}
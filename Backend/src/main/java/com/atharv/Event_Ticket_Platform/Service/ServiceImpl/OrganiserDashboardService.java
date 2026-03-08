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

@Service
@RequiredArgsConstructor
@Slf4j
public class OrganiserDashboardService {

    private final EventRepo eventRepo;
    private final TicketsRepo ticketsRepo;
    private final UserRepo userRepo;

    public Map<String, Object> getOrganiserOverview(UUID organiserId) {
        log.info("Fetching organiser overview for: {}", organiserId);

        User organiser = userRepo.findById(organiserId)
                .orElseThrow(() -> new IllegalStateException("Organiser not found"));

        List<Event> allEvents = organiser.getOrganisedEvents();

        List<Event> publishedEvents = allEvents.stream()
                .filter(e -> e.getEventStatus() == EventStatus.PUBLISHED)
                .collect(Collectors.toList());

        List<Event> draftEvents = allEvents.stream()
                .filter(e -> e.getEventStatus() == EventStatus.DRAFT)
                .collect(Collectors.toList());

        long totalTicketsSold = 0;
        double totalRevenue = 0.0;
        long totalAttendees = 0;

        for (Event event : allEvents) {
            long ticketsSold = ticketsRepo.countByTicketType_Event_Id(event.getId());
            totalTicketsSold += ticketsSold;

            List<Ticket> tickets = ticketsRepo.findAllByEventId(event.getId());
            double eventRevenue = tickets.stream()
                    .mapToDouble(Ticket::getPrice)
                    .sum();
            totalRevenue += eventRevenue;

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

    public Map<String, Object> getEventStatistics(UUID eventId, UUID organiserId) {
        Event event = eventRepo.findById(eventId)
                .orElseThrow(() -> new IllegalStateException("Event not found"));

        if (!event.getOrganiser().getId().equals(organiserId)) {
            throw new IllegalStateException("You don't have permission to view this event");
        }

        long ticketsSold = ticketsRepo.countByTicketType_Event_Id(eventId);

        List<Ticket> tickets = ticketsRepo.findAllByEventId(eventId);
        double revenue = tickets.stream()
                .mapToDouble(Ticket::getPrice)
                .sum();

        long attendeesCount = event.getAttendees().size();

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

    public List<Map<String, Object>> getEventAttendees(UUID eventId, UUID organiserId) {
        log.info("Finding event for the {} id ",eventId);
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

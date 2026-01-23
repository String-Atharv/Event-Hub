package com.atharv.Event_Ticket_Platform.Service.ServiceImpl;


import com.atharv.Event_Ticket_Platform.Domain.DTO.AnalyticDtos.*;
import com.atharv.Event_Ticket_Platform.Domain.Entity.*;
import com.atharv.Event_Ticket_Platform.Domain.Enum.EventStatus;
import com.atharv.Event_Ticket_Platform.Domain.Enum.TicketValidationStatus;
import com.atharv.Event_Ticket_Platform.Repository.EventRepo;
import com.atharv.Event_Ticket_Platform.Repository.TicketValidationRepo;
import com.atharv.Event_Ticket_Platform.Repository.TicketsRepo;
import com.atharv.Event_Ticket_Platform.Repository.UserRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 📊 Complete Analytics Service
 * Provides comprehensive analytics per ticket type, per event, and across all events
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticsService {
    private final EventRepo eventRepo;
    private final TicketsRepo ticketsRepo;
    private final TicketValidationRepo ticketValidationRepo;
    private final UserRepo userRepo;

    /**
     * ✅ Get complete analytics for a specific event
     * Shows ticket sales, revenue, and attendees per ticket type
     */
    public EventAnalyticsDto getEventAnalytics(UUID eventId, UUID organiserId) {
        log.info("Fetching analytics for event: {}", eventId);

        Event event = eventRepo.findById(eventId)
                .orElseThrow(() -> new IllegalStateException("Event not found"));

        // Verify ownership
        if (!event.getOrganiser().getId().equals(organiserId)) {
            throw new IllegalStateException("You don't have permission to view this event");
        }

        // Calculate overall metrics
        long totalTicketsSold = ticketsRepo.countByTicketType_Event_Id(eventId);
        List<Ticket> allTickets = ticketsRepo.findAllByEventId(eventId);
        double totalRevenue = allTickets.stream()
                .mapToDouble(Ticket::getPrice)
                .sum();
        long totalValidated = ticketValidationRepo.countByEvent_IdAndValidationStatus(
                eventId,
                TicketValidationStatus.VALID
        );
        double overallAttendanceRate = totalTicketsSold > 0 ?
                (double) totalValidated / totalTicketsSold * 100 : 0;

        // Calculate per ticket type analytics
        List<TicketTypeAnalyticsDto> ticketTypeAnalytics = event.getTicketTypes().stream()
                .map(ticketType -> calculateTicketTypeAnalytics(ticketType, eventId))
                .collect(Collectors.toList());

        return EventAnalyticsDto.builder()
                .eventId(event.getId())
                .eventName(event.getName())
                .eventStatus(event.getEventStatus().name())
                .eventType(event.getEventType() != null ? event.getEventType().name() : null)
                .venue(event.getVenue())
                .startTime(event.getStartTime())
                .endTime(event.getEndTime())
                .totalTicketsSold(totalTicketsSold)
                .totalRevenue(totalRevenue)
                .totalAttendeesValidated(totalValidated)
                .overallAttendanceRate(overallAttendanceRate)
                .ticketTypeAnalytics(ticketTypeAnalytics)
                .build();
    }

    /**
     * ✅ Calculate analytics for a specific ticket type
     */
    private TicketTypeAnalyticsDto calculateTicketTypeAnalytics(TicketType ticketType, UUID eventId) {
        List<Ticket> soldTickets = ticketType.getTicket();
        long ticketsSold = soldTickets.size();

        double revenue = soldTickets.stream()
                .mapToDouble(Ticket::getPrice)
                .sum();

        long validated = ticketValidationRepo.countByEvent_IdAndTicket_TicketType_IdAndValidationStatus(
                eventId,
                ticketType.getId(),
                TicketValidationStatus.VALID
        );

        double attendanceRate = ticketsSold > 0 ? (double) validated / ticketsSold * 100 : 0;

        int remaining = ticketType.getTotalAvailable() != null ?
                ticketType.getTotalAvailable() : 0;

        return TicketTypeAnalyticsDto.builder()
                .ticketTypeId(ticketType.getId())
                .ticketTypeName(ticketType.getName())
                .price(ticketType.getPrice())
                .totalAvailable(ticketType.getTotalAvailable())
                .ticketsSold(ticketsSold)
                .revenue(revenue)
                .attendeesValidated(validated)
                .attendanceRate(attendanceRate)
                .remainingTickets(remaining)
                .build();
    }

    /**
     * ✅ Get complete analytics across ALL events for an organizer
     * This is the main analytics dashboard
     */
    public OrganiserCompleteAnalyticsDto getCompleteOrganiserAnalytics(UUID organiserId) {
        log.info("Fetching complete analytics for organiser: {}", organiserId);

        User organiser = userRepo.findById(organiserId)
                .orElseThrow(() -> new IllegalStateException("Organiser not found"));

        List<Event> allEvents = organiser.getOrganisedEvents();

        // Count event types
        long publishedCount = allEvents.stream()
                .filter(e -> e.getEventStatus() == EventStatus.PUBLISHED)
                .count();

        long draftCount = allEvents.stream()
                .filter(e -> e.getEventStatus() == EventStatus.DRAFT)
                .count();

        // Calculate totals across all events
        long totalTicketsSold = 0;
        double totalRevenue = 0.0;
        long totalValidated = 0;
        List<Double> attendanceRates = new ArrayList<>();

        List<EventAnalyticsDto> eventAnalyticsList = new ArrayList<>();

        for (Event event : allEvents) {
            EventAnalyticsDto eventAnalytics = getEventAnalytics(event.getId(), organiserId);
            eventAnalyticsList.add(eventAnalytics);

            totalTicketsSold += eventAnalytics.getTotalTicketsSold();
            totalRevenue += eventAnalytics.getTotalRevenue();
            totalValidated += eventAnalytics.getTotalAttendeesValidated();

            if (eventAnalytics.getTotalTicketsSold() > 0) {
                attendanceRates.add(eventAnalytics.getOverallAttendanceRate());
            }
        }

        double averageAttendanceRate = attendanceRates.isEmpty() ? 0 :
                attendanceRates.stream()
                        .mapToDouble(Double::doubleValue)
                        .average()
                        .orElse(0.0);

        // Find top performers
        EventAnalyticsDto mostRevenueEvent = eventAnalyticsList.stream()
                .max(Comparator.comparing(EventAnalyticsDto::getTotalRevenue))
                .orElse(null);

        EventAnalyticsDto mostTicketsSoldEvent = eventAnalyticsList.stream()
                .max(Comparator.comparing(EventAnalyticsDto::getTotalTicketsSold))
                .orElse(null);

        EventAnalyticsDto bestAttendanceRateEvent = eventAnalyticsList.stream()
                .filter(e -> e.getTotalTicketsSold() > 0)
                .max(Comparator.comparing(EventAnalyticsDto::getOverallAttendanceRate))
                .orElse(null);

        return OrganiserCompleteAnalyticsDto.builder()
                .organiserId(organiserId)
                .organiserName(organiser.getName())
                .organiserEmail(organiser.getEmail())
                .totalEvents(allEvents.size())
                .publishedEvents((int) publishedCount)
                .draftEvents((int) draftCount)
                .totalTicketsSold(totalTicketsSold)
                .totalRevenue(totalRevenue)
                .totalAttendeesValidated(totalValidated)
                .averageAttendanceRate(averageAttendanceRate)
                .eventAnalytics(eventAnalyticsList)
                .mostRevenueEvent(mostRevenueEvent)
                .mostTicketsSoldEvent(mostTicketsSoldEvent)
                .bestAttendanceRateEvent(bestAttendanceRateEvent)
                .build();
    }

    /**
     * ✅ Get analytics for just published events
     * Useful for seeing active/live events only
     */
    public OrganiserCompleteAnalyticsDto getPublishedEventsAnalytics(UUID organiserId) {
        log.info("Fetching published events analytics for organiser: {}", organiserId);

        User organiser = userRepo.findById(organiserId)
                .orElseThrow(() -> new IllegalStateException("Organiser not found"));

        List<Event> publishedEvents = organiser.getOrganisedEvents().stream()
                .filter(e -> e.getEventStatus() == EventStatus.PUBLISHED)
                .collect(Collectors.toList());

        // Use same logic as complete analytics but only for published events
        return calculateAnalyticsForEventList(organiser, publishedEvents);
    }

    /**
     * Helper method to calculate analytics for a list of events
     */
    private OrganiserCompleteAnalyticsDto calculateAnalyticsForEventList(
            User organiser,
            List<Event> events
    ) {
        long totalTicketsSold = 0;
        double totalRevenue = 0.0;
        long totalValidated = 0;
        List<Double> attendanceRates = new ArrayList<>();

        List<EventAnalyticsDto> eventAnalyticsList = new ArrayList<>();

        for (Event event : events) {
            EventAnalyticsDto eventAnalytics = getEventAnalytics(event.getId(), organiser.getId());
            eventAnalyticsList.add(eventAnalytics);

            totalTicketsSold += eventAnalytics.getTotalTicketsSold();
            totalRevenue += eventAnalytics.getTotalRevenue();
            totalValidated += eventAnalytics.getTotalAttendeesValidated();

            if (eventAnalytics.getTotalTicketsSold() > 0) {
                attendanceRates.add(eventAnalytics.getOverallAttendanceRate());
            }
        }

        double averageAttendanceRate = attendanceRates.isEmpty() ? 0 :
                attendanceRates.stream()
                        .mapToDouble(Double::doubleValue)
                        .average()
                        .orElse(0.0);

        EventAnalyticsDto mostRevenueEvent = eventAnalyticsList.stream()
                .max(Comparator.comparing(EventAnalyticsDto::getTotalRevenue))
                .orElse(null);

        EventAnalyticsDto mostTicketsSoldEvent = eventAnalyticsList.stream()
                .max(Comparator.comparing(EventAnalyticsDto::getTotalTicketsSold))
                .orElse(null);

        EventAnalyticsDto bestAttendanceRateEvent = eventAnalyticsList.stream()
                .filter(e -> e.getTotalTicketsSold() > 0)
                .max(Comparator.comparing(EventAnalyticsDto::getOverallAttendanceRate))
                .orElse(null);

        long publishedCount = events.stream()
                .filter(e -> e.getEventStatus() == EventStatus.PUBLISHED)
                .count();

        return OrganiserCompleteAnalyticsDto.builder()
                .organiserId(organiser.getId())
                .organiserName(organiser.getName())
                .organiserEmail(organiser.getEmail())
                .totalEvents(events.size())
                .publishedEvents((int) publishedCount)
                .draftEvents(events.size() - (int) publishedCount)
                .totalTicketsSold(totalTicketsSold)
                .totalRevenue(totalRevenue)
                .totalAttendeesValidated(totalValidated)
                .averageAttendanceRate(averageAttendanceRate)
                .eventAnalytics(eventAnalyticsList)
                .mostRevenueEvent(mostRevenueEvent)
                .mostTicketsSoldEvent(mostTicketsSoldEvent)
                .bestAttendanceRateEvent(bestAttendanceRateEvent)
                .build();
    }

    /**
     * 🆕 Get ticket type performance across all events
     * Shows which ticket type names perform best overall
     */
    public List<TicketTypePerformanceDto> getTicketTypePerformanceAcrossEvents(UUID organiserId) {
        log.info("Fetching ticket type performance for organiser: {}", organiserId);

        User organiser = userRepo.findById(organiserId)
                .orElseThrow(() -> new IllegalStateException("Organiser not found"));

        // Group all ticket types by name
        Map<String, List<TicketType>> ticketTypesByName = new HashMap<>();

        for (Event event : organiser.getOrganisedEvents()) {
            for (TicketType ticketType : event.getTicketTypes()) {
                String name = ticketType.getName();
                ticketTypesByName.computeIfAbsent(name, k -> new ArrayList<>()).add(ticketType);
            }
        }

        // Calculate performance for each ticket type name
        return ticketTypesByName.entrySet().stream()
                .map(entry -> {
                    String typeName = entry.getKey();
                    List<TicketType> types = entry.getValue();

                    long totalSold = types.stream()
                            .flatMap(tt -> tt.getTicket().stream())
                            .count();

                    double totalRevenue = types.stream()
                            .flatMap(tt -> tt.getTicket().stream())
                            .mapToDouble(Ticket::getPrice)
                            .sum();

                    long totalValidated = 0;
                    for (TicketType tt : types) {
                        totalValidated += ticketValidationRepo
                                .countByEvent_IdAndTicket_TicketType_IdAndValidationStatus(
                                        tt.getEvent().getId(),
                                        tt.getId(),
                                        TicketValidationStatus.VALID
                                );
                    }

                    double averagePrice = totalSold > 0 ? totalRevenue / totalSold : 0;

                    return TicketTypePerformanceDto.builder()
                            .ticketTypeName(typeName)
                            .totalSold(totalSold)
                            .totalRevenue(totalRevenue)
                            .totalValidated(totalValidated)
                            .averagePrice(averagePrice)
                            .numberOfEvents(types.size())
                            .build();
                })
                .sorted(Comparator.comparing(TicketTypePerformanceDto::getTotalRevenue).reversed())
                .collect(Collectors.toList());
    }

    /**
     * 🆕 Get comparison between events
     * Useful for side-by-side comparison
     */
    public Map<String, Object> compareEvents(UUID organiserId, List<UUID> eventIds) {
        log.info("Comparing {} events for organiser {}", eventIds.size(), organiserId);

        List<EventAnalyticsDto> eventComparisons = eventIds.stream()
                .map(eventId -> getEventAnalytics(eventId, organiserId))
                .collect(Collectors.toList());

        return Map.of(
                "events", eventComparisons,
                "comparisonCount", eventIds.size(),
                "organiserId", organiserId
        );
    }


    public Page<Map<String, Object>> getValidatedAttendees(
            UUID eventId,
            UUID organiserId,
            Pageable pageable
    ) {
        log.info("Fetching validated attendees for event: {}", eventId);

        // Verify event exists and belongs to organiser
        Event event = eventRepo.findById(eventId)
                .orElseThrow(() -> new IllegalStateException("Event not found"));

        if (!event.getOrganiser().getId().equals(organiserId)) {
            throw new IllegalStateException("You don't have permission to view this event");
        }

        // Get validated tickets
        Page<TicketValidation> validations = ticketValidationRepo
                .findValidatedAttendeesByEvent(
                        eventId,
                        TicketValidationStatus.VALID,
                        pageable
                );

        // Map to response
        return validations.map(validation -> {
            Ticket ticket = validation.getTicket();
            User attendee = ticket.getPurchaser();

            return Map.of(
                    "attendeeId", attendee.getId(),
                    "attendeeName", attendee.getName(),
                    "attendeeEmail", attendee.getEmail(),
                    "ticketId", ticket.getId(),
                    "ticketType", ticket.getTicketType().getName(),
                    "ticketPrice", ticket.getPrice(),
                    "validatedAt", validation.getValidatedAt(),
                    "validatedBy", validation.getStaff().getUsername()
            );
        });
    }

    private ValidatedAttendeeResponse mapToDto(TicketValidation tv) {
        Ticket ticket = tv.getTicket();
        User user = ticket.getPurchaser();

        return ValidatedAttendeeResponse.builder()
                .validationId(tv.getId())
                .validatedAt(tv.getValidatedAt())
                .validationMethod(tv.getValidationMethod().name())
                .attendeeId(user.getId())
                .attendeeName(user.getName())
                .attendeeEmail(user.getEmail())
                .ticketId(ticket.getId())
                .ticketType(ticket.getTicketType().getName())
                .ticketPrice(ticket.getPrice())
                .build();
    }
}
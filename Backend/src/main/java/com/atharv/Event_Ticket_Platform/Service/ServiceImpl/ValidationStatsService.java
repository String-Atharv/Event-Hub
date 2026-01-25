package com.atharv.Event_Ticket_Platform.Service.ServiceImpl;

import com.atharv.Event_Ticket_Platform.Domain.DTO.TicketTypeDto.TicketTypeRevenueDto;
import com.atharv.Event_Ticket_Platform.Domain.DTO.TicketValidationDtos.*;
import com.atharv.Event_Ticket_Platform.Domain.Entity.*;
import com.atharv.Event_Ticket_Platform.Domain.Enum.TicketValidationStatus;
import com.atharv.Event_Ticket_Platform.Repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ValidationStatsService {

    private final TicketValidationRepo ticketValidationRepo;
    private final TicketsRepo ticketsRepo;
    private final StaffRepo staffRepo;
    private final EventRepo eventRepo;
    private final TicketTypeRepo ticketTypeRepo;

    // ==================== ORGANIZER DASHBOARD METHODS ====================

    /**
     * 🆕 Complete event dashboard with revenue statistics
     */
    public Map<String, Object> getEventDashboardStats(UUID eventId) {
        Event event = eventRepo.findById(eventId)
                .orElseThrow(() -> new IllegalStateException("Event not found"));

        long totalSold = ticketsRepo.countByTicketType_Event_Id(eventId);
        long totalValidated = ticketValidationRepo.countByEvent_IdAndValidationStatus(
                eventId, TicketValidationStatus.VALID
        );

        // ✅ Calculate revenue
        double totalRevenue = calculateTotalRevenue(eventId);
        List<TicketTypeRevenueDto> revenueByTicketType = calculateRevenueByTicketType(eventId);

        return Map.of(
                "eventId", event.getId(),
                "eventName", event.getName(),
                "totalTicketsSold", totalSold,
                "totalValidated", totalValidated,
                "remainingAttendees", totalSold - totalValidated,
                "totalRevenue", totalRevenue,
                "revenueByTicketType", revenueByTicketType
        );
    }

    /**
     * 🆕 Calculate total revenue for an event
     */
    private double calculateTotalRevenue(UUID eventId) {
        List<Ticket> tickets = ticketsRepo.findAllByEventId(eventId);
        return tickets.stream()
                .mapToDouble(Ticket::getPrice)
                .sum();
    }

    /**
     * 🆕 Calculate revenue breakdown by ticket type
     */
    private List<TicketTypeRevenueDto> calculateRevenueByTicketType(UUID eventId) {
        Event event = eventRepo.findById(eventId)
                .orElseThrow(() -> new IllegalStateException("Event not found"));

        return event.getTicketTypes().stream()
                .map(ticketType -> {
                    List<Ticket> soldTickets = ticketType.getTicket();
                    long ticketsSold = soldTickets.size();
                    double revenue = soldTickets.stream()
                            .mapToDouble(Ticket::getPrice)
                            .sum();

                    return TicketTypeRevenueDto.builder()
                            .ticketTypeId(ticketType.getId())
                            .ticketTypeName(ticketType.getName())
                            .ticketsSold(ticketsSold)
                            .revenue(revenue)
                            .averagePrice(ticketsSold > 0 ? revenue / ticketsSold : 0)
                            .build();
                })
                .collect(Collectors.toList());
    }

    /**
     * Get all staff members and their validation counts for an event
     */
    public List<StaffValidationStatsDto> getAllStaffStatsForEvent(UUID eventId, UUID organiserId) {
        Event event = eventRepo.findById(eventId)
                .orElseThrow(() -> new IllegalStateException("Event not found"));

        if (!event.getOrganiser().getId().equals(organiserId)) {
            throw new IllegalStateException("You don't have permission to view this event");
        }

        List<Staff> staffList = staffRepo.findByCreatedByOrganiserIdAndEventId(organiserId, eventId);

        return staffList.stream()
                .map(staff -> {
                    long validatedCount = ticketValidationRepo
                            .countByEvent_IdAndValidationStatusAndStaff_StaffUserId(
                                    eventId,
                                    TicketValidationStatus.VALID,
                                    staff.getStaffUserId()
                            );

                    return StaffValidationStatsDto.builder()
                            .staffUserId(staff.getStaffUserId())
                            .staffUsername(staff.getUsername())
                            .validatedCount(validatedCount)
                            .build();
                })
                .collect(Collectors.toList());
    }

    /**
     * Get detailed list of attendees validated by a specific staff member
     */
    public Page<ValidationHistoryDto> getAttendeesValidatedByStaff(
            UUID eventId,
            UUID staffUserId,
            UUID organiserId,
            Pageable pageable
    ) {
        Event event = eventRepo.findById(eventId)
                .orElseThrow(() -> new IllegalStateException("Event not found"));

        if (!event.getOrganiser().getId().equals(organiserId)) {
            throw new IllegalStateException("You don't have permission to view this event");
        }

        Staff staff = staffRepo.findByStaffUserId(staffUserId)
                .orElseThrow(() -> new IllegalStateException("Staff not found"));

        if (!staff.getEventId().equals(eventId)) {
            throw new IllegalStateException("Staff is not assigned to this event");
        }

        Page<TicketValidation> validations = ticketValidationRepo
                .findByEvent_IdAndStaff_StaffUserId(eventId, staffUserId, pageable);

        return validations.map(validation -> ValidationHistoryDto.builder()
                .validationId(validation.getId())
                .ticketId(validation.getTicket().getId())
                .ticketTypeName(validation.getTicket().getTicketType().getName())
                .attendeeName(validation.getTicket().getPurchaser().getName())
                .attendeeEmail(validation.getTicket().getPurchaser().getEmail())
                .validationMethod(validation.getValidationMethod().name())
                .validationStatus(validation.getValidationStatus().name())
                .validatedAt(validation.getValidatedAt())
                .build()
        );
    }

    /**
     * Get validation stats per ticket type for an event
     */
    public List<TicketTypeAttendanceDto> getValidatedAttendeesPerTicketType(UUID eventId, UUID organiserId) {
        Event event = eventRepo.findById(eventId)
                .orElseThrow(() -> new IllegalStateException("Event not found"));

        if (!event.getOrganiser().getId().equals(organiserId)) {
            throw new IllegalStateException("You don't have permission to view this event");
        }

        return event.getTicketTypes().stream()
                .map(ticketType -> {
                    long validatedCount = ticketValidationRepo
                            .countByEvent_IdAndTicket_TicketType_IdAndValidationStatus(
                                    eventId,
                                    ticketType.getId(),
                                    TicketValidationStatus.VALID
                            );

                    return TicketTypeAttendanceDto.builder()
                            .ticketTypeId(ticketType.getId())
                            .ticketTypeName(ticketType.getName())
                            .validatedCount(validatedCount)
                            .build();
                })
                .collect(Collectors.toList());
    }

    // ==================== STAFF PERSONAL METHODS ====================

    /**
     * 🆕 Get personal stats for a staff member
     * Shows what THEY can see on their dashboard
     */
    public Map<String, Object> getStaffPersonalStats(UUID staffUserId) {
        log.info("Getting stats for staff: {}", staffUserId);

        Staff staff = staffRepo.findByStaffUserId(staffUserId)
                .orElseThrow(() -> {
                    log.error("Staff not found: {}", staffUserId);
                    return new IllegalStateException("Staff not found");
                });

        log.info("Staff found: username={}, eventId={}, validUntil={}",
                staff.getUsername(), staff.getEventId(), staff.getValidUntil());

        long totalValidated = ticketValidationRepo
                .countByEvent_IdAndValidationStatusAndStaff_StaffUserId(
                        staff.getEventId(),
                        TicketValidationStatus.VALID,
                        staff.getStaffUserId()
                );

        Event event = eventRepo.findById(staff.getEventId())
                .orElseThrow(() -> new IllegalStateException("Event not found"));

        // ✅ FIX: Calculate time until expiry safely
        LocalDateTime now = LocalDateTime.now();
        Duration timeUntilExpiry = Duration.between(now, staff.getValidUntil());

        // Handle negative durations (already expired)
        long hoursRemaining = Math.max(0, timeUntilExpiry.toHours());
        long minutesRemaining = Math.max(0, timeUntilExpiry.toMinutes() % 60);

        // ✅ Alternative: Calculate time since expiry if expired
        boolean isExpired = staff.isExpired();
        long hoursSinceExpiry = isExpired ? Math.abs(timeUntilExpiry.toHours()) : 0;
        long minutesSinceExpiry = isExpired ? Math.abs(timeUntilExpiry.toMinutes() % 60) : 0;

        return Map.ofEntries(
                Map.entry("staffUsername", staff.getUsername()),
                Map.entry("eventId", staff.getEventId()),
                Map.entry("eventName", event.getName()),
                Map.entry("totalValidated", totalValidated),
                Map.entry("credentialValidFrom", staff.getValidFrom()),
                Map.entry("credentialValidUntil", staff.getValidUntil()),
                Map.entry("isExpired", isExpired),
                Map.entry("hoursRemaining", hoursRemaining),
                Map.entry("minutesRemaining", minutesRemaining),
                Map.entry("hoursSinceExpiry", hoursSinceExpiry),
                Map.entry("minutesSinceExpiry", minutesSinceExpiry),
                Map.entry("isActive", staff.getIsActive())
        );

    }

    /**
     * 🆕 Get staff validation history (what tickets they validated)
     */
    public Page<ValidationHistoryDto> getStaffValidationHistory(
            UUID staffUserId,
            Pageable pageable
    ) {
        Staff staff = staffRepo.findByStaffUserId(staffUserId)
                .orElseThrow(() -> new IllegalStateException("Staff not found"));

        Page<TicketValidation> validations = ticketValidationRepo
                .findByEvent_IdAndStaff_StaffUserId(
                        staff.getEventId(),
                        staffUserId,
                        pageable
                );

        return validations.map(validation -> ValidationHistoryDto.builder()
                .validationId(validation.getId())
                .ticketId(validation.getTicket().getId())
                .ticketTypeName(validation.getTicket().getTicketType().getName())
                .attendeeName(validation.getTicket().getPurchaser().getName())
                .attendeeEmail(validation.getTicket().getPurchaser().getEmail())
                .validationMethod(validation.getValidationMethod().name())
                .validationStatus(validation.getValidationStatus().name())
                .validatedAt(validation.getValidatedAt())
                .build()
        );
    }

    /**
     * 🆕 Get staff validations grouped by ticket type
     */
    public List<TicketTypeAttendanceDto> getStaffValidationsByTicketType(UUID staffUserId) {
        Staff staff = staffRepo.findByStaffUserId(staffUserId)
                .orElseThrow(() -> new IllegalStateException("Staff not found"));

        Event event = eventRepo.findById(staff.getEventId())
                .orElseThrow(() -> new IllegalStateException("Event not found"));

        return event.getTicketTypes().stream()
                .map(ticketType -> {
                    long validatedCount = ticketValidationRepo
                            .countByStaff_StaffUserIdAndTicket_TicketType_IdAndValidationStatus(
                                    staffUserId,
                                    ticketType.getId(),
                                    TicketValidationStatus.VALID
                            );

                    return TicketTypeAttendanceDto.builder()
                            .ticketTypeId(ticketType.getId())
                            .ticketTypeName(ticketType.getName())
                            .validatedCount(validatedCount)
                            .build();
                })
                .collect(Collectors.toList());
    }

    /**
     * 🆕 Get staff credential information
     */
    public Map<String, Object> getStaffCredentialInfo(UUID staffUserId) {
        Staff staff = staffRepo.findByStaffUserId(staffUserId)
                .orElseThrow(() -> new IllegalStateException("Staff not found"));

        LocalDateTime now = LocalDateTime.now();
        Duration timeUntilExpiry = Duration.between(now, staff.getValidUntil());

        return Map.of(
                "username", staff.getUsername(),
                "email", staff.getEmail(),
                "validFrom", staff.getValidFrom(),
                "validUntil", staff.getValidUntil(),
                "isActive", staff.getIsActive(),
                "isExpired", staff.isExpired(),
                "hoursRemaining", Math.max(0, timeUntilExpiry.toHours()),
                "minutesRemaining", Math.max(0, timeUntilExpiry.toMinutes() % 60),
                "createdAt", staff.getCreatedAt(),
                "lastLogin", staff.getLastLogin()
        );
    }

    /**
     * Legacy method - kept for backward compatibility
     */
    public StaffValidationStatsDto getStaffStats(UUID staffUserId) {
        Staff staff = staffRepo.findByStaffUserId(staffUserId)
                .orElseThrow(() -> new IllegalStateException("Staff not found"));

        long validatedByStaff = ticketValidationRepo
                .countByEvent_IdAndValidationStatusAndStaff_StaffUserId(
                        staff.getEventId(),
                        TicketValidationStatus.VALID,
                        staff.getStaffUserId()
                );

        return StaffValidationStatsDto.builder()
                .staffUserId(staff.getStaffUserId())
                .staffUsername(staff.getUsername())
                .validatedCount(validatedByStaff)
                .build();
    }
}
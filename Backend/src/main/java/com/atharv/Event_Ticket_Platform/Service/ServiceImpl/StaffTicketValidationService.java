package com.atharv.Event_Ticket_Platform.Service.ServiceImpl;

import com.atharv.Event_Ticket_Platform.Domain.Entity.*;
import com.atharv.Event_Ticket_Platform.Domain.Enum.*;
import com.atharv.Event_Ticket_Platform.Exceptions.QrCodeNotFoundException;
import com.atharv.Event_Ticket_Platform.Repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class StaffTicketValidationService {

    private final QrCodeRepo qrCodeRepo;
    private final TicketsRepo ticketsRepo;
    private final TicketValidationRepo ticketValidationRepo;
    private final StaffRepo staffRepo;
    private final EventRepo eventRepo;
    private final UserRepo userRepo;

    @Value("${qr.expiry.minutes}")
    private long qrExpiryMinutes;

    @Transactional
    public TicketValidation validateTicketByStaff(String publicCode, UUID staffUserId) {
        String normalizedCode = normalizePublicCode(publicCode);
        log.info("Staff {} attempting to validate QR code: {}", staffUserId, normalizedCode);

        Staff staff = verifyStaffAccess(staffUserId);

        QrCode qr = qrCodeRepo.findByPublicCode(normalizedCode)
                .orElseThrow(() -> new QrCodeNotFoundException("Invalid QR code"));

        Ticket ticket = qr.getTicket();
        if (ticket == null) {
            throw new IllegalStateException("QR code not linked to any ticket");
        }

        verifyTicketBelongsToStaffEvent(ticket, staff);
        validateQrCode(qr);
        validateTicketStatus(ticket);

        return performValidation(ticket, qr, staff, TicketValidationMethod.QR);
    }

    @Transactional
    public TicketValidation validateTicketManually(String publicCode, UUID staffUserId) {
        String normalizedCode = normalizePublicCode(publicCode);
        log.info("Staff {} attempting MANUAL validation with QR code: {}", staffUserId, normalizedCode);

        Staff staff = verifyStaffAccess(staffUserId);

        QrCode qr = qrCodeRepo.findByPublicCode(normalizedCode)
                .orElseThrow(() ->
                        new QrCodeNotFoundException("Invalid QR code: " + normalizedCode)
                );

        Ticket ticket = qr.getTicket();
        if (ticket == null) {
            throw new IllegalStateException("QR code not linked to any ticket");
        }

        verifyTicketBelongsToStaffEvent(ticket, staff);
        validateQrCode(qr);
        validateTicketStatus(ticket);

        return performValidation(ticket, qr, staff, TicketValidationMethod.MANUAL);
    }

    public Ticket searchTicketForValidation(String publicCode, UUID staffUserId) {
        log.info("Staff {} searching for ticket with QR code: {}", staffUserId, publicCode);

        if (publicCode == null || publicCode.trim().isEmpty()) {
            throw new IllegalArgumentException("QR code is required for search");
        }

        Staff staff = verifyStaffAccess(staffUserId);

        QrCode qr = qrCodeRepo.findByPublicCode(publicCode.trim().toUpperCase())
                .orElseThrow(() -> new QrCodeNotFoundException("QR code not found: " + publicCode));

        Ticket ticket = qr.getTicket();
        if (ticket == null) {
            throw new IllegalStateException("QR code not linked to any ticket");
        }

        verifyTicketBelongsToStaffEvent(ticket, staff);

        LocalDateTime qrExpiry = qr.getGeneratedDateTime().plusMinutes(qrExpiryMinutes);
        if (LocalDateTime.now().isAfter(qrExpiry)) {
            log.warn("QR code {} is expired", qr.getPublicCode());
            throw new IllegalStateException("QR code has expired. Attendee must regenerate QR code.");
        }

        if (qr.getQrCodeStatus() != QrCodeStatus.ACTIVE) {
            log.warn("QR code {} is not active. Status: {}", qr.getPublicCode(), qr.getQrCodeStatus());
            throw new IllegalStateException("QR code is " + qr.getQrCodeStatus().name().toLowerCase());
        }

        return ticket;
    }

    private Staff verifyStaffAccess(UUID staffUserId) {
        Staff staff = staffRepo.findByStaffUserId(staffUserId)
                .orElseThrow(() -> new IllegalStateException("Staff member not found"));

        if (!staff.getIsActive()) {
            log.warn("Inactive staff {} attempted to validate ticket", staffUserId);
            throw new IllegalStateException("Staff account is inactive");
        }

        if (staff.isExpired()) {
            log.warn("Staff {} credentials have expired", staffUserId);
            throw new IllegalStateException("Staff credentials have expired. Please contact the organiser.");
        }

        return staff;
    }

    private void verifyTicketBelongsToStaffEvent(Ticket ticket, Staff staff) {
        Event ticketEvent = ticket.getTicketType().getEvent();
        if (!ticketEvent.getId().equals(staff.getEventId())) {
            log.warn("Staff {} tried to validate ticket for different event. Staff event: {}, Ticket event: {}",
                    staff.getStaffUserId(), staff.getEventId(), ticketEvent.getId());
            throw new IllegalStateException("This ticket is for a different event");
        }
    }

    private void validateQrCode(QrCode qr) {
        LocalDateTime qrExpiry = qr.getGeneratedDateTime().plusMinutes(qrExpiryMinutes);
        LocalDateTime now = LocalDateTime.now();

        if (now.isAfter(qrExpiry)) {
            qr.setQrCodeStatus(QrCodeStatus.EXPIRED);
            qrCodeRepo.save(qr);
            log.warn("QR code {} has expired. Generated: {}, Expiry: {}, Now: {}",
                    qr.getPublicCode(), qr.getGeneratedDateTime(), qrExpiry, now);
            throw new IllegalStateException(
                    String.format("QR code expired %d minutes ago. Attendee must regenerate QR code.",
                            java.time.Duration.between(qrExpiry, now).toMinutes())
            );
        }

        if (qr.getQrCodeStatus() != QrCodeStatus.ACTIVE) {
            log.warn("QR code {} is not active. Status: {}", qr.getPublicCode(), qr.getQrCodeStatus());
            throw new IllegalStateException("QR code already " + qr.getQrCodeStatus().name().toLowerCase());
        }
    }

    private void validateTicketStatus(Ticket ticket) {
        if (ticket.getStatus() == TicketStatus.USED) {
            log.warn("Ticket {} already used", ticket.getId());
            throw new IllegalStateException("Ticket has already been used for entry");
        }

        if (ticket.getStatus() == TicketStatus.CANCELLED) {
            log.warn("Ticket {} is cancelled", ticket.getId());
            throw new IllegalStateException("Ticket has been cancelled");
        }

        if (ticket.getStatus() != TicketStatus.PURCHASED) {
            log.warn("Ticket {} is not in PURCHASED state. Status: {}", ticket.getId(), ticket.getStatus());
            throw new IllegalStateException("Invalid ticket status: " + ticket.getStatus().name());
        }
    }

    private TicketValidation performValidation(
            Ticket ticket,
            QrCode qr,
            Staff staff,
            TicketValidationMethod method
    ) {

        ticket.setStatus(TicketStatus.USED);
        ticketsRepo.save(ticket);

        qr.setQrCodeStatus(QrCodeStatus.EXPIRED);
        qrCodeRepo.save(qr);

        Event event = ticket.getTicketType().getEvent();
        TicketValidation validation = TicketValidation.builder()
                .ticket(ticket)
                .staff(staff)
                .event(event)
                .validationStatus(TicketValidationStatus.VALID)
                .validatedAt(LocalDateTime.now())
                .ValidationMethod(method)
                .build();

        TicketValidation savedValidation = ticketValidationRepo.save(validation);

        staff.setLastLogin(LocalDateTime.now());
        staffRepo.save(staff);

        log.info(" Ticket {} successfully validated by staff {} using {} (QR: {})",
                ticket.getId(), staff.getStaffUserId(), method, qr.getPublicCode());

        registerAttendeeForEvent(ticket);

        return savedValidation;
    }

    private String normalizePublicCode(String publicCode) {
        if (publicCode == null) {
            throw new IllegalArgumentException("QR code is required");
        }
        return publicCode.trim().toUpperCase(Locale.ROOT);
    }

    private void registerAttendeeForEvent(Ticket ticket) {
        User attendee = ticket.getPurchaser();
        Event event = ticket.getTicketType().getEvent();

        boolean alreadyAttending = attendee.getAttendingEvents().stream()
                .anyMatch(e -> e.getId().equals(event.getId()));

        if (!alreadyAttending) {

            event.getAttendees().add(attendee);

            attendee.getAttendingEvents().add(event);

            eventRepo.save(event);
            userRepo.save(attendee);

            log.info("Registered attendee {} for event {} via ticket validation",
                    attendee.getId(), event.getId());
        } else {
            log.debug("Attendee {} already registered for event {}",
                    attendee.getId(), event.getId());
        }
    }

}

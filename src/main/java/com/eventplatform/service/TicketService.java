package com.eventplatform.service;

import com.eventplatform.model.Event;
import com.eventplatform.model.Ticket;
import com.eventplatform.model.User;
import com.eventplatform.repository.EventRepository;
import com.eventplatform.repository.TicketRepository;
import com.eventplatform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final QRCodeService qrCodeService;
    private final EmailService emailService;

    @Transactional
    public Ticket purchaseTicket(Long eventId, Long userId, Integer quantity) throws Exception {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (event.getAvailableTickets() < quantity) {
            throw new RuntimeException("Not enough tickets available");
        }

        // Update available tickets
        event.setAvailableTickets(event.getAvailableTickets() - quantity);
        eventRepository.save(event);

        // Create ticket
        Ticket ticket = new Ticket();
        ticket.setEvent(event);
        ticket.setAttendee(user);
        ticket.setPurchasePrice(event.getTicketPrice());
        ticket.setStatus(Ticket.TicketStatus.VALID);

        // Generate unique ticket data for QR code
        String uniqueData = UUID.randomUUID().toString() + "|" +
                eventId + "|" +
                userId + "|" +
                LocalDateTime.now();

        // Generate QR code
        String qrCodeBase64 = qrCodeService.generateQRCodeBase64(uniqueData);
        ticket.setQrCodeData(uniqueData);

        // Save QR code image
        String fileName = "qrcodes/ticket_" + ticket.getTicketNumber() + ".png";
        qrCodeService.saveQRCodeImage(uniqueData, fileName);
        ticket.setQrCodeImagePath(fileName);

        Ticket savedTicket = ticketRepository.save(ticket);

        // Send confirmation email
        emailService.sendTicketConfirmation(user.getEmail(), savedTicket);

        return savedTicket;
    }

    @Transactional(readOnly = true)
    public boolean validateTicket(String qrCodeData) {
        Ticket ticket = ticketRepository.findByTicketNumber(
                qrCodeData.split("\\|")[0].replace("TICK-", "")
        ).orElse(null);

        if (ticket == null) {
            return false;
        }

        if (ticket.getStatus() != Ticket.TicketStatus.VALID) {
            return false;
        }

        // Check if ticket hasn't expired (event hasn't passed)
        Event event = ticket.getEvent();
        if (event.getEndDateTime().isBefore(LocalDateTime.now())) {
            return false;
        }

        return true;
    }

    @Transactional
    public void scanTicket(String ticketNumber) {
        Ticket ticket = ticketRepository.findByTicketNumber(ticketNumber)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (ticket.getStatus() != Ticket.TicketStatus.VALID) {
            throw new RuntimeException("Ticket is not valid");
        }

        ticket.setStatus(Ticket.TicketStatus.USED);
        ticketRepository.save(ticket);
    }
}
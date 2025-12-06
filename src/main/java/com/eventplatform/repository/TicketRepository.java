package com.eventplatform.repository;

import com.eventplatform.model.Event;
import com.eventplatform.model.Ticket;
import com.eventplatform.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByAttendee(User attendee);
    List<Ticket> findByEvent(Event event);
    Optional<Ticket> findByTicketNumber(String ticketNumber);
    Long countByEventAndStatus(Event event, Ticket.TicketStatus status);
    List<Ticket> findByEventAndAttendee(Event event, User attendee);
}
package com.atharv.Event_Ticket_Platform.Repository;

import com.atharv.Event_Ticket_Platform.Domain.Entity.Ticket;
import com.atharv.Event_Ticket_Platform.Domain.Enum.TicketStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TicketsRepo extends JpaRepository<Ticket, UUID> {

    Page<Ticket> findByPurchaser_Id(UUID userID, Pageable pageable);

    long countByTicketType_Event_Id(UUID eventId);

    @Query("SELECT COUNT(t) FROM Ticket t " +
            "WHERE t.ticketType.event.id = :eventId " +
            "AND t.status = :status")
    long countByTicketType_Event_IdAndStatus(
            @Param("eventId") UUID eventId,
            @Param("status") TicketStatus status
    );

    @Query("SELECT t FROM Ticket t WHERE t.ticketType.event.id = :eventId")
    Page<Ticket> findByEventId(@Param("eventId") UUID eventId, Pageable pageable);

    /**
     * ✅ NEW: Get all tickets for an event (for revenue calculation)
     */
    @Query("SELECT t FROM Ticket t WHERE t.ticketType.event.id = :eventId")
    List<Ticket> findAllByEventId(@Param("eventId") UUID eventId);
}

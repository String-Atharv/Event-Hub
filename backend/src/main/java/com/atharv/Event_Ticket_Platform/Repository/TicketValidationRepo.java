package com.atharv.Event_Ticket_Platform.Repository;

import com.atharv.Event_Ticket_Platform.Domain.Entity.TicketValidation;
import com.atharv.Event_Ticket_Platform.Domain.Enum.TicketValidationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface TicketValidationRepo extends JpaRepository<TicketValidation, UUID> {

    // Existing methods
    long countByEvent_IdAndValidationStatus(UUID eventId, TicketValidationStatus status);

    long countByEvent_IdAndValidationStatusAndStaff_StaffUserId(
            UUID eventId,
            TicketValidationStatus status,
            UUID staffId
    );

    long countByEvent_IdAndTicket_TicketType_IdAndValidationStatus(
            UUID eventId,
            Integer ticketTypeId,
            TicketValidationStatus status
    );

    @Query("SELECT tv FROM TicketValidation tv " +
            "WHERE tv.event.id = :eventId " +
            "AND tv.staff.staffUserId = :staffUserId " +
            "ORDER BY tv.validatedAt DESC")
    Page<TicketValidation> findByEvent_IdAndStaff_StaffUserId(
            @Param("eventId") UUID eventId,
            @Param("staffUserId") UUID staffUserId,
            Pageable pageable
    );

    @Query("SELECT tv FROM TicketValidation tv " +
            "WHERE tv.event.id = :eventId " +
            "ORDER BY tv.validatedAt DESC")
    Page<TicketValidation> findByEvent_Id(
            @Param("eventId") UUID eventId,
            Pageable pageable
    );

    /**
     * ✅ NEW: Count validations by staff and ticket type
     */
    @Query("SELECT COUNT(tv) FROM TicketValidation tv " +
            "WHERE tv.staff.staffUserId = :staffUserId " +
            "AND tv.ticket.ticketType.id = :ticketTypeId " +
            "AND tv.validationStatus = :status")
    long countByStaff_StaffUserIdAndTicket_TicketType_IdAndValidationStatus(
            @Param("staffUserId") UUID staffUserId,
            @Param("ticketTypeId") Integer ticketTypeId,
            @Param("status") TicketValidationStatus status
    );

    /**
     * Find all validated attendees for an event
     */
    @Query("SELECT DISTINCT tv FROM TicketValidation tv " +
            "JOIN FETCH tv.ticket t " +
            "JOIN FETCH t.purchaser " +
            "WHERE tv.event.id = :eventId " +
            "AND tv.validationStatus = :status " +
            "ORDER BY tv.validatedAt DESC")
    Page<TicketValidation> findValidatedAttendeesByEvent(
            @Param("eventId") UUID eventId,
            @Param("status") TicketValidationStatus status,
            Pageable pageable
    );



}

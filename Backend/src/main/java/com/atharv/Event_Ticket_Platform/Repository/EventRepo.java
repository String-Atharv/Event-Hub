package com.atharv.Event_Ticket_Platform.Repository;

import com.atharv.Event_Ticket_Platform.Domain.Entity.Event;
import com.atharv.Event_Ticket_Platform.Domain.Enum.EventStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface EventRepo extends JpaRepository<Event, UUID> {
    Page<Event> findByOrganiserId(UUID organiserId ,Pageable pageable);
    Optional<Event> findByIdAndOrganiser_id(UUID eventId, UUID organiserId);

    Page<Event> findByEventStatus(EventStatus eventStatus, Pageable pageable);

    Page<Event> findByEventStatusAndNameContainingIgnoreCase(
            EventStatus eventStatus,
            String name,
            Pageable pageable
    );

}

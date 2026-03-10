package com.atharv.Event_Ticket_Platform.Repository;

import com.atharv.Event_Ticket_Platform.Domain.Entity.Staff;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface  StaffRepo extends JpaRepository<Staff, Long> {

    Page<Staff> findByCreatedByOrganiserIdAndEventId(
            UUID organiserId,
            UUID eventId,
            Pageable pageable
    );

    Page<Staff> findByCreatedByOrganiserIdAndEventIdAndIsActiveTrue(
            UUID organiserId,
            UUID eventId,
            Pageable pageable
    );

    @Query("SELECT s FROM Staff s WHERE s.createdByOrganiserId = :organiserId " +
            "AND s.eventId = :eventId " +
            "AND s.isActive = true " +
            "AND s.validUntil > :now")
    Page<Staff> findValidStaffByEvent(
            @Param("organiserId") UUID organiserId,
            @Param("eventId") UUID eventId,
            @Param("now") LocalDateTime now,
            Pageable pageable
    );

    Optional<Staff> findByStaffUserId(UUID staffUserId);

    List<Staff> findByCreatedByOrganiserIdAndIsActiveTrue(UUID organiserId);

    List<Staff> findByCreatedByOrganiserIdAndEventId(
            UUID organiserId,
            UUID eventId
    );

    boolean existsByStaffUserId(UUID staffUserId);

    @Query("SELECT COUNT(s) FROM Staff s WHERE s.eventId = :eventId " +
            "AND s.isActive = true " +
            "AND s.validUntil > :now")
    long countActiveStaffByEvent(
            @Param("eventId") UUID eventId,
            @Param("now") LocalDateTime now
    );

    Optional<Staff> findByUsername(String identifier);
}

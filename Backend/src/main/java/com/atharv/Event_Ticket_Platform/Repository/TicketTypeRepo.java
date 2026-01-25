package com.atharv.Event_Ticket_Platform.Repository;

import com.atharv.Event_Ticket_Platform.Domain.Entity.TicketType;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;


@Repository
public interface TicketTypeRepo extends JpaRepository<TicketType,Integer> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("Select tt from TicketType tt where tt.id = :id")
    Optional<TicketType> findByIdForUpdate(@Param("id") Integer id);

}

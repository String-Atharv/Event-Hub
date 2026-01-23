package com.atharv.Event_Ticket_Platform.Repository;

import com.atharv.Event_Ticket_Platform.Domain.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface UserRepo extends JpaRepository<User, UUID> {
}

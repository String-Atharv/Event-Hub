package com.atharv.Event_Ticket_Platform.Service.ServiceInterface;

import com.atharv.Event_Ticket_Platform.Domain.Entity.User;

import java.util.UUID;

public interface UserService {
    User getUserById(UUID userId);
}

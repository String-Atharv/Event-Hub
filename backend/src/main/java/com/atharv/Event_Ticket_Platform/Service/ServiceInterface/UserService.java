package com.atharv.Event_Ticket_Platform.Service.ServiceInterface;

import com.atharv.Event_Ticket_Platform.Domain.Entity.User;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.UUID;

public interface UserService {
    User ensureUserExists(UUID keycloakId, Jwt jwt);
}

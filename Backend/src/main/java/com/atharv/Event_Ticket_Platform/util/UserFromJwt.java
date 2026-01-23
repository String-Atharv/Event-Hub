package com.atharv.Event_Ticket_Platform.util;


import org.springframework.security.oauth2.jwt.Jwt;

import java.util.UUID;

public final class UserFromJwt {
    private UserFromJwt(){}
    public static UUID parseUserId(Jwt jwt){
        return UUID.fromString(jwt.getSubject());
    }
}

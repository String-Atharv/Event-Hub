package com.atharv.Event_Ticket_Platform.Controllers;

import com.atharv.Event_Ticket_Platform.Service.ServiceImpl.KeycloakRoleService;
import com.atharv.Event_Ticket_Platform.util.UserFromJwt;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/roles")
@RequiredArgsConstructor
@Slf4j
public class KeycloakRoleController {

    private final KeycloakRoleService keycloakRoleService;

    /**
     * Endpoint called when user clicks "List an Event" button
     * This promotes them to ROLE_ORGANISER in Keycloak
     */
    @PostMapping("/promote-to-organiser")
    public ResponseEntity<Map<String, Object>> promoteToOrganiser(@AuthenticationPrincipal Jwt jwt) {
        UUID userId = UserFromJwt.parseUserId(jwt);
        log.info("User {} requesting promotion to ROLE_ORGANISER", userId);

        try {
            keycloakRoleService.promoteToOrganiser(userId.toString());

            List<String> updatedRoles = keycloakRoleService.getUserRoles(userId.toString());

            return ResponseEntity.ok(Map.of(
                    "message", "Successfully promoted to organiser. Please log out and log back in for changes to take effect.",
                    "userId", userId,
                    "roles", updatedRoles,
                    "requiresRelogin", true  // Frontend should prompt user to re-login
            ));
        } catch (Exception e) {
            log.error("Failed to promote user {} to organiser: {}", userId, e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Failed to promote user",
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * Get current user's roles from Keycloak
     */
    @GetMapping("/my-roles")
    public ResponseEntity<Map<String, Object>> getMyRoles(@AuthenticationPrincipal Jwt jwt) {
        UUID userId = UserFromJwt.parseUserId(jwt);

        try {
            List<String> roles = keycloakRoleService.getUserRoles(userId.toString());

            return ResponseEntity.ok(Map.of(
                    "userId", userId,
                    "roles", roles
            ));
        } catch (Exception e) {
            log.error("Failed to get roles for user {}: {}", userId, e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Failed to retrieve roles",
                    "message", e.getMessage()
            ));
        }
    }
}
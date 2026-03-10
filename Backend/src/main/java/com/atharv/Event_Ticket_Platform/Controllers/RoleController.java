package com.atharv.Event_Ticket_Platform.Controllers;

import com.atharv.Event_Ticket_Platform.Domain.Entity.User;
import com.atharv.Event_Ticket_Platform.Security.UserPrincipal;
import com.atharv.Event_Ticket_Platform.Service.ServiceImpl.RoleElevationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/roles")
@RequiredArgsConstructor
@Slf4j
public class RoleController {

    private final RoleElevationService roleElevationService;

    @PostMapping("/promote-to-organiser")
    public ResponseEntity<?> promoteToOrganiser(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            log.info("User {} requesting organiser role promotion", userPrincipal.getEmail());

            User user = roleElevationService.promoteToOrganiser();

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "You have been promoted to ORGANISER role",
                    "userId", user.getId(),
                    "email", user.getEmail(),
                    "roles", user.getRoles(),
                    "note", "Please refresh your authentication token to access organiser features"
            ));

        } catch (Exception e) {
            log.error("Failed to promote user to organiser: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Failed to promote to organiser role",
                    "error", e.getMessage()
            ));
        }
    }

    @GetMapping("/is-organiser")
    public ResponseEntity<?> checkIsOrganiser(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            boolean isOrganiser = roleElevationService.isOrganiser();

            return ResponseEntity.ok(Map.of(
                    "isOrganiser", isOrganiser,
                    "email", userPrincipal.getEmail(),
                    "userId", userPrincipal.getUserId(),
                    "currentRolesInToken", userPrincipal.getRoles(),
                    "note", isOrganiser ?
                            "User has ORGANISER role in database" :
                            "User does not have ORGANISER role"
            ));

        } catch (Exception e) {
            log.error("Failed to check organiser status: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Failed to check organiser status",
                    "message", e.getMessage()
            ));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            User user = roleElevationService.getCurrentUser();

            return ResponseEntity.ok(Map.of(
                    "userId", user.getId(),
                    "name", user.getName(),
                    "email", user.getEmail(),
                    "roles", user.getRoles(),
                    "rolesInCurrentToken", userPrincipal.getRoles(),
                    "tokenNeedsRefresh", !userPrincipal.getRoles().containsAll(user.getRoles())
            ));

        } catch (Exception e) {
            log.error("Failed to get current user: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Failed to get user information",
                    "message", e.getMessage()
            ));
        }
    }

  
}

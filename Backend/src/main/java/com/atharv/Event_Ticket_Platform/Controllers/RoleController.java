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

/**
 * Controller for managing user roles
 * Provides endpoints to promote users to ORGANISER and check role status
 */
@RestController
@RequestMapping("/api/v1/roles")
@RequiredArgsConstructor
@Slf4j
public class RoleController {

    private final RoleElevationService roleElevationService;

    /**
     * ✅ Promote current user to ORGANISER role
     * POST /api/v1/roles/promote-to-organiser
     *
     * This allows users to explicitly request organiser role promotion
     * instead of waiting for automatic promotion on first organiser endpoint access
     */
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

    /**
     * ✅ Check if current user has ORGANISER role
     * GET /api/v1/roles/is-organiser
     *
     * Returns whether the authenticated user has organiser role
     */
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

    /**
     * ✅ Get current user profile with roles
     * GET /api/v1/roles/me
     *
     * Returns complete user information including all roles
     */
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

    /**
     * ✅ Get all available roles in the system
     * GET /api/v1/roles/available
     *
     * Returns list of all possible roles
     */
    @GetMapping("/available")
    public ResponseEntity<?> getAvailableRoles() {
        return ResponseEntity.ok(Map.of(
                "roles", new String[]{
                        "ROLE_USER",
                        "ROLE_ORGANISER",
                        "ROLE_STAFF"
                },
                "descriptions", Map.of(
                        "ROLE_USER", "Default role for all registered users - can browse and purchase tickets",
                        "ROLE_ORGANISER", "Can create events, manage tickets, view analytics, and create staff",
                        "ROLE_STAFF", "Can validate tickets for specific events (time-limited access)"
                )
        ));
    }
}
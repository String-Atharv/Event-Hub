package com.atharv.Event_Ticket_Platform.Service.ServiceImpl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.UserResource;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.representations.idm.RoleRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class KeycloakRoleService {

    private final Keycloak keycloak;

    @Value("${keycloak.admin.realm}")
    private String realm;

    /**
     * Get the RealmResource for the configured realm
     */
    private RealmResource getRealmResource() {
        return keycloak.realm(realm);
    }

    /**
     * Get UserResource for a specific user
     */
    private UserResource getUserResource(String userId) {
        return getRealmResource().users().get(userId);
    }

    /**
     * Assign a realm role to a user
     */
    public void assignRole(String userId, String roleName) {
        log.info("Assigning role {} to user {} in Keycloak", roleName, userId);

        try {
            UserResource userResource = getUserResource(userId);

            // Get the role from realm
            RoleRepresentation role = getRealmResource()
                    .roles()
                    .get(roleName)
                    .toRepresentation();

            // Assign role to user
            userResource.roles().realmLevel().add(Collections.singletonList(role));

            log.info("Successfully assigned role {} to user {}", roleName, userId);
        } catch (Exception e) {
            log.error("Failed to assign role {} to user {}: {}", roleName, userId, e.getMessage());
            throw new RuntimeException("Failed to assign role in Keycloak", e);
        }
    }

    /**
     * Remove a realm role from a user
     */
    public void removeRole(String userId, String roleName) {
        log.info("Removing role {} from user {} in Keycloak", roleName, userId);

        try {
            UserResource userResource = getUserResource(userId);

            RoleRepresentation role = getRealmResource()
                    .roles()
                    .get(roleName)
                    .toRepresentation();

            userResource.roles().realmLevel().remove(Collections.singletonList(role));

            log.info("Successfully removed role {} from user {}", roleName, userId);
        } catch (Exception e) {
            log.error("Failed to remove role {} from user {}: {}", roleName, userId, e.getMessage());
            throw new RuntimeException("Failed to remove role in Keycloak", e);
        }
    }

    /**
     * Check if user has a specific role
     */
    public boolean hasRole(String userId, String roleName) {
        try {
            UserResource userResource = getUserResource(userId);

            List<RoleRepresentation> roles = userResource.roles().realmLevel().listAll();

            return roles.stream()
                    .anyMatch(role -> role.getName().equals(roleName));
        } catch (Exception e) {
            log.error("Failed to check role for user {}: {}", userId, e.getMessage());
            return false;
        }
    }

    /**
     * Get all roles for a user
     */
    public List<String> getUserRoles(String userId) {
        try {
            UserResource userResource = getUserResource(userId);

            return userResource.roles().realmLevel().listAll().stream()
                    .map(RoleRepresentation::getName)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Failed to get roles for user {}: {}", userId, e.getMessage());
            return Collections.emptyList();
        }
    }

    /**
     * Promote user to ROLE_ORGANISER
     */
    public void promoteToOrganiser(String userId) {
        if (!hasRole(userId, "ROLE_ORGANISER")) {
            assignRole(userId, "ROLE_ORGANISER");
        } else {
            log.info("User {} already has ROLE_ORGANISER", userId);
        }
    }

    /**
     * Assign default ROLE_ATTENDEE to new users
     */
    public void assignDefaultRole(String userId) {
        if (!hasRole(userId, "ROLE_ATTENDEE")) {
            assignRole(userId, "ROLE_ATTENDEE");
        } else {
            log.debug("User {} already has ROLE_ATTENDEE", userId);
        }
    }
}
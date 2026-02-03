package com.atharv.Event_Ticket_Platform.Service.ServiceImpl;

import com.atharv.Event_Ticket_Platform.Domain.Entity.User;
import com.atharv.Event_Ticket_Platform.Exceptions.UserNotFoundExceptions;
import com.atharv.Event_Ticket_Platform.Repository.UserRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service to handle automatic role elevation
 * When users access organiser-specific endpoints, they are automatically promoted to ORGANISER role
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RoleElevationService {

    private final UserRepo userRepo;

    /**
     * Promote current authenticated user to ORGANISER role
     * This is called automatically when user attempts to access EventController or AnalyticsController
     */
    @Transactional
    public User promoteToOrganiser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("No authenticated user found");
        }

        String email = authentication.getName();
        User user = userRepo.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new UserNotFoundExceptions("User not found with email: " + email));

        // Add ORGANISER role if not already present
        if (!user.hasRole("ROLE_ORGANISER")) {
            log.info("Promoting user {} to ORGANISER role", email);
            user.addRole("ROLE_ORGANISER");
            user = userRepo.save(user);

            // Note: The user's current authentication won't be updated
            // They may need to re-authenticate to get the new role in their token
            log.info("User {} has been promoted to ORGANISER. They may need to refresh their token.", email);
        } else {
            log.debug("User {} already has ORGANISER role", email);
        }

        return user;
    }

    /**
     * Check if current user has ORGANISER role
     */
    @Transactional(readOnly = true)
    public boolean isOrganiser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        String email = authentication.getName();
        return userRepo.findByEmailIgnoreCase(email)
                .map(user -> user.hasRole("ROLE_ORGANISER"))
                .orElse(false);
    }

    /**
     * Get current authenticated user
     */
    @Transactional(readOnly = true)
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("No authenticated user found");
        }

        String email = authentication.getName();
        return userRepo.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new UserNotFoundExceptions("User not found with email: " + email));
    }
}
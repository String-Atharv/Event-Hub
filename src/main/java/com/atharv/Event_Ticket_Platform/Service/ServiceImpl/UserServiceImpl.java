package com.atharv.Event_Ticket_Platform.Service.ServiceImpl;

import com.atharv.Event_Ticket_Platform.Domain.Entity.User;
import com.atharv.Event_Ticket_Platform.Repository.UserRepo;
import com.atharv.Event_Ticket_Platform.Service.ServiceInterface.UserService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {
    private final UserRepo userRepo;


    @Transactional
    @Override
    public User ensureUserExists(UUID keycloakId, Jwt jwt) {
        log.info("=== ensureUserExists called for keycloakId: {}", keycloakId);

        // Check if user already exists in database
        Optional<User> existingUser = userRepo.findById(keycloakId);

        if (existingUser.isPresent()) {
            User user = existingUser.get();
            log.info("User FOUND in DB - ID: {}, Email: {}, createdAt: {}, updatedAt: {}",
                    user.getId(), user.getEmail(), user.getCreatedAt(), user.getUpdatedAt());
            return user;
        } else {
            log.info("User NOT FOUND - Creating new user from JWT");

            // Extract user information from JWT claims
            String name = jwt.getClaimAsString("name");
            String email = jwt.getClaimAsString("email");
            String preferredUsername = jwt.getClaimAsString("preferred_username");

            // Log JWT claims for debugging
            log.debug("JWT Claims - name: {}, email: {}, preferred_username: {}",
                    name, email, preferredUsername);

            // Build new user entity
            User user = User.builder()
                    .id(keycloakId)
                    .name(name != null ? name : (preferredUsername != null ? preferredUsername : "Unknown"))
                    .email(email != null ? email : "unknown@example.com")
                    .build();

            // Save to database with flush to ensure immediate persistence
            User savedUser = userRepo.saveAndFlush(user);

            log.info("User CREATED - ID: {}, Email: {}, Name: {}, createdAt: {}, updatedAt: {}",
                    savedUser.getId(),
                    savedUser.getEmail(),
                    savedUser.getName(),
                    savedUser.getCreatedAt(),
                    savedUser.getUpdatedAt());

            return savedUser;
        }
    }}


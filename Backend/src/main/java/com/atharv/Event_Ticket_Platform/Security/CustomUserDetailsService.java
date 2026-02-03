package com.atharv.Event_Ticket_Platform.Security;

import com.atharv.Event_Ticket_Platform.Domain.Entity.User;
import com.atharv.Event_Ticket_Platform.Repository.UserRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;  // ✅ Add this
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j  // ✅ Add this
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepo userRepo;

    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {

        // ✅ Normalize email to lowercase
        String normalizedEmail = email.toLowerCase().trim();

        log.info("🔍 Loading user by email: {}", normalizedEmail);

        User user = userRepo.findByEmail(normalizedEmail)
                .orElseThrow(() -> {
                    log.error("❌ User not found with email: {}", normalizedEmail);
                    return new UsernameNotFoundException("User not found with email: " + normalizedEmail);
                });

        log.info("✅ User found: id={}, email={}", user.getId(), user.getEmail());
        log.info("📝 User password from DB: {}", user.getPassword() != null ? "EXISTS (length: " + user.getPassword().length() + ")" : "NULL");
        log.info("👤 User roles: {}", user.getRoles());

        List<String> roles = user.getRoles() != null && !user.getRoles().isEmpty()
                ? new ArrayList<>(user.getRoles())
                : List.of("ROLE_ATTENDEE");

        UserPrincipal userPrincipal = new UserPrincipal(
                user.getId(),
                user.getEmail(),
                user.getEmail(),
                user.getPassword(),
                roles
        );

        log.info("🔐 UserPrincipal password: {}",
                userPrincipal.getPassword() != null ? "SET (length: " + userPrincipal.getPassword().length() + ")" : "NULL");

        return userPrincipal;
    }
}
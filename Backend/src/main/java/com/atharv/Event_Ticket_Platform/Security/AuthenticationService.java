package com.atharv.Event_Ticket_Platform.Security;

import com.atharv.Event_Ticket_Platform.Domain.Entity.Staff;
import com.atharv.Event_Ticket_Platform.Domain.Entity.User;
import com.atharv.Event_Ticket_Platform.Repository.StaffRepo;
import com.atharv.Event_Ticket_Platform.Repository.UserRepo;
import com.atharv.Event_Ticket_Platform.Security.Dto.AuthenticationRequest;
import com.atharv.Event_Ticket_Platform.Security.Dto.AuthenticationResponse;
import com.atharv.Event_Ticket_Platform.Security.Dto.RegisterRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

/**
 * Authentication Service
 * Handles user registration, authentication, and token generation
 */
@Service
@Slf4j  // ✅ Add this
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepo userRepo;
    private final StaffRepo staffRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    /**
     * Register new user
     */
    @Transactional
    public AuthenticationResponse register(RegisterRequest request) {

        // ✅ Normalize email to lowercase
        String normalizedEmail = request.getEmail().toLowerCase().trim();

        log.info("📝 Registering user: {}", normalizedEmail);

        // Check if user already exists
        if (userRepo.findByEmail(normalizedEmail).isPresent()) {
            throw new RuntimeException("User with email already exists");
        }

        Set<String> initialRoles = new HashSet<>();
        initialRoles.add("ROLE_ATTENDEE");

        String encodedPassword = passwordEncoder.encode(request.getPassword());

        User user = User.builder()
                .email(normalizedEmail)  // ✅ Use normalized email
                .password(encodedPassword)
                .name(request.getName())
                .roles(initialRoles)
                .build();

        userRepo.save(user);
        log.info("✅ User saved to database with ID: {}", user.getId());

        UserDetails userDetails = userDetailsService.loadUserByUsername(normalizedEmail);

        String jwtToken = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        return AuthenticationResponse.builder()
                .accessToken(jwtToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(3600L)
                .build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {

        // ✅ Normalize email to lowercase
        String normalizedIdentifier = request.getIdentifier().toLowerCase().trim();

        log.info("🔑 Authentication attempt for: {}", normalizedIdentifier);

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            normalizedIdentifier,  // ✅ Use normalized email
                            request.getPassword()
                    )
            );
            log.info("✅ Authentication successful for: {}", normalizedIdentifier);
        } catch (Exception e) {
            log.error("❌ Authentication failed for: {} - Reason: {}",
                    normalizedIdentifier, e.getMessage());
            throw e;
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(normalizedIdentifier);

        String jwtToken = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        return AuthenticationResponse.builder()
                .accessToken(jwtToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(3600L)
                .build();
    }
    /**
     * Authenticate staff and generate token
     */
    public AuthenticationResponse authenticateStaff(AuthenticationRequest request) {


        // Authenticate staff credentials
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getIdentifier(),
                        request.getPassword()
                )
        );

        User user = userRepo.findByEmailIgnoreCase(request.getIdentifier()).orElseThrow(()-> new UsernameNotFoundException("user not found"));

        Staff staff = staffRepo.findByStaffUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("No staff assignment"));

        if (!staff.isValidNow()) {
            throw new RuntimeException("Staff access expired or inactive");
        }


        // Load staff details
        UserDetails staffDetails = userDetailsService.loadUserByUsername(request.getIdentifier());

        // Generate JWT token
        String jwtToken = jwtService.generateToken(staffDetails);
        String refreshToken = jwtService.generateRefreshToken(staffDetails);

        return AuthenticationResponse.builder()
                .accessToken(jwtToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(3600L) // 1 hour
                .build();
    }

    /**
     * Refresh JWT token
     */
    public AuthenticationResponse refreshToken(String refreshToken) {

        // Extract token from "Bearer " prefix
        if (refreshToken != null && refreshToken.startsWith("Bearer ")) {
            refreshToken = refreshToken.substring(7);
        }

        // Extract username from refresh token
        String username = jwtService.extractUsername(refreshToken);

        if (username != null) {
            // Load user details
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            // Validate refresh token
            if (jwtService.isTokenValid(refreshToken, userDetails)) {
                // Generate new access token
                String accessToken = jwtService.generateToken(userDetails);

                return AuthenticationResponse.builder()
                        .accessToken(accessToken)
                        .refreshToken(refreshToken)
                        .tokenType("Bearer")
                        .expiresIn(3600L)
                        .build();
            }
        }

        throw new RuntimeException("Invalid refresh token");
    }

    // ========== ADDED: Method to promote user to ORGANISER ==========
    /**
     * Promote user to ORGANISER role
     * Call this when user first accesses organiser endpoints
     */
    @Transactional
    public User promoteToOrganiser(String email) {
        User user = userRepo.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        // Add ORGANISER role if not already present
        if (!user.hasRole("ROLE_ORGANISER")) {
            user.addRole("ROLE_ORGANISER");
            user = userRepo.save(user);
        }

        return user;
    }
    // ===============================================================
}
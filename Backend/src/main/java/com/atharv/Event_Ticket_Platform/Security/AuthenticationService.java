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

@Service
@Slf4j
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepo userRepo;
    private final StaffRepo staffRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    @Transactional
    public AuthenticationResponse register(RegisterRequest request) {

        String normalizedEmail = request.getEmail().toLowerCase().trim();

        log.info("Registering user: {}", normalizedEmail);

        if (userRepo.findByEmail(normalizedEmail).isPresent()) {
            throw new RuntimeException("User with email already exists");
        }

        Set<String> initialRoles = new HashSet<>();
        initialRoles.add("ROLE_ATTENDEE");

        String encodedPassword = passwordEncoder.encode(request.getPassword());

        User user = User.builder()
                .email(normalizedEmail)
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

        String normalizedIdentifier = request.getIdentifier().toLowerCase().trim();

        log.info("Authentication attempt for: {}", normalizedIdentifier);

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            normalizedIdentifier,
                            request.getPassword()
                    )
            );
            log.info("Authentication successful for: {}", normalizedIdentifier);
        } catch (Exception e) {
            log.error(" Authentication failed for: {} - Reason: {}",
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

    public AuthenticationResponse authenticateStaff(AuthenticationRequest request) {

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

        UserDetails staffDetails = userDetailsService.loadUserByUsername(request.getIdentifier());

        String jwtToken = jwtService.generateToken(staffDetails);
        String refreshToken = jwtService.generateRefreshToken(staffDetails);

        return AuthenticationResponse.builder()
                .accessToken(jwtToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(3600L)
                .build();
    }

    public AuthenticationResponse refreshToken(String refreshToken) {

        if (refreshToken != null && refreshToken.startsWith("Bearer ")) {
            refreshToken = refreshToken.substring(7);
        }

        String username = jwtService.extractUsername(refreshToken);

        if (username != null) {

            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            if (jwtService.isTokenValid(refreshToken, userDetails)) {

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

    @Transactional
    public User promoteToOrganiser(String email) {
        User user = userRepo.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        if (!user.hasRole("ROLE_ORGANISER")) {
            user.addRole("ROLE_ORGANISER");
            user = userRepo.save(user);
        }

        return user;
    }

}

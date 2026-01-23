package com.atharv.Event_Ticket_Platform.Filters;

import com.atharv.Event_Ticket_Platform.Domain.Entity.Staff;
import com.atharv.Event_Ticket_Platform.Repository.StaffRepo;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.springframework.security.core.context.SecurityContextHolder.*;

/**
 * ✅ Filter to validate staff credentials on each request
 * Checks if staff member's credentials are still valid
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class StaffValidationFilter extends OncePerRequestFilter {

    private final StaffRepo staffRepo;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        Authentication authentication = getContext().getAuthentication();

        if (authentication != null &&
                authentication.isAuthenticated() &&
                authentication.getPrincipal() instanceof Jwt jwt) {

            // Check if user has ROLE_STAFF
            boolean isStaff = authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .anyMatch(role -> role.equals("ROLE_STAFF"));

            if (isStaff) {
                UUID staffUserId = UUID.fromString(jwt.getSubject());

                Optional<Staff> staffOpt = staffRepo.findByStaffUserId(staffUserId);

                if (staffOpt.isPresent()) {
                    Staff staff = staffOpt.get();

                    // Update last login time
                    if (staff.getLastLogin() == null ||
                            staff.getLastLogin().isBefore(LocalDateTime.now().minusMinutes(5))) {
                        staff.setLastLogin(LocalDateTime.now());
                        staffRepo.save(staff);
                    }

                    // ✅ Check if credentials are expired
                    if (staff.isExpired()) {
                        log.warn("Staff member {} credentials have expired", staffUserId);
                        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                        response.setContentType("application/json");
                        response.getWriter().write(
                                "{\"error\": \"Staff credentials expired\", " +
                                        "\"message\": \"Your access credentials have expired. Please contact the event organiser.\"}"
                        );
                        return;
                    }

                    // ✅ Check if account is inactive
                    if (!staff.getIsActive()) {
                        log.warn("Staff member {} account is inactive", staffUserId);
                        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                        response.setContentType("application/json");
                        response.getWriter().write(
                                "{\"error\": \"Account inactive\", " +
                                        "\"message\": \"Your account has been deactivated. Please contact the event organiser.\"}"
                        );
                        return;
                    }
                }
            }
        }

        filterChain.doFilter(request, response);
    }
}

package com.atharv.Event_Ticket_Platform.Filters;

import com.atharv.Event_Ticket_Platform.Domain.Entity.Staff;
import com.atharv.Event_Ticket_Platform.Repository.StaffRepo;
import com.atharv.Event_Ticket_Platform.Security.UserPrincipal;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.springframework.security.core.context.SecurityContextHolder.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class StaffValidationFilter extends OncePerRequestFilter {

    private final StaffRepo staffRepo;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !request.getRequestURI().startsWith("/api/v1/staff/validation");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null &&
                authentication.isAuthenticated() &&
                authentication.getPrincipal() instanceof UserPrincipal userPrincipal) {

            boolean isStaff = authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .anyMatch("ROLE_STAFF"::equals);

            if (isStaff) {
                UUID staffUserId = userPrincipal.getUserId();

                Optional<Staff> staffOpt = staffRepo.findByStaffUserId(staffUserId);

                if (staffOpt.isEmpty()) {
                    log.warn("ROLE_STAFF user {} has no staff record", staffUserId);
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.setContentType("application/json");
                    response.getWriter().write(
                            "{\"error\":\"Invalid staff account\",\"message\":\"No staff assignment found.\"}"
                    );
                    return;
                }

                Staff staff = staffOpt.get();

                // Update last login (throttled)
                if (staff.getLastLogin() == null ||
                        staff.getLastLogin().isBefore(LocalDateTime.now().minusMinutes(5))) {
                    staff.setLastLogin(LocalDateTime.now());
                    staffRepo.save(staff);
                }

                if (!staff.getIsActive()) {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.setContentType("application/json");
                    response.getWriter().write(
                            "{\"error\":\"Account inactive\",\"message\":\"Your account has been deactivated.\"}"
                    );
                    return;
                }

                if (staff.isExpired()) {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.setContentType("application/json");
                    response.getWriter().write(
                            "{\"error\":\"Credentials expired\",\"message\":\"Your access has expired.\"}"
                    );
                    return;
                }
            }
        }

        filterChain.doFilter(request, response);
    }
}

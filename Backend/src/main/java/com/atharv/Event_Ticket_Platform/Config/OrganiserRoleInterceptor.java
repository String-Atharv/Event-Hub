package com.atharv.Event_Ticket_Platform.Config;

import com.atharv.Event_Ticket_Platform.Service.ServiceImpl.RoleElevationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrganiserRoleInterceptor implements HandlerInterceptor {

    private final RoleElevationService roleElevationService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.isAuthenticated() &&
                !authentication.getName().equals("anonymousUser")) {

            String requestPath = request.getRequestURI();


                try {
                    log.debug("Organiser endpoint accessed: {}. Promoting user if needed.", requestPath);
                    roleElevationService.promoteToOrganiser();
                } catch (Exception e) {
                    log.error("Failed to promote user to ORGANISER role", e);

                }
            }


        return true;
    }

    private boolean isOrganiserEndpoint(String requestPath) {

        return requestPath.startsWith("/api/v1/events") ||
                requestPath.startsWith("/api/v1/analytics") ||
                requestPath.startsWith("/api/v1/organiser-dashboard");
    }
}

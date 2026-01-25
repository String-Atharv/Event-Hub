package com.atharv.Event_Ticket_Platform.Filters;

import com.atharv.Event_Ticket_Platform.Domain.Entity.User;
import com.atharv.Event_Ticket_Platform.Repository.UserRepo;
import com.atharv.Event_Ticket_Platform.Service.ServiceImpl.KeycloakRoleService;
import com.atharv.Event_Ticket_Platform.Service.ServiceInterface.UserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.security.Security;
import java.util.UUID;
// OncePerRequestFilter is abstract class , we must implement methods of this class

@Component
@RequiredArgsConstructor
@Slf4j  // ← Add this
public class UserProvisioningFilter extends OncePerRequestFilter {

    private final UserRepo userRepo;
    private final UserService userService;
    private final KeycloakRoleService keycloakRoleService;
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        log.info("=== UserProvisioningFilter executing for path: {}", request.getRequestURI());
        // doFilterInternal is executed for every authenticated requests (means after the Security Authentication Filter)

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        // authentication obj is stored in SecurityContextHolder

        if(authentication!=null && authentication.isAuthenticated() && authentication.getPrincipal() instanceof Jwt jwt){
            // principal is authenticated user , it contains the identity information(id,username,email)
            // but principal can of diff types depending on authentication method (here authentication method is jwt so principal is of jwt type)
            // getPrincipal() instanceof Jwt jwt checks if principal jwt based identity , if yes it casts it into jwt type
//            UUID keycloakId = UUID.fromString(jwt.getSubject()); // subject is unique identifier of user (primary key)
            // UUID.fromString(string) convert string to UUID obj , as id is stored as UUID in db not as string
            UUID keycloakId = UUID.fromString(jwt.getSubject());
            User user=userService.ensureUserExists(keycloakId,jwt);

            try {
                keycloakRoleService.assignDefaultRole(keycloakId.toString());
            } catch (Exception e) {
                log.warn("Failed to assign default role to user {}: {}", keycloakId, e.getMessage());
            }
            log.info("JWT authenticated - keycloakId: {}", keycloakId);
            request.setAttribute("jwt", jwt);



        }
        filterChain.doFilter(request,response); // request proceeds to further controller,service...
        log.info("=== UserProvisioningFilter completed");
    }
}

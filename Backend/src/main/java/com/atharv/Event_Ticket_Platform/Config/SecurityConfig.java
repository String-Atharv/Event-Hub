package com.atharv.Event_Ticket_Platform.Config;

import com.atharv.Event_Ticket_Platform.Filters.StaffValidationFilter;
import com.atharv.Event_Ticket_Platform.Filters.UserProvisioningFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.server.resource.web.authentication.BearerTokenAuthenticationFilter;
import org.springframework.security.web.SecurityFilterChain;


@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            UserProvisioningFilter userProvisioningFilter,
            StaffValidationFilter staffValidationFilter,
            JwtAuthenticationConverter jwtAuthenticationConverter
    ) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorize -> authorize
                        // ==================== PUBLIC ENDPOINTS ====================
                        .requestMatchers("GET", "/api/v1/published-events/**").permitAll()

                        // ==================== ROLE MANAGEMENT ====================
                        .requestMatchers("POST", "/api/v1/roles/promote-to-organiser").authenticated()
                        .requestMatchers("GET", "/api/v1/roles/my-roles").authenticated()

                        // ==================== ORGANISER ENDPOINTS ====================
                        .requestMatchers("/api/v1/events/**").hasRole("ORGANISER")
                        .requestMatchers("/api/v1/staff/events/**").hasRole("ORGANISER")
                        .requestMatchers("/api/v1/organiser/events/**").hasRole("ORGANISER")

                        // ==================== STAFF ENDPOINTS ====================
                        // ✅ CRITICAL: Staff can ONLY access validation endpoints
                        // They should NOT be able to access organizer or attendee endpoints
                        .requestMatchers("/api/v1/staff/validation/**").hasRole("STAFF")

                        // ==================== ATTENDEE ENDPOINTS ====================
                        .requestMatchers("/api/v1/tickets/**").authenticated()

                        // ==================== ALL OTHER REQUESTS ====================
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter)))
                .addFilterAfter(userProvisioningFilter, BearerTokenAuthenticationFilter.class)
                .addFilterAfter(staffValidationFilter, UserProvisioningFilter.class);

        return http.build();
    }
}


    // above all the methods(csrf,sessionManagement,authorizeHttpRequest) takes consumer functional interface as argument , so we pass the lambda function which implements those consumer interfaces

    // if lambda's were not used then , this would be passed as

    /*
        public class DisableCsrfConsumer
        implements Consumer<CsrfConfigurer<HttpSecurity>> {
        @Override
        public void accept(CsrfConfigurer<HttpSecurity> csrf) {
            csrf.disable();
        }
}
         http.csrf(new DisableCsrfConsumer()); // here object of implementation of functional(consumer) interface is passed

         then came anonymous class , which directly passes the implementation  like without implementing the class , overriding the object with method

         http.csrf(new Consumer<CsrfConfigurer<HttpSecurity>>() {
            @Override
            public void accept(CsrfConfigurer<HttpSecurity> csrf) {
                csrf.disable();
            }
        });
        then came lambda's which directly passes the implementation , without implementing the class
     */


// in session-based authentication , server stores the user info at server side for authentication and authorization in session , but in jwt authentication data travels with every request so no need of storing the user info at server side so no session needed

// it is jwt based authentication , not session based  authentication so csrf is disabled because in session based authentication , session id is sent automatically with every request as it is browsers's tendency to attach the session cookies(info about user) with every request , so to prevent the cross - site request forgery , csrf is enabled , but in jwt based authentication jwt token is not send automatically with every request by browser as browser cannot attach the jwt in authorization header automatically

// oauth2ResourceServer(oauth2 ->oauth2.jwt(Customizer.withDefaults())) declares that the Spring Boot application is an OAuth 2.0 Resource Server, whose responsibility is to validate incoming JWT access tokens. and keycloak is authorization server that issues the jwt token to resource server and resource server validates the jwt

// BearerTokenAuthenticationFilter.class) built in spring filter that reads the jwt token from authorization header and validates it  and stores authentication obj in securityContextHolder
// addFilterAfter(A,B) means that Filter A should come after filter b
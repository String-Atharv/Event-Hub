package com.atharv.Event_Ticket_Platform.Config;

import com.atharv.Event_Ticket_Platform.Filters.StaffValidationFilter;
import com.atharv.Event_Ticket_Platform.Security.JwtAccessDeniedHandler;
import com.atharv.Event_Ticket_Platform.Security.JwtAuthenticationEntryPoint;
import com.atharv.Event_Ticket_Platform.Security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

/**
 * Spring Security Configuration with JWT
 * Replaces Keycloak-based OAuth2 Resource Server configuration
 * Implements stateless JWT-based authentication and role-based authorization
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true, securedEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;
    private final CorsConfigurationSource corsConfigurationSource;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final JwtAccessDeniedHandler jwtAccessDeniedHandler;
    private final StaffValidationFilter staffValidationFilter;

    /**
     * Main Security Filter Chain
     * Configures authorization rules, session management, and JWT filter
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .authorizeHttpRequests(auth -> auth

                        // Public endpoints
                        .requestMatchers(
                                "/api/v1/auth/**",
                                "/api/events",
                                "/api/events/{eventId}",
                                "/api/events/{eventId}/ticket-types",
                                "/error",
                                "/api/v1/published-events/**"
                        ).permitAll()

                        // Staff-only (ticket validation etc.)
                        .requestMatchers("/api/v1/staff/validation/**").hasRole("STAFF")

                        // Organiser-only staff management
                        .requestMatchers("/api/v1/staff/events/**").hasRole("ORGANISER")

                        // Organiser / user authenticated endpoints
                        .requestMatchers(
                                "/api/v1/events/**",
                                "/api/organiser/**",
                                "/api/v1/analytics/**"
                        ).authenticated()

                        // Ticket purchase
                        .requestMatchers("/api/tickets/**").authenticated()

                        .anyRequest().authenticated()
                )
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .exceptionHandling(exception ->
                        exception.authenticationEntryPoint(jwtAuthenticationEntryPoint)
                                .accessDeniedHandler(jwtAccessDeniedHandler)
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterAfter(staffValidationFilter, JwtAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Authentication Provider
     * Configures DaoAuthenticationProvider with UserDetailsService and PasswordEncoder
     */
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    /**
     * Authentication Manager
     * Required for authenticating users during login
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * Password Encoder
     * Uses BCrypt hashing algorithm for password security
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
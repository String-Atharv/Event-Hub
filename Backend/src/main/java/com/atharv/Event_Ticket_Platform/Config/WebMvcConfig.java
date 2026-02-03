package com.atharv.Event_Ticket_Platform.Config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web MVC Configuration to register interceptors
 */
@Configuration
@RequiredArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {

    private final OrganiserRoleInterceptor organiserRoleInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // Register the organiser role interceptor
        // This will automatically promote users to ORGANISER when they access organiser endpoints
        registry.addInterceptor(organiserRoleInterceptor)
                .addPathPatterns(
                        "/api/v1/events/**",
                        "/api/v1/analytics/**",
                        "/api/v1/organiser-dashboard/**"
                )
                .excludePathPatterns(
                        "/api/v1/auth/**",
                        "/api/v1/published-events/**"  // Public endpoints
                );
    }
}
package com.atharv.Event_Ticket_Platform.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // Allow your frontend origin
        config.setAllowedOrigins(Arrays.asList(
                "http://localhost:5173",
                "http://localhost:3000"
                        ,"https://d1n3aocu9m7nw9.cloudfront.net"// Add other ports if needed
        ));

        // IMPORTANT: Allow ALL HTTP methods including OPTIONS, PATCH, etc.
        config.setAllowedMethods(Arrays.asList(
                "GET",
                "POST",
                "PUT",
                "PATCH",   // ← This was missing!
                "DELETE",
                "OPTIONS", // ← This is critical for preflight
                "HEAD"
        ));

        // Allow all headers from the client
        config.setAllowedHeaders(Arrays.asList("*"));

        // Allow credentials (cookies, authorization headers, etc.)
        config.setAllowCredentials(true);

        // How long the response from a preflight request can be cached (in seconds)
        config.setMaxAge(3600L);

        // Expose headers that the client can access
        config.setExposedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type",
                "X-Requested-With",
                "Accept",
                "Origin",
                "Access-Control-Request-Method",
                "Access-Control-Request-Headers"
        ));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

        // Apply CORS config to ALL endpoints
        source.registerCorsConfiguration("/**", config);

        return source;
    }
}
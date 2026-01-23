package com.atharv.Event_Ticket_Platform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class EventTicketPlatformApplication {

    public static void main(String[] args) {
        SpringApplication.run(EventTicketPlatformApplication.class, args);
    }
}

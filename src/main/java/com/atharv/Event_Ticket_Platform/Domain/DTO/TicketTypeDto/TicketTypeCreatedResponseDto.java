package com.atharv.Event_Ticket_Platform.Domain.DTO.TicketTypeDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketTypeCreatedResponseDto {
    private Integer id;
    private String name;
    private Integer totalAvailable;
    private String description;
    private Double price;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}

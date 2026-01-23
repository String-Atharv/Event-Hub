package com.atharv.Event_Ticket_Platform.Domain.DTO.TicketTypeDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data @NoArgsConstructor @AllArgsConstructor
public class UpdateTicketTypeRequestDto {
    private Integer id;
    private String name;
    private Integer totalAvailable;
    private String description;
    private Double price;

}

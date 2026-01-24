package com.atharv.Event_Ticket_Platform.Domain.DTO.TicketTypeDto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateTicketTypeRequestDto {
    @NotBlank(message = "ticket type name is required")
    private String name;

    @NotNull(message = "price is required")
    @PositiveOrZero(message = "price must be 0 or greater")
    private Double price;

    private  String description;
    private Integer totalAvailable;

}
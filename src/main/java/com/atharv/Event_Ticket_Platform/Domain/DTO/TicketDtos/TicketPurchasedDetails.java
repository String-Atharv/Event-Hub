package com.atharv.Event_Ticket_Platform.Domain.DTO.TicketDtos;

import com.atharv.Event_Ticket_Platform.Domain.DTO.QrCodeDtos.QrCodeDetails;
import com.atharv.Event_Ticket_Platform.Domain.DTO.TicketTypeDto.TicketTypeDetails;
import com.atharv.Event_Ticket_Platform.Domain.Entity.QrCode;
import com.atharv.Event_Ticket_Platform.Domain.Enum.TicketStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data @NoArgsConstructor @AllArgsConstructor
public class TicketPurchasedDetails {
    private UUID id;
    private Double price;
    private TicketStatus status;
    private TicketTypeDetails ticketType;
    private LocalDateTime purchasedAt;
//    private QrCodeDetails qrCode;
}

package com.atharv.Event_Ticket_Platform.Service.ServiceInterface;

import com.atharv.Event_Ticket_Platform.Domain.DTO.TicketDtos.TicketPurchasedDetails;
import com.atharv.Event_Ticket_Platform.Domain.Entity.Ticket;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface TicketService {
    Ticket purchaseTicket(UUID userId , Integer ticketTypeId);

    Page<Ticket> listAllTicketsForThisUser(UUID userID, Pageable pageable);

    TicketPurchasedDetails getTicketDetails
            (UUID userId, UUID ticketId);

    @Transactional
    void cancelTicket(UUID userId, UUID ticketId);
}

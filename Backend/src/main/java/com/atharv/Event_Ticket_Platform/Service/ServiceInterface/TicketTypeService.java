package com.atharv.Event_Ticket_Platform.Service.ServiceInterface;

import com.atharv.Event_Ticket_Platform.Domain.Entity.Ticket;
import com.atharv.Event_Ticket_Platform.Domain.Entity.TicketType;

import java.util.UUID;

public interface TicketTypeService {
    Ticket purchaseTicket(UUID purchaserId,Integer TicketTypeId);
}

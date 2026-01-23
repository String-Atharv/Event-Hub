package com.atharv.Event_Ticket_Platform.Domain.Mapper;

import com.atharv.Event_Ticket_Platform.Domain.DTO.EventDtos.EventDtoForTicketPurchase;
import com.atharv.Event_Ticket_Platform.Domain.DTO.QrCodeDtos.QrCodeDetails;
import com.atharv.Event_Ticket_Platform.Domain.DTO.TicketDtos.TicketPurchasedDetails;
import com.atharv.Event_Ticket_Platform.Domain.DTO.TicketDtos.TicketPurchasedDto;
import com.atharv.Event_Ticket_Platform.Domain.DTO.TicketTypeDto.TicketTypeDetails;
import com.atharv.Event_Ticket_Platform.Domain.DTO.TicketTypeDto.TicketTypeDtoForTicketPurchase;
import com.atharv.Event_Ticket_Platform.Domain.Entity.Event;
import com.atharv.Event_Ticket_Platform.Domain.Entity.QrCode;
import com.atharv.Event_Ticket_Platform.Domain.Entity.Ticket;
import com.atharv.Event_Ticket_Platform.Domain.Entity.TicketType;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.data.domain.Page;

import java.util.List;

@Mapper(componentModel = "spring")
public interface TicketMapper {
    @Mapping(
            target = "event",
            source = "ticketType.event"
    )
    TicketPurchasedDto toTicketPuchasedDto(Ticket ticket);
    EventDtoForTicketPurchase toEventDtoFromTicket(Event event);
    TicketTypeDtoForTicketPurchase toTicketTypeDtoForTicketPurchase(TicketType ticketType);

    @Mapping(target="purchasedAt",source="createdAt")
    TicketPurchasedDetails toDetails(Ticket ticket);

    TicketTypeDetails toDetails(TicketType ticketType);

    QrCodeDetails toDetails(QrCode qrCode);


}

package com.atharv.Event_Ticket_Platform.Domain.Mapper;

import com.atharv.Event_Ticket_Platform.Domain.DTO.EventDtos.*;
import com.atharv.Event_Ticket_Platform.Domain.DTO.TicketTypeDto.CreateTicketTypeRequestDto;
import com.atharv.Event_Ticket_Platform.Domain.DTO.TicketTypeDto.ListEventTicketTypeResponseDto;
import com.atharv.Event_Ticket_Platform.Domain.DTO.TicketTypeDto.TicketTypeCreatedResponseDto;
import com.atharv.Event_Ticket_Platform.Domain.DTO.TicketTypeDto.UpdateTicketTypeRequestDto;
import com.atharv.Event_Ticket_Platform.Domain.Requests.CreateEventRequest;
import com.atharv.Event_Ticket_Platform.Domain.Requests.CreateTicketTypeRequest;
import com.atharv.Event_Ticket_Platform.Domain.Entity.Event;
import com.atharv.Event_Ticket_Platform.Domain.Entity.TicketType;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface EventMapper {

    List<CreateTicketTypeRequest> fromDtoList(List<CreateTicketTypeRequestDto> dtos);

    CreateTicketTypeRequest fromDto(CreateTicketTypeRequestDto createTicketTypeRequestDto);
    CreateEventRequest fromDto(CreateEventRequestDto createEventRequestDto);
    EventCreatedResponseDto toDto(Event event);
    TicketTypeCreatedResponseDto toDto(TicketType ticketType);
    List<TicketTypeCreatedResponseDto> toDto(List<TicketType> ticketTypes);

    @Mapping(target = "id",ignore = true) // do not map the id from client
    @Mapping(target = "eventStatus",ignore = true) // do not map the eventStatus from client
    @Mapping(target = "organiser",ignore = true) // do not set the organiser from client , it is set from jwt
    // ticketType in CreateEventRequest ->(to)  ticketType in Event class
    @Mapping(target = "attendees", ignore = true)
    @Mapping(target = "staff", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Event toEvent(CreateEventRequest eventRequest);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "event", ignore = true)
    @Mapping(target = "ticket", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    TicketType toTicketType(CreateTicketTypeRequest ticketTypeRequest);


    ListEventTicketTypeResponseDto toListEventTicketTypeResponseDto(TicketType ticketType);
    ListEventResponseDto toListEventResponseDto(Event event);

    @Mapping(target = "id" , ignore = true)
    Event fromUpdateEventRequestDto(UpdateEventRequestDto updateEventRequestDto);

    List<TicketType> fromUpdateTicketTypeRequestDto(List<UpdateTicketTypeRequestDto> updateTicketTypeRequestDto);

    UpdatedEventResponseDto toUpdatedEventResponseDto(Event event);
    EventResponseDto toEventResponseDto(Event event);

    PublishEventDto toPublishEventDto(Event event);


}

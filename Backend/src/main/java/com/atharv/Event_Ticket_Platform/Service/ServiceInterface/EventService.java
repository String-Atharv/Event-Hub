package com.atharv.Event_Ticket_Platform.Service.ServiceInterface;

import com.atharv.Event_Ticket_Platform.Domain.DTO.EventDtos.UpdateEventRequestDto;
import com.atharv.Event_Ticket_Platform.Domain.Entity.Event;
import com.atharv.Event_Ticket_Platform.Domain.Requests.CreateEventRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

public interface EventService {
    Event createEvent(UUID organiserId, CreateEventRequest eventRequest);
    Page<Event> listEventForOrganiser(UUID organiser,Pageable pageable);
    Event updateEvent(UUID organiserId, UUID eventId, UpdateEventRequestDto updateEventRequestDto);
    Event getEvent(UUID eventId,UUID organiserId);

    void deleteEvent(UUID eventId,UUID organiser);

    void deleteTicketType(UUID organiserId, UUID eventId, Integer ticketTypeId);

    Page<Event> listPublishedEvents(Pageable pageable);

    Page<Event> searchPublishedEvents(String searchTerm, Pageable pageable);

    Optional<Event> getPublishedEventById(UUID eventId);
}
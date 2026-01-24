package com.atharv.Event_Ticket_Platform.Service.ServiceImpl;
import com.atharv.Event_Ticket_Platform.Domain.DTO.EventDtos.UpdateEventRequestDto;
import com.atharv.Event_Ticket_Platform.Domain.DTO.TicketTypeDto.UpdateTicketTypeRequestDto;
import com.atharv.Event_Ticket_Platform.Domain.Entity.TicketType;
import com.atharv.Event_Ticket_Platform.Domain.Requests.CreateEventRequest;
import com.atharv.Event_Ticket_Platform.Domain.Entity.Event;
import com.atharv.Event_Ticket_Platform.Domain.Entity.User;
import com.atharv.Event_Ticket_Platform.Domain.Enum.EventStatus;
import com.atharv.Event_Ticket_Platform.Domain.Mapper.EventMapper;
import com.atharv.Event_Ticket_Platform.Exceptions.ResourceNotFoundException;
import com.atharv.Event_Ticket_Platform.Repository.EventRepo;
import com.atharv.Event_Ticket_Platform.Repository.TicketTypeRepo;
import com.atharv.Event_Ticket_Platform.Repository.UserRepo;
import com.atharv.Event_Ticket_Platform.Service.ServiceInterface.EventService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventServiceImpl implements EventService {
    private final UserRepo userRepo;
    private final EventRepo eventRepo;
    private final TicketTypeRepo ticketTypeRepo;
    private final EventMapper eventMapper;
    private final UserServiceImpl userService;

    @Override
    @Transactional
    public Event createEvent(UUID organiserId, CreateEventRequest eventRequest,Jwt jwt) {

        User organiser = userService.ensureUserExists(organiserId,jwt);

        Event event = eventMapper.toEvent(eventRequest);

        event.setOrganiser(organiser);
        if(event.getSalesStartDate()!=null && event.getSalesEndDate()!=null && !event.getTicketTypes().isEmpty() && event.getName()!=null && event.getDescription()!=null && event.getStartTime()!=null && event.getEndTime()!=null)
            event.setEventStatus(EventStatus.PUBLISHED);
        else event.setEventStatus(EventStatus.DRAFT);
        event.getTicketTypes().
                forEach(ticketType -> ticketType.setEvent(event));
        Event savedEvent = eventRepo.save(event);
        log.info("Event SAVED successfully - ID: {}", savedEvent.getId());
        return savedEvent;

    }



    @Override
    public Page<Event> listEventForOrganiser(UUID organiserId, Pageable pageable) {
        return eventRepo.findByOrganiserId(organiserId,pageable);
    }

    @Override
    @Transactional  // ✅ ADD THIS - Very Important!
    public Event updateEvent(UUID organiserId, UUID eventId, UpdateEventRequestDto updateEventRequestDto) {
        log.info("Updating event - ID: {}, Organiser: {}", eventId, organiserId);

        // 1. Fetch existing event
        Event existingEvent = eventRepo.findByIdAndOrganiser_id(eventId, organiserId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found or you don't have permission"));

        // 2. Update basic event fields
        if (updateEventRequestDto.getName() != null) {
            existingEvent.setName(updateEventRequestDto.getName());
        }
        if (updateEventRequestDto.getDescription() != null) {
            existingEvent.setDescription(updateEventRequestDto.getDescription());
        }
        if (updateEventRequestDto.getStartTime() != null) {
            existingEvent.setStartTime(updateEventRequestDto.getStartTime());
        }
        if (updateEventRequestDto.getEndTime() != null) {
            existingEvent.setEndTime(updateEventRequestDto.getEndTime());
        }
        if (updateEventRequestDto.getVenue() != null) {
            existingEvent.setVenue(updateEventRequestDto.getVenue());
        }
        if (updateEventRequestDto.getSalesStartDate() != null) {
            existingEvent.setSalesStartDate(updateEventRequestDto.getSalesStartDate());
        }
        if (updateEventRequestDto.getSalesEndDate() != null) {
            existingEvent.setSalesEndDate(updateEventRequestDto.getSalesEndDate());
        }
        if (updateEventRequestDto.getEventType() != null) {
            existingEvent.setEventType(updateEventRequestDto.getEventType());
        }

        // 3. Update ticket types
        if (updateEventRequestDto.getTicketTypes() != null && !updateEventRequestDto.getTicketTypes().isEmpty()) {
            for (UpdateTicketTypeRequestDto ticketDto : updateEventRequestDto.getTicketTypes()) {
                if (ticketDto.getId() != null) {
                    // Update existing ticket type
                    TicketType existingTicketType = ticketTypeRepo.findById(ticketDto.getId())
                            .orElseThrow(() -> new ResourceNotFoundException("TicketType with ID " + ticketDto.getId() + " not found"));

                    // Verify this ticket type belongs to this event
                    if (!existingTicketType.getEvent().getId().equals(eventId)) {
                        throw new IllegalArgumentException("TicketType " + ticketDto.getId() + " does not belong to this event");
                    }

                    // Update ticket type fields
                    if (ticketDto.getName() != null) {
                        existingTicketType.setName(ticketDto.getName());
                    }
                    if (ticketDto.getPrice() != null) {
                        existingTicketType.setPrice(ticketDto.getPrice());
                    }
                    if (ticketDto.getDescription() != null) {
                        existingTicketType.setDescription(ticketDto.getDescription());
                    }
                    if (ticketDto.getTotalAvailable() != null) {
                        existingTicketType.setTotalAvailable(ticketDto.getTotalAvailable());
                    }

                    log.info("Updated ticket type ID: {}", ticketDto.getId());
                } else {
                    // Create new ticket type (if ID is null, it's a new ticket type)
                    TicketType newTicketType = TicketType.builder()
                            .name(ticketDto.getName())
                            .price(ticketDto.getPrice())
                            .description(ticketDto.getDescription())
                            .totalAvailable(ticketDto.getTotalAvailable())
                            .event(existingEvent)
                            .build();

                    existingEvent.getTicketTypes().add(newTicketType);
                    log.info("Created new ticket type: {}", ticketDto.getName());
                }
            }
        }

        // 4. Update event status based on completeness
        updateEventStatus(existingEvent);

        // 5. Save and return updated event
        Event updatedEvent = eventRepo.save(existingEvent);  // ✅ THIS WAS MISSING!
        log.info("Event UPDATED successfully - ID: {}", updatedEvent.getId());

        return updatedEvent;
    }

    // Helper method to update event status
    private void updateEventStatus(Event event) {
        if (event.getSalesStartDate() != null &&
                event.getSalesEndDate() != null &&
                !event.getTicketTypes().isEmpty() &&
                event.getName() != null &&
                event.getDescription() != null &&
                event.getStartTime() != null &&
                event.getEndTime() != null && event.getEventStatus() !=null) {
            event.setEventStatus(EventStatus.PUBLISHED);
        } else {
            event.setEventStatus(EventStatus.DRAFT);
        }
    }

    @Override
    public Event getEvent(UUID eventId, UUID organiserId) {
        Event event = eventRepo.findById(eventId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Event not found")
                );

        if (!event.getOrganiser().getId().equals(organiserId)) {
            throw new AccessDeniedException("You are not allowed to access this event");
        }
        return event;
    }

    @Override
    public void deleteEvent(UUID eventId,UUID organiserId) {
        Event event = eventRepo.findByIdAndOrganiser_id(eventId,organiserId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Event not found")
                );

        eventRepo.delete(event);
    }

    @Override
    @Transactional
    public void deleteTicketType(UUID organiserId, UUID eventId, Integer ticketTypeId) {
        log.info("Deleting ticket type - ID: {}, Event: {}, Organiser: {}", ticketTypeId, eventId, organiserId);

        // 1. Verify event ownership
        Event event = eventRepo.findByIdAndOrganiser_id(eventId, organiserId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found or you don't have permission"));

        // 2. Find ticket type
        TicketType ticketType = ticketTypeRepo.findById(ticketTypeId)
                .orElseThrow(() -> new ResourceNotFoundException("TicketType not found"));

        // 3. Verify ticket type belongs to this event
        if (!ticketType.getEvent().getId().equals(eventId)) {
            throw new IllegalArgumentException("TicketType does not belong to this event");
        }

        // 4. Check if there are tickets sold (optional - prevent deletion if tickets exist)
        if (ticketType.getTicket() != null && !ticketType.getTicket().isEmpty()) {
            throw new IllegalStateException("Cannot delete ticket type with existing tickets sold");
        }

        // 5. Delete ticket type
        ticketTypeRepo.delete(ticketType);
        log.info("TicketType deleted successfully - ID: {}", ticketTypeId);
    }


    @Override
    public Page<Event> listPublishedEvents(Pageable pageable) {
        return eventRepo.findByEventStatus(EventStatus.PUBLISHED, pageable);
    }

    @Override
    public Page<Event> searchPublishedEvents(String searchTerm, Pageable pageable) {
        return eventRepo.findByEventStatusAndNameContainingIgnoreCase(EventStatus.PUBLISHED,searchTerm, pageable);
    }

    @Override
    public Optional<Event> getPublishedEventById(UUID eventId) {
        try {
            return eventRepo.findById(eventId)
                    .filter(event -> event.getEventStatus() == EventStatus.PUBLISHED);
        } catch (IllegalArgumentException e) {
            return Optional.empty();
        }
    }
}



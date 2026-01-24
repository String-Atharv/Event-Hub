package com.atharv.Event_Ticket_Platform.Controllers;

import com.atharv.Event_Ticket_Platform.Domain.DTO.EventDtos.*;
import com.atharv.Event_Ticket_Platform.Domain.Entity.Event;
import com.atharv.Event_Ticket_Platform.Domain.Mapper.EventMapper;
import com.atharv.Event_Ticket_Platform.Domain.Requests.CreateEventRequest;
import com.atharv.Event_Ticket_Platform.Service.ServiceInterface.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

import static com.atharv.Event_Ticket_Platform.util.UserFromJwt.parseUserId;

@RestController
@RequestMapping(path ="/api/v1/events")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;
    private final EventMapper eventMapper;
    //@AuthenticationPrincipal is used to access authenticated user from Security Context

    @PostMapping("createEvent")
    public ResponseEntity<EventCreatedResponseDto> createEvent(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody CreateEventRequestDto createEventRequestDto){
        System.out.println("CONTROLLER HIT");
        CreateEventRequest createEventRequest=eventMapper.fromDto(createEventRequestDto);
        UUID userId = UUID.fromString(jwt.getSubject());
        Event event = eventService.createEvent(userId,createEventRequest,jwt);
        EventCreatedResponseDto eventCreatedResponseDto= eventMapper.toDto(event);
        return new ResponseEntity<>(eventCreatedResponseDto, HttpStatus.CREATED);
    }

    @GetMapping("listEvent")
    public ResponseEntity<Page<ListEventResponseDto>> listEvent(@AuthenticationPrincipal Jwt jwt,Pageable pageable){
        UUID organiserId = parseUserId(jwt);
        Page<Event> evnt=eventService.listEventForOrganiser(organiserId,pageable);
         Page<ListEventResponseDto> listEventResponseDtos=evnt.map(eventMapper::toListEventResponseDto);
        return new ResponseEntity<>(listEventResponseDtos,HttpStatus.OK);
    }


    @GetMapping("getEvent/{eventId}")
    public ResponseEntity<EventResponseDto> getEvent(
            @AuthenticationPrincipal Jwt jwt, @PathVariable UUID eventId
    ){
        UUID organiserId=parseUserId(jwt);
        Event event = eventService.getEvent(eventId,organiserId);
        return new ResponseEntity<>(eventMapper.toEventResponseDto(event),HttpStatus.OK);
    }


    @PatchMapping("updateEvent/{eventId}")
    public ResponseEntity<UpdatedEventResponseDto> getEvent(@AuthenticationPrincipal Jwt jwt , @PathVariable UUID eventId, @RequestBody UpdateEventRequestDto updateEventRequestDto){
        UUID userId=parseUserId(jwt);
        Event updatedEvent =eventService.updateEvent(userId,eventId,updateEventRequestDto);
        UpdatedEventResponseDto updatedEventResponseDto=eventMapper.toUpdatedEventResponseDto(updatedEvent);
        return new ResponseEntity<>(updatedEventResponseDto,HttpStatus.OK);
    }

    @DeleteMapping("{eventID}")
    public ResponseEntity<Void> DeleteEvent(@AuthenticationPrincipal Jwt jwt , @PathVariable UUID eventID){
        UUID organiser=parseUserId(jwt);
            eventService.deleteEvent(eventID,organiser);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("{eventId}/ticket-types/{ticketTypeId}")
    public ResponseEntity<Void> deleteTicketType(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID eventId,
            @PathVariable Integer ticketTypeId
    ) {
        UUID organiserId = parseUserId(jwt);
        eventService.deleteTicketType(organiserId, eventId, ticketTypeId);
        return ResponseEntity.noContent().build();
    }



}

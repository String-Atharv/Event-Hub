package com.atharv.Event_Ticket_Platform.Controllers;

import com.atharv.Event_Ticket_Platform.Domain.DTO.EventDtos.PublishEventDto;
import com.atharv.Event_Ticket_Platform.Domain.Entity.Event;
import com.atharv.Event_Ticket_Platform.Domain.Mapper.EventMapper;
import com.atharv.Event_Ticket_Platform.Repository.EventRepo;
import com.atharv.Event_Ticket_Platform.Service.ServiceInterface.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
@RequestMapping(path ="/api/v1/published-events")
public class PublishEventController {
    private final EventRepo eventRepo;
    private final EventService eventService;
    private final EventMapper eventMapper;

    @GetMapping
    public ResponseEntity<Page<PublishEventDto>> publishEvent(Pageable pageable){
        Page<PublishEventDto> p=eventService.listPublishedEvents(pageable).map(eventMapper::toPublishEventDto);
        return new ResponseEntity<>(p, HttpStatus.OK);
    }

    @GetMapping("{eventID}")
    public ResponseEntity<PublishEventDto> getPublishedEventById(@PathVariable UUID eventID){
         Optional<Event> event=eventService.getPublishedEventById(eventID);
         if(event.isPresent()){
             return new ResponseEntity<>(eventMapper.toPublishEventDto(event.get()),HttpStatus.OK);
         }
         return ResponseEntity.noContent().build();
    }



}

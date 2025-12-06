package com.eventplatform.controller;

import com.eventplatform.model.Event;
import com.eventplatform.model.User;
import com.eventplatform.repository.EventRepository;
import com.eventplatform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EventController {

    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    private static final String UPLOAD_DIR = "uploads/events/";

    @GetMapping
    public ResponseEntity<List<Event>> getAllEvents() {
        return ResponseEntity.ok(eventRepository.findByIsPublishedTrue());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Event> getEventById(@PathVariable Long id) {
        return eventRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Event> createEvent(
            @RequestBody Event event,
            @AuthenticationPrincipal User currentUser) {

        event.setOrganizer(currentUser);
        Event savedEvent = eventRepository.save(event);
        return ResponseEntity.ok(savedEvent);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Event> updateEvent(
            @PathVariable Long id,
            @RequestBody Event eventDetails,
            @AuthenticationPrincipal User currentUser) {

        return eventRepository.findById(id)
                .map(event -> {
                    // Check if current user is the organizer
                    if (!event.getOrganizer().getId().equals(currentUser.getId()) &&
                            !currentUser.getRole().equals(User.UserRole.ADMIN)) {
                        return ResponseEntity.status(403).build();
                    }

                    event.setTitle(eventDetails.getTitle());
                    event.setDescription(eventDetails.getDescription());
                    event.setStartDateTime(eventDetails.getStartDateTime());
                    event.setEndDateTime(eventDetails.getEndDateTime());
                    event.setVenue(eventDetails.getVenue());
                    event.setCity(eventDetails.getCity());
                    event.setCountry(eventDetails.getCountry());
                    event.setTicketPrice(eventDetails.getTicketPrice());
                    event.setTotalTickets(eventDetails.getTotalTickets());
                    event.setCategory(eventDetails.getCategory());
                    event.setPublished(eventDetails.getIsPublished());

                    Event updatedEvent = eventRepository.save(event);
                    return ResponseEntity.ok(updatedEvent);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/upload-image")
    public ResponseEntity<String> uploadEventImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) throws IOException {

        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Save file
        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath);

        // Update event with image URL
        event.setImageUrl("/" + UPLOAD_DIR + fileName);
        eventRepository.save(event);

        return ResponseEntity.ok("Image uploaded successfully");
    }

    @GetMapping("/search")
    public ResponseEntity<List<Event>> searchEvents(
            @RequestParam String query,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime date) {

        List<Event> events;
        if (city != null) {
            events = eventRepository.findByCityAndIsPublishedTrue(city);
        } else if (category != null) {
            events = eventRepository.findByCategoryAndIsPublishedTrue(category);
        } else if (date != null) {
            events = eventRepository.findByStartDateTimeAfterAndIsPublishedTrue(date);
        } else {
            events = eventRepository.searchEvents(query);
        }

        return ResponseEntity.ok(events);
    }
}
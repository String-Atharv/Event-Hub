package com.eventplatform.repository;

import com.eventplatform.model.Event;
import com.eventplatform.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByOrganizer(User organizer);
    List<Event> findByIsPublishedTrue();
    List<Event> findByCityAndIsPublishedTrue(String city);
    List<Event> findByCategoryAndIsPublishedTrue(String category);
    List<Event> findByStartDateTimeAfterAndIsPublishedTrue(LocalDateTime dateTime);

    @Query("SELECT e FROM Event e WHERE LOWER(e.title) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(e.description) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "AND e.isPublished = true")
    List<Event> searchEvents(@Param("query") String query);

    @Query("SELECT e FROM Event e WHERE e.availableTickets > 0 AND e.isPublished = true")
    List<Event> findAvailableEvents();
}
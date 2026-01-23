package com.atharv.Event_Ticket_Platform.Domain.Entity;


import com.atharv.Event_Ticket_Platform.Domain.Enum.EventStatus;
import com.atharv.Event_Ticket_Platform.Domain.Enum.EventType;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name="event")
@EntityListeners(AuditingEntityListener.class)  // ← ADD THIS LINE
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@Builder
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name="id",updatable = false,nullable = false)
    private UUID id;

    @Column(name="name",nullable = false)
    private String name;

    private String description;

    @Column(nullable = true)
    private LocalDateTime startTime;

    @Column(nullable = true)
    private LocalDateTime endTime;

    @Column(nullable = false)
    private String venue;

    @Column(nullable = true)
    private LocalDateTime salesStartDate;

    @Column(nullable = true)
    private LocalDateTime salesEndDate;

    @Column(nullable = true)
    @Enumerated(EnumType.STRING) // if this statement is not mentioned then numeric position of enum value is stored in db
    private EventStatus eventStatus;

    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="organiser_id",nullable = false) // organiser_id is foreign key in Event table
    private User organiser;

    @ManyToMany(mappedBy = "attendingEvents")
    private List<User> attendees=new ArrayList<>();

    @ManyToMany(mappedBy = "staffingEvents")
    private List<User> staff = new ArrayList<>();

    @OneToMany(mappedBy = "event",cascade = CascadeType.ALL)
    private List<TicketType> ticketTypes;

    @Column(nullable = true)
    @Enumerated(EnumType.STRING)
    private EventType eventType;

    @CreatedDate
    @Column(name="created_at",nullable=false , updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name="updated_at")
    private LocalDateTime updatedAt;

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Event event = (Event) o;
        return Objects.equals(id, event.id) ;
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}

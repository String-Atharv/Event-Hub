package com.atharv.Event_Ticket_Platform.Domain.Entity;

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

@EntityListeners(AuditingEntityListener.class)
@Entity
@Table(name="users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {
    @Id
    private UUID id;

    @Column(name="name",nullable = false)
    private String name;

    @Column(name="email",nullable = false,unique = true)
    private String email;

//    private set<Role> roles;

    // todo : organising event
    @OneToMany(mappedBy = "organiser")
    private List<Event> organisedEvents=new ArrayList<>();

    // todo : attending event
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name="event_attendees",
            joinColumns = @JoinColumn(name="user_id"),
            inverseJoinColumns = @JoinColumn(name="event_id")
    )
    private List<Event> attendingEvents=new ArrayList<>();


    //todo : staffing event
    @ManyToMany
    @JoinTable(
            name="user_staffing_event",
            joinColumns = @JoinColumn(name="user_id"),
            inverseJoinColumns = @JoinColumn(name="event_id")
    )
    private List<Event> staffingEvents=new ArrayList<>();

    @OneToMany(mappedBy = "purchaser")
    private List<Ticket> tickets = new ArrayList<>();


    @CreatedDate
    @Column(name="created_at",nullable=false,updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name="updated_at")
    private LocalDateTime updatedAt;

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        User user = (User) o;
        return Objects.equals(id, user.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}

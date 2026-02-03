package com.atharv.Event_Ticket_Platform.Domain.Entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.boot.autoconfigure.web.WebProperties;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.*;

@EntityListeners(AuditingEntityListener.class)
@Entity
@Table(name="users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name="name",nullable = false)
    private String name;

    @Column(name="email",nullable = false,unique = true)
    private String email;

    @Column(nullable = false)
    private String password;


    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "role")
    @Builder.Default
    private Set<String> roles = new HashSet<>();

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

    /**
     * Add a role to the user (automatically adds ROLE_ prefix if not present)
     */
    public void addRole(String role) {
        if (this.roles == null) {
            this.roles = new HashSet<>();
        }
        // Ensure ROLE_ prefix
        String normalizedRole = role.startsWith("ROLE_") ? role : "ROLE_" + role;
        this.roles.add(normalizedRole);
    }

    /**
     * Remove a role from the user
     */
    public void removeRole(String role) {
        if (this.roles != null) {
            String normalizedRole = role.startsWith("ROLE_") ? role : "ROLE_" + role;
            this.roles.remove(normalizedRole);
        }
    }

    /**
     * Check if user has a specific role
     */
    public boolean hasRole(String role) {
        if (this.roles == null) {
            return false;
        }
        String normalizedRole = role.startsWith("ROLE_") ? role : "ROLE_" + role;
        return this.roles.contains(normalizedRole);
    }

    /**
     * Initialize roles collection if null
     */
    @PrePersist
    @PreUpdate
    private void ensureRolesInitialized() {
        if (this.roles == null) {
            this.roles = new HashSet<>();
        }
        // Ensure all roles have ROLE_ prefix
        Set<String> normalizedRoles = new HashSet<>();
        for (String role : this.roles) {
            normalizedRoles.add(role.startsWith("ROLE_") ? role : "ROLE_" + role);
        }
        this.roles = normalizedRoles;
    }
}

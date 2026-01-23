package com.atharv.Event_Ticket_Platform.Domain.Entity;

import com.atharv.Event_Ticket_Platform.Domain.Enum.TicketStatus;
import com.atharv.Event_Ticket_Platform.Domain.Enum.TicketValidationMethod;
import com.atharv.Event_Ticket_Platform.Domain.Enum.TicketValidationStatus;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name="ticket_validation")
@Getter @Setter @AllArgsConstructor @NoArgsConstructor @Builder
public class TicketValidation {
    @Id
    @Column(nullable = false,updatable = false)
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false,updatable = false)
    private TicketValidationStatus validationStatus;

    @Enumerated(EnumType.STRING)
    private TicketValidationMethod ValidationMethod;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name="ticket_id")
    private Ticket ticket;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "staff_id", nullable = false)
    private Staff staff;

    @Column(name="created_at",nullable=false)
    private LocalDateTime validatedAt;

    @CreatedDate
    @Column(name="validated_at",nullable=false,updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name="updated_at")
    private LocalDateTime updatedAt;

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        TicketValidation that = (TicketValidation) o;
        return Objects.equals(id, that.id) && Objects.equals(validatedAt, that.validatedAt) && Objects.equals(updatedAt, that.updatedAt);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, validatedAt, updatedAt);
    }
}

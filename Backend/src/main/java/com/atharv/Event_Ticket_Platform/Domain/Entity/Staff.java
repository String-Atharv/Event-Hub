package com.atharv.Event_Ticket_Platform.Domain.Entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name="staff")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Staff {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "staff_user_id", nullable = false, unique = true)
    private UUID staffUserId;

    @Column(nullable = false)
    private UUID eventId;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    private String email;

    @Column(name = "created_by_organiser_id", nullable = false)
    private UUID createdByOrganiserId;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "valid_from", nullable = false)
    private LocalDateTime validFrom;

    @Column(name = "valid_until", nullable = false)
    private LocalDateTime validUntil;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    @Transient
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(validUntil);
    }

    @Transient
    public boolean isValidNow() {
        LocalDateTime now = LocalDateTime.now();
        return isActive &&
                !now.isBefore(validFrom) &&
                !now.isAfter(validUntil);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Staff)) return false;
        Staff that = (Staff) o;
        return Objects.equals(staffUserId, that.staffUserId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(staffUserId);
    }
}

package com.atharv.Event_Ticket_Platform.Domain.Entity;


import com.atharv.Event_Ticket_Platform.Domain.Enum.TicketStatus;
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
@EntityListeners(AuditingEntityListener.class)
@Table(name="ticket")
@Getter @Setter @AllArgsConstructor @NoArgsConstructor @Builder
public class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name="id", nullable=false, updatable=false)
    private UUID id;


    @Column(nullable = false)
    private Double price;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="ticket_type_id")
    private TicketType ticketType;

    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="purchaser_id")
    private User purchaser;

    // todo : validation
    @OneToMany(mappedBy = "ticket")
    private List<TicketValidation> ticketValidations=new ArrayList<>();

    // todo : QrCode
    @OneToMany(mappedBy = "ticket",cascade = CascadeType.ALL)
    private List<QrCode> qrCodes=new ArrayList<>();


    @CreatedDate
    @Column(name="created_at",nullable=false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name="updated_at")
    private LocalDateTime updatedAt;

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Ticket ticket1 = (Ticket) o;
        return Objects.equals(id, ticket1.id) && Objects.equals(price, ticket1.price) && status == ticket1.status && Objects.equals(createdAt, ticket1.createdAt) && Objects.equals(updatedAt, ticket1.updatedAt);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, price, status, createdAt, updatedAt);
    }
}

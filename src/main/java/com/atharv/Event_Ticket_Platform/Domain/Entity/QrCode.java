package com.atharv.Event_Ticket_Platform.Domain.Entity;


import com.atharv.Event_Ticket_Platform.Domain.Enum.QrCodeStatus;
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
@Table(name="qr_codes")
@Getter @Setter @AllArgsConstructor @NoArgsConstructor @Builder
public class QrCode {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "public_code", unique = true, nullable = false, length = 8)
    private String publicCode;

    @Enumerated(EnumType.STRING)
    private QrCodeStatus qrCodeStatus;

    @Column(nullable = false)
    private LocalDateTime generatedDateTime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="ticket_id")
    private Ticket ticket;

    @CreatedDate
    @Column(name="created_at",nullable=false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name="updated_at")
    private LocalDateTime updatedAt;

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        QrCode qrCode = (QrCode) o;
        return Objects.equals(id, qrCode.id) && qrCodeStatus == qrCode.qrCodeStatus && Objects.equals(generatedDateTime, qrCode.generatedDateTime) && Objects.equals(createdAt, qrCode.createdAt) && Objects.equals(updatedAt, qrCode.updatedAt);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, qrCodeStatus, generatedDateTime, createdAt, updatedAt);
    }
}

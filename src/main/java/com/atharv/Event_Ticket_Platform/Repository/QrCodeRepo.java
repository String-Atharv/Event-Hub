package com.atharv.Event_Ticket_Platform.Repository;

import com.atharv.Event_Ticket_Platform.Domain.Entity.QrCode;
import com.atharv.Event_Ticket_Platform.Domain.Enum.QrCodeStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface QrCodeRepo extends JpaRepository<QrCode, UUID> {
    List<QrCode> findByQrCodeStatusAndTicket_Id(QrCodeStatus status,UUID ticketId);

   QrCode findTopByTicket_IdOrderByGeneratedDateTimeDesc(UUID ticketId);

    boolean existsByPublicCode(String publicCode);

    Optional<QrCode> findByPublicCode(String publicCode);

}

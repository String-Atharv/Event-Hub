package com.atharv.Event_Ticket_Platform.Service.ServiceInterface;

import com.atharv.Event_Ticket_Platform.Domain.DTO.QrCodeDtos.QrCodeDetails;
import com.atharv.Event_Ticket_Platform.Domain.Entity.QrCode;
import com.atharv.Event_Ticket_Platform.Domain.Entity.Ticket;
import com.google.zxing.WriterException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.UUID;


public interface QrService {
    QrCode createQr(Ticket ticket);


    byte[] createQrImage(String QrId) throws RuntimeException, IOException, WriterException;

    @Transactional
    void generateNewQrForTicket(Ticket ticket);


//    @Transactional
//    void scanQrOrThrow(String publicCode);

    QrCodeDetails qrCodeDetails(UUID userId, UUID ticketId);

    @Transactional
    byte[] generateQrImage(UUID userId, UUID ticketId)
            throws IOException, WriterException;
}

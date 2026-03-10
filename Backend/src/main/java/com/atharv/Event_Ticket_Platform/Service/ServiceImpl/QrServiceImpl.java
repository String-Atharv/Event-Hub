package com.atharv.Event_Ticket_Platform.Service.ServiceImpl;

import com.atharv.Event_Ticket_Platform.Domain.DTO.QrCodeDtos.QrCodeDetails;
import com.atharv.Event_Ticket_Platform.Domain.Entity.QrCode;
import com.atharv.Event_Ticket_Platform.Domain.Entity.Ticket;
import com.atharv.Event_Ticket_Platform.Domain.Enum.QrCodeStatus;
import com.atharv.Event_Ticket_Platform.Domain.Enum.TicketStatus;
import com.atharv.Event_Ticket_Platform.Domain.Mapper.TicketMapper;
import com.atharv.Event_Ticket_Platform.Exceptions.QrCodeNotFoundException;
import com.atharv.Event_Ticket_Platform.Exceptions.ResourceNotFoundException;
import com.atharv.Event_Ticket_Platform.Repository.QrCodeRepo;
import com.atharv.Event_Ticket_Platform.Repository.TicketValidationRepo;
import com.atharv.Event_Ticket_Platform.Repository.TicketsRepo;
import com.atharv.Event_Ticket_Platform.Service.ServiceInterface.QrService;
import com.atharv.Event_Ticket_Platform.util.generatePublicQrCode;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service @RequiredArgsConstructor
public class QrServiceImpl implements QrService {

    private final QrCodeRepo qrCodeRepo;
    private  static final int height=300;
    private static final int width=300;
    private final TicketValidationRepo ticketValidationRepo;
    private final TicketsRepo ticketsRepo;
    private final TicketMapper ticketMapper;

    @Value("${qr.expiry.minutes}")
    private long qrExpiryMinutes;
    private LocalDateTime qrGeneratedTime;

    @Override
    public QrCode createQr(Ticket ticket) {

        QrCode qrCode = new QrCode();
        qrCode.setTicket(ticket);
        qrCode.setQrCodeStatus(QrCodeStatus.ACTIVE);
        qrCode.setGeneratedDateTime(LocalDateTime.now());

        String publicCode;
        do {
            publicCode = generatePublicQrCode.generate(8);
        } while (qrCodeRepo.existsByPublicCode(publicCode));

        String pc=publicCode.toUpperCase(Locale.ROOT);
        qrCode.setPublicCode(pc);

        return qrCodeRepo.save(qrCode);
    }

    @Override
 public byte[] createQrImage(String QrId) throws RuntimeException, IOException, WriterException {
        BitMatrix bitMatrix=new MultiFormatWriter().encode(QrId, BarcodeFormat.QR_CODE,width,height);

        ByteArrayOutputStream outputStream=new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix,"PNG",outputStream);
        return outputStream.toByteArray();
    }

    @Transactional
    @Override
    public void generateNewQrForTicket(Ticket ticket){
        List<QrCode> activeQrCodes=qrCodeRepo.findByQrCodeStatusAndTicket_Id(QrCodeStatus.ACTIVE,ticket.getId());

        for(QrCode qr : activeQrCodes){
            qr.setQrCodeStatus(QrCodeStatus.EXPIRED);
        }

        QrCode qr =createQr(ticket);
        ticket.getQrCodes().add(qr);
    }

    @Override
    public QrCodeDetails qrCodeDetails(UUID userId, UUID ticketId) {

        Ticket ticket = ticketsRepo.findById(ticketId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Ticket not found"));

        if (!ticket.getPurchaser().getId().equals(userId)) {
            throw new IllegalStateException("This ticket does not belong to this user");
        }

        QrCode latestQr =
                qrCodeRepo.findTopByTicket_IdOrderByGeneratedDateTimeDesc(ticketId);

        return latestQr != null ? ticketMapper.toDetails(latestQr) : null;
    }

    @Transactional
    @Override
    public byte[] generateQrImage(UUID userId, UUID ticketId)
            throws IOException, WriterException {

        Ticket ticket = ticketsRepo.findById(ticketId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Ticket not found"));

        if (!ticket.getPurchaser().getId().equals(userId)) {
            throw new IllegalStateException("Unauthorized access");
        }

        if (ticket.getStatus() == TicketStatus.USED) {
            throw new IllegalStateException("Ticket already used");
        }

        if (ticket.getStatus() == TicketStatus.CANCELLED) {
            throw new IllegalStateException("ticket cancelled");
        }

        QrCode qr =
                qrCodeRepo.findTopByTicket_IdOrderByGeneratedDateTimeDesc(ticketId);

        if (qr != null && qr.getQrCodeStatus() == QrCodeStatus.ACTIVE) {

            LocalDateTime expiry =
                    qr.getGeneratedDateTime().plusMinutes(qrExpiryMinutes);

            if (LocalDateTime.now().isBefore(expiry)) {
                return createQrImage(qr.getPublicCode());
            }

            qr.setQrCodeStatus(QrCodeStatus.EXPIRED);
        }

        QrCode newQr = createQr(ticket);

        return createQrImage(newQr.getPublicCode());
    }

}

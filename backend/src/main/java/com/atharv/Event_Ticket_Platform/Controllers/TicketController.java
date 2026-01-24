package com.atharv.Event_Ticket_Platform.Controllers;

import com.atharv.Event_Ticket_Platform.Domain.DTO.EventDtos.EventDtoForTicketPurchase;
import com.atharv.Event_Ticket_Platform.Domain.DTO.QrCodeDtos.QrCodeDetails;
import com.atharv.Event_Ticket_Platform.Domain.DTO.TicketDtos.TicketPurchasedDetails;
import com.atharv.Event_Ticket_Platform.Domain.DTO.TicketDtos.TicketPurchasedDto;
import com.atharv.Event_Ticket_Platform.Domain.DTO.TicketTypeDto.TicketTypeDetails;
import com.atharv.Event_Ticket_Platform.Domain.Entity.Event;
import com.atharv.Event_Ticket_Platform.Domain.Entity.Ticket;
import com.atharv.Event_Ticket_Platform.Domain.Entity.User;
import com.atharv.Event_Ticket_Platform.Domain.Mapper.EventMapper;
import com.atharv.Event_Ticket_Platform.Domain.Mapper.TicketMapper;
import com.atharv.Event_Ticket_Platform.Repository.TicketsRepo;
import com.atharv.Event_Ticket_Platform.Repository.UserRepo;
import com.atharv.Event_Ticket_Platform.Service.ServiceInterface.QrService;
import com.atharv.Event_Ticket_Platform.Service.ServiceInterface.TicketService;
import com.atharv.Event_Ticket_Platform.util.UserFromJwt;
import com.google.zxing.WriterException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.logging.log4j.Logger;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/v1/tickets")
public class TicketController {
    private final TicketService ticketService;
    private final TicketMapper ticketMapper;
    private final EventMapper eventMapper;
    private final QrService qrService;

    @PostMapping("/purchase/{ticketTypeId}")
    public ResponseEntity<TicketPurchasedDto> purchaseTicket(@AuthenticationPrincipal Jwt jwt , @PathVariable Integer ticketTypeId){
        UUID purchaserId=UserFromJwt.parseUserId(jwt);
        log.info("User {} purchasing ticket type {}", purchaserId, ticketTypeId);
        Ticket purchasedTicket=ticketService.purchaseTicket(purchaserId,ticketTypeId);
        TicketPurchasedDto ticketPurchasedDto=ticketMapper.toTicketPuchasedDto(purchasedTicket);
        return new ResponseEntity<>(ticketPurchasedDto, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Page<TicketPurchasedDto>> listPurchasedTicket(@AuthenticationPrincipal Jwt jwt , Pageable pageable){
        UUID userID = UserFromJwt.parseUserId(jwt);
        log.info(" listing all tickets for userid {} ",userID);
        Page<Ticket> ticketForUser=ticketService.listAllTicketsForThisUser(userID,pageable);
        Page<TicketPurchasedDto> ticketPurchasedDtos=ticketForUser.map(ticketMapper::toTicketPuchasedDto);
        return new ResponseEntity<>(ticketPurchasedDtos,HttpStatus.OK);
    }

    @GetMapping("{ticketId}")
    public ResponseEntity<TicketPurchasedDetails> TicketDetails(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID ticketId){
        UUID userId = UserFromJwt.parseUserId(jwt);
        TicketPurchasedDetails ticketPurchasedDto=ticketService.getTicketDetails(userId,ticketId);
        return new ResponseEntity<>(ticketPurchasedDto,HttpStatus.OK);
    }

    @GetMapping("{ticketId}/qr")
    public ResponseEntity<QrCodeDetails> QrDetails(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID ticketId){
        UUID userId = UserFromJwt.parseUserId(jwt);
        QrCodeDetails qrCodeDetails=qrService.qrCodeDetails(userId,ticketId);
        return new ResponseEntity<>(qrCodeDetails,HttpStatus.OK);
    }

    @PostMapping("/{ticketId}/qr")
    public ResponseEntity<byte[]> getQrCode(@AuthenticationPrincipal Jwt jwt,@PathVariable UUID ticketId) throws IOException, WriterException {
        UUID userId = UserFromJwt.parseUserId(jwt);
        byte[] qrGenerated= qrService.generateQrImage(userId,ticketId);
        return new ResponseEntity<>(qrGenerated,HttpStatus.OK);
    }














}

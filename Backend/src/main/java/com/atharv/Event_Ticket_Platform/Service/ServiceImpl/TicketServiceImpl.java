package com.atharv.Event_Ticket_Platform.Service.ServiceImpl;

import com.atharv.Event_Ticket_Platform.Domain.DTO.TicketDtos.TicketPurchasedDetails;
import com.atharv.Event_Ticket_Platform.Domain.Entity.Ticket;
import com.atharv.Event_Ticket_Platform.Domain.Entity.TicketType;
import com.atharv.Event_Ticket_Platform.Domain.Entity.User;
import com.atharv.Event_Ticket_Platform.Domain.Enum.TicketStatus;
import com.atharv.Event_Ticket_Platform.Domain.Mapper.TicketMapper;
import com.atharv.Event_Ticket_Platform.Exceptions.ResourceNotFoundException;
import com.atharv.Event_Ticket_Platform.Exceptions.TicketSoldOutException;
import com.atharv.Event_Ticket_Platform.Exceptions.UserNotFoundExceptions;
import com.atharv.Event_Ticket_Platform.Repository.TicketTypeRepo;
import com.atharv.Event_Ticket_Platform.Repository.TicketsRepo;
import com.atharv.Event_Ticket_Platform.Repository.UserRepo;
import com.atharv.Event_Ticket_Platform.Service.ServiceInterface.QrService;
import com.atharv.Event_Ticket_Platform.Service.ServiceInterface.TicketService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service @RequiredArgsConstructor @Slf4j
public class TicketServiceImpl implements TicketService {
    private final TicketsRepo ticketsRepo;
    private final TicketTypeRepo ticketTypeRepo;
    private final UserRepo userRepo;
    private final QrService qrService;
    private final TicketMapper ticketMapper;

    @Transactional
    @Override
    public Ticket purchaseTicket(UUID userId, Integer ticketTypeId) {
        // VERIFY THE USER
        User user = userRepo.findById(userId).orElseThrow(()->new UserNotFoundExceptions(String.format("user with id : %s not found",userId)));

        // verify the ticketType
        TicketType ticketType=ticketTypeRepo.findByIdForUpdate(ticketTypeId).orElseThrow(()->new ResourceNotFoundException (String.format("TicketType with ID : %s not found",ticketTypeId)));


        // 3. Verify event sales window
        LocalDateTime salesStartTime = ticketType.getEvent().getSalesStartDate();
        LocalDateTime salesEndTime = ticketType.getEvent().getSalesEndDate();

        if (salesStartTime == null || salesEndTime == null) {
            throw new IllegalStateException("Event sales dates not configured");
        }

        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(salesStartTime)) {
            throw new IllegalStateException("Ticket sales have not started yet");
        }

        if (now.isAfter(salesEndTime)) {
            throw new IllegalStateException("Ticket sales have ended");
        }


        // user can purchase ticket if the tickets are available
        if(ticketType.getTotalAvailable()==null || ticketType.getTotalAvailable()<=0){
            log.info("TotalAvailable Tickets for this TicketType is 0");
            throw new TicketSoldOutException(String.format("Tickets sold out for this ticketType : %s",ticketTypeId));
        }


        Ticket ticket = Ticket.builder()
                .ticketType(ticketType)
                .purchaser(user)
                .price(ticketType.getPrice())
                .status(TicketStatus.PURCHASED)
                .build();

        ticketType.setTotalAvailable(ticketType.getTotalAvailable()-1);
        ticketTypeRepo.save(ticketType);
        Ticket savedTicket = ticketsRepo.save(ticket);
        log.info("Ticket purchased successfully - Ticket ID: {}",
                savedTicket.getId());
        return savedTicket;

    }

    @Override
    public Page<Ticket> listAllTicketsForThisUser(UUID userID, Pageable pageable) {
        log.info("Fetching tickets for user: {}", userID);
        Page<Ticket> ticketsOfUser = ticketsRepo.findByPurchaser_Id(userID, pageable);

        if (ticketsOfUser.isEmpty()) {
            log.info("No tickets found for user: {}", userID);
        }

        return ticketsOfUser;
    }

    @Override
    public TicketPurchasedDetails getTicketDetails
            (UUID userId, UUID ticketId) {

        Ticket ticket=ticketsRepo.findById(ticketId).orElseThrow(()->new ResourceNotFoundException(String.format("ticket with id : %s not found",ticketId)));

        if(!ticket.getPurchaser().getId().equals(userId)){
            throw new IllegalStateException("this ticket doesn't belong to this user");
        }

        // create TicketPurchaseDetails
        TicketPurchasedDetails ticketPurchasedDetails=ticketMapper.toDetails(ticket);
        return ticketPurchasedDetails;

    }


    @Transactional
    @Override
    public void cancelTicket(UUID userId, UUID ticketId) {
        log.info("Cancelling ticket - UserId: {}, TicketId: {}", userId, ticketId);

        Ticket ticket = ticketsRepo.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        String.format("Ticket with id: %s not found", ticketId)
                ));

        if (!ticket.getPurchaser().getId().equals(userId)) {
            throw new IllegalStateException("This ticket does not belong to this user");
        }

        if (ticket.getStatus() == TicketStatus.USED) {
            throw new IllegalStateException("Cannot cancel a used ticket");
        }

        if (ticket.getStatus() == TicketStatus.CANCELLED) {
            throw new IllegalStateException("Ticket already cancelled");
        }

        // Mark as cancelled and restore ticket availability
        ticket.setStatus(TicketStatus.CANCELLED);

        TicketType ticketType = ticket.getTicketType();
        ticketType.setTotalAvailable(ticketType.getTotalAvailable() + 1);

        ticketTypeRepo.save(ticketType);
        ticketsRepo.save(ticket);

        log.info("Ticket cancelled successfully - TicketId: {}", ticketId);
    }





}

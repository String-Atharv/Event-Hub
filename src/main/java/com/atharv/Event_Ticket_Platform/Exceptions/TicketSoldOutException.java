package com.atharv.Event_Ticket_Platform.Exceptions;

public class TicketSoldOutException extends EventTicketExceptions{
    public TicketSoldOutException() {
        super();
    }

    public TicketSoldOutException(String message) {
        super(message);
    }

    public TicketSoldOutException(String message, Throwable cause) {
        super(message, cause);
    }

    public TicketSoldOutException(Throwable cause) {
        super(cause);
    }

    public TicketSoldOutException(String message, Throwable cause, boolean enableSuppression, boolean writableStackTrace) {
        super(message, cause, enableSuppression, writableStackTrace);
    }
}

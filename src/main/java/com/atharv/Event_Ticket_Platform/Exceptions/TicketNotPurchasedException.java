package com.atharv.Event_Ticket_Platform.Exceptions;

public class TicketNotPurchasedException extends EventTicketExceptions{
    public TicketNotPurchasedException() {
        super();
    }

    public TicketNotPurchasedException(String message) {
        super(message);
    }

    public TicketNotPurchasedException(String message, Throwable cause) {
        super(message, cause);
    }

    public TicketNotPurchasedException(Throwable cause) {
        super(cause);
    }

    public TicketNotPurchasedException(String message, Throwable cause, boolean enableSuppression, boolean writableStackTrace) {
        super(message, cause, enableSuppression, writableStackTrace);
    }
}

package com.atharv.Event_Ticket_Platform.Exceptions;

public class EventTicketExceptions extends RuntimeException{
    public EventTicketExceptions() {
    }

    public EventTicketExceptions(String message) {
        super(message);
    }

    public EventTicketExceptions(String message, Throwable cause) {
        super(message, cause);
    }

    public EventTicketExceptions(Throwable cause) {
        super(cause);
    }

    public EventTicketExceptions(String message, Throwable cause, boolean enableSuppression, boolean writableStackTrace) {
        super(message, cause, enableSuppression, writableStackTrace);
    }
}

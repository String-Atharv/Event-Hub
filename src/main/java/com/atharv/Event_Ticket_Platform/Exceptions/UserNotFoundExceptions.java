package com.atharv.Event_Ticket_Platform.Exceptions;

public class UserNotFoundExceptions extends EventTicketExceptions{
    public UserNotFoundExceptions() {
    }

    public UserNotFoundExceptions(String message) {
        super(message);
    }

    public UserNotFoundExceptions(String message, Throwable cause) {
        super(message, cause);
    }

    public UserNotFoundExceptions(Throwable cause) {
        super(cause);
    }

    public UserNotFoundExceptions(String message, Throwable cause, boolean enableSuppression, boolean writableStackTrace) {
        super(message, cause, enableSuppression, writableStackTrace);
    }
}

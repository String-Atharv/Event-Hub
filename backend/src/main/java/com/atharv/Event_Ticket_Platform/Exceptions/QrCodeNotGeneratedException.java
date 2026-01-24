package com.atharv.Event_Ticket_Platform.Exceptions;

public class QrCodeNotGeneratedException extends EventTicketExceptions{
    public QrCodeNotGeneratedException() {
        super();
    }

    public QrCodeNotGeneratedException(String message) {
        super(message);
    }

    public QrCodeNotGeneratedException(String message, Throwable cause) {
        super(message, cause);
    }

    public QrCodeNotGeneratedException(Throwable cause) {
        super(cause);
    }

    public QrCodeNotGeneratedException(String message, Throwable cause, boolean enableSuppression, boolean writableStackTrace) {
        super(message, cause, enableSuppression, writableStackTrace);
    }
}

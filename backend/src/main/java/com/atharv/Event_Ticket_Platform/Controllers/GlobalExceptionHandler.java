package com.atharv.Event_Ticket_Platform.Controllers;

import com.atharv.Event_Ticket_Platform.Domain.DTO.ErrorDtos.ErrorDto;
import com.atharv.Event_Ticket_Platform.Exceptions.*;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {


    @ExceptionHandler(UserNotFoundExceptions.class)
    public ResponseEntity<ErrorDto> handleExceptions(UserNotFoundExceptions ex){
        log.error("user not found....",ex);
        ErrorDto errorDto = new ErrorDto();
        errorDto.setError("user not found");
        return  new ResponseEntity<>(errorDto,HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorDto> handleExceptions(ConstraintViolationException ex){
        log.error("unexpected error occured...",ex);
        ErrorDto errorDto = new ErrorDto();
        String msg=ex.getConstraintViolations().stream().findFirst().map(constraintViolation -> constraintViolation.getPropertyPath()+":"+constraintViolation.getMessage()).orElse("Constrain Violation error occured");
        errorDto.setError(msg);
        return new ResponseEntity<>(errorDto,HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorDto> handleExceptions(MethodArgumentNotValidException ex){
        ErrorDto errorDto = new ErrorDto();
        List<FieldError> fieldErrors= ex.getBindingResult().getFieldErrors();
        String message = fieldErrors.stream().findFirst().map(fieldError -> fieldError.getField() +":"+fieldError.getDefaultMessage()).orElse("Validation Error Occured");
        errorDto.setError(message);
        return new ResponseEntity<>(errorDto,HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<?> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorDto> handleExceptions(Exception ex){
        log.error("unexpected error occured...",ex);
        ErrorDto errorDto = new ErrorDto("UnExpected error occured..");
        return new ResponseEntity<>(errorDto,HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(QrCodeNotGeneratedException.class)
    public ResponseEntity<ErrorDto> handleExceptions(QrCodeNotGeneratedException ex){
        log.error("QR not Generated....",ex);
        ErrorDto errorDto = new ErrorDto();
        errorDto.setError("QR not Generated not found");
        return  new ResponseEntity<>(errorDto,HttpStatus.INTERNAL_SERVER_ERROR);
    }


    @ExceptionHandler(QrCodeNotFoundException.class)
    public ResponseEntity<ErrorDto> handleExceptions(QrCodeNotFoundException ex){
        log.error("QR not found....",ex);
        ErrorDto errorDto = new ErrorDto();
        errorDto.setError("QR not found");
        return  new ResponseEntity<>(errorDto,HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(TicketSoldOutException.class)
    public ResponseEntity<ErrorDto> handleExceptions(TicketSoldOutException ex){
        log.error("All tickets of this Ticket Type sold out",ex);
        ErrorDto errorDto = new ErrorDto();
        errorDto.setError("All ticket of this Ticket Type Sold out");
        return  new ResponseEntity<>(errorDto,HttpStatus.BAD_REQUEST);
    }

}

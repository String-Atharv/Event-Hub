package com.atharv.Event_Ticket_Platform.Domain.DTO.QrCodeDtos;

import com.atharv.Event_Ticket_Platform.Domain.Enum.QrCodeStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data @AllArgsConstructor @NoArgsConstructor
public class QrCodeDetails {
    private UUID id;
    private String publicCode;
    private QrCodeStatus qrCodeStatus;
    private LocalDateTime generatedDateTime;
}

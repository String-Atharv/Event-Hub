package com.atharv.Event_Ticket_Platform.Domain.DTO.StaffDtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class GenerateStaffRequestDto {
    private Integer count; // Number of staff to generate
    private Integer validityHours; // How long credentials are valid
}

package com.atharv.Event_Ticket_Platform.Controllers;

import com.atharv.Event_Ticket_Platform.Domain.DTO.StaffDtos.*;
import com.atharv.Event_Ticket_Platform.Domain.Entity.Staff;
import com.atharv.Event_Ticket_Platform.Repository.StaffRepo;
import com.atharv.Event_Ticket_Platform.Security.UserPrincipal;
import com.atharv.Event_Ticket_Platform.Service.ServiceImpl.StaffIamService;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/staff")
@RequiredArgsConstructor
@Slf4j @Builder
public class StaffController {

    private final StaffIamService keycloakUserService;
    private final StaffRepo staffRepo;

    /**
     * ✅ Generate staff accounts for a specific event
     * POST /api/v1/staff/events/{eventId}/generate
     */
    @PostMapping("/events/{eventId}/generate")
    @PreAuthorize("hasRole('ORGANISER')")
    public ResponseEntity<GenerateStaffResponseDto> generateStaffAccounts(
            @AuthenticationPrincipal UserPrincipal organiser,
            @PathVariable UUID eventId,
            @RequestBody GenerateStaffRequestDto request
    ) {
        UUID organiserId = organiser.getUserId();
        log.info("Organiser {} requesting {} staff accounts for event {} with {} hours validity",
                organiserId, request.getCount(), eventId, request.getValidityHours());

        // Defaults
        int count = request.getCount() != null ? request.getCount() : 1;
        int validityHours = request.getValidityHours() != null ? request.getValidityHours() : 24;

        try {
            List<StaffCredentialWithPasswordDto> credentials =
                    keycloakUserService.createStaffAccounts(organiserId, eventId, count, validityHours);

            LocalDateTime validFrom = LocalDateTime.now();
            LocalDateTime validUntil = validFrom.plusHours(validityHours);

            GenerateStaffResponseDto response = GenerateStaffResponseDto.builder()
                    .message("Staff accounts created successfully")
                    .organiserId(organiserId)
                    .eventId(eventId)
                    .staffCount(credentials.size())
                    .validityHours(validityHours)
                    .validFrom(validFrom)
                    .validUntil(validUntil)
                    .credentials(credentials)
                    .build();

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to create staff accounts: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * ✅ Get all staff for a specific event (including expired ones)
     * GET /api/v1/staff/events/{eventId}
     */
    @GetMapping("/events/{eventId}")
    @PreAuthorize("hasRole('ORGANISER')")
    public ResponseEntity<Page<StaffCredentialsDto>> getStaffByEvent(
            @AuthenticationPrincipal UserPrincipal organiser,
            @PathVariable UUID eventId,
            Pageable pageable
    ) {
        UUID organiserId = organiser.getUserId();
        log.info("Organiser {} fetching staff for event {}", organiserId, eventId);

        try {
            Page<Staff> staffPage = staffRepo.findByCreatedByOrganiserIdAndEventId(
                    organiserId, eventId, pageable
            );

            Page<StaffCredentialsDto> dtos = staffPage.map(staff ->
                    StaffCredentialsDto.builder()
                            .id(staff.getId())
                            .staffUserId(staff.getStaffUserId())
                            .username(staff.getUsername())
                            .email(staff.getEmail())
                            .isActive(staff.getIsActive())
                            .validFrom(staff.getValidFrom())
                            .validUntil(staff.getValidUntil())
                            .isExpired(staff.isExpired())
                            .createdAt(staff.getCreatedAt())
                            .lastLogin(staff.getLastLogin())
                            .build()
            );

            return ResponseEntity.ok(dtos);

        } catch (Exception e) {
            log.error("Failed to fetch staff: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * ✅ Get only active (non-expired) staff for a specific event
     * GET /api/v1/staff/events/{eventId}/active
     */
    @GetMapping("/events/{eventId}/active")
    @PreAuthorize("hasRole('ORGANISER')")
    public ResponseEntity<Page<StaffCredentialsDto>> getActiveStaffByEvent(
            @AuthenticationPrincipal UserPrincipal organiser,
            @PathVariable UUID eventId,
            Pageable pageable
    ) {
        UUID organiserId = organiser.getUserId();
        log.info("Organiser {} fetching active staff for event {}", organiserId, eventId);

        try {
            Page<Staff> staffPage = staffRepo.findValidStaffByEvent(
                    organiserId, eventId, LocalDateTime.now(), pageable
            );

            Page<StaffCredentialsDto> dtos = staffPage.map(staff ->
                    StaffCredentialsDto.builder()
                            .id(staff.getId())
                            .staffUserId(staff.getStaffUserId())
                            .username(staff.getUsername())
                            .email(staff.getEmail())
                            .isActive(staff.getIsActive())
                            .validFrom(staff.getValidFrom())
                            .validUntil(staff.getValidUntil())
                            .isExpired(false) // These are all active
                            .createdAt(staff.getCreatedAt())
                            .lastLogin(staff.getLastLogin())
                            .build()
            );

            return ResponseEntity.ok(dtos);

        } catch (Exception e) {
            log.error("Failed to fetch active staff: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * ✅ Delete a staff user from a specific event
     * DELETE /api/v1/staff/events/{eventId}/users/{userId}
     */
    @DeleteMapping("/events/{eventId}/users/{userId}")
    @PreAuthorize("hasRole('ORGANISER')")
    public ResponseEntity<Map<String, String>> deleteStaffUser(
            @AuthenticationPrincipal UserPrincipal organiser,
            @PathVariable UUID eventId,
            @PathVariable String userId
    ) {
        UUID organiserId = organiser.getUserId();
        log.info("Organiser {} deleting staff user {} from event {}",
                organiserId, userId, eventId);

        try {
            keycloakUserService.deleteStaffUser(organiserId, eventId, userId);

            return ResponseEntity.ok(Map.of(
                    "message", "Staff user deleted successfully",
                    "userId", userId,
                    "eventId", eventId.toString()
            ));
        } catch (Exception e) {
            log.error("Failed to delete staff user: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Failed to delete staff user",
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * ✅ Reset staff user password
     * POST /api/v1/staff/events/{eventId}/users/{userId}/reset-password
     */
    @PostMapping("/events/{eventId}/users/{userId}/reset-password")
    @PreAuthorize("hasRole('ORGANISER')")
    public ResponseEntity<Map<String, String>> resetStaffPassword(
            @AuthenticationPrincipal UserPrincipal organiser,
            @PathVariable UUID eventId,
            @PathVariable String userId
    ) {
        UUID organiserId = organiser.getUserId();
        log.info("Organiser {} resetting password for staff user {} in event {}",
                organiserId, userId, eventId);

        try {
            String newPassword = keycloakUserService.resetPassword(organiserId, eventId, userId);

            return ResponseEntity.ok(Map.of(
                    "message", "Password reset successfully",
                    "userId", userId,
                    "eventId", eventId.toString(),
                    "newPassword", newPassword,
                    "note", "⚠️ Save this password securely. It won't be shown again."
            ));
        } catch (Exception e) {
            log.error("Failed to reset password: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Failed to reset password",
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * ✅ Extend validity period for a staff member
     * POST /api/v1/staff/events/{eventId}/users/{userId}/extend-validity
     */
    @PostMapping("/events/{eventId}/users/{userId}/extend-validity")
    @PreAuthorize("hasRole('ORGANISER')")
    public ResponseEntity<Map<String, Object>> extendValidity(
            @AuthenticationPrincipal UserPrincipal organiser,
            @PathVariable UUID eventId,
            @PathVariable String userId,
            @RequestParam int hours
    ) {
        UUID organiserId = organiser.getUserId();
        log.info("Organiser {} extending validity for staff {} by {} hours",
                organiserId, userId, hours);

        try {
            Staff updatedStaff = keycloakUserService.extendValidity(
                    organiserId, eventId, userId, hours
            );

            return ResponseEntity.ok(Map.of(
                    "message", "Validity extended successfully",
                    "userId", userId,
                    "eventId", eventId.toString(),
                    "newValidUntil", updatedStaff.getValidUntil(),
                    "extendedBy", hours + " hours"
            ));
        } catch (Exception e) {
            log.error("Failed to extend validity: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Failed to extend validity",
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * ✅ Get staff statistics for an event
     * GET /api/v1/staff/events/{eventId}/stats
     */
    @GetMapping("/events/{eventId}/stats")
    @PreAuthorize("hasRole('ORGANISER')")
    public ResponseEntity<Map<String, Object>> getStaffStats(
            @AuthenticationPrincipal UserPrincipal organiser,
            @PathVariable UUID eventId
    ) {
        UUID organiserId = organiser.getUserId();

        try {
            List<Staff> allStaff = staffRepo.findByCreatedByOrganiserIdAndEventId(
                    organiserId, eventId
            );

            long total = allStaff.size();
            long active = allStaff.stream()
                    .filter(Staff::isValidNow)
                    .count();
            long expired = allStaff.stream()
                    .filter(Staff::isExpired)
                    .count();
            long inactive = allStaff.stream()
                    .filter(s -> !s.getIsActive())
                    .count();

            return ResponseEntity.ok(Map.of(
                    "eventId", eventId,
                    "total", total,
                    "active", active,
                    "expired", expired,
                    "inactive", inactive
            ));
        } catch (Exception e) {
            log.error("Failed to get stats: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
}
package com.atharv.Event_Ticket_Platform.Service.ServiceImpl;

import com.atharv.Event_Ticket_Platform.Domain.DTO.StaffDtos.StaffCredentialWithPasswordDto;
import com.atharv.Event_Ticket_Platform.Domain.Entity.Staff;
import com.atharv.Event_Ticket_Platform.Domain.Entity.User;
import com.atharv.Event_Ticket_Platform.Repository.StaffRepo;
import com.atharv.Event_Ticket_Platform.Repository.UserRepo;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class StaffIamService {

    private final StaffRepo staffRepo;
    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;

    /**
     * ✅ Generate staff accounts for a specific event with validity period
     * (JWT + Spring Security based)
     */
    @Transactional
    public List<StaffCredentialWithPasswordDto> createStaffAccounts(
            UUID organiserId,
            UUID eventId,
            int numberOfStaff,
            int validityHours
    ) {
        log.info("Organiser {} requesting {} staff accounts for event {} with {} hours validity",
                organiserId, numberOfStaff, eventId, validityHours);

        if (numberOfStaff <= 0 || numberOfStaff > 100) {
            throw new IllegalArgumentException("Number of staff must be between 1 and 100");
        }

        if (validityHours <= 0 || validityHours > 8760) {
            throw new IllegalArgumentException("Validity hours must be between 1 and 8760 (1 year)");
        }

        LocalDateTime validFrom = LocalDateTime.now();
        LocalDateTime validUntil = validFrom.plusHours(validityHours);

        List<StaffCredentialWithPasswordDto> staffCredentials = new ArrayList<>();

        for (int i = 0; i < numberOfStaff; i++) {
            String username = generateUniqueUsername();
            String rawPassword = generateSecurePassword();
            String email = username;

            if (userRepo.existsByEmail(email)) {
                throw new RuntimeException("Generated staff email already exists");
            }


            // 1️⃣ Create USER (authentication identity)
            User staffUser = User.builder()
                    .name(username)
                    .email(email)
                    .password(passwordEncoder.encode(rawPassword))
                    .roles(Set.of("ROLE_STAFF"))
                    .build();

            userRepo.save(staffUser);

            // 2️⃣ Create STAFF (business identity)
            Staff staff = Staff.builder()
                    .staffUserId(staffUser.getId()) // ✅ local DB user ID
                    .eventId(eventId)
                    .username(username)
                    .email(email)
                    .createdByOrganiserId(organiserId)
                    .isActive(true)
                    .validFrom(validFrom)
                    .validUntil(validUntil)
                    .build();

            staffRepo.save(staff);

            // 3️⃣ Return credentials (password shown ONCE)
            staffCredentials.add(
                    StaffCredentialWithPasswordDto.builder()
                            .staffUserId(staffUser.getId())
                            .username(username)
                            .password(rawPassword)
                            .email(email)
                            .validFrom(validFrom)
                            .validUntil(validUntil)
                            .build()
            );

            log.info("Created staff account {} for event {} by organiser {}",
                    username, eventId, organiserId);
        }

        return staffCredentials;
    }

    /**
     * ✅ Deactivate staff user (soft delete)
     */
    @Transactional
    public void deleteStaffUser(UUID organiserId, UUID eventId, String userId) {

        Staff staff = staffRepo.findByStaffUserId(UUID.fromString(userId))
                .orElseThrow(() -> new RuntimeException("Staff user not found"));

        validateOwnership(staff, organiserId, eventId);

        staff.setIsActive(false);
        staffRepo.save(staff);

        log.info("Deactivated staff user {}", userId);
    }

    /**
     * ✅ Reset staff password (local DB)
     */
    @Transactional
    public String resetPassword(UUID organiserId, UUID eventId, String userId) {

        Staff staff = staffRepo.findByStaffUserId(UUID.fromString(userId))
                .orElseThrow(() -> new RuntimeException("Staff user not found"));

        validateOwnership(staff, organiserId, eventId);

        User user = userRepo.findById(staff.getStaffUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String newPassword = generateSecurePassword();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepo.save(user);

        log.info("Password reset for staff user {}", userId);
        return newPassword;
    }

    /**
     * ✅ Extend validity period
     */
    @Transactional
    public Staff extendValidity(UUID organiserId, UUID eventId, String userId, int additionalHours) {

        Staff staff = staffRepo.findByStaffUserId(UUID.fromString(userId))
                .orElseThrow(() -> new RuntimeException("Staff user not found"));

        validateOwnership(staff, organiserId, eventId);

        staff.setValidUntil(staff.getValidUntil().plusHours(additionalHours));
        return staffRepo.save(staff);
    }

    // ------------------- helpers -------------------

    private void validateOwnership(Staff staff, UUID organiserId, UUID eventId) {
        if (!staff.getCreatedByOrganiserId().equals(organiserId)) {
            throw new RuntimeException("You don't have permission to manage this staff");
        }
        if (!staff.getEventId().equals(eventId)) {
            throw new RuntimeException("Staff not assigned to this event");
        }
    }

    private String generateUniqueUsername() {
        return "staff_" + UUID.randomUUID().toString().substring(0, 8);
    }

    private String generateSecurePassword() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
        Random random = new Random();
        StringBuilder password = new StringBuilder();

        for (int i = 0; i < 12; i++) {
            password.append(chars.charAt(random.nextInt(chars.length())));
        }
        return password.toString();
    }
}

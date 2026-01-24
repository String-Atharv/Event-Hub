package com.atharv.Event_Ticket_Platform.Service.ServiceImpl;

import com.atharv.Event_Ticket_Platform.Domain.DTO.StaffDtos.StaffCredentialWithPasswordDto;
import com.atharv.Event_Ticket_Platform.Domain.Entity.Staff;
import com.atharv.Event_Ticket_Platform.Repository.StaffRepo;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.ws.rs.core.Response;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class KeycloakUserService {

    private final Keycloak keycloak;
    private final KeycloakRoleService keycloakRoleService;
    private final StaffRepo staffRepo;

    @Value("${keycloak.admin.realm}")
    private String realm;

    /**
     * ✅ Generate staff accounts for a specific event with validity period
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

        if (validityHours <= 0 || validityHours > 8760) { // Max 1 year
            throw new IllegalArgumentException("Validity hours must be between 1 and 8760 (1 year)");
        }

        LocalDateTime validFrom = LocalDateTime.now();
        LocalDateTime validUntil = validFrom.plusHours(validityHours);

        List<StaffCredentialWithPasswordDto> staffCredentials = new ArrayList<>();
        RealmResource realmResource = keycloak.realm(realm);
        UsersResource usersResource = realmResource.users();

        for (int i = 0; i < numberOfStaff; i++) {
            String username = generateUniqueUsername();
            String password = generateSecurePassword();
            String email = username + "@staff.eventplatform.com";

            try {
                // Create user representation
                UserRepresentation user = new UserRepresentation();
                user.setEnabled(true);
                user.setUsername(username);
                user.setEmail(email);
                user.setFirstName("Staff");
                user.setLastName(username);
                user.setEmailVerified(true);

                // Set password
                CredentialRepresentation credential = new CredentialRepresentation();
                credential.setType(CredentialRepresentation.PASSWORD);
                credential.setValue(password);
                credential.setTemporary(false);
                user.setCredentials(Collections.singletonList(credential));

                // Create user in Keycloak
                Response response = usersResource.create(user);

                if (response.getStatus() == 201) {
                    String locationHeader = response.getHeaderString("Location");
                    String userId = locationHeader.substring(locationHeader.lastIndexOf('/') + 1);

                    // Assign ROLE_STAFF
                    keycloakRoleService.assignRole(userId, "ROLE_STAFF");

                    // ✅ Store credentials in database with validity period
                    Staff staffCred = Staff.builder()
                            .staffUserId(UUID.fromString(userId))
                            .eventId(eventId) // ✅ Link to specific event
                            .username(username)
                            .email(email)
                            .createdByOrganiserId(organiserId)
                            .isActive(true)
                            .validFrom(validFrom) // ✅ Validity period
                            .validUntil(validUntil) // ✅ Expiration time
                            .build();

                    staffRepo.save(staffCred);

                    // Return credentials (password only shown once)
                    staffCredentials.add(StaffCredentialWithPasswordDto.builder()
                            .staffUserId(UUID.fromString(userId))
                            .username(username)
                            .password(password)
                            .email(email)
                            .validFrom(validFrom)
                            .validUntil(validUntil)
                            .build()
                    );

                    log.info("Created staff account: {} for event: {} by organiser: {}",
                            username, eventId, organiserId);
                } else {
                    log.error("Failed to create staff account. Status: {}", response.getStatus());
                }

                response.close();

            } catch (Exception e) {
                log.error("Error creating staff account: {}", e.getMessage(), e);
            }
        }

        return staffCredentials;
    }

    /**
     * ✅ Delete staff user from Keycloak and deactivate in database
     */
    @Transactional
    public void deleteStaffUser(UUID organiserId, UUID eventId, String userId) {
        log.info("Organiser {} deleting staff user {} from event {}",
                organiserId, userId, eventId);

        // Verify ownership and event association
        Staff staff = staffRepo.findByStaffUserId(UUID.fromString(userId))
                .orElseThrow(() -> new RuntimeException("Staff user not found"));

        if (!staff.getCreatedByOrganiserId().equals(organiserId)) {
            throw new RuntimeException("You don't have permission to delete this staff");
        }

        if (!staff.getEventId().equals(eventId)) {
            throw new RuntimeException("This staff member is not assigned to this event");
        }

        try {
            // Delete from Keycloak
            keycloak.realm(realm).users().delete(userId);

            // Deactivate in database (soft delete)
            staff.setIsActive(false);
            staffRepo.save(staff);

            log.info("Successfully deleted and deactivated staff user {}", userId);
        } catch (Exception e) {
            log.error("Failed to delete staff user {}: {}", userId, e.getMessage());
            throw new RuntimeException("Failed to delete staff user from Keycloak", e);
        }
    }

    /**
     * ✅ Reset staff user password
     */
    @Transactional
    public String resetPassword(UUID organiserId, UUID eventId, String userId) {
        log.info("Organiser {} resetting password for staff user {} in event {}",
                organiserId, userId, eventId);

        // Verify ownership
        Staff staff = staffRepo.findByStaffUserId(UUID.fromString(userId))
                .orElseThrow(() -> new RuntimeException("Staff user not found"));

        if (!staff.getCreatedByOrganiserId().equals(organiserId)) {
            throw new RuntimeException("You don't have permission to reset this staff's password");
        }

        if (!staff.getEventId().equals(eventId)) {
            throw new RuntimeException("This staff member is not assigned to this event");
        }

        try {
            String newPassword = generateSecurePassword();

            CredentialRepresentation credential = new CredentialRepresentation();
            credential.setType(CredentialRepresentation.PASSWORD);
            credential.setValue(newPassword);
            credential.setTemporary(false);

            keycloak.realm(realm).users().get(userId).resetPassword(credential);

            log.info("Successfully reset password for staff user {}", userId);
            return newPassword;

        } catch (Exception e) {
            log.error("Failed to reset password for staff user {}: {}", userId, e.getMessage());
            throw new RuntimeException("Failed to reset password in Keycloak", e);
        }
    }

    /**
     * ✅ Extend validity period for a staff member
     */
    @Transactional
    public Staff extendValidity(UUID organiserId, UUID eventId, String userId, int additionalHours) {
        log.info("Organiser {} extending validity for staff {} by {} hours",
                organiserId, userId, additionalHours);

        Staff staff = staffRepo.findByStaffUserId(UUID.fromString(userId))
                .orElseThrow(() -> new RuntimeException("Staff user not found"));

        if (!staff.getCreatedByOrganiserId().equals(organiserId)) {
            throw new RuntimeException("You don't have permission to modify this staff");
        }

        if (!staff.getEventId().equals(eventId)) {
            throw new RuntimeException("This staff member is not assigned to this event");
        }

        staff.setValidUntil(staff.getValidUntil().plusHours(additionalHours));
        return staffRepo.save(staff);
    }

    private String generateUniqueUsername() {
        String prefix = "staff";
        String randomPart = UUID.randomUUID().toString().substring(0, 8);
        return prefix + "_" + randomPart;
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
package com.atharv.Event_Ticket_Platform.Security;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserPrincipal implements UserDetails {

    private UUID userId;
    private String email;
    private String username;
    private String password;  // ✅ ADD THIS FIELD
    private List<String> roles;

    public UserPrincipal(UUID userId, String email, String username, List<String> roles) {
        this.userId = userId;
        this.email = email;
        this.username = username;
        this.roles = roles;
    }


    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // ========== FIXED: Roles from DB already have ROLE_ prefix ==========
        // Don't add ROLE_ again if it's already there
        return roles.stream()
                .map(role -> {
                    String authority = role.startsWith("ROLE_") ? role : "ROLE_" + role;
                    return new SimpleGrantedAuthority(authority);
                })
                .collect(Collectors.toList());
        // ====================================================================
    }

    @Override
    public String getPassword() {
        return password; // Not needed for JWT
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
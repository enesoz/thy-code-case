package com.ehy.entity;

import com.ehy.enums.UserRole;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.annotations.UuidGenerator;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

/**
 * Entity representing a user in the system.
 * Implements Spring Security's UserDetails interface for authentication and authorization.
 */
@Entity
@Table(name = "users")
@SQLDelete(sql = "UPDATE users SET deleted = true WHERE id = ? AND optimistic_lock_version = ?")
@SQLRestriction("deleted = false")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User implements UserDetails {

    /**
     * Unique identifier for the user (UUID)
     */
    @Id
    @UuidGenerator
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    /**
     * Unique username for authentication
     */
    @Column(name = "username", unique = true, nullable = false, length = 100)
    private String username;

    /**
     * BCrypt encoded password
     */
    @Column(name = "password", nullable = false)
    private String password;

    /**
     * User's role in the system (ADMIN, AGENCY)
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 20)
    private UserRole role;

    /**
     * Soft delete flag - true if the user has been deleted/deactivated
     */
    @Column(name = "deleted", nullable = false)
    @Builder.Default
    private Boolean deleted = false;

    /**
     * Version field for optimistic locking to prevent concurrent modification issues
     */
    @Version
    @Column(name = "optimistic_lock_version")
    private Long optimisticLockVersion;

    /**
     * Timestamp when the user was created
     * Automatically populated by JPA auditing
     */
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Timestamp when the user was last modified
     * Automatically updated by JPA auditing
     */
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // UserDetails interface implementation

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return !deleted;
    }

    @Override
    public boolean isAccountNonLocked() {
        return !deleted;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return !deleted;
    }

    @Override
    public boolean isEnabled() {
        return !deleted;
    }
}

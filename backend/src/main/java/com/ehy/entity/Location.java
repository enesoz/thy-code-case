package com.ehy.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.annotations.UuidGenerator;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity representing a geographical location in the system.
 * Locations can be airports or other points of interest (e.g., city centers, landmarks).
 * Each location is uniquely identified by a location code (IATA codes for airports or custom codes).
 */
@Entity
@Table(
    name = "locations",
    indexes = {
        @Index(name = "idx_location_code", columnList = "location_code"),
        @Index(name = "idx_tenant_deleted", columnList = "tenant_id,deleted")
    }
)
@SQLDelete(sql = "UPDATE locations SET deleted = true WHERE id = ? AND optimistic_lock_version = ?")
@SQLRestriction("deleted = false")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Location {

    /**
     * Unique identifier for the location (UUID)
     */
    @Id
    @UuidGenerator
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    /**
     * Tenant identifier for multi-tenancy support
     */
    @Column(name = "tenant_id")
    private UUID tenantId;

    /**
     * Human-readable name of the location
     * Example: "Istanbul Airport", "Taksim Square"
     */
    @Column(name = "name", nullable = false)
    private String name;

    /**
     * Country where the location is situated
     */
    @Column(name = "country", nullable = false)
    private String country;

    /**
     * City where the location is situated
     */
    @Column(name = "city", nullable = false)
    private String city;

    /**
     * Unique location code (IATA codes for airports: 3 chars, or custom codes: 4 chars)
     * Example: "IST", "SAW", "TAKSIM"
     */
    @Column(name = "location_code", unique = true, nullable = false, length = 10)
    private String locationCode;

    /**
     * Soft delete flag - true if the location has been deleted
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
     * Display order for sorting locations in UI
     */
    @Column(name = "display_order")
    private Integer displayOrder;

    /**
     * Timestamp when the location was created
     * Automatically populated by JPA auditing
     */
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Timestamp when the location was last modified
     * Automatically updated by JPA auditing
     */
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Username of the user who created this location
     * Automatically populated by JPA auditing
     */
    @CreatedBy
    @Column(name = "created_by", updatable = false, length = 100)
    private String createdBy;

    /**
     * Username of the user who last modified this location
     * Automatically updated by JPA auditing
     */
    @LastModifiedBy
    @Column(name = "updated_by", length = 100)
    private String updatedBy;
}

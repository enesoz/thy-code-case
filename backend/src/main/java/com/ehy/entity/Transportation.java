package com.ehy.entity;

import com.ehy.enums.TransportationType;
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
 * Entity representing a transportation option between two locations.
 * Includes information about the type of transport and operating days.
 */
@Entity
@Table(
    name = "transportations",
    indexes = {
        @Index(name = "idx_origin_dest", columnList = "origin_location_id,destination_location_id"),
        @Index(name = "idx_type_deleted", columnList = "transportation_type,deleted"),
        @Index(name = "idx_tenant_deleted", columnList = "tenant_id,deleted")
    }
)
@SQLDelete(sql = "UPDATE transportations SET deleted = true WHERE id = ? AND optimistic_lock_version = ?")
@SQLRestriction("deleted = false")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transportation {

    /**
     * Unique identifier for the transportation (UUID)
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
     * Origin location of the transportation route
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "origin_location_id", nullable = false)
    private Location originLocation;

    /**
     * Destination location of the transportation route
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_location_id", nullable = false)
    private Location destinationLocation;

    /**
     * Type of transportation (FLIGHT, BUS, SUBWAY, UBER)
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "transportation_type", nullable = false, length = 20)
    private TransportationType transportationType;

    /**
     * Operating days as a comma-separated string of integers 1-7 (Mon-Sun).
     * Example: "1,3,5,7" means Monday, Wednesday, Friday, Sunday
     */
    @Column(name = "operating_days", nullable = false, length = 50)
    private String operatingDays;

    /**
     * Soft delete flag - true if the transportation has been deleted
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
     * Timestamp when the transportation was created
     * Automatically populated by JPA auditing
     */
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Timestamp when the transportation was last modified
     * Automatically updated by JPA auditing
     */
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Username of the user who created this transportation
     * Automatically populated by JPA auditing
     */
    @CreatedBy
    @Column(name = "created_by", updatable = false, length = 100)
    private String createdBy;

    /**
     * Username of the user who last modified this transportation
     * Automatically updated by JPA auditing
     */
    @LastModifiedBy
    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    /**
     * Check if this transportation operates on the given day of week
     * @param dayOfWeek Day of week (1=Monday, 2=Tuesday, ..., 7=Sunday)
     * @return true if transportation operates on this day
     */
    public boolean isOperatingOnDay(int dayOfWeek) {
        if (operatingDays == null || operatingDays.isBlank()) {
            return false;
        }
        String[] parts = operatingDays.split(",");
        for (String part : parts) {
            try {
                int day = Integer.parseInt(part.trim());
                if (day == dayOfWeek) {
                    return true;
                }
            } catch (NumberFormatException ignored) {
                // skip invalid tokens
            }
        }
        return false;
    }
}

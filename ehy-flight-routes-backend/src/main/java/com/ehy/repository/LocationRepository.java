package com.ehy.repository;

import com.ehy.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for Location entity.
 * Provides CRUD operations and custom queries for location management.
 * Note: @SQLRestriction("deleted = false") on Location entity automatically filters out deleted records.
 */
@Repository
public interface LocationRepository extends JpaRepository<Location, UUID> {

    /**
     * Find all non-deleted locations
     * @return List of active locations
     */
    List<Location> findAll();

    /**
     * Find a non-deleted location by ID
     * @param id Location ID
     * @return Optional containing the location if found and not deleted
     */
    Optional<Location> findById(UUID id);

    /**
     * Find a location by its location code (IATA code or custom code)
     * @param locationCode Unique location code
     * @return Optional containing the location if found
     */
    Optional<Location> findByLocationCode(String locationCode);

    /**
     * Check if a location code already exists (case-insensitive)
     * @param locationCode Location code to check
     * @return true if the code exists
     */
    boolean existsByLocationCodeIgnoreCase(String locationCode);

    /**
     * Find all locations ordered by display order
     * @return List of locations sorted by display order
     */
    @Query("SELECT l FROM Location l ORDER BY l.displayOrder ASC, l.name ASC")
    List<Location> findAllOrderedByDisplayOrder();

    /**
     * Find all non-deleted location IDs only (performance optimization).
     * This query only fetches IDs, avoiding the overhead of loading full entities.
     * Useful for route calculation where we only need to check which locations exist.
     *
     * @return List of location IDs
     */
    @Query("SELECT l.id FROM Location l")
    List<UUID> findAllLocationIds();
}

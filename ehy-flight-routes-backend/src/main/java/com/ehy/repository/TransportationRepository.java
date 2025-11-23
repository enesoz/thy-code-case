package com.ehy.repository;

import com.ehy.entity.Transportation;
import com.ehy.enums.TransportationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for Transportation entity.
 * Provides CRUD operations and custom queries for transportation management and route calculation.
 * Note: @SQLRestriction("deleted = false") on Transportation entity automatically filters out deleted records.
 */
@Repository
public interface TransportationRepository extends JpaRepository<Transportation, UUID> {

    /**
     * Find all non-deleted transportations
     * @return List of active transportations
     */
    List<Transportation> findAll();

    /**
     * Find a non-deleted transportation by ID
     * @param id Transportation ID
     * @return Optional containing the transportation if found and not deleted
     */
    Optional<Transportation> findById(UUID id);

    /**
     * Find all transportations between origin and destination locations that operate on the given day.
     * Used for finding direct flights and transfers.
     *
     * @param originId Origin location ID
     * @param destinationId Destination location ID
     * @param dayOfWeek Day of week (1=Monday, 2=Tuesday, ..., 7=Sunday)
     * @return List of available transportations
     */
    @Query("SELECT t FROM Transportation t " +
           "WHERE t.originLocation.id = :originId " +
           "AND t.destinationLocation.id = :destinationId " +
           "AND CONCAT(',', t.operatingDays, ',') LIKE CONCAT(CONCAT('%,', :dayOfWeek), ',%')")
    List<Transportation> findAvailableTransportations(
        @Param("originId") UUID originId,
        @Param("destinationId") UUID destinationId,
        @Param("dayOfWeek") Integer dayOfWeek
    );

    /**
     * Find all transportations of a specific type between origin and destination that operate on the given day.
     * Used for finding flights or specific transfer types.
     * Uses JOIN FETCH to eagerly load origin and destination locations to prevent N+1 query problem.
     *
     * @param originId Origin location ID
     * @param destinationId Destination location ID
     * @param type Transportation type (FLIGHT, BUS, SUBWAY, UBER)
     * @param dayOfWeek Day of week (1=Monday, 2=Tuesday, ..., 7=Sunday)
     * @return List of available transportations of the specified type
     */
    @Query("SELECT t FROM Transportation t " +
           "JOIN FETCH t.originLocation " +
           "JOIN FETCH t.destinationLocation " +
           "WHERE t.originLocation.id = :originId " +
           "AND t.destinationLocation.id = :destinationId " +
           "AND t.transportationType = :type " +
           "AND CONCAT(',', t.operatingDays, ',') LIKE CONCAT(CONCAT('%,', :dayOfWeek), ',%')")
    List<Transportation> findAvailableTransportationsByType(
        @Param("originId") UUID originId,
        @Param("destinationId") UUID destinationId,
        @Param("type") TransportationType type,
        @Param("dayOfWeek") Integer dayOfWeek
    );

    /**
     * Find all transportations from origin locations to destination locations that operate on the given day.
     * Used for finding multiple possible transfers (before-flight or after-flight).
     *
     * @param originIds List of origin location IDs
     * @param destinationIds List of destination location IDs
     * @param dayOfWeek Day of week (1=Monday, 2=Tuesday, ..., 7=Sunday)
     * @return List of available transportations
     */
    @Query("SELECT t FROM Transportation t " +
           "WHERE t.originLocation.id IN :originIds " +
           "AND t.destinationLocation.id IN :destinationIds " +
           "AND CONCAT(',', t.operatingDays, ',') LIKE CONCAT(CONCAT('%,', :dayOfWeek), ',%')")
    List<Transportation> findAvailableTransportationsBetweenLocations(
        @Param("originIds") List<UUID> originIds,
        @Param("destinationIds") List<UUID> destinationIds,
        @Param("dayOfWeek") Integer dayOfWeek
    );

    /**
     * Find all non-flight transportations from origin locations to destination locations that operate on the given day.
     * Used specifically for finding ground transfers (BUS, SUBWAY, UBER).
     * Uses JOIN FETCH to eagerly load origin and destination locations to prevent N+1 query problem.
     *
     * @param originIds List of origin location IDs
     * @param destinationIds List of destination location IDs
     * @param dayOfWeek Day of week (1=Monday, 2=Tuesday, ..., 7=Sunday)
     * @return List of available non-flight transportations
     */
    @Query("SELECT t FROM Transportation t " +
           "JOIN FETCH t.originLocation " +
           "JOIN FETCH t.destinationLocation " +
           "WHERE t.originLocation.id IN :originIds " +
           "AND t.destinationLocation.id IN :destinationIds " +
           "AND t.transportationType <> 'FLIGHT' " +
           "AND CONCAT(',', t.operatingDays, ',') LIKE CONCAT(CONCAT('%,', :dayOfWeek), ',%')")
    List<Transportation> findAvailableNonFlightTransportations(
        @Param("originIds") List<UUID> originIds,
        @Param("destinationIds") List<UUID> destinationIds,
        @Param("dayOfWeek") Integer dayOfWeek
    );

    /**
     * Find all flights between any origin and destination locations that operate on the given day.
     * Used for finding all available flights.
     * Uses JOIN FETCH to eagerly load origin and destination locations to prevent N+1 query problem.
     *
     * @param originIds List of possible origin location IDs
     * @param destinationIds List of possible destination location IDs
     * @param dayOfWeek Day of week (1=Monday, 2=Tuesday, ..., 7=Sunday)
     * @return List of available flights
     */
    @Query("SELECT t FROM Transportation t " +
           "JOIN FETCH t.originLocation " +
           "JOIN FETCH t.destinationLocation " +
           "WHERE t.originLocation.id IN :originIds " +
           "AND t.destinationLocation.id IN :destinationIds " +
           "AND t.transportationType = 'FLIGHT' " +
           "AND CONCAT(',', t.operatingDays, ',') LIKE CONCAT(CONCAT('%,', :dayOfWeek), ',%')")
    List<Transportation> findAvailableFlights(
        @Param("originIds") List<UUID> originIds,
        @Param("destinationIds") List<UUID> destinationIds,
        @Param("dayOfWeek") Integer dayOfWeek
    );

    /**
     * Check if any transportation uses the given location as origin or destination.
     * Used for referential integrity check before deleting a location.
     *
     * @param locationId Location ID to check
     * @return true if any non-deleted transportation references this location
     */
    @Query("SELECT CASE WHEN COUNT(t) > 0 THEN true ELSE false END " +
           "FROM Transportation t " +
           "WHERE (t.originLocation.id = :locationId OR t.destinationLocation.id = :locationId)")
    boolean existsByOriginOrDestination(@Param("locationId") UUID locationId);
}

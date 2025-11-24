package com.ehy.service;

import com.ehy.dto.LocationRequest;
import com.ehy.dto.LocationResponse;
import com.ehy.entity.Location;
import com.ehy.exception.DuplicateResourceException;
import com.ehy.exception.ResourceNotFoundException;
import com.ehy.mapper.LocationMapper;
import com.ehy.repository.LocationRepository;
import com.ehy.repository.TransportationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Service for location management operations.
 * Handles CRUD operations for locations with validation.
 */
@Service
@Transactional(readOnly = true)
public class LocationService {

    private static final Logger logger = LoggerFactory.getLogger(LocationService.class);

    private final LocationRepository locationRepository;
    private final LocationMapper locationMapper;
    private final TransportationRepository transportationRepository;

    public LocationService(
            LocationRepository locationRepository,
            LocationMapper locationMapper,
            TransportationRepository transportationRepository) {
        this.locationRepository = locationRepository;
        this.locationMapper = locationMapper;
        this.transportationRepository = transportationRepository;
    }

    /**
     * Get all non-deleted locations
     * @return List of locations
     */
    public List<LocationResponse> getAllLocations() {
        logger.debug("Retrieving all locations");
        List<Location> locations = locationRepository.findAllOrderedByDisplayOrder();
        return locationMapper.toResponseList(locations);
    }

    /**
     * Get a location by ID
     * @param id Location ID
     * @return Location details
     * @throws ResourceNotFoundException if location not found
     */
    @Cacheable(value ="locationById" , key = "#id")
    public LocationResponse getLocationById(UUID id) {
        logger.debug("Retrieving location with id: {}", id);
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location", "id", id));
        return locationMapper.toResponse(location);
    }

    /**
     * Create a new location
     * Evicts all cached routes since new location may affect route calculations.
     *
     * @param request Location creation request
     * @return Created location
     * @throws DuplicateResourceException if location code already exists
     */
    @Transactional
    @CacheEvict(value = "routes, locationById", allEntries = true)
    public LocationResponse createLocation(LocationRequest request) {
        logger.info("Creating new location with code: {}", request.getLocationCode());

        // Check for duplicate location code
        if (locationRepository.existsByLocationCodeIgnoreCase(request.getLocationCode())) {
            throw new DuplicateResourceException("Location", "locationCode", request.getLocationCode());
        }

        Location location = locationMapper.toEntity(request);
        location.setDeleted(false);

        Location savedLocation = locationRepository.save(location);
        logger.info("Location created successfully with id: {}", savedLocation.getId());

        return locationMapper.toResponse(savedLocation);
    }

    /**
     * Update an existing location
     * Evicts all cached routes since location changes may affect route calculations.
     *
     * @param id Location ID
     * @param request Location update request
     * @return Updated location
     * @throws ResourceNotFoundException if location not found
     * @throws DuplicateResourceException if location code already exists for another location
     */
    @Transactional
    @CacheEvict(value = "routes, locationById", allEntries = true)
    public LocationResponse updateLocation(UUID id, LocationRequest request) {
        logger.info("Updating location with id: {}", id);

        Location existingLocation = locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location", "id", id));

        // Check if location code is being changed and if new code already exists
        if (!existingLocation.getLocationCode().equalsIgnoreCase(request.getLocationCode())) {
            if (locationRepository.existsByLocationCodeIgnoreCase(request.getLocationCode())) {
                throw new DuplicateResourceException("Location", "locationCode", request.getLocationCode());
            }
        }

        locationMapper.updateEntityFromRequest(request, existingLocation);

        Location updatedLocation = locationRepository.save(existingLocation);
        logger.info("Location updated successfully with id: {}", updatedLocation.getId());

        return locationMapper.toResponse(updatedLocation);
    }

    /**
     * Soft delete a location
     * Validates that no active transportations reference this location before deletion.
     * Uses @SQLDelete annotation to automatically set deleted flag to true.
     * Evicts all cached routes since location deletion may affect route availability.
     *
     * @param id Location ID
     * @throws ResourceNotFoundException if location not found
     * @throws IllegalStateException if location has active transportations
     */
    @Transactional
    @CacheEvict(value = "routes, locationById", allEntries = true)
    public void deleteLocation(UUID id) {
        logger.info("Deleting location with id: {}", id);

        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location", "id", id));

        // Check referential integrity: ensure no active transportations use this location
        if (transportationRepository.existsByOriginOrDestination(id)) {
            logger.warn("Cannot delete location {} - has active transportations", id);
            throw new IllegalStateException(
                "Cannot delete location '" + location.getName() +
                "' because it is referenced by one or more active transportations. " +
                "Please delete or modify the related transportations first."
            );
        }

        // @SQLDelete annotation will execute: UPDATE locations SET deleted = true WHERE id = ?
        locationRepository.delete(location);

        logger.info("Location soft deleted successfully with id: {}", id);
    }
}

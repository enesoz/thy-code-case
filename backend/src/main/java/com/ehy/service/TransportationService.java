package com.ehy.service;

import com.ehy.dto.TransportationRequest;
import com.ehy.dto.TransportationResponse;
import com.ehy.entity.Location;
import com.ehy.entity.Transportation;
import com.ehy.exception.ResourceNotFoundException;
import com.ehy.mapper.TransportationMapper;
import com.ehy.repository.LocationRepository;
import com.ehy.repository.TransportationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * Service for transportation management operations.
 * Handles CRUD operations for transportations with validation.
 */
@Service
@Transactional(readOnly = true)
public class TransportationService {

    private static final Logger logger = LoggerFactory.getLogger(TransportationService.class);

    private final TransportationRepository transportationRepository;
    private final LocationRepository locationRepository;
    private final TransportationMapper transportationMapper;

    public TransportationService(
            TransportationRepository transportationRepository,
            LocationRepository locationRepository,
            TransportationMapper transportationMapper) {
        this.transportationRepository = transportationRepository;
        this.locationRepository = locationRepository;
        this.transportationMapper = transportationMapper;
    }

    /**
     * Get all non-deleted transportations
     * @return List of transportations
     */
    public List<TransportationResponse> getAllTransportations() {
        logger.debug("Retrieving all transportations");
        List<Transportation> transportations = transportationRepository.findAll();
        return transportationMapper.toResponseList(transportations);
    }

    /**
     * Get a transportation by ID
     * @param id Transportation ID
     * @return Transportation details
     * @throws ResourceNotFoundException if transportation not found
     */
    public TransportationResponse getTransportationById(UUID id) {
        logger.debug("Retrieving transportation with id: {}", id);
        Transportation transportation = transportationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transportation", "id", id));
        return transportationMapper.toResponse(transportation);
    }

    /**
     * Create a new transportation
     * @param request Transportation creation request
     * @return Created transportation
     * @throws ResourceNotFoundException if origin or destination location not found
     * @throws IllegalArgumentException if operating days are invalid
     */
    @Transactional
    public TransportationResponse createTransportation(TransportationRequest request) {
        logger.info("Creating new transportation from {} to {}",
                request.getOriginLocationId(), request.getDestinationLocationId());

        // Validate origin and destination exist
        Location originLocation = locationRepository.findById(request.getOriginLocationId())
                .orElseThrow(() -> new ResourceNotFoundException("Location", "id", request.getOriginLocationId()));

        Location destinationLocation = locationRepository.findById(request.getDestinationLocationId())
                .orElseThrow(() -> new ResourceNotFoundException("Location", "id", request.getDestinationLocationId()));

        // Validate origin and destination are different
        if (originLocation.getId().equals(destinationLocation.getId())) {
            throw new IllegalArgumentException("Origin and destination locations must be different");
        }

        // Validate operating days (array from frontend)
        validateOperatingDays(request.getOperatingDays());

        Transportation transportation = transportationMapper.toEntity(request);
        transportation.setOriginLocation(originLocation);
        transportation.setDestinationLocation(destinationLocation);
        transportation.setDeleted(false);

        Transportation savedTransportation = transportationRepository.save(transportation);
        logger.info("Transportation created successfully with id: {}", savedTransportation.getId());

        return transportationMapper.toResponse(savedTransportation);
    }

    /**
     * Update an existing transportation
     * @param id Transportation ID
     * @param request Transportation update request
     * @return Updated transportation
     * @throws ResourceNotFoundException if transportation, origin, or destination not found
     * @throws IllegalArgumentException if operating days are invalid
     */
    @Transactional
    public TransportationResponse updateTransportation(UUID id, TransportationRequest request) {
        logger.info("Updating transportation with id: {}", id);

        Transportation existingTransportation = transportationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transportation", "id", id));

        // Validate origin and destination exist
        Location originLocation = locationRepository.findById(request.getOriginLocationId())
                .orElseThrow(() -> new ResourceNotFoundException("Location", "id", request.getOriginLocationId()));

        Location destinationLocation = locationRepository.findById(request.getDestinationLocationId())
                .orElseThrow(() -> new ResourceNotFoundException("Location", "id", request.getDestinationLocationId()));

        // Validate origin and destination are different
        if (originLocation.getId().equals(destinationLocation.getId())) {
            throw new IllegalArgumentException("Origin and destination locations must be different");
        }

        // Validate operating days (array from frontend)
        validateOperatingDays(request.getOperatingDays());

        transportationMapper.updateEntityFromRequest(request, existingTransportation);
        existingTransportation.setOriginLocation(originLocation);
        existingTransportation.setDestinationLocation(destinationLocation);

        Transportation updatedTransportation = transportationRepository.save(existingTransportation);
        logger.info("Transportation updated successfully with id: {}", updatedTransportation.getId());

        return transportationMapper.toResponse(updatedTransportation);
    }

    /**
     * Soft delete a transportation
     * Uses @SQLDelete annotation to automatically set deleted flag to true.
     *
     * @param id Transportation ID
     * @throws ResourceNotFoundException if transportation not found
     */
    @Transactional
    public void deleteTransportation(UUID id) {
        logger.info("Deleting transportation with id: {}", id);

        Transportation transportation = transportationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transportation", "id", id));

        // @SQLDelete annotation will execute: UPDATE transportations SET deleted = true WHERE id = ?
        transportationRepository.delete(transportation);

        logger.info("Transportation soft deleted successfully with id: {}", id);
    }

    /**
     * Validate operating days array (1-7, unique)
     * @param operatingDays Array of integers
     * @throws IllegalArgumentException if days are invalid
     */
    private void validateOperatingDays(Integer[] operatingDays) {
        if (operatingDays == null || operatingDays.length == 0) {
            throw new IllegalArgumentException("Operating days cannot be empty");
        }
        for (Integer day : operatingDays) {
            if (day == null || day < 1 || day > 7) {
                throw new IllegalArgumentException(
                        "Invalid operating day: " + day + ". Must be between 1 (Monday) and 7 (Sunday)");
            }
        }
        long distinct = Arrays.stream(operatingDays).distinct().count();
        if (distinct != operatingDays.length) {
            throw new IllegalArgumentException("Operating days cannot contain duplicates");
        }
    }
}

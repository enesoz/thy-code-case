package com.ehy.service;

import com.ehy.dto.LocationResponse;
import com.ehy.dto.RouteResponse;
import com.ehy.dto.RouteSegmentResponse;
import com.ehy.entity.Location;
import com.ehy.entity.Transportation;
import com.ehy.enums.TransportationType;
import com.ehy.exception.ResourceNotFoundException;
import com.ehy.mapper.LocationMapper;
import com.ehy.repository.LocationRepository;
import com.ehy.repository.TransportationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

/**
 * Service for route calculation and route-related operations.
 * Implements the core business logic for finding valid routes between locations.
 */
@Service
@Transactional(readOnly = true)
public class RouteService {

    private static final Logger logger = LoggerFactory.getLogger(RouteService.class);

    private final TransportationRepository transportationRepository;
    private final LocationRepository locationRepository;
    private final LocationMapper locationMapper;

    public RouteService(
            TransportationRepository transportationRepository,
            LocationRepository locationRepository,
            LocationMapper locationMapper) {
        this.transportationRepository = transportationRepository;
        this.locationRepository = locationRepository;
        this.locationMapper = locationMapper;
    }

    /**
     * Find all valid routes between origin and destination on a specific date.
     * Results are cached using Redis with key: originId:destinationId:date
     *
     * Algorithm:
     * 1. Extract day of week from date (1=Monday, ..., 7=Sunday)
     * 2. Find all direct flights from origin to destination
     * 3. Find all locations (for finding before/after-flight transfers)
     * 4. Find all before-flight transfers (ground transport to any location with flight)
     * 5. Find all after-flight transfers (flight from any location to destination)
     * 6. Build valid route combinations:
     *    - Type 1: Direct flights only
     *    - Type 2: Before-flight transfer + Connected flight
     *    - Type 3: Flight + Connected after-flight transfer
     *    - Type 4: Before-flight transfer + Flight + After-flight transfer (all connected)
     *
     * @param originId Origin location UUID
     * @param destinationId Destination location UUID
     * @param date Travel date
     * @return List of valid routes
     */
    @Cacheable(value = "routes", key = "#originId + ':' + #destinationId + ':' + #date")
    public List<RouteResponse> findRoutes(UUID originId, UUID destinationId, LocalDate date) {
        logger.debug("Finding routes from {} to {} on {}", originId, destinationId, date);

        // Validate that origin and destination exist
        Location origin = locationRepository.findById(originId)
                .orElseThrow(() -> new ResourceNotFoundException("Location", "id", originId));

        Location destination = locationRepository.findById(destinationId)
                .orElseThrow(() -> new ResourceNotFoundException("Location", "id", destinationId));

        // Extract day of week (1=Monday, ..., 7=Sunday)
        int dayOfWeek = date.getDayOfWeek().getValue();
        logger.debug("Day of week: {} ({})", dayOfWeek, date.getDayOfWeek());

        // Get all location IDs for finding potential transfer points (performance optimization)
        // Using ID-only query instead of loading full entities
        List<UUID> allLocationIds = locationRepository.findAllLocationIds();

        List<RouteResponse> routes = new ArrayList<>();

        // Type 1: Direct flights (no transfers)
        logger.debug("Searching for direct flights...");
        List<Transportation> directFlights = transportationRepository.findAvailableTransportationsByType(
                originId, destinationId, TransportationType.FLIGHT, dayOfWeek
        );

        for (Transportation flight : directFlights) {
            routes.add(buildRoute(List.of(flight)));
        }
        logger.debug("Found {} direct flights", directFlights.size());

        // Type 2: Before-flight transfer + Flight
        logger.debug("Searching for routes with before-flight transfers...");
        List<Transportation> beforeTransfers = transportationRepository.findAvailableNonFlightTransportations(
                List.of(originId), allLocationIds, dayOfWeek
        );

        for (Transportation beforeTransfer : beforeTransfers) {
            UUID intermediateLocationId = beforeTransfer.getDestinationLocation().getId();

            // Find flights from intermediate location to destination
            List<Transportation> connectingFlights = transportationRepository.findAvailableTransportationsByType(
                    intermediateLocationId, destinationId, TransportationType.FLIGHT, dayOfWeek
            );

            for (Transportation flight : connectingFlights) {
                routes.add(buildRoute(List.of(beforeTransfer, flight)));
            }
        }
        logger.debug("Found {} routes with before-flight transfers", beforeTransfers.size());

        // Type 3: Flight + After-flight transfer
        logger.debug("Searching for routes with after-flight transfers...");
        List<Transportation> flightsFromOrigin = transportationRepository.findAvailableFlights(
                List.of(originId),
                allLocationIds.stream()
                        .filter(id -> !id.equals(destinationId))
                        .toList(),
                dayOfWeek
        );

        for (Transportation flight : flightsFromOrigin) {
            UUID intermediateLocationId = flight.getDestinationLocation().getId();

            // Find ground transfers from intermediate location to destination
            List<Transportation> afterTransfers = transportationRepository.findAvailableNonFlightTransportations(
                    List.of(intermediateLocationId), List.of(destinationId), dayOfWeek
            );

            for (Transportation afterTransfer : afterTransfers) {
                routes.add(buildRoute(List.of(flight, afterTransfer)));
            }
        }
        logger.debug("Found {} routes with after-flight transfers", flightsFromOrigin.size());

        // Type 4: Before-flight transfer + Flight + After-flight transfer
        logger.debug("Searching for routes with both before and after-flight transfers...");
        for (Transportation beforeTransfer : beforeTransfers) {
            UUID firstIntermediateId = beforeTransfer.getDestinationLocation().getId();

            // Find flights from first intermediate location
            List<Transportation> middleFlights = transportationRepository.findAvailableFlights(
                    List.of(firstIntermediateId),
                    allLocationIds.stream()
                            .filter(id -> !id.equals(destinationId))
                            .toList(),
                    dayOfWeek
            );

            for (Transportation flight : middleFlights) {
                UUID secondIntermediateId = flight.getDestinationLocation().getId();

                // Find ground transfers to final destination
                List<Transportation> afterTransfers = transportationRepository.findAvailableNonFlightTransportations(
                        List.of(secondIntermediateId), List.of(destinationId), dayOfWeek
                );

                for (Transportation afterTransfer : afterTransfers) {
                    routes.add(buildRoute(List.of(beforeTransfer, flight, afterTransfer)));
                }
            }
        }

        logger.info("Found {} total route(s) from {} to {} on {}",
                routes.size(), origin.getLocationCode(), destination.getLocationCode(), date);

        return routes;
    }

    /**
     * Build a RouteResponse from a list of Transportation segments.
     * Validates connectivity between segments.
     *
     * @param segments List of Transportation entities in order
     * @return RouteResponse DTO
     */
    private RouteResponse buildRoute(List<Transportation> segments) {
        if (segments == null || segments.isEmpty()) {
            throw new IllegalArgumentException("Route must have at least one segment");
        }

        if (segments.size() > 3) {
            throw new IllegalArgumentException("Route cannot have more than 3 segments");
        }

        // Validate connectivity: each segment's destination must be the next segment's origin
        for (int i = 0; i < segments.size() - 1; i++) {
            UUID currentDestination = segments.get(i).getDestinationLocation().getId();
            UUID nextOrigin = segments.get(i + 1).getOriginLocation().getId();

            if (!currentDestination.equals(nextOrigin)) {
                throw new IllegalArgumentException(
                        "Route segments are not connected: segment " + (i + 1) +
                        " ends at different location than segment " + (i + 2) + " starts"
                );
            }
        }

        // Validate that exactly one segment is a flight
        long flightCount = segments.stream()
                .filter(s -> s.getTransportationType() == TransportationType.FLIGHT)
                .count();

        if (flightCount != 1) {
            throw new IllegalArgumentException("Route must have exactly one flight segment");
        }

        // Find the flight segment index
        int flightIndex = -1;
        for (int i = 0; i < segments.size(); i++) {
            if (segments.get(i).getTransportationType() == TransportationType.FLIGHT) {
                flightIndex = i;
                break;
            }
        }

        // Validate segment order: non-flight segments before flight, then flight, then non-flight segments after
        for (int i = 0; i < flightIndex; i++) {
            if (segments.get(i).getTransportationType() == TransportationType.FLIGHT) {
                throw new IllegalArgumentException("Multiple flights or invalid segment order");
            }
        }
        for (int i = flightIndex + 1; i < segments.size(); i++) {
            if (segments.get(i).getTransportationType() == TransportationType.FLIGHT) {
                throw new IllegalArgumentException("Multiple flights or invalid segment order");
            }
        }

        // Build RouteSegmentResponse list
        List<RouteSegmentResponse> segmentResponses = new ArrayList<>();
        for (int i = 0; i < segments.size(); i++) {
            Transportation transportation = segments.get(i);
            segmentResponses.add(buildRouteSegment(transportation, i + 1));
        }

        // Determine transfer flags
        boolean hasBeforeFlightTransfer = flightIndex > 0;
        boolean hasAfterFlightTransfer = flightIndex < segments.size() - 1;

        return RouteResponse.builder()
                .segments(segmentResponses)
                .totalSegments(segments.size())
                .hasBeforeFlightTransfer(hasBeforeFlightTransfer)
                .hasAfterFlightTransfer(hasAfterFlightTransfer)
                .build();
    }

    /**
     * Build a RouteSegmentResponse from a Transportation entity.
     *
     * @param transportation Transportation entity
     * @param segmentOrder Segment order (1-based)
     * @return RouteSegmentResponse DTO
     */
    private RouteSegmentResponse buildRouteSegment(Transportation transportation, int segmentOrder) {
        LocationResponse origin = locationMapper.toResponse(transportation.getOriginLocation());
        LocationResponse destination = locationMapper.toResponse(transportation.getDestinationLocation());

        return RouteSegmentResponse.builder()
                .transportationId(transportation.getId())
                .originLocation(origin)
                .destinationLocation(destination)
                .transportationType(transportation.getTransportationType())
                .segmentOrder(segmentOrder)
                .build();
    }
}

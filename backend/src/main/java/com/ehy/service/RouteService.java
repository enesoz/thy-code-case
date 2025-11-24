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
     * Optimized Algorithm (O(n + m) where n=locations, m=transportation edges):
     * 1. Extract day of week from date
     * 2. Build adjacency graph structure for O(1) lookups
     * 3. Find valid route combinations:
     *    - Type 1: Direct flights only
     *    - Type 2: Before-flight transfer + Connected flight
     *    - Type 3: Flight + Connected after-flight transfer
     *    - Type 4: Before-flight transfer + Flight + After-flight transfer
     *
     * @param originId Origin location UUID
     * @param destinationId Destination location UUID
     * @param date Travel date
     * @return List of valid routes
     */
    @Cacheable(value = "routes", key = "#originId + ':' + #destinationId + ':' + #date")
    public List<RouteResponse> findRoutes(UUID originId, UUID destinationId, LocalDate date) {
        logger.debug("Finding routes from {} to {} on {}", originId, destinationId, date);

        Location origin = validateLocation(originId);
        Location destination = validateLocation(destinationId);

        int dayOfWeek = date.getDayOfWeek().getValue();
        logger.debug("Day of week: {} ({})", dayOfWeek, date.getDayOfWeek());

        List<RouteResponse> routes = new ArrayList<>();

        // Type 1: Direct flights (no transfers)
        routes.addAll(findDirectFlights(originId, destinationId, dayOfWeek));

        // Build graph structure for complex routes
        RouteGraph graph = buildRouteGraph(originId, destinationId, dayOfWeek);

        // Type 2: Before-flight transfer + Flight
        routes.addAll(findBeforeFlightTransferRoutes(graph));

        // Type 3: Flight + After-flight transfer
        routes.addAll(findAfterFlightTransferRoutes(originId, graph));

        // Type 4: Before-flight transfer + Flight + After-flight transfer
        routes.addAll(findMultiTransferRoutes(graph));

        logger.info("Found {} total route(s) from {} to {} on {}",
                routes.size(), origin.getLocationCode(), destination.getLocationCode(), date);

        return routes;
    }

    /**
     * Validates that a location exists.
     */
    private Location validateLocation(UUID locationId) {
        return locationRepository.findById(locationId)
                .orElseThrow(() -> new ResourceNotFoundException("Location", "id", locationId));
    }

    /**
     * Find direct flights between origin and destination.
     */
    private List<RouteResponse> findDirectFlights(UUID originId, UUID destinationId, int dayOfWeek) {
        logger.debug("Searching for direct flights...");
        List<Transportation> directFlights = transportationRepository.findAvailableTransportationsByType(
                originId, destinationId, TransportationType.FLIGHT, dayOfWeek
        );

        List<RouteResponse> routes = directFlights.stream()
                .map(flight -> buildRoute(List.of(flight)))
                .toList();

        logger.debug("Found {} direct flights", routes.size());
        return routes;
    }

    /**
     * Build adjacency graph structure for efficient route lookups.
     * Batch-fetches all transportations to avoid O(n³) nested queries.
     */
    private RouteGraph buildRouteGraph(UUID originId, UUID destinationId, int dayOfWeek) {
        List<UUID> allLocationIds = locationRepository.findAllLocationIds();

        // Fetch ground transportations from origin
        List<Transportation> groundFromOrigin = transportationRepository.findAvailableNonFlightTransportations(
                List.of(originId), allLocationIds, dayOfWeek
        );

        // Identify intermediate locations
        Set<UUID> intermediateLocations = groundFromOrigin.stream()
                .map(t -> t.getDestinationLocation().getId())
                .collect(HashSet::new, HashSet::add, HashSet::addAll);
        intermediateLocations.add(originId);

        // Build adjacency maps for flights
        Map<UUID, List<Transportation>> flightsByOrigin = buildFlightsByOriginMap(
                intermediateLocations, allLocationIds, destinationId, dayOfWeek
        );

        Map<UUID, List<Transportation>> flightsToDestination = buildFlightsToDestinationMap(
                intermediateLocations, destinationId, dayOfWeek
        );

        // Build adjacency map for ground transfers to destination
        Map<UUID, List<Transportation>> groundToDestination = buildGroundToDestinationMap(
                flightsByOrigin, destinationId, dayOfWeek
        );

        return new RouteGraph(groundFromOrigin, flightsByOrigin, flightsToDestination, groundToDestination);
    }

    /**
     * Build map of flights indexed by origin location.
     */
    private Map<UUID, List<Transportation>> buildFlightsByOriginMap(
            Set<UUID> intermediateLocations, List<UUID> allLocationIds, UUID destinationId, int dayOfWeek) {
        Map<UUID, List<Transportation>> flightsByOrigin = new HashMap<>();

        for (UUID locationId : intermediateLocations) {
            List<Transportation> flights = transportationRepository.findAvailableFlights(
                    List.of(locationId),
                    allLocationIds.stream().filter(id -> !id.equals(destinationId)).toList(),
                    dayOfWeek
            );
            flightsByOrigin.put(locationId, flights);
        }

        return flightsByOrigin;
    }

    /**
     * Build map of flights to destination indexed by origin location.
     */
    private Map<UUID, List<Transportation>> buildFlightsToDestinationMap(
            Set<UUID> intermediateLocations, UUID destinationId, int dayOfWeek) {
        Map<UUID, List<Transportation>> flightsToDestination = new HashMap<>();

        for (UUID locationId : intermediateLocations) {
            List<Transportation> flights = transportationRepository.findAvailableTransportationsByType(
                    locationId, destinationId, TransportationType.FLIGHT, dayOfWeek
            );
            if (!flights.isEmpty()) {
                flightsToDestination.put(locationId, flights);
            }
        }

        return flightsToDestination;
    }

    /**
     * Build map of ground transfers to destination indexed by origin location.
     */
    private Map<UUID, List<Transportation>> buildGroundToDestinationMap(
            Map<UUID, List<Transportation>> flightsByOrigin, UUID destinationId, int dayOfWeek) {
        Map<UUID, List<Transportation>> groundToDestination = new HashMap<>();

        Set<UUID> flightDestinations = flightsByOrigin.values().stream()
                .flatMap(List::stream)
                .map(t -> t.getDestinationLocation().getId())
                .collect(HashSet::new, HashSet::add, HashSet::addAll);

        for (UUID locationId : flightDestinations) {
            List<Transportation> groundTransfers = transportationRepository.findAvailableNonFlightTransportations(
                    List.of(locationId), List.of(destinationId), dayOfWeek
            );
            if (!groundTransfers.isEmpty()) {
                groundToDestination.put(locationId, groundTransfers);
            }
        }

        return groundToDestination;
    }

    /**
     * Find routes with before-flight transfer: Ground → Flight.
     */
    private List<RouteResponse> findBeforeFlightTransferRoutes(RouteGraph graph) {
        logger.debug("Searching for routes with before-flight transfers...");
        List<RouteResponse> routes = new ArrayList<>();

        for (Transportation beforeTransfer : graph.groundFromOrigin) {
            UUID intermediateId = beforeTransfer.getDestinationLocation().getId();
            List<Transportation> connectingFlights = graph.flightsToDestination.get(intermediateId);

            if (connectingFlights != null) {
                for (Transportation flight : connectingFlights) {
                    routes.add(buildRoute(List.of(beforeTransfer, flight)));
                }
            }
        }

        logger.debug("Found {} routes with before-flight transfers", routes.size());
        return routes;
    }

    /**
     * Find routes with after-flight transfer: Flight → Ground.
     */
    private List<RouteResponse> findAfterFlightTransferRoutes(UUID originId, RouteGraph graph) {
        logger.debug("Searching for routes with after-flight transfers...");
        List<RouteResponse> routes = new ArrayList<>();

        List<Transportation> flightsFromOrigin = graph.flightsByOrigin.getOrDefault(originId, List.of());

        for (Transportation flight : flightsFromOrigin) {
            UUID intermediateId = flight.getDestinationLocation().getId();
            List<Transportation> afterTransfers = graph.groundToDestination.get(intermediateId);

            if (afterTransfers != null) {
                for (Transportation afterTransfer : afterTransfers) {
                    routes.add(buildRoute(List.of(flight, afterTransfer)));
                }
            }
        }

        logger.debug("Found {} routes with after-flight transfers", routes.size());
        return routes;
    }

    /**
     * Find routes with both transfers: Ground → Flight → Ground.
     * Optimized from O(n³) to O(n) using adjacency maps.
     */
    private List<RouteResponse> findMultiTransferRoutes(RouteGraph graph) {
        logger.debug("Searching for routes with both before and after-flight transfers...");
        List<RouteResponse> routes = new ArrayList<>();

        for (Transportation beforeTransfer : graph.groundFromOrigin) {
            UUID firstIntermediateId = beforeTransfer.getDestinationLocation().getId();
            List<Transportation> middleFlights = graph.flightsByOrigin.getOrDefault(firstIntermediateId, List.of());

            for (Transportation flight : middleFlights) {
                UUID secondIntermediateId = flight.getDestinationLocation().getId();
                List<Transportation> afterTransfers = graph.groundToDestination.get(secondIntermediateId);

                if (afterTransfers != null) {
                    for (Transportation afterTransfer : afterTransfers) {
                        routes.add(buildRoute(List.of(beforeTransfer, flight, afterTransfer)));
                    }
                }
            }
        }

        logger.debug("Found {} routes with both transfers", routes.size());
        return routes;
    }

    /**
     * Internal class to hold the route graph structure.
     * Contains adjacency maps for efficient O(1) lookups.
     */
    private record RouteGraph(
            List<Transportation> groundFromOrigin,
            Map<UUID, List<Transportation>> flightsByOrigin,
            Map<UUID, List<Transportation>> flightsToDestination,
            Map<UUID, List<Transportation>> groundToDestination
    ) {}

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

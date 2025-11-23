package com.ehy.service;

import com.ehy.dto.RouteResponse;
import com.ehy.entity.Location;
import com.ehy.entity.Transportation;
import com.ehy.enums.TransportationType;
import com.ehy.exception.ResourceNotFoundException;
import com.ehy.mapper.LocationMapper;
import com.ehy.repository.LocationRepository;
import com.ehy.repository.TransportationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

/**
 * Unit tests for RouteService.
 * Tests the route calculation algorithm with various scenarios.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("RouteService Tests")
class RouteServiceTest {

    @Mock
    private TransportationRepository transportationRepository;

    @Mock
    private LocationRepository locationRepository;

    @Mock
    private LocationMapper locationMapper;

    @InjectMocks
    private RouteService routeService;

    private Location originLocation;
    private Location destinationLocation;
    private Location intermediateLocation;
    private UUID originId;
    private UUID destinationId;

    @BeforeEach
    void setUp() {
        originId = UUID.randomUUID();
        destinationId = UUID.randomUUID();
        UUID intermediateId = UUID.randomUUID();

        originLocation = Location.builder()
                .id(originId)
                .name("Taksim Square")
                .locationCode("TAKSIM")
                .deleted(false)
                .build();

        destinationLocation = Location.builder()
                .id(destinationId)
                .name("Wembley Stadium")
                .locationCode("WEMBLEY")
                .deleted(false)
                .build();

        intermediateLocation = Location.builder()
                .id(intermediateId)
                .name("Istanbul Airport")
                .locationCode("IST")
                .deleted(false)
                .build();
    }

    @Test
    @DisplayName("Should throw exception when origin location not found")
    void shouldThrowExceptionWhenOriginNotFound() {
        // Given
        LocalDate date = LocalDate.of(2025, 11, 23);
        when(locationRepository.findById(originId))
                .thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> routeService.findRoutes(originId, destinationId, date))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("Should throw exception when destination location not found")
    void shouldThrowExceptionWhenDestinationNotFound() {
        // Given
        LocalDate date = LocalDate.of(2025, 11, 23);
        when(locationRepository.findById(originId))
                .thenReturn(Optional.of(originLocation));
        when(locationRepository.findById(destinationId))
                .thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> routeService.findRoutes(originId, destinationId, date))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("Should return empty list when no routes found")
    void shouldReturnEmptyListWhenNoRoutesFound() {
        // Given
        LocalDate date = LocalDate.of(2025, 11, 23); // Saturday (6)
        when(locationRepository.findById(originId))
                .thenReturn(Optional.of(originLocation));
        when(locationRepository.findById(destinationId))
                .thenReturn(Optional.of(destinationLocation));
        when(locationRepository.findAllLocationIds())
                .thenReturn(List.of(originId, destinationId, intermediateLocation.getId()));
        when(transportationRepository.findAvailableTransportationsByType(any(), any(), any(), anyInt()))
                .thenReturn(Collections.emptyList());
        when(transportationRepository.findAvailableNonFlightTransportations(any(), any(), anyInt()))
                .thenReturn(Collections.emptyList());
        when(transportationRepository.findAvailableFlights(any(), any(), anyInt()))
                .thenReturn(Collections.emptyList());

        // When
        List<RouteResponse> routes = routeService.findRoutes(originId, destinationId, date);

        // Then
        assertThat(routes).isEmpty();
    }

    @Test
    @DisplayName("Should find direct flight route")
    void shouldFindDirectFlightRoute() {
        // Given
        LocalDate date = LocalDate.of(2025, 11, 24); // Monday (1)
        Transportation directFlight = Transportation.builder()
                .id(UUID.randomUUID())
                .originLocation(originLocation)
                .destinationLocation(destinationLocation)
                .transportationType(TransportationType.FLIGHT)
                .operatingDays("1,3,5,7")
                .deleted(false)
                .build();

        when(locationRepository.findById(originId))
                .thenReturn(Optional.of(originLocation));
        when(locationRepository.findById(destinationId))
                .thenReturn(Optional.of(destinationLocation));
        when(locationRepository.findAllLocationIds())
                .thenReturn(List.of(originId, destinationId, intermediateLocation.getId()));
        when(transportationRepository.findAvailableTransportationsByType(
                any(UUID.class), any(UUID.class), any(TransportationType.class), anyInt()
        )).thenReturn(List.of(directFlight));
        when(transportationRepository.findAvailableNonFlightTransportations(any(), any(), anyInt()))
                .thenReturn(Collections.emptyList());
        when(transportationRepository.findAvailableFlights(any(), any(), anyInt()))
                .thenReturn(Collections.emptyList());

        // When
        List<RouteResponse> routes = routeService.findRoutes(originId, destinationId, date);

        // Then
        assertThat(routes).hasSize(1);
        assertThat(routes.get(0).getTotalSegments()).isEqualTo(1);
        assertThat(routes.get(0).getHasBeforeFlightTransfer()).isFalse();
        assertThat(routes.get(0).getHasAfterFlightTransfer()).isFalse();
    }
}

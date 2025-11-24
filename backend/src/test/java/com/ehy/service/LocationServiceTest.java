package com.ehy.service;

import com.ehy.dto.LocationRequest;
import com.ehy.dto.LocationResponse;
import com.ehy.entity.Location;
import com.ehy.exception.DuplicateResourceException;
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

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Comprehensive unit tests for LocationService.
 * Tests all CRUD operations, validation logic, and edge cases.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("LocationService Tests")
class LocationServiceTest {

    @Mock
    private LocationRepository locationRepository;

    @Mock
    private LocationMapper locationMapper;

    @Mock
    private TransportationRepository transportationRepository;

    @InjectMocks
    private LocationService locationService;

    private Location testLocation;
    private LocationRequest testRequest;
    private LocationResponse testResponse;
    private UUID testId;

    @BeforeEach
    void setUp() {
        testId = UUID.randomUUID();

        testLocation = Location.builder()
                .id(testId)
                .locationCode("IST")
                .name("Istanbul Airport")
                .city("Istanbul")
                .country("Turkey")
                .deleted(false)
                .displayOrder(1)
                .build();

        testRequest = LocationRequest.builder()
                .locationCode("IST")
                .name("Istanbul Airport")
                .city("Istanbul")
                .country("Turkey")
                .displayOrder(1)
                .build();

        testResponse = LocationResponse.builder()
                .id(testId)
                .locationCode("IST")
                .name("Istanbul Airport")
                .city("Istanbul")
                .country("Turkey")
                .displayOrder(1)
                .build();
    }

    // ==================== GET ALL LOCATIONS TESTS ====================

    @Test
    @DisplayName("Should return all non-deleted locations")
    void getAllLocations_ShouldReturnAllLocations() {
        // Given
        Location location2 = Location.builder()
                .id(UUID.randomUUID())
                .locationCode("SAW")
                .name("Sabiha Gokcen Airport")
                .city("Istanbul")
                .country("Turkey")
                .deleted(false)
                .build();

        List<Location> locations = Arrays.asList(testLocation, location2);
        List<LocationResponse> expectedResponses = Arrays.asList(testResponse,
                LocationResponse.builder().locationCode("SAW").build());

        when(locationRepository.findAllOrderedByDisplayOrder()).thenReturn(locations);
        when(locationMapper.toResponseList(locations)).thenReturn(expectedResponses);

        // When
        List<LocationResponse> result = locationService.getAllLocations();

        // Then
        assertThat(result).hasSize(2);
        verify(locationRepository).findAllOrderedByDisplayOrder();
        verify(locationMapper).toResponseList(locations);
    }

    @Test
    @DisplayName("Should return empty list when no locations exist")
    void getAllLocations_WhenNoLocations_ShouldReturnEmptyList() {
        // Given
        when(locationRepository.findAllOrderedByDisplayOrder()).thenReturn(List.of());
        when(locationMapper.toResponseList(List.of())).thenReturn(List.of());

        // When
        List<LocationResponse> result = locationService.getAllLocations();

        // Then
        assertThat(result).isEmpty();
    }

    // ==================== GET LOCATION BY ID TESTS ====================

    @Test
    @DisplayName("Should return location by ID when exists")
    void getLocationById_WhenExists_ShouldReturnLocation() {
        // Given
        when(locationRepository.findById(testId)).thenReturn(Optional.of(testLocation));
        when(locationMapper.toResponse(testLocation)).thenReturn(testResponse);

        // When
        LocationResponse result = locationService.getLocationById(testId);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(testId);
        assertThat(result.getLocationCode()).isEqualTo("IST");
        verify(locationRepository).findById(testId);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when location not found")
    void getLocationById_WhenNotExists_ShouldThrowException() {
        // Given
        when(locationRepository.findById(testId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> locationService.getLocationById(testId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Location")
                .hasMessageContaining(testId.toString());

        verify(locationRepository).findById(testId);
        verify(locationMapper, never()).toResponse(any());
    }

    // ==================== CREATE LOCATION TESTS ====================

    @Test
    @DisplayName("Should create location successfully")
    void createLocation_WithValidData_ShouldSucceed() {
        // Given
        when(locationRepository.existsByLocationCodeIgnoreCase(anyString())).thenReturn(false);
        when(locationMapper.toEntity(testRequest)).thenReturn(testLocation);
        when(locationRepository.save(any(Location.class))).thenReturn(testLocation);
        when(locationMapper.toResponse(testLocation)).thenReturn(testResponse);

        // When
        LocationResponse result = locationService.createLocation(testRequest);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getLocationCode()).isEqualTo("IST");
        verify(locationRepository).existsByLocationCodeIgnoreCase("IST");
        verify(locationRepository).save(any(Location.class));
    }

    @Test
    @DisplayName("Should throw DuplicateResourceException when location code exists")
    void createLocation_WithDuplicateCode_ShouldThrowException() {
        // Given
        when(locationRepository.existsByLocationCodeIgnoreCase("IST")).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> locationService.createLocation(testRequest))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("Location")
                .hasMessageContaining("locationCode");

        verify(locationRepository).existsByLocationCodeIgnoreCase("IST");
        verify(locationRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should create location with case-insensitive code check")
    void createLocation_CaseInsensitiveCheck_ShouldWork() {
        // Given
        testRequest.setLocationCode("ist"); // lowercase
        when(locationRepository.existsByLocationCodeIgnoreCase("ist")).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> locationService.createLocation(testRequest))
                .isInstanceOf(DuplicateResourceException.class);
    }

    // ==================== UPDATE LOCATION TESTS ====================

    @Test
    @DisplayName("Should update location successfully")
    void updateLocation_WithValidData_ShouldSucceed() {
        // Given
        LocationRequest updateRequest = LocationRequest.builder()
                .locationCode("IST")
                .name("Istanbul New Airport")
                .city("Istanbul")
                .country("Turkey")
                .displayOrder(1)
                .build();

        when(locationRepository.findById(testId)).thenReturn(Optional.of(testLocation));
        when(locationRepository.save(any(Location.class))).thenReturn(testLocation);
        when(locationMapper.toResponse(testLocation)).thenReturn(testResponse);
        doNothing().when(locationMapper).updateEntityFromRequest(updateRequest, testLocation);

        // When
        LocationResponse result = locationService.updateLocation(testId, updateRequest);

        // Then
        assertThat(result).isNotNull();
        verify(locationRepository).findById(testId);
        verify(locationMapper).updateEntityFromRequest(updateRequest, testLocation);
        verify(locationRepository).save(testLocation);
    }

    @Test
    @DisplayName("Should throw exception when updating non-existent location")
    void updateLocation_WhenNotExists_ShouldThrowException() {
        // Given
        when(locationRepository.findById(testId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> locationService.updateLocation(testId, testRequest))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(locationRepository).findById(testId);
        verify(locationRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should allow updating location with same code")
    void updateLocation_WithSameCode_ShouldSucceed() {
        // Given
        when(locationRepository.findById(testId)).thenReturn(Optional.of(testLocation));
        when(locationRepository.save(any(Location.class))).thenReturn(testLocation);
        when(locationMapper.toResponse(testLocation)).thenReturn(testResponse);
        doNothing().when(locationMapper).updateEntityFromRequest(testRequest, testLocation);

        // When
        LocationResponse result = locationService.updateLocation(testId, testRequest);

        // Then
        assertThat(result).isNotNull();
        verify(locationRepository, never()).existsByLocationCodeIgnoreCase(anyString());
    }

    @Test
    @DisplayName("Should throw exception when changing to duplicate code")
    void updateLocation_WithDuplicateCode_ShouldThrowException() {
        // Given
        LocationRequest updateRequest = LocationRequest.builder()
                .locationCode("SAW") // Different code
                .name("Istanbul Airport")
                .city("Istanbul")
                .country("Turkey")
                .displayOrder(1)
                .build();

        when(locationRepository.findById(testId)).thenReturn(Optional.of(testLocation));
        when(locationRepository.existsByLocationCodeIgnoreCase("SAW")).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> locationService.updateLocation(testId, updateRequest))
                .isInstanceOf(DuplicateResourceException.class);

        verify(locationRepository).existsByLocationCodeIgnoreCase("SAW");
        verify(locationRepository, never()).save(any());
    }

    // ==================== DELETE LOCATION TESTS ====================

    @Test
    @DisplayName("Should soft delete location successfully")
    void deleteLocation_WithNoTransportations_ShouldSucceed() {
        // Given
        when(locationRepository.findById(testId)).thenReturn(Optional.of(testLocation));
        when(transportationRepository.existsByOriginOrDestination(testId)).thenReturn(false);

        // When
        locationService.deleteLocation(testId);

        // Then
        verify(locationRepository).findById(testId);
        verify(transportationRepository).existsByOriginOrDestination(testId);
        verify(locationRepository).delete(testLocation);

    }

    @Test
    @DisplayName("Should throw exception when location not found for deletion")
    void deleteLocation_WhenNotExists_ShouldThrowException() {
        // Given
        when(locationRepository.findById(testId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> locationService.deleteLocation(testId))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(locationRepository).findById(testId);
        verify(transportationRepository, never()).existsByOriginOrDestination(any());
        verify(locationRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw exception when location has active transportations")
    void deleteLocation_WithActiveTransportations_ShouldThrowException() {
        // Given
        when(locationRepository.findById(testId)).thenReturn(Optional.of(testLocation));
        when(transportationRepository.existsByOriginOrDestination(testId)).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> locationService.deleteLocation(testId))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("transportations")
                .hasMessageContaining(testLocation.getName());

        verify(locationRepository).findById(testId);
        verify(transportationRepository).existsByOriginOrDestination(testId);
        verify(locationRepository, never()).save(any());
        assertThat(testLocation.getDeleted()).isFalse();
    }

    @Test
    @DisplayName("Should check referential integrity before deletion")
    void deleteLocation_ShouldCheckReferentialIntegrity() {
        // Given
        lenient().when(locationRepository.findById(testId)).thenReturn(Optional.of(testLocation));
        lenient().when(transportationRepository.existsByOriginOrDestination(testId)).thenReturn(false);
        lenient().when(locationRepository.save(any(Location.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // When
        locationService.deleteLocation(testId);

        // Then
        verify(transportationRepository).existsByOriginOrDestination(testId);
    }
}

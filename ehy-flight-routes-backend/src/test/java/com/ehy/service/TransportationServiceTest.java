package com.ehy.service;

import com.ehy.dto.TransportationRequest;
import com.ehy.dto.TransportationResponse;
import com.ehy.entity.Location;
import com.ehy.entity.Transportation;
import com.ehy.enums.TransportationType;
import com.ehy.exception.ResourceNotFoundException;
import com.ehy.mapper.TransportationMapper;
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
import static org.mockito.Mockito.*;

/**
 * Comprehensive unit tests for TransportationService.
 * Tests all CRUD operations, validation logic, and edge cases.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("TransportationService Tests")
class TransportationServiceTest {

        @Mock
        private TransportationRepository transportationRepository;

        @Mock
        private LocationRepository locationRepository;

        @Mock
        private TransportationMapper transportationMapper;

        @InjectMocks
        private TransportationService transportationService;

        private Transportation testTransportation;
        private TransportationRequest testRequest;
        private TransportationResponse testResponse;
        private Location originLocation;
        private Location destinationLocation;
        private UUID transportationId;
        private UUID originId;
        private UUID destinationId;

        @BeforeEach
        void setUp() {
                transportationId = UUID.randomUUID();
                originId = UUID.randomUUID();
                destinationId = UUID.randomUUID();

                originLocation = Location.builder()
                                .id(originId)
                                .locationCode("IST")
                                .name("Istanbul Airport")
                                .city("Istanbul")
                                .country("Turkey")
                                .deleted(false)
                                .build();

                destinationLocation = Location.builder()
                                .id(destinationId)
                                .locationCode("ANK")
                                .name("Ankara Airport")
                                .city("Ankara")
                                .country("Turkey")
                                .deleted(false)
                                .build();

                testTransportation = Transportation.builder()
                                .id(transportationId)
                                .originLocation(originLocation)
                                .destinationLocation(destinationLocation)
                                .transportationType(TransportationType.FLIGHT)
                                .operatingDays("1,3,5") // Mon, Wed, Fri
                                .deleted(false)
                                .build();

                testRequest = TransportationRequest.builder()
                                .originLocationId(originId)
                                .destinationLocationId(destinationId)
                                .transportationType(TransportationType.FLIGHT)
                                .operatingDays(new Integer[] { 1, 3, 5 })
                                .build();

                testResponse = TransportationResponse.builder()
                                .id(transportationId)
                                .transportationType(TransportationType.FLIGHT)
                                .operatingDays(new Integer[] { 1, 3, 5 })
                                .build();
        }

        // ==================== GET ALL TRANSPORTATIONS TESTS ====================

        @Test
        @DisplayName("Should return all non-deleted transportations")
        void getAllTransportations_ShouldReturnAll() {
                // Given
                Transportation transport2 = Transportation.builder()
                                .id(UUID.randomUUID())
                                .transportationType(TransportationType.BUS)
                                .operatingDays("1,2,3,4,5")
                                .build();

                List<Transportation> transportations = Arrays.asList(testTransportation, transport2);
                List<TransportationResponse> responses = Arrays.asList(testResponse, new TransportationResponse());

                when(transportationRepository.findAll()).thenReturn(transportations);
                when(transportationMapper.toResponseList(transportations)).thenReturn(responses);

                // When
                List<TransportationResponse> result = transportationService.getAllTransportations();

                // Then
                assertThat(result).hasSize(2);
                verify(transportationRepository).findAll();
        }

        // ==================== GET TRANSPORTATION BY ID TESTS ====================

        @Test
        @DisplayName("Should return transportation by ID when exists")
        void getTransportationById_WhenExists_ShouldReturn() {
                // Given
                when(transportationRepository.findById(transportationId))
                                .thenReturn(Optional.of(testTransportation));
                when(transportationMapper.toResponse(testTransportation)).thenReturn(testResponse);

                // When
                TransportationResponse result = transportationService.getTransportationById(transportationId);

                // Then
                assertThat(result).isNotNull();
                assertThat(result.getId()).isEqualTo(transportationId);
        }

        @Test
        @DisplayName("Should throw exception when transportation not found")
        void getTransportationById_WhenNotExists_ShouldThrow() {
                // Given
                when(transportationRepository.findById(transportationId))
                                .thenReturn(Optional.empty());

                // When & Then
                assertThatThrownBy(() -> transportationService.getTransportationById(transportationId))
                                .isInstanceOf(ResourceNotFoundException.class)
                                .hasMessageContaining("Transportation");
        }

        // ==================== CREATE TRANSPORTATION TESTS ====================

        @Test
        @DisplayName("Should create transportation successfully")
        void createTransportation_WithValidData_ShouldSucceed() {
                // Given
                when(locationRepository.findById(originId)).thenReturn(Optional.of(originLocation));
                when(locationRepository.findById(destinationId)).thenReturn(Optional.of(destinationLocation));
                when(transportationMapper.toEntity(testRequest)).thenReturn(testTransportation);
                when(transportationRepository.save(any(Transportation.class))).thenReturn(testTransportation);
                when(transportationMapper.toResponse(testTransportation)).thenReturn(testResponse);

                // When
                TransportationResponse result = transportationService.createTransportation(testRequest);

                // Then
                assertThat(result).isNotNull();
                verify(locationRepository).findById(originId);
                verify(locationRepository).findById(destinationId);
                verify(transportationRepository).save(any(Transportation.class));
        }

        @Test
        @DisplayName("Should throw exception when origin location not found")
        void createTransportation_WithInvalidOrigin_ShouldThrow() {
                // Given
                when(locationRepository.findById(originId)).thenReturn(Optional.empty());

                // When & Then
                assertThatThrownBy(() -> transportationService.createTransportation(testRequest))
                                .isInstanceOf(ResourceNotFoundException.class)
                                .hasMessageContaining("Location");

                verify(transportationRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should throw exception when destination location not found")
        void createTransportation_WithInvalidDestination_ShouldThrow() {
                // Given
                when(locationRepository.findById(originId)).thenReturn(Optional.of(originLocation));
                when(locationRepository.findById(destinationId)).thenReturn(Optional.empty());

                // When & Then
                assertThatThrownBy(() -> transportationService.createTransportation(testRequest))
                                .isInstanceOf(ResourceNotFoundException.class)
                                .hasMessageContaining("Location");

                verify(transportationRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should throw exception when origin equals destination")
        void createTransportation_WithSameOriginAndDestination_ShouldThrow() {
                // Given
                testRequest.setDestinationLocationId(originId); // Same as origin
                when(locationRepository.findById(originId)).thenReturn(Optional.of(originLocation));

                // When & Then
                assertThatThrownBy(() -> transportationService.createTransportation(testRequest))
                                .isInstanceOf(IllegalArgumentException.class)
                                .hasMessageContaining("different");

                verify(transportationRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should throw exception with null operating days")
        void createTransportation_WithNullOperatingDays_ShouldThrow() {
                // Given
                testRequest.setOperatingDays(null);
                when(locationRepository.findById(originId)).thenReturn(Optional.of(originLocation));
                when(locationRepository.findById(destinationId)).thenReturn(Optional.of(destinationLocation));

                // When & Then
                assertThatThrownBy(() -> transportationService.createTransportation(testRequest))
                                .isInstanceOf(IllegalArgumentException.class)
                                .hasMessageContaining("Operating days cannot be empty");
        }

        @Test
        @DisplayName("Should throw exception with empty operating days")
        void createTransportation_WithEmptyOperatingDays_ShouldThrow() {
                // Given
                testRequest.setOperatingDays(new Integer[] {});
                when(locationRepository.findById(originId)).thenReturn(Optional.of(originLocation));
                when(locationRepository.findById(destinationId)).thenReturn(Optional.of(destinationLocation));

                // When & Then
                assertThatThrownBy(() -> transportationService.createTransportation(testRequest))
                                .isInstanceOf(IllegalArgumentException.class)
                                .hasMessageContaining("Operating days cannot be empty");
        }

        @Test
        @DisplayName("Should throw exception with invalid operating day")
        void createTransportation_WithInvalidOperatingDay_ShouldThrow() {
                // Given
                testRequest.setOperatingDays(new Integer[] { 1, 8 }); // 8 is invalid
                when(locationRepository.findById(originId)).thenReturn(Optional.of(originLocation));
                when(locationRepository.findById(destinationId)).thenReturn(Optional.of(destinationLocation));

                // When & Then
                assertThatThrownBy(() -> transportationService.createTransportation(testRequest))
                                .isInstanceOf(IllegalArgumentException.class)
                                .hasMessageContaining("Invalid operating day");
        }

        @Test
        @DisplayName("Should throw exception with duplicate operating days")
        void createTransportation_WithDuplicateOperatingDays_ShouldThrow() {
                // Given
                testRequest.setOperatingDays(new Integer[] { 1, 3, 1 }); // 1 appears twice
                when(locationRepository.findById(originId)).thenReturn(Optional.of(originLocation));
                when(locationRepository.findById(destinationId)).thenReturn(Optional.of(destinationLocation));

                // When & Then
                assertThatThrownBy(() -> transportationService.createTransportation(testRequest))
                                .isInstanceOf(IllegalArgumentException.class)
                                .hasMessageContaining("duplicates");
        }

        // ==================== UPDATE TRANSPORTATION TESTS ====================

        @Test
        @DisplayName("Should update transportation successfully")
        void updateTransportation_WithValidData_ShouldSucceed() {
                // Given
                when(transportationRepository.findById(transportationId))
                                .thenReturn(Optional.of(testTransportation));
                when(locationRepository.findById(originId)).thenReturn(Optional.of(originLocation));
                when(locationRepository.findById(destinationId)).thenReturn(Optional.of(destinationLocation));
                when(transportationRepository.save(any(Transportation.class))).thenReturn(testTransportation);
                when(transportationMapper.toResponse(testTransportation)).thenReturn(testResponse);
                doNothing().when(transportationMapper).updateEntityFromRequest(testRequest, testTransportation);

                // When
                TransportationResponse result = transportationService.updateTransportation(transportationId,
                                testRequest);

                // Then
                assertThat(result).isNotNull();
                verify(transportationRepository).save(testTransportation);
        }

        @Test
        @DisplayName("Should throw exception when updating non-existent transportation")
        void updateTransportation_WhenNotExists_ShouldThrow() {
                // Given
                when(transportationRepository.findById(transportationId))
                                .thenReturn(Optional.empty());

                // When & Then
                assertThatThrownBy(() -> transportationService.updateTransportation(transportationId, testRequest))
                                .isInstanceOf(ResourceNotFoundException.class);

                verify(transportationRepository, never()).save(any());
        }

        // ==================== DELETE TRANSPORTATION TESTS ====================

        @Test
        @DisplayName("Should soft delete transportation successfully")
        void deleteTransportation_ShouldSucceed() {
                // Given
                when(transportationRepository.findById(transportationId))
                                .thenReturn(Optional.of(testTransportation));

                // When
                transportationService.deleteTransportation(transportationId);

                // Then
                verify(transportationRepository).delete(testTransportation);

        }

        @Test
        @DisplayName("Should throw exception when deleting non-existent transportation")
        void deleteTransportation_WhenNotExists_ShouldThrow() {
                // Given
                when(transportationRepository.findById(transportationId))
                                .thenReturn(Optional.empty());

                // When & Then
                assertThatThrownBy(() -> transportationService.deleteTransportation(transportationId))
                                .isInstanceOf(ResourceNotFoundException.class);

                verify(transportationRepository, never()).save(any());
        }
}

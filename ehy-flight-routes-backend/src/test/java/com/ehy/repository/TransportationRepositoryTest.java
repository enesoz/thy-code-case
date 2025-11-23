package com.ehy.repository;

import com.ehy.entity.Location;
import com.ehy.entity.Transportation;
import com.ehy.enums.TransportationType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integration tests for TransportationRepository.
 * Tests custom query methods and JOIN FETCH performance optimizations.
 */
@DataJpaTest
@DisplayName("TransportationRepository Tests")
class TransportationRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private TransportationRepository transportationRepository;

    private Location istanbul;
    private Location ankara;
    private Location izmir;

    @BeforeEach
    void setUp() {
        // Create test locations
        istanbul = Location.builder()
                .locationCode("IST")
                .name("Istanbul Airport")
                .city("Istanbul")
                .country("Turkey")
                .deleted(false)
                .displayOrder(1)
                .build();

        ankara = Location.builder()
                .locationCode("ANK")
                .name("Ankara Airport")
                .city("Ankara")
                .country("Turkey")
                .deleted(false)
                .displayOrder(2)
                .build();

        izmir = Location.builder()
                .locationCode("IZM")
                .name("Izmir Airport")
                .city("Izmir")
                .country("Turkey")
                .deleted(false)
                .displayOrder(3)
                .build();

        entityManager.persist(istanbul);
        entityManager.persist(ankara);
        entityManager.persist(izmir);
        entityManager.flush();
    }

    @Test
    @DisplayName("Should find transportations by type with JOIN FETCH")
    void findAvailableTransportationsByType_ShouldUseJoinFetch() {
        // Given
        Transportation flight = Transportation.builder()
                .originLocation(istanbul)
                .destinationLocation(ankara)
                .transportationType(TransportationType.FLIGHT)
                .operatingDays("1,3,5") // Mon, Wed, Fri
                .deleted(false)
                .build();

        entityManager.persist(flight);
        entityManager.flush();
        entityManager.clear(); // Clear persistence context to test lazy loading

        // When
        List<Transportation> results = transportationRepository.findAvailableTransportationsByType(
                istanbul.getId(), ankara.getId(), TransportationType.FLIGHT, 1 // Monday
        );

        // Then
        assertThat(results).hasSize(1);
        Transportation result = results.get(0);

        // Verify that locations are eagerly loaded (no lazy loading exception)
        assertThat(result.getOriginLocation().getName()).isEqualTo("Istanbul Airport");
        assertThat(result.getDestinationLocation().getName()).isEqualTo("Ankara Airport");
    }

    @Test
    @DisplayName("Should find non-flight transportations with JOIN FETCH")
    void findAvailableNonFlightTransportations_ShouldWork() {
        // Given
        Transportation bus = Transportation.builder()
                .originLocation(istanbul)
                .destinationLocation(ankara)
                .transportationType(TransportationType.BUS)
                .operatingDays("1,2,3,4,5") // Weekdays
                .deleted(false)
                .build();

        Transportation flight = Transportation.builder()
                .originLocation(istanbul)
                .destinationLocation(ankara)
                .transportationType(TransportationType.FLIGHT)
                .operatingDays("1,2,3,4,5")
                .deleted(false)
                .build();

        entityManager.persist(bus);
        entityManager.persist(flight);
        entityManager.flush();
        entityManager.clear();

        // When
        List<Transportation> results = transportationRepository.findAvailableNonFlightTransportations(
                List.of(istanbul.getId()), List.of(ankara.getId()), 1 // Monday
        );

        // Then
        assertThat(results).hasSize(1);
        assertThat(results.get(0).getTransportationType()).isEqualTo(TransportationType.BUS);

        // Verify JOIN FETCH worked
        assertThat(results.get(0).getOriginLocation().getName()).isEqualTo("Istanbul Airport");
    }

    @Test
    @DisplayName("Should find flights with JOIN FETCH")
    void findAvailableFlights_ShouldWork() {
        // Given
        Transportation flight1 = Transportation.builder()
                .originLocation(istanbul)
                .destinationLocation(ankara)
                .transportationType(TransportationType.FLIGHT)
                .operatingDays("1,3,5")
                .deleted(false)
                .build();

        Transportation flight2 = Transportation.builder()
                .originLocation(istanbul)
                .destinationLocation(izmir)
                .transportationType(TransportationType.FLIGHT)
                .operatingDays("1,2")
                .deleted(false)
                .build();

        entityManager.persist(flight1);
        entityManager.persist(flight2);
        entityManager.flush();
        entityManager.clear();

        // When
        List<Transportation> results = transportationRepository.findAvailableFlights(
                List.of(istanbul.getId()),
                List.of(ankara.getId(), izmir.getId()),
                1 // Monday
        );

        // Then
        assertThat(results).hasSize(2);
        assertThat(results).allMatch(t -> t.getTransportationType() == TransportationType.FLIGHT);

        // Verify JOIN FETCH worked - no lazy loading exception
        results.forEach(t -> {
            assertThat(t.getOriginLocation().getName()).isNotNull();
            assertThat(t.getDestinationLocation().getName()).isNotNull();
        });
    }

    @Test
    @DisplayName("Should check if transportation exists by origin or destination")
    void existsByOriginOrDestination_ShouldWork() {
        // Given
        Transportation transport = Transportation.builder()
                .originLocation(istanbul)
                .destinationLocation(ankara)
                .transportationType(TransportationType.FLIGHT)
                .operatingDays("1,2,3,4,5,6,7")
                .deleted(false)
                .build();

        entityManager.persist(transport);
        entityManager.flush();

        // When & Then
        assertThat(transportationRepository.existsByOriginOrDestination(istanbul.getId())).isTrue();
        assertThat(transportationRepository.existsByOriginOrDestination(ankara.getId())).isTrue();
        assertThat(transportationRepository.existsByOriginOrDestination(izmir.getId())).isFalse();
    }

    @Test
    @DisplayName("Should not find deleted transportations")
    void queries_ShouldExcludeDeleted() {
        // Given
        Transportation deletedTransport = Transportation.builder()
                .originLocation(istanbul)
                .destinationLocation(ankara)
                .transportationType(TransportationType.FLIGHT)
                .operatingDays("1,2,3,4,5,6,7")
                .deleted(true) // Soft deleted
                .build();

        entityManager.persist(deletedTransport);
        entityManager.flush();

        // When & Then
        assertThat(transportationRepository.existsByOriginOrDestination(istanbul.getId())).isFalse();

        List<Transportation> flights = transportationRepository.findAvailableFlights(
                List.of(istanbul.getId()), List.of(ankara.getId()), 1
        );
        assertThat(flights).isEmpty();
    }

    @Test
    @DisplayName("Should filter by operating day correctly")
    void queries_ShouldFilterByOperatingDay() {
        // Given - Transportation only operates on Monday (1)
        Transportation transport = Transportation.builder()
                .originLocation(istanbul)
                .destinationLocation(ankara)
                .transportationType(TransportationType.FLIGHT)
                .operatingDays("1") // Monday only
                .deleted(false)
                .build();

        entityManager.persist(transport);
        entityManager.flush();

        // When & Then
        List<Transportation> mondayResults = transportationRepository.findAvailableFlights(
                List.of(istanbul.getId()), List.of(ankara.getId()), 1
        );
        assertThat(mondayResults).hasSize(1);

        List<Transportation> tuesdayResults = transportationRepository.findAvailableFlights(
                List.of(istanbul.getId()), List.of(ankara.getId()), 2
        );
        assertThat(tuesdayResults).isEmpty();
    }
}

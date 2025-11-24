package com.ehy.repository;

import com.ehy.entity.Location;
import com.ehy.entity.Transportation;
import com.ehy.enums.TransportationType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@DataJpaTest
class TransportationRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private TransportationRepository transportationRepository;

    private Location ist;
    private Location esb;
    private Location jfk;

    @BeforeEach
    void setUp() {
        ist = Location.builder()
                .name("Istanbul Airport")
                .country("Turkey")
                .city("Istanbul")
                .locationCode("IST")
                .build();
        entityManager.persist(ist);

        esb = Location.builder()
                .name("Esenboga Airport")
                .country("Turkey")
                .city("Ankara")
                .locationCode("ESB")
                .build();
        entityManager.persist(esb);

        jfk = Location.builder()
                .name("JFK Airport")
                .country("USA")
                .city("New York")
                .locationCode("JFK")
                .build();
        entityManager.persist(jfk);

        entityManager.flush();
    }

    @Test
    void findAvailableTransportations_ReturnsMatchingTransportations() {
        // Arrange
        Transportation flight = Transportation.builder()
                .originLocation(ist)
                .destinationLocation(esb)
                .transportationType(TransportationType.FLIGHT)
                .operatingDays("1,3,5")
                .build();
        entityManager.persist(flight);
        entityManager.flush();

        // Act
        List<Transportation> result = transportationRepository.findAvailableTransportations(ist.getId(), esb.getId(),
                1);

        // Assert
        assertEquals(1, result.size());
        assertEquals(flight.getId(), result.get(0).getId());
    }

    @Test
    void findAvailableTransportations_ReturnsEmpty_WhenDayDoesNotMatch() {
        // Arrange
        Transportation flight = Transportation.builder()
                .originLocation(ist)
                .destinationLocation(esb)
                .transportationType(TransportationType.FLIGHT)
                .operatingDays("1,3,5")
                .build();
        entityManager.persist(flight);
        entityManager.flush();

        // Act
        List<Transportation> result = transportationRepository.findAvailableTransportations(ist.getId(), esb.getId(),
                2);

        // Assert
        assertTrue(result.isEmpty());
    }

    @Test
    void findAvailableFlights_ReturnsFlightsOnly() {
        // Arrange
        Transportation flight = Transportation.builder()
                .originLocation(ist)
                .destinationLocation(esb)
                .transportationType(TransportationType.FLIGHT)
                .operatingDays("1,2,3,4,5,6,7")
                .build();
        entityManager.persist(flight);

        Transportation bus = Transportation.builder()
                .originLocation(ist)
                .destinationLocation(esb)
                .transportationType(TransportationType.BUS)
                .operatingDays("1,2,3,4,5,6,7")
                .build();
        entityManager.persist(bus);
        entityManager.flush();

        // Act
        List<Transportation> result = transportationRepository.findAvailableFlights(
                List.of(ist.getId()),
                List.of(esb.getId()),
                1);

        // Assert
        assertEquals(1, result.size());
        assertEquals(TransportationType.FLIGHT, result.get(0).getTransportationType());
    }
}

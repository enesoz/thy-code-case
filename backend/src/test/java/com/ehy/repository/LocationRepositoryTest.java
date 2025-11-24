package com.ehy.repository;

import com.ehy.entity.Location;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class LocationRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private LocationRepository locationRepository;

    @Test
    void findByLocationCode_ReturnsLocation() {
        // Arrange
        Location location = new Location();
        location.setCountry("Turkey");
        location.setCity("Istanbul");
        location.setLocationCode("IST");
        location.setName("Istanbul Airport");
        entityManager.persist(location);
        entityManager.flush();

        // Act
        Optional<Location> found = locationRepository.findByLocationCode("IST");

        // Assert
        assertTrue(found.isPresent());
        assertEquals("IST", found.get().getLocationCode());
    }

    @Test
    void existsByLocationCodeIgnoreCase_ReturnsTrue() {
        // Arrange
        Location location = new Location();
        location.setCountry("Turkey");
        location.setCity("Ankara");
        location.setLocationCode("ESB");
        location.setName("Esenboga Airport");
        entityManager.persist(location);
        entityManager.flush();

        // Act
        boolean exists = locationRepository.existsByLocationCodeIgnoreCase("esb");

        // Assert
        assertTrue(exists);
    }
}

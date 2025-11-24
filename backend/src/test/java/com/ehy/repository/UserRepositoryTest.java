package com.ehy.repository;

import com.ehy.entity.User;
import com.ehy.enums.UserRole;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@DataJpaTest
class UserRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private UserRepository userRepository;

    @Test
    void findByUsername_ReturnsUser() {
        // Arrange
        User user = new User();
        user.setUsername("testuser");
        user.setPassword("password");
        user.setRole(UserRole.ADMIN);
        entityManager.persist(user);
        entityManager.flush();

        // Act
        Optional<User> found = userRepository.findByUsername("testuser");

        // Assert
        assertTrue(found.isPresent());
        assertEquals("testuser", found.get().getUsername());
    }

    @Test
    void existsByUsername_ReturnsTrue() {
        // Arrange
        User user = new User();
        user.setUsername("existinguser");
        user.setPassword("password");
        user.setRole(UserRole.AGENCY);
        entityManager.persist(user);
        entityManager.flush();

        // Act
        boolean exists = userRepository.existsByUsernameIgnoreCase("existinguser");

        // Assert
        assertTrue(exists);
    }
}

package com.ehy.repository;

import com.ehy.entity.User;
import com.ehy.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for User entity.
 * Provides CRUD operations and custom queries for user management and authentication.
 * Note: @SQLRestriction("deleted = false") on User entity automatically filters out deleted records.
 */
@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    /**
     * Find a user by username for authentication
     * @param username Username to search for
     * @return Optional containing the user if found and not deleted
     */
    Optional<User> findByUsername(String username);

    /**
     * Check if a username already exists (case-insensitive)
     * @param username Username to check
     * @return true if the username exists
     */
    boolean existsByUsernameIgnoreCase(String username);

    /**
     * Find all non-deleted users
     * @return List of active users
     */
    List<User> findAll();

    /**
     * Find all non-deleted users by role
     * @param role User role to filter by
     * @return List of active users with the specified role
     */
    List<User> findByRole(UserRole role);

    /**
     * Find a non-deleted user by ID
     * @param id User ID
     * @return Optional containing the user if found and not deleted
     */
    Optional<User> findById(UUID id);
}

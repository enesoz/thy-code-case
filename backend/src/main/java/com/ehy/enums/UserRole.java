package com.ehy.enums;

/**
 * Enumeration representing user roles in the system.
 * Determines access control and authorization for different operations.
 */
public enum UserRole {
    /**
     * Administrator role - full access to all CRUD operations
     * Can manage locations, transportations, and access route search
     */
    ADMIN,

    /**
     * Agency role - limited access for route searching only
     * Can search routes but cannot modify locations or transportations
     */
    AGENCY
}

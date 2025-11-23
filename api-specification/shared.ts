/**
 * Shared TypeScript utilities and types for the API specification
 * 
 * This file contains types that are useful across both backend and frontend
 * but aren't directly generated from OpenAPI (like utility types, constants, etc.)
 */

// ============================================================================
// Enum Constants
// ============================================================================
// These mirror the backend enums for better TypeScript usage

export const UserRole = {
    ADMIN: 'ADMIN',
    AGENCY: 'AGENCY',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const TransportationType = {
    FLIGHT: 'FLIGHT',
    BUS: 'BUS',
    SUBWAY: 'SUBWAY',
    UBER: 'UBER',
} as const;

export type TransportationType = (typeof TransportationType)[keyof typeof TransportationType];

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Makes all optional fields required
 * Useful for runtime validation of API responses
 */
export type Required<T> = {
    [P in keyof T]-?: T[P];
};

/**
 * Type guard to check if a value is defined
 */
export function isDefined<T>(value: T | undefined | null): value is T {
    return value !== undefined && value !== null;
}

/**
 * Validates that all required fields are present
 */
export function validateRequired<T extends object>(
    obj: T,
    requiredFields: (keyof T)[]
): obj is Required<T> {
    return requiredFields.every(field => isDefined(obj[field]));
}

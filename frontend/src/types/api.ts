// ============================================================================
// Re-export Generated API Types
// ============================================================================
export type {
    LoginRequest,
    LoginResponse,
    LocationResponse,
    LocationRequest,
    TransportationResponse,
    TransportationRequest,
    RouteResponse,
    RouteSegmentResponse,
} from '../../../api-specification/generated';

// ============================================================================
// Re-export Shared Types and Utilities
// ============================================================================
export {
    UserRole,
    TransportationType,
    isDefined,
    validateRequired,
} from '../../../api-specification/shared';
export type { UserRole, TransportationType } from '../../../api-specification/shared';

// ============================================================================
// Type Aliases for Convenience
// ============================================================================
export type LocationCreateRequest = LocationRequest;
export type LocationUpdateRequest = LocationRequest;
export type TransportationCreateRequest = TransportationRequest;
export type TransportationUpdateRequest = TransportationRequest;

// Shorter aliases for common types
export type { LocationResponse as Location } from '../../../api-specification/generated';
export type { TransportationResponse as Transportation } from '../../../api-specification/generated';
export type { RouteSegmentResponse as RouteSegment } from '../../../api-specification/generated';

// ============================================================================
// Frontend-Specific Types
// ============================================================================

/**
 * User object for frontend auth state
 * Simplified from LoginResponse for easier state management
 */
export interface User {
    id: string;
    username: string;
    role: UserRole;
}

/**
 * Route search query parameters
 * TODO: Consider moving to backend as a DTO if not already there
 */
export interface RouteSearchParams {
    originId: string;
    destinationId: string;
    date: string; // yyyy-MM-dd format
}

// ============================================================================
// Form State Types (Frontend-Only)
// ============================================================================
// These represent HTML form state, not API contracts

export interface LoginFormData {
    username: string;
    password: string;
}

export interface LocationFormData {
    name: string;
    country: string;
    city: string;
    locationCode: string;
    displayOrder: string; // String because HTML input returns string
}

export interface TransportationFormData {
    originLocationId: string;
    destinationLocationId: string;
    transportationType: TransportationType | ''; // Empty string for unselected dropdown
    operatingDays: number[];
}

export interface RouteSearchFormData {
    originId: string;
    destinationId: string;
    date: string;
}

// ============================================================================
// Frontend Error Handling
// ============================================================================

export interface ApiError {
    message: string;
    status?: number;
    timestamp?: string;
    path?: string;
}

// ============================================================================
// React-Specific Types
// ============================================================================

/**
 * Auth context type for React Context API
 */
export interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    isAdmin: boolean;
}

/**
 * React Query cache keys
 */
export const QUERY_KEYS = {
    LOCATIONS: ['locations'] as const,
    LOCATION: (id: string) => ['location', id] as const,
    TRANSPORTATIONS: ['transportations'] as const,
    TRANSPORTATION: (id: string) => ['transportation', id] as const,
    ROUTES: (params: RouteSearchParams) => ['routes', params] as const,
} as const;

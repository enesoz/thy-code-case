import { jwtDecode } from 'jwt-decode';

/**
 * JWT Token payload interface
 */
interface JWTPayload {
  sub: string; // subject (username)
  exp: number; // expiration time (seconds since epoch)
  iat: number; // issued at (seconds since epoch)
  role?: string;
}

/**
 * Checks if a JWT token is expired
 * @param token - JWT token string
 * @returns true if token is expired or invalid, false otherwise
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    const currentTime = Date.now() / 1000; // Convert to seconds

    // Add 30 second buffer to prevent edge case issues
    return decoded.exp < currentTime + 30;
  } catch (error) {
    // If token can't be decoded, consider it expired/invalid
    console.error('Error decoding token:', error);
    return true;
  }
};

/**
 * Gets the expiration time of a JWT token
 * @param token - JWT token string
 * @returns Date object representing expiration time, or null if token is invalid
 */
export const getTokenExpiration = (token: string): Date | null => {
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    return new Date(decoded.exp * 1000);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Gets the time remaining until token expires (in milliseconds)
 * @param token - JWT token string
 * @returns Milliseconds until expiration, or 0 if expired/invalid
 */
export const getTokenTimeRemaining = (token: string): number => {
  const expiration = getTokenExpiration(token);
  if (!expiration) return 0;

  const remaining = expiration.getTime() - Date.now();
  return Math.max(0, remaining);
};

/**
 * Validates token format and structure
 * @param token - JWT token string
 * @returns true if token has valid JWT structure, false otherwise
 */
export const isValidTokenFormat = (token: string): boolean => {
  if (!token || typeof token !== 'string') return false;

  const parts = token.split('.');
  if (parts.length !== 3) return false;

  try {
    jwtDecode(token);
    return true;
  } catch {
    return false;
  }
};

/**
 * Extracts user information from JWT token
 * @param token - JWT token string
 * @returns Partial user info or null if invalid
 */
export const getUserFromToken = (token: string): { username: string; role?: string } | null => {
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    return {
      username: decoded.sub,
      role: decoded.role,
    };
  } catch (error) {
    console.error('Error extracting user from token:', error);
    return null;
  }
};

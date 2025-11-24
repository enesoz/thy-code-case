/**
 * Test utilities for generating mock data and tokens
 */

/**
 * Generates a valid JWT token for testing
 * @param username - Username to encode in the token
 * @param role - User role to encode in the token
 * @param expiresIn - Expiration time in seconds from now (default: 1 hour)
 * @returns A valid JWT token string
 */
export const generateMockJWT = (
  username: string = 'testuser',
  role: string = 'ADMIN',
  expiresIn: number = 3600
): string => {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: username,
    role: role,
    iat: now,
    exp: now + expiresIn,
  };

  // Base64 encode header and payload
  const base64Header = btoa(JSON.stringify(header));
  const base64Payload = btoa(JSON.stringify(payload));

  // For testing, we don't need a real signature, just a valid structure
  const signature = 'mock-signature';

  return `${base64Header}.${base64Payload}.${signature}`;
};

/**
 * Generates an expired JWT token for testing
 */
export const generateExpiredMockJWT = (
  username: string = 'testuser',
  role: string = 'ADMIN'
): string => {
  return generateMockJWT(username, role, -3600); // Expired 1 hour ago
};

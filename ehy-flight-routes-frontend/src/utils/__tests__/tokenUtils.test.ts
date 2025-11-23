import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  isTokenExpired,
  getTokenExpiration,
  getTokenTimeRemaining,
  isValidTokenFormat,
  getUserFromToken,
} from '../tokenUtils';

describe('tokenUtils', () => {
  // Helper to create a mock JWT token
  const createMockToken = (exp: number, sub = 'testuser', role = 'ADMIN'): string => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(
      JSON.stringify({
        sub,
        exp,
        iat: Math.floor(Date.now() / 1000),
        role,
      })
    );
    const signature = 'mock-signature';
    return `${header}.${payload}.${signature}`;
  };

  describe('isTokenExpired', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    it('should return false for valid non-expired token', () => {
      const futureTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const token = createMockToken(futureTime);

      expect(isTokenExpired(token)).toBe(false);
    });

    it('should return true for expired token', () => {
      const pastTime = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      const token = createMockToken(pastTime);

      expect(isTokenExpired(token)).toBe(true);
    });

    it('should return true for token expiring within 30 seconds (buffer)', () => {
      const nearFutureTime = Math.floor(Date.now() / 1000) + 20; // 20 seconds from now
      const token = createMockToken(nearFutureTime);

      expect(isTokenExpired(token)).toBe(true);
    });

    it('should return true for invalid token format', () => {
      expect(isTokenExpired('invalid-token')).toBe(true);
    });

    it('should return true for empty token', () => {
      expect(isTokenExpired('')).toBe(true);
    });
  });

  describe('getTokenExpiration', () => {
    it('should return correct expiration date', () => {
      const expTime = Math.floor(Date.now() / 1000) + 3600;
      const token = createMockToken(expTime);

      const expiration = getTokenExpiration(token);
      expect(expiration).toBeInstanceOf(Date);
      expect(expiration?.getTime()).toBe(expTime * 1000);
    });

    it('should return null for invalid token', () => {
      expect(getTokenExpiration('invalid-token')).toBeNull();
    });
  });

  describe('getTokenTimeRemaining', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    it('should return correct time remaining for valid token', () => {
      const futureTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour
      const token = createMockToken(futureTime);

      const remaining = getTokenTimeRemaining(token);
      expect(remaining).toBeGreaterThan(3590000); // ~1 hour in ms (with some tolerance)
      expect(remaining).toBeLessThanOrEqual(3600000);
    });

    it('should return 0 for expired token', () => {
      const pastTime = Math.floor(Date.now() / 1000) - 3600;
      const token = createMockToken(pastTime);

      expect(getTokenTimeRemaining(token)).toBe(0);
    });

    it('should return 0 for invalid token', () => {
      expect(getTokenTimeRemaining('invalid-token')).toBe(0);
    });
  });

  describe('isValidTokenFormat', () => {
    it('should return true for valid JWT format', () => {
      const token = createMockToken(Math.floor(Date.now() / 1000) + 3600);
      expect(isValidTokenFormat(token)).toBe(true);
    });

    it('should return false for invalid format', () => {
      expect(isValidTokenFormat('not.a.valid.jwt')).toBe(false);
      expect(isValidTokenFormat('invalid')).toBe(false);
      expect(isValidTokenFormat('')).toBe(false);
    });

    it('should return false for non-string input', () => {
      expect(isValidTokenFormat(null as any)).toBe(false);
      expect(isValidTokenFormat(undefined as any)).toBe(false);
      expect(isValidTokenFormat(123 as any)).toBe(false);
    });
  });

  describe('getUserFromToken', () => {
    it('should extract user information from valid token', () => {
      const token = createMockToken(
        Math.floor(Date.now() / 1000) + 3600,
        'john.doe',
        'AGENCY'
      );

      const user = getUserFromToken(token);
      expect(user).toEqual({
        username: 'john.doe',
        role: 'AGENCY',
      });
    });

    it('should return null for invalid token', () => {
      expect(getUserFromToken('invalid-token')).toBeNull();
    });
  });
});

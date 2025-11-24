import { describe, it, expect } from 'vitest';
import {
  formatDateForApi,
  parseDateFromApi,
  formatOperatingDays,
  getDayName,
  isValidLocationCode,
  formatErrorMessage,
  isPastDate,
  isValidOperatingDays,
  getTransportationTypeColor,
  getTransportationTypeIcon,
} from '../index';
import { TransportationType } from '../../types';

describe('Utils', () => {
  describe('formatDateForApi', () => {
    it('formats date to yyyy-MM-dd', () => {
      const date = new Date('2024-03-15');
      expect(formatDateForApi(date)).toBe('2024-03-15');
    });

    it('pads single digit month and day with zero', () => {
      const date = new Date('2024-01-05');
      expect(formatDateForApi(date)).toBe('2024-01-05');
    });
  });

  describe('parseDateFromApi', () => {
    it('parses date string to Date object', () => {
      const dateString = '2024-03-15';
      const date = parseDateFromApi(dateString);
      expect(date).toBeInstanceOf(Date);
      expect(date.toISOString()).toContain('2024-03-15');
    });
  });

  describe('formatOperatingDays', () => {
    it('formats operating days array to readable string', () => {
      expect(formatOperatingDays([1, 3, 5])).toBe('Mon, Wed, Fri');
    });

    it('sorts days in correct order', () => {
      expect(formatOperatingDays([7, 1, 4])).toBe('Mon, Thu, Sun');
    });

    it('handles all days', () => {
      expect(formatOperatingDays([1, 2, 3, 4, 5, 6, 7])).toBe(
        'Mon, Tue, Wed, Thu, Fri, Sat, Sun'
      );
    });
  });

  describe('getDayName', () => {
    it('returns correct day name for day number', () => {
      expect(getDayName(1)).toBe('Monday');
      expect(getDayName(4)).toBe('Thursday');
      expect(getDayName(7)).toBe('Sunday');
    });

    it('returns empty string for invalid day number', () => {
      expect(getDayName(0)).toBe('');
      expect(getDayName(8)).toBe('');
    });
  });

  describe('isValidLocationCode', () => {
    it('validates 3-character uppercase codes', () => {
      expect(isValidLocationCode('IST')).toBe(true);
      expect(isValidLocationCode('LHR')).toBe(true);
    });

    it('validates 4-character uppercase codes', () => {
      expect(isValidLocationCode('TAKS')).toBe(true);
    });

    it('rejects lowercase codes', () => {
      expect(isValidLocationCode('ist')).toBe(false);
    });

    it('rejects codes with invalid length', () => {
      expect(isValidLocationCode('IS')).toBe(false);
      expect(isValidLocationCode('ISTANBUL')).toBe(false);
    });

    it('rejects codes with special characters', () => {
      expect(isValidLocationCode('IS-T')).toBe(false);
    });
  });

  describe('formatErrorMessage', () => {
    it('extracts message from error object', () => {
      const error = { message: 'Test error' };
      expect(formatErrorMessage(error)).toBe('Test error');
    });

    it('returns default message for unknown error', () => {
      expect(formatErrorMessage(null)).toBe('An unexpected error occurred');
      expect(formatErrorMessage(undefined)).toBe('An unexpected error occurred');
    });
  });

  describe('isPastDate', () => {
    it('returns true for past dates', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isPastDate(formatDateForApi(yesterday))).toBe(true);
    });

    it('returns false for today', () => {
      const today = new Date();
      expect(isPastDate(formatDateForApi(today))).toBe(false);
    });

    it('returns false for future dates', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(isPastDate(formatDateForApi(tomorrow))).toBe(false);
    });
  });

  describe('isValidOperatingDays', () => {
    it('validates correct operating days array', () => {
      expect(isValidOperatingDays([1, 2, 3])).toBe(true);
      expect(isValidOperatingDays([1, 7])).toBe(true);
    });

    it('rejects empty array', () => {
      expect(isValidOperatingDays([])).toBe(false);
    });

    it('rejects array with invalid day numbers', () => {
      expect(isValidOperatingDays([0, 1, 2])).toBe(false);
      expect(isValidOperatingDays([1, 8])).toBe(false);
    });

    it('rejects non-integer values', () => {
      expect(isValidOperatingDays([1.5, 2])).toBe(false);
    });
  });

  describe('getTransportationTypeColor', () => {
    it('returns correct color class for each transportation type', () => {
      expect(getTransportationTypeColor(TransportationType.FLIGHT)).toBe('badge-info');
      expect(getTransportationTypeColor(TransportationType.BUS)).toBe('badge-warning');
      expect(getTransportationTypeColor(TransportationType.SUBWAY)).toBe('badge-success');
      expect(getTransportationTypeColor(TransportationType.UBER)).toBe('badge-danger');
    });
  });

  describe('getTransportationTypeIcon', () => {
    it('returns correct icon for each transportation type', () => {
      expect(getTransportationTypeIcon(TransportationType.FLIGHT)).toBe('✈️');
      expect(getTransportationTypeIcon(TransportationType.BUS)).toBe('🚌');
      expect(getTransportationTypeIcon(TransportationType.SUBWAY)).toBe('🚇');
      expect(getTransportationTypeIcon(TransportationType.UBER)).toBe('🚗');
    });
  });
});

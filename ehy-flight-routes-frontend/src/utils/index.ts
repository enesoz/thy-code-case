import { TransportationType } from '../types';

/**
 * Format a date to yyyy-MM-dd format for API requests
 */
export const formatDateForApi = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Parse a date string from API (yyyy-MM-dd) to Date object
 */
export const parseDateFromApi = (dateString: string): Date => {
  return new Date(dateString);
};

/**
 * Get today's date in yyyy-MM-dd format
 */
export const getTodayString = (): string => {
  return formatDateForApi(new Date());
};

/**
 * Format operating days to readable string
 * Accepts either a comma-separated string (e.g., "1,3,5") or an array of numbers
 */
export const formatOperatingDays = (days: string | number[]): string => {
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const asArray: number[] = Array.isArray(days)
    ? [...days]
    : String(days)
        .split(',')
        .map((s) => Number(s.trim()))
        .filter((n) => Number.isFinite(n));
  const sortedDays = [...asArray].sort((a, b) => a - b);
  return sortedDays.map((day) => dayNames[day - 1]).join(', ');
};

/**
 * Get day name from day number (1-7)
 */
export const getDayName = (dayNumber: number): string => {
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return dayNames[dayNumber - 1] || '';
};

/**
 * Get all days array for multi-select
 */
export const getAllDays = (): Array<{ value: number; label: string }> => {
  return [
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
    { value: 7, label: 'Sunday' },
  ];
};

/**
 * Get transportation type badge color
 */
export const getTransportationTypeColor = (type: TransportationType): string => {
  const colors: Record<TransportationType, string> = {
    [TransportationType.FLIGHT]: 'badge-info',
    [TransportationType.BUS]: 'badge-warning',
    [TransportationType.SUBWAY]: 'badge-success',
    [TransportationType.UBER]: 'badge-danger',
  };
  return colors[type] || 'badge-info';
};

/**
 * Get transportation type icon
 */
export const getTransportationTypeIcon = (type: TransportationType): string => {
  const icons: Record<TransportationType, string> = {
    [TransportationType.FLIGHT]: '✈️',
    [TransportationType.BUS]: '🚌',
    [TransportationType.SUBWAY]: '🚇',
    [TransportationType.UBER]: '🚗',
  };
  return icons[type] || '';
};

/**
 * Validate location code (3-4 uppercase alphanumeric characters)
 */
export const isValidLocationCode = (code: string): boolean => {
  return /^[A-Z0-9]{3,4}$/.test(code);
};

/**
 * Format error message from API error
 */
export const formatErrorMessage = (error: unknown): string => {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return (error as { message: string }).message;
  }
  return 'An unexpected error occurred';
};

/**
 * Debounce function for search inputs
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Check if date is in the past
 */
export const isPastDate = (dateString: string): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedDate = new Date(dateString);
  return selectedDate < today;
};

/**
 * Validate operating days (array of numbers or comma-separated string of 1-7)
 */
export const isValidOperatingDays = (days: number[] | string): boolean => {
  const arr: number[] = Array.isArray(days)
    ? days
    : String(days)
        .split(',')
        .map((s) => Number(s.trim()))
        .filter((n) => Number.isFinite(n));
  if (!Array.isArray(arr) || arr.length === 0) return false;
  const set = new Set<number>();
  for (const d of arr) {
    if (!Number.isInteger(d) || d < 1 || d > 7) return false;
    if (set.has(d)) return false;
    set.add(d);
  }
  return true;
};

/**
 * Helpers to convert between number[] and comma-separated string
 */
export const joinOperatingDays = (arr: number[]): string => arr.map((n) => String(n)).join(',');
export const splitOperatingDays = (str: string): number[] =>
  String(str)
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isInteger(n));

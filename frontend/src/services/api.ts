import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type {
  LoginRequest,
  LoginResponse,
  Location,
  LocationRequest,
  Transportation,
  TransportationRequest,
  RouteSearchParams,
  RouteResponse,
  ApiError,
} from '../types';
import { isTokenExpired } from '../utils/tokenUtils';

/**
 * Validates and gets API URL from environment
 * Throws error if not configured in production
 */
const getApiBaseUrl = (): string => {
  const apiUrl = import.meta.env.VITE_API_URL;

  // In production, API URL must be explicitly set
  if (import.meta.env.PROD && !apiUrl) {
    throw new Error(
      'VITE_API_URL environment variable is required in production. ' +
        'Please set it in your .env.production file.'
    );
  }

  // Development fallback
  return apiUrl || 'http://localhost:8080/api';
};

// Logout callback - will be set by AuthProvider to avoid circular dependency
let onUnauthorizedCallback: (() => void) | null = null;

/**
 * Sets the callback to be called when user is unauthorized (401)
 * This is used to trigger logout from the API layer without circular dependency
 */
export const setUnauthorizedCallback = (callback: () => void): void => {
  onUnauthorizedCallback = callback;
};

// Create axios instance with base configuration
const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add JWT token to all requests and validate expiration
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');

    if (token) {
      // Check if token is expired before making request
      if (isTokenExpired(token)) {
        console.warn('Token expired before request, triggering logout');
        // Clear expired token
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Trigger logout callback if available
        if (onUnauthorizedCallback) {
          onUnauthorizedCallback();
        }

        // Reject the request
        return Promise.reject({
          message: 'Session expired. Please login again.',
          status: 401,
        } as ApiError);
      }

      // Add valid token to headers
      if (config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle 401 errors globally
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      // Clear authentication data
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Trigger logout callback instead of direct navigation
      // This avoids breaking SPA and circular dependency issues
      if (onUnauthorizedCallback) {
        onUnauthorizedCallback();
      }
    }

    // Transform error to consistent format
    const apiError: ApiError = {
      message: error.response?.data?.message || error.message || 'An unexpected error occurred',
      status: error.response?.status,
      timestamp: error.response?.data?.timestamp,
      path: error.response?.data?.path,
    };

    return Promise.reject(apiError);
  }
);

// Authentication API
export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },
};

// Locations API
export const locationsApi = {
  getAll: async (): Promise<Location[]> => {
    const response = await api.get<Location[]>('/locations');
    return response.data;
  },

  getById: async (id: string): Promise<Location> => {
    const response = await api.get<Location>(`/locations/${id}`);
    return response.data;
  },

  create: async (data: LocationRequest): Promise<Location> => {
    const response = await api.post<Location>('/locations', data);
    return response.data;
  },

  update: async (id: string, data: LocationRequest): Promise<Location> => {
    const response = await api.put<Location>(`/locations/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/locations/${id}`);
  },
};

// Transportations API
export const transportationsApi = {
  getAll: async (): Promise<Transportation[]> => {
    const response = await api.get<Transportation[]>('/transportations');
    return response.data;
  },

  getById: async (id: string): Promise<Transportation> => {
    const response = await api.get<Transportation>(`/transportations/${id}`);
    return response.data;
  },

  create: async (data: TransportationRequest): Promise<Transportation> => {
    const response = await api.post<Transportation>('/transportations', data);
    return response.data;
  },

  update: async (id: string, data: TransportationRequest): Promise<Transportation> => {
    const response = await api.put<Transportation>(`/transportations/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/transportations/${id}`);
  },
};

// Routes API
export const routesApi = {
  search: async (params: RouteSearchParams): Promise<RouteResponse[]> => {
    const response = await api.get<RouteResponse[]>('/routes/search', {
      params: {
        originId: params.originId,
        destinationId: params.destinationId,
        date: params.date,
      },
    });
    return response.data;
  },
};

export default api;

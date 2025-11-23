import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { locationsApi, routesApi } from '../services/api';
import { QUERY_KEYS } from '../types';
import type { RouteSearchFormData, RouteResponse } from '../types';
import { formatErrorMessage, getTodayString, getTransportationTypeColor, getTransportationTypeIcon } from '../utils';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

const RoutesPage: React.FC = () => {
  const [searchResults, setSearchResults] = useState<RouteResponse[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RouteSearchFormData>({
    defaultValues: {
      originId: '',
      destinationId: '',
      date: getTodayString(),
    },
  });

  // Fetch locations for dropdowns
  const {
    data: locations,
    isLoading: isLoadingLocations,
    error: locationsError,
  } = useQuery({
    queryKey: QUERY_KEYS.LOCATIONS,
    queryFn: locationsApi.getAll,
  });

  const originId = watch('originId');
  const destinationId = watch('destinationId');

  const onSubmit = async (data: RouteSearchFormData) => {
    if (data.originId === data.destinationId) {
      setSearchError('Origin and destination cannot be the same');
      return;
    }

    setIsSearching(true);
    setSearchError('');
    setSearchResults(null);

    try {
      const results = await routesApi.search({
        originId: data.originId,
        destinationId: data.destinationId,
        date: data.date,
      });
      setSearchResults(results);

      if (results.length === 0) {
        setSearchError('No routes found for the selected criteria');
      }
    } catch (error) {
      setSearchError(formatErrorMessage(error));
    } finally {
      setIsSearching(false);
    }
  };

  if (locationsError) {
    return (
      <div className="max-w-4xl mx-auto">
        <ErrorMessage
          message={formatErrorMessage(locationsError)}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Search Flight Routes</h1>
        <p className="mt-2 text-gray-600">
          Find the best routes combining flights and ground transportation
        </p>
      </div>

      {/* Search Form */}
      <div className="card mb-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Origin Location */}
            <div>
              <label htmlFor="originId" className="label">
                Origin Location
              </label>
              {isLoadingLocations ? (
                <div className="flex items-center justify-center h-10">
                  <LoadingSpinner size="sm" />
                </div>
              ) : (
                <select
                  id="originId"
                  disabled={isSearching}
                  className={`input-field ${errors.originId ? 'input-error' : ''}`}
                  {...register('originId', {
                    required: 'Origin location is required',
                  })}
                  aria-invalid={errors.originId ? 'true' : 'false'}
                  aria-describedby={errors.originId ? 'origin-error' : undefined}
                >
                  <option value="">Select origin...</option>
                  {locations?.map((location) => (
                    <option
                      key={location.id}
                      value={location.id}
                      disabled={location.id === destinationId}
                    >
                      {location.name} ({location.locationCode})
                    </option>
                  ))}
                </select>
              )}
              {errors.originId && (
                <p className="error-message" id="origin-error" role="alert">
                  {errors.originId.message}
                </p>
              )}
            </div>

            {/* Destination Location */}
            <div>
              <label htmlFor="destinationId" className="label">
                Destination Location
              </label>
              {isLoadingLocations ? (
                <div className="flex items-center justify-center h-10">
                  <LoadingSpinner size="sm" />
                </div>
              ) : (
                <select
                  id="destinationId"
                  disabled={isSearching}
                  className={`input-field ${errors.destinationId ? 'input-error' : ''}`}
                  {...register('destinationId', {
                    required: 'Destination location is required',
                  })}
                  aria-invalid={errors.destinationId ? 'true' : 'false'}
                  aria-describedby={errors.destinationId ? 'destination-error' : undefined}
                >
                  <option value="">Select destination...</option>
                  {locations?.map((location) => (
                    <option
                      key={location.id}
                      value={location.id}
                      disabled={location.id === originId}
                    >
                      {location.name} ({location.locationCode})
                    </option>
                  ))}
                </select>
              )}
              {errors.destinationId && (
                <p className="error-message" id="destination-error" role="alert">
                  {errors.destinationId.message}
                </p>
              )}
            </div>

            {/* Date */}
            <div>
              <label htmlFor="date" className="label">
                Travel Date
              </label>
              <input
                id="date"
                type="date"
                disabled={isSearching}
                min={getTodayString()}
                className={`input-field ${errors.date ? 'input-error' : ''}`}
                {...register('date', {
                  required: 'Date is required',
                })}
                aria-invalid={errors.date ? 'true' : 'false'}
                aria-describedby={errors.date ? 'date-error' : undefined}
              />
              {errors.date && (
                <p className="error-message" id="date-error" role="alert">
                  {errors.date.message}
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isSearching || isLoadingLocations}
              className="btn-primary w-full md:w-auto min-w-[200px] flex items-center justify-center"
            >
              {isSearching ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Searching...
                </>
              ) : (
                'Search Routes'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Search Error */}
      {searchError && <ErrorMessage message={searchError} className="mb-8" />}

      {/* Search Results */}
      {searchResults && searchResults.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Available Routes ({searchResults.length})
            </h2>
          </div>

          {searchResults.map((route, routeIndex) => (
            <div key={routeIndex} className="card hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Route Option {routeIndex + 1}
                </h3>
                <span className="badge badge-info">
                  {route.totalSegments} segment{route.totalSegments > 1 ? 's' : ''}
                </span>
              </div>

              {/* Route Segments */}
              <div className="space-y-4">
                {route.segments.map((segment, segmentIndex) => (
                  <div key={segmentIndex}>
                    <div className="flex items-center space-x-4">
                      {/* Segment Number */}
                      <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-700">
                          {segment.segmentOrder}
                        </span>
                      </div>

                      {/* Transportation Details */}
                      <div className="flex-1 bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl" aria-hidden="true">
                              {getTransportationTypeIcon(segment.transportationType)}
                            </span>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-gray-900">
                                  {segment.originLocation.name}
                                </span>
                                <span className="text-gray-500">→</span>
                                <span className="font-semibold text-gray-900">
                                  {segment.destinationLocation.name}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2 mt-1">
                                <span
                                  className={`badge ${getTransportationTypeColor(
                                    segment.transportationType
                                  )}`}
                                >
                                  {segment.transportationType}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {segment.originLocation.locationCode} →{' '}
                                  {segment.destinationLocation.locationCode}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Arrow between segments */}
                    {segmentIndex < route.segments.length - 1 && (
                      <div className="flex justify-center py-2">
                        <svg
                          className="w-6 h-6 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 14l-7 7m0 0l-7-7m7 7V3"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results message */}
      {searchResults && searchResults.length === 0 && (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4" aria-hidden="true">
            🔍
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Routes Found</h3>
          <p className="text-gray-600">
            Try adjusting your search criteria or selecting a different date.
          </p>
        </div>
      )}
    </div>
  );
};

export default RoutesPage;

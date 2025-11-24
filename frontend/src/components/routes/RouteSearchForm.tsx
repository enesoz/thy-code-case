import React from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { Location, RouteSearchFormData } from '../../types';
import { getTodayString } from '../../utils';
import LoadingSpinner from '../common/LoadingSpinner';

interface RouteSearchFormProps {
    form: UseFormReturn<RouteSearchFormData>;
    locations: Location[] | undefined;
    isLoadingLocations: boolean;
    isSearching: boolean;
    originId: string;
    destinationId: string;
    onSubmit: (data: RouteSearchFormData) => void;
    onSwapLocations: () => void;
}

/**
 * Route search form component
 */
export const RouteSearchForm: React.FC<RouteSearchFormProps> = ({
    form,
    locations,
    isLoadingLocations,
    isSearching,
    originId,
    destinationId,
    onSubmit,
    onSwapLocations,
}) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = form;

    return (
        <div className="card mb-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_1fr] gap-6 items-start">
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

                    {/* Swap Button */}
                    <div className="flex items-end pb-2 md:pb-0 md:pt-8">
                        <button
                            type="button"
                            onClick={onSwapLocations}
                            disabled={isSearching || isLoadingLocations}
                            className="p-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Swap origin and destination"
                            aria-label="Swap origin and destination locations"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-gray-600 dark:text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                                />
                            </svg>
                        </button>
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
    );
};

export default RouteSearchForm;

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
}) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = form;

    return (
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
    );
};

export default RouteSearchForm;

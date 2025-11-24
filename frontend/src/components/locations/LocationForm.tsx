import React from 'react';
import { useForm } from 'react-hook-form';
import type { LocationFormData } from '../../types';
import { isValidLocationCode } from '../../utils';
import LoadingSpinner from '../common/LoadingSpinner';

interface LocationFormProps {
  initialData?: Partial<LocationFormData>;
  onSubmit: (data: LocationFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const LocationForm: React.FC<LocationFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LocationFormData>({
    defaultValues: initialData || {
      name: '',
      country: '',
      city: '',
      locationCode: '',
      displayOrder: '0',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Name */}
      <div>
        <label htmlFor="name" className="label">
          Location Name *
        </label>
        <input
          id="name"
          type="text"
          disabled={isLoading}
          placeholder="e.g., Istanbul Airport"
          className={`input-field ${errors.name ? 'input-error' : ''}`}
          {...register('name', {
            required: 'Location name is required',
            minLength: {
              value: 2,
              message: 'Location name must be at least 2 characters',
            },
          })}
          aria-invalid={errors.name ? 'true' : 'false'}
          aria-describedby={errors.name ? 'name-error' : undefined}
        />
        {errors.name && (
          <p className="error-message" id="name-error" role="alert">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Country */}
      <div>
        <label htmlFor="country" className="label">
          Country *
        </label>
        <input
          id="country"
          type="text"
          disabled={isLoading}
          placeholder="e.g., Turkey"
          className={`input-field ${errors.country ? 'input-error' : ''}`}
          {...register('country', {
            required: 'Country is required',
            minLength: {
              value: 2,
              message: 'Country must be at least 2 characters',
            },
          })}
          aria-invalid={errors.country ? 'true' : 'false'}
          aria-describedby={errors.country ? 'country-error' : undefined}
        />
        {errors.country && (
          <p className="error-message" id="country-error" role="alert">
            {errors.country.message}
          </p>
        )}
      </div>

      {/* City */}
      <div>
        <label htmlFor="city" className="label">
          City *
        </label>
        <input
          id="city"
          type="text"
          disabled={isLoading}
          placeholder="e.g., Istanbul"
          className={`input-field ${errors.city ? 'input-error' : ''}`}
          {...register('city', {
            required: 'City is required',
            minLength: {
              value: 2,
              message: 'City must be at least 2 characters',
            },
          })}
          aria-invalid={errors.city ? 'true' : 'false'}
          aria-describedby={errors.city ? 'city-error' : undefined}
        />
        {errors.city && (
          <p className="error-message" id="city-error" role="alert">
            {errors.city.message}
          </p>
        )}
      </div>

      {/* Location Code */}
      <div>
        <label htmlFor="locationCode" className="label">
          Location Code *
        </label>
        <input
          id="locationCode"
          type="text"
          disabled={isLoading}
          placeholder="e.g., IST (3-4 uppercase letters)"
          maxLength={4}
          className={`input-field ${errors.locationCode ? 'input-error' : ''}`}
          {...register('locationCode', {
            required: 'Location code is required',
            validate: (value) =>
              isValidLocationCode(value) ||
              'Location code must be 3-4 uppercase alphanumeric characters',
          })}
          aria-invalid={errors.locationCode ? 'true' : 'false'}
          aria-describedby={errors.locationCode ? 'locationCode-error' : undefined}
        />
        {errors.locationCode && (
          <p className="error-message" id="locationCode-error" role="alert">
            {errors.locationCode.message}
          </p>
        )}
        <p className="text-xs text-gray-500 mt-1">IATA codes (3 chars) or custom (4 chars)</p>
      </div>

      {/* Display Order */}
      <div>
        <label htmlFor="displayOrder" className="label">
          Display Order
        </label>
        <input
          id="displayOrder"
          type="number"
          disabled={isLoading}
          min="0"
          className={`input-field ${errors.displayOrder ? 'input-error' : ''}`}
          {...register('displayOrder', {
            min: {
              value: 0,
              message: 'Display order must be 0 or greater',
            },
          })}
          aria-invalid={errors.displayOrder ? 'true' : 'false'}
          aria-describedby={errors.displayOrder ? 'displayOrder-error' : undefined}
        />
        {errors.displayOrder && (
          <p className="error-message" id="displayOrder-error" role="alert">
            {errors.displayOrder.message}
          </p>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button type="submit" disabled={isLoading} className="btn-primary flex items-center">
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Saving...
            </>
          ) : (
            'Save Location'
          )}
        </button>
      </div>
    </form>
  );
};

export default LocationForm;

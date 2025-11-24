import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import type { TransportationFormData } from '../../types';
import { TransportationType, QUERY_KEYS } from '../../types';
import { locationsApi } from '../../services/api';
import { getAllDays } from '../../utils';
import LoadingSpinner from '../common/LoadingSpinner';

interface TransportationFormProps {
  initialData?: Partial<TransportationFormData>;
  onSubmit: (data: TransportationFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const TransportationForm: React.FC<TransportationFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<TransportationFormData>({
    defaultValues: initialData || {
      originLocationId: '',
      destinationLocationId: '',
      transportationType: '',
      operatingDays: [],
    },
  });

  // Fetch locations for dropdowns
  const { data: locations, isLoading: isLoadingLocations } = useQuery({
    queryKey: QUERY_KEYS.LOCATIONS,
    queryFn: locationsApi.getAll,
  });

  const originLocationId = watch('originLocationId');
  const destinationLocationId = watch('destinationLocationId');
  const allDays = getAllDays();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Origin Location */}
      <div>
        <label htmlFor="originLocationId" className="label">
          Origin Location *
        </label>
        {isLoadingLocations ? (
          <div className="flex items-center justify-center h-10">
            <LoadingSpinner size="sm" />
          </div>
        ) : (
          <select
            id="originLocationId"
            disabled={isLoading}
            className={`input-field ${errors.originLocationId ? 'input-error' : ''}`}
            {...register('originLocationId', {
              required: 'Origin location is required',
            })}
            aria-invalid={errors.originLocationId ? 'true' : 'false'}
            aria-describedby={errors.originLocationId ? 'origin-error' : undefined}
          >
            <option value="">Select origin...</option>
            {locations?.map((location) => (
              <option
                key={location.id}
                value={location.id}
                disabled={location.id === destinationLocationId}
              >
                {location.name} ({location.locationCode})
              </option>
            ))}
          </select>
        )}
        {errors.originLocationId && (
          <p className="error-message" id="origin-error" role="alert">
            {errors.originLocationId.message}
          </p>
        )}
      </div>

      {/* Destination Location */}
      <div>
        <label htmlFor="destinationLocationId" className="label">
          Destination Location *
        </label>
        {isLoadingLocations ? (
          <div className="flex items-center justify-center h-10">
            <LoadingSpinner size="sm" />
          </div>
        ) : (
          <select
            id="destinationLocationId"
            disabled={isLoading}
            className={`input-field ${errors.destinationLocationId ? 'input-error' : ''}`}
            {...register('destinationLocationId', {
              required: 'Destination location is required',
            })}
            aria-invalid={errors.destinationLocationId ? 'true' : 'false'}
            aria-describedby={errors.destinationLocationId ? 'destination-error' : undefined}
          >
            <option value="">Select destination...</option>
            {locations?.map((location) => (
              <option
                key={location.id}
                value={location.id}
                disabled={location.id === originLocationId}
              >
                {location.name} ({location.locationCode})
              </option>
            ))}
          </select>
        )}
        {errors.destinationLocationId && (
          <p className="error-message" id="destination-error" role="alert">
            {errors.destinationLocationId.message}
          </p>
        )}
      </div>

      {/* Transportation Type */}
      <div>
        <label htmlFor="transportationType" className="label">
          Transportation Type *
        </label>
        <select
          id="transportationType"
          disabled={isLoading}
          className={`input-field ${errors.transportationType ? 'input-error' : ''}`}
          {...register('transportationType', {
            required: 'Transportation type is required',
          })}
          aria-invalid={errors.transportationType ? 'true' : 'false'}
          aria-describedby={errors.transportationType ? 'type-error' : undefined}
        >
          <option value="">Select type...</option>
          {Object.values(TransportationType).map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        {errors.transportationType && (
          <p className="error-message" id="type-error" role="alert">
            {errors.transportationType.message}
          </p>
        )}
      </div>

      {/* Operating Days */}
      <div>
        <label className="label">Operating Days *</label>
        <Controller
          name="operatingDays"
          control={control}
          rules={{
            validate: (value) =>
              (value && value.length > 0) || 'Select at least one operating day',
          }}
          render={({ field }) => (
            <div className="space-y-2">
              {allDays.map((day) => (
                <label key={day.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={isLoading}
                    checked={field.value?.includes(day.value)}
                    onChange={(e) => {
                      const newValue = e.target.checked
                        ? [...(field.value || []), day.value]
                        : (field.value || []).filter((d) => d !== day.value);
                      field.onChange(newValue.sort((a, b) => a - b));
                    }}
                    className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">{day.label}</span>
                </label>
              ))}
            </div>
          )}
        />
        {errors.operatingDays && (
          <p className="error-message" role="alert">
            {errors.operatingDays.message}
          </p>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button type="button" onClick={onCancel} disabled={isLoading} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={isLoading} className="btn-primary flex items-center">
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Saving...
            </>
          ) : (
            'Save Transportation'
          )}
        </button>
      </div>
    </form>
  );
};

export default TransportationForm;

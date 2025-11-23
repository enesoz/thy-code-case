import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { locationsApi } from '../services/api';
import { QUERY_KEYS } from '../types';
import type { Location, LocationFormData } from '../types';
import { formatErrorMessage } from '../utils';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import Modal from '../components/common/Modal';
import LocationForm from '../components/locations/LocationForm';

const LocationsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [deletingLocationId, setDeletingLocationId] = useState<string | null>(null);

  // Fetch locations
  const {
    data: locations,
    isLoading,
    error,
  } = useQuery({
    queryKey: QUERY_KEYS.LOCATIONS,
    queryFn: locationsApi.getAll,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: locationsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LOCATIONS });
      setIsCreateModalOpen(false);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: LocationFormData }) =>
      locationsApi.update(id, {
        name: data.name,
        country: data.country,
        city: data.city,
        locationCode: data.locationCode,
        displayOrder: parseInt(data.displayOrder) || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LOCATIONS });
      setEditingLocation(null);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: locationsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LOCATIONS });
      setDeletingLocationId(null);
    },
  });

  const handleCreate = async (data: LocationFormData) => {
    await createMutation.mutateAsync({
      name: data.name,
      country: data.country,
      city: data.city,
      locationCode: data.locationCode,
      displayOrder: parseInt(data.displayOrder) || undefined,
    });
  };

  const handleUpdate = async (data: LocationFormData) => {
    if (!editingLocation) return;
    await updateMutation.mutateAsync({ id: editingLocation.id, data });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      setDeletingLocationId(id);
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        setDeletingLocationId(null);
      }
    }
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <ErrorMessage
          message={formatErrorMessage(error)}
          onRetry={() => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LOCATIONS })}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Locations Management</h1>
          <p className="mt-2 text-gray-600">
            Manage airports and transportation hubs
          </p>
        </div>
        <button onClick={() => setIsCreateModalOpen(true)} className="btn-primary">
          + Add Location
        </button>
      </div>

      {/* Error Messages */}
      {createMutation.isError && (
        <ErrorMessage
          message={formatErrorMessage(createMutation.error)}
          className="mb-4"
        />
      )}
      {updateMutation.isError && (
        <ErrorMessage
          message={formatErrorMessage(updateMutation.error)}
          className="mb-4"
        />
      )}
      {deleteMutation.isError && (
        <ErrorMessage
          message={formatErrorMessage(deleteMutation.error)}
          className="mb-4"
        />
      )}

      {/* Locations Table */}
      <div className="card">
        {!locations || locations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4" aria-hidden="true">
              📍
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Locations Yet</h3>
            <p className="text-gray-600 mb-4">
              Get started by creating your first location.
            </p>
            <button onClick={() => setIsCreateModalOpen(true)} className="btn-primary">
              + Add Location
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Code</th>
                  <th className="table-header-cell">Name</th>
                  <th className="table-header-cell">City</th>
                  <th className="table-header-cell">Country</th>
                  <th className="table-header-cell">Display Order</th>
                  <th className="table-header-cell">Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {locations.map((location) => (
                  <tr key={location.id}>
                    <td className="table-cell">
                      <span className="font-mono font-semibold text-primary-600">
                        {location.locationCode}
                      </span>
                    </td>
                    <td className="table-cell font-medium">{location.name}</td>
                    <td className="table-cell">{location.city}</td>
                    <td className="table-cell">{location.country}</td>
                    <td className="table-cell">{location.displayOrder || '-'}</td>
                    <td className="table-cell">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(location)}
                          disabled={deletingLocationId === location.id}
                          className="text-primary-600 hover:text-primary-900 font-medium text-sm"
                          aria-label={`Edit ${location.name}`}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(location.id)}
                          disabled={deletingLocationId === location.id}
                          className="text-red-600 hover:text-red-900 font-medium text-sm flex items-center"
                          aria-label={`Delete ${location.name}`}
                        >
                          {deletingLocationId === location.id ? (
                            <>
                              <LoadingSpinner size="sm" className="mr-1" />
                              Deleting...
                            </>
                          ) : (
                            'Delete'
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add New Location"
        size="md"
      >
        <LocationForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
          isLoading={createMutation.isPending}
        />
      </Modal>

      {/* Edit Modal */}
      {editingLocation && (
        <Modal
          isOpen={!!editingLocation}
          onClose={() => setEditingLocation(null)}
          title="Edit Location"
          size="md"
        >
          <LocationForm
            initialData={{
              name: editingLocation.name,
              country: editingLocation.country,
              city: editingLocation.city,
              locationCode: editingLocation.locationCode,
              displayOrder: String(editingLocation.displayOrder || 0),
            }}
            onSubmit={handleUpdate}
            onCancel={() => setEditingLocation(null)}
            isLoading={updateMutation.isPending}
          />
        </Modal>
      )}
    </div>
  );
};

export default LocationsPage;

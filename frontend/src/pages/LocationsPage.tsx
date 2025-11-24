import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { locationsApi } from '../services/api';
import { QUERY_KEYS } from '../types';
import type { Location, LocationFormData, LocationRequest } from '../types';
import { formatErrorMessage } from '../utils';
import { useEntityCRUD } from '../hooks';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';
import LocationForm from '../components/locations/LocationForm';
import LocationsTable from '../components/locations/LocationsTable';

const LocationsPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Fetch locations
  const {
    data: locations,
    isLoading,
    error,
  } = useQuery({
    queryKey: QUERY_KEYS.LOCATIONS,
    queryFn: locationsApi.getAll,
  });

  // CRUD operations with custom hook
  const {
    isCreateModalOpen,
    editingEntity: editingLocation,
    deletingEntityId: deletingLocationId,
    openCreateModal,
    closeCreateModal,
    openEditModal,
    closeEditModal,
    createMutation,
    updateMutation,
    deleteMutation,
    handleCreate,
    handleUpdate,
    handleDelete,
  } = useEntityCRUD<Location, LocationFormData, LocationRequest, LocationRequest>({
    queryKey: QUERY_KEYS.LOCATIONS,
    api: locationsApi,
    transformCreate: (data): LocationRequest => ({
      name: data.name,
      country: data.country,
      city: data.city,
      locationCode: data.locationCode,
      displayOrder: data.displayOrder ? parseInt(data.displayOrder, 10) : undefined,
    }),
    transformUpdate: (data): LocationRequest => ({
      name: data.name,
      country: data.country,
      city: data.city,
      locationCode: data.locationCode,
      displayOrder: data.displayOrder ? parseInt(data.displayOrder, 10) : undefined,
    }),
  });

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
      <PageHeader
        title="Locations Management"
        description="Manage airports and transportation hubs"
        actionLabel="+ Add Location"
        onAction={openCreateModal}
      />

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
          <EmptyState
            icon="📍"
            title="No Locations Yet"
            description="Get started by creating your first location."
            actionLabel="+ Add Location"
            onAction={openCreateModal}
          />
        ) : (
          <LocationsTable
            locations={locations}
            onEdit={openEditModal}
            onDelete={handleDelete}
            deletingLocationId={deletingLocationId}
          />
        )}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        title="Add New Location"
        size="md"
      >
        <LocationForm
          onSubmit={handleCreate}
          onCancel={closeCreateModal}
          isLoading={createMutation.isPending}
        />
      </Modal>

      {/* Edit Modal */}
      {editingLocation && (
        <Modal
          isOpen={!!editingLocation}
          onClose={closeEditModal}
          title="Edit Location"
          size="md"
        >
          <LocationForm
            initialData={{
              name: editingLocation.name || '',
              country: editingLocation.country || '',
              city: editingLocation.city || '',
              locationCode: editingLocation.locationCode || '',
              displayOrder: editingLocation.displayOrder !== undefined ? String(editingLocation.displayOrder) : '0',
            }}
            onSubmit={(data) => handleUpdate(data, editingLocation.id!)}
            onCancel={closeEditModal}
            isLoading={updateMutation.isPending}
          />
        </Modal>
      )}
    </div>
  );
};

export default LocationsPage;

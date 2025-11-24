import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { transportationsApi } from '../services/api';
import { QUERY_KEYS, TransportationType } from '../types';
import type { Transportation, TransportationFormData } from '../types';
import { formatErrorMessage } from '../utils';
import { useEntityCRUD } from '../hooks';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';
import TransportationForm from '../components/transportations/TransportationForm';
import TransportationsTable from '../components/transportations/TransportationsTable';

const TransportationsPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Fetch transportations
  const {
    data: transportations,
    isLoading,
    error,
  } = useQuery({
    queryKey: QUERY_KEYS.TRANSPORTATIONS,
    queryFn: transportationsApi.getAll,
  });

  // CRUD operations with custom hook
  const {
    isCreateModalOpen,
    editingEntity: editingTransportation,
    deletingEntityId: deletingTransportationId,
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
  } = useEntityCRUD<Transportation, TransportationFormData, TransportationFormData, TransportationFormData>({
    queryKey: QUERY_KEYS.TRANSPORTATIONS,
    api: transportationsApi,
    transformCreate: (data) => ({
      originLocationId: data.originLocationId,
      destinationLocationId: data.destinationLocationId,
      transportationType: data.transportationType as TransportationType,
      operatingDays: data.operatingDays,
    }),
    transformUpdate: (data) => ({
      originLocationId: data.originLocationId,
      destinationLocationId: data.destinationLocationId,
      transportationType: data.transportationType as TransportationType,
      operatingDays: data.operatingDays,
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
          onRetry={() => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TRANSPORTATIONS })}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="Transportations Management"
        description="Manage flight routes and ground transportation"
        actionLabel="+ Add Transportation"
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

      {/* Transportations Table */}
      <div className="card">
        {!transportations || transportations.length === 0 ? (
          <EmptyState
            icon="🚀"
            title="No Transportations Yet"
            description="Get started by creating your first transportation route."
            actionLabel="+ Add Transportation"
            onAction={openCreateModal}
          />
        ) : (
          <TransportationsTable
            transportations={transportations}
            onEdit={openEditModal}
            onDelete={handleDelete}
            deletingTransportationId={deletingTransportationId}
          />
        )}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        title="Add New Transportation"
        size="lg"
      >
        <TransportationForm
          onSubmit={handleCreate}
          onCancel={closeCreateModal}
          isLoading={createMutation.isPending}
        />
      </Modal>

      {/* Edit Modal */}
      {editingTransportation && (
        <Modal
          isOpen={!!editingTransportation}
          onClose={closeEditModal}
          title="Edit Transportation"
          size="lg"
        >
          <TransportationForm
            initialData={{
              originLocationId: editingTransportation.originLocation.id,
              destinationLocationId: editingTransportation.destinationLocation.id,
              transportationType: editingTransportation.transportationType,
              operatingDays: editingTransportation.operatingDays,
            }}
            onSubmit={(data) => handleUpdate(data, editingTransportation.id)}
            onCancel={closeEditModal}
            isLoading={updateMutation.isPending}
          />
        </Modal>
      )}
    </div>
  );
};

export default TransportationsPage;

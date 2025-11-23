import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transportationsApi } from '../services/api';
import { QUERY_KEYS, TransportationType } from '../types';
import type { Transportation, TransportationFormData } from '../types';
import { formatErrorMessage, formatOperatingDays, getTransportationTypeColor, getTransportationTypeIcon } from '../utils';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import Modal from '../components/common/Modal';
import TransportationForm from '../components/transportations/TransportationForm';

const TransportationsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTransportation, setEditingTransportation] = useState<Transportation | null>(null);
  const [deletingTransportationId, setDeletingTransportationId] = useState<string | null>(null);

  // Fetch transportations
  const {
    data: transportations,
    isLoading,
    error,
  } = useQuery({
    queryKey: QUERY_KEYS.TRANSPORTATIONS,
    queryFn: transportationsApi.getAll,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: transportationsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TRANSPORTATIONS });
      setIsCreateModalOpen(false);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TransportationFormData }) =>
      transportationsApi.update(id, {
        originLocationId: data.originLocationId,
        destinationLocationId: data.destinationLocationId,
        transportationType: data.transportationType as TransportationType,
        operatingDays: data.operatingDays,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TRANSPORTATIONS });
      setEditingTransportation(null);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: transportationsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TRANSPORTATIONS });
      setDeletingTransportationId(null);
    },
  });

  const handleCreate = async (data: TransportationFormData) => {
    await createMutation.mutateAsync({
      originLocationId: data.originLocationId,
      destinationLocationId: data.destinationLocationId,
      transportationType: data.transportationType as TransportationType,
      operatingDays: data.operatingDays,
    });
  };

  const handleUpdate = async (data: TransportationFormData) => {
    if (!editingTransportation) return;
    await updateMutation.mutateAsync({ id: editingTransportation.id, data });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this transportation?')) {
      setDeletingTransportationId(id);
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        setDeletingTransportationId(null);
      }
    }
  };

  const handleEdit = (transportation: Transportation) => {
    setEditingTransportation(transportation);
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
          onRetry={() => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TRANSPORTATIONS })}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transportations Management</h1>
          <p className="mt-2 text-gray-600">
            Manage flight routes and ground transportation
          </p>
        </div>
        <button onClick={() => setIsCreateModalOpen(true)} className="btn-primary">
          + Add Transportation
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

      {/* Transportations Table */}
      <div className="card">
        {!transportations || transportations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4" aria-hidden="true">
              🚀
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Transportations Yet
            </h3>
            <p className="text-gray-600 mb-4">
              Get started by creating your first transportation route.
            </p>
            <button onClick={() => setIsCreateModalOpen(true)} className="btn-primary">
              + Add Transportation
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Type</th>
                  <th className="table-header-cell">Route</th>
                  <th className="table-header-cell">Origin</th>
                  <th className="table-header-cell">Destination</th>
                  <th className="table-header-cell">Operating Days</th>
                  <th className="table-header-cell">Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {transportations.map((transportation) => (
                  <tr key={transportation.id}>
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl" aria-hidden="true">
                          {getTransportationTypeIcon(transportation.transportationType)}
                        </span>
                        <span
                          className={`badge ${getTransportationTypeColor(
                            transportation.transportationType
                          )}`}
                        >
                          {transportation.transportationType}
                        </span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="font-mono text-sm">
                        {transportation.originLocation.locationCode} →{' '}
                        {transportation.destinationLocation.locationCode}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div>
                        <div className="font-medium">{transportation.originLocation.name}</div>
                        <div className="text-xs text-gray-500">
                          {transportation.originLocation.city}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div>
                        <div className="font-medium">
                          {transportation.destinationLocation.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {transportation.destinationLocation.city}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="text-sm">
                        {formatOperatingDays(transportation.operatingDays)}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(transportation)}
                          disabled={deletingTransportationId === transportation.id}
                          className="text-primary-600 hover:text-primary-900 font-medium text-sm"
                          aria-label={`Edit transportation from ${transportation.originLocation.name}`}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(transportation.id)}
                          disabled={deletingTransportationId === transportation.id}
                          className="text-red-600 hover:text-red-900 font-medium text-sm flex items-center"
                          aria-label={`Delete transportation from ${transportation.originLocation.name}`}
                        >
                          {deletingTransportationId === transportation.id ? (
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
        title="Add New Transportation"
        size="lg"
      >
        <TransportationForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
          isLoading={createMutation.isPending}
        />
      </Modal>

      {/* Edit Modal */}
      {editingTransportation && (
        <Modal
          isOpen={!!editingTransportation}
          onClose={() => setEditingTransportation(null)}
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
            onSubmit={handleUpdate}
            onCancel={() => setEditingTransportation(null)}
            isLoading={updateMutation.isPending}
          />
        </Modal>
      )}
    </div>
  );
};

export default TransportationsPage;

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Generic CRUD operations hook for entity management
 * Encapsulates common create, update, delete logic with modal state management
 */
export function useEntityCRUD<TEntity, TFormData, TCreateRequest, TUpdateRequest>(config: {
    queryKey: readonly string[];
    api: {
        create: (data: TCreateRequest) => Promise<TEntity>;
        update: (id: string, data: TUpdateRequest) => Promise<TEntity>;
        delete: (id: string) => Promise<void>;
    };
    transformCreate: (data: TFormData) => TCreateRequest;
    transformUpdate: (data: TFormData) => TUpdateRequest;
}) {
    const queryClient = useQueryClient();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingEntity, setEditingEntity] = useState<TEntity | null>(null);
    const [deletingEntityId, setDeletingEntityId] = useState<string | null>(null);

    // Create mutation
    const createMutation = useMutation({
        mutationFn: config.api.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: config.queryKey });
            setIsCreateModalOpen(false);
        },
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: TUpdateRequest }) =>
            config.api.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: config.queryKey });
            setEditingEntity(null);
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: config.api.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: config.queryKey });
            setDeletingEntityId(null);
        },
    });

    const handleCreate = async (data: TFormData) => {
        await createMutation.mutateAsync(config.transformCreate(data));
    };

    const handleUpdate = async (data: TFormData, entityId: string) => {
        await updateMutation.mutateAsync({
            id: entityId,
            data: config.transformUpdate(data),
        });
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            setDeletingEntityId(id);
            try {
                await deleteMutation.mutateAsync(id);
            } catch (error) {
                setDeletingEntityId(null);
            }
        }
    };

    const openCreateModal = () => setIsCreateModalOpen(true);
    const closeCreateModal = () => setIsCreateModalOpen(false);
    const openEditModal = (entity: TEntity) => setEditingEntity(entity);
    const closeEditModal = () => setEditingEntity(null);

    return {
        // Modal state
        isCreateModalOpen,
        editingEntity,
        deletingEntityId,

        // Modal controls
        openCreateModal,
        closeCreateModal,
        openEditModal,
        closeEditModal,

        // Mutations
        createMutation,
        updateMutation,
        deleteMutation,

        // Handlers
        handleCreate,
        handleUpdate,
        handleDelete,
    };
}

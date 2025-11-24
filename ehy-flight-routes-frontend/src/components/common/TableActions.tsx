import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface TableActionsProps {
    onEdit: () => void;
    onDelete: () => void;
    isDeleting?: boolean;
    editLabel?: string;
    deleteLabel?: string;
    itemName?: string;
}

/**
 * Reusable table action buttons for edit and delete operations
 */
export const TableActions: React.FC<TableActionsProps> = ({
    onEdit,
    onDelete,
    isDeleting = false,
    editLabel = 'Edit',
    deleteLabel = 'Delete',
    itemName = 'item',
}) => {
    return (
        <div className="flex space-x-2">
            <button
                onClick={onEdit}
                disabled={isDeleting}
                className="text-primary-600 hover:text-primary-900 font-medium text-sm"
                aria-label={`Edit ${itemName}`}
            >
                {editLabel}
            </button>
            <button
                onClick={onDelete}
                disabled={isDeleting}
                className="text-red-600 hover:text-red-900 font-medium text-sm flex items-center"
                aria-label={`Delete ${itemName}`}
            >
                {isDeleting ? (
                    <>
                        <LoadingSpinner size="sm" className="mr-1" />
                        Deleting...
                    </>
                ) : (
                    deleteLabel
                )}
            </button>
        </div>
    );
};

export default TableActions;

import React from 'react';

interface EmptyStateProps {
    icon: string;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
}

/**
 * Reusable empty state component for when no data is available
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    description,
    actionLabel,
    onAction,
}) => {
    return (
        <div className="text-center py-12">
            <div className="text-6xl mb-4" aria-hidden="true">
                {icon}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 mb-4">{description}</p>
            {actionLabel && onAction && (
                <button onClick={onAction} className="btn-primary">
                    {actionLabel}
                </button>
            )}
        </div>
    );
};

export default EmptyState;

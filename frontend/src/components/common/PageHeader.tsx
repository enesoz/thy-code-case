import React from 'react';

interface PageHeaderProps {
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
}

/**
 * Reusable page header component with title, description, and optional action button
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    description,
    actionLabel,
    onAction,
}) => {
    return (
        <div className="mb-8 flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                <p className="mt-2 text-gray-600">{description}</p>
            </div>
            {actionLabel && onAction && (
                <button onClick={onAction} className="btn-primary">
                    {actionLabel}
                </button>
            )}
        </div>
    );
};

export default PageHeader;

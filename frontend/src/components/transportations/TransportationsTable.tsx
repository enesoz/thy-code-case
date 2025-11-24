import React from 'react';
import type { Transportation } from '../../types';
import TransportationRow from './TransportationRow';

interface TransportationsTableProps {
    transportations: Transportation[];
    onEdit: (transportation: Transportation) => void;
    onDelete: (id: string) => void;
    deletingTransportationId: string | null;
}

/**
 * Table component for displaying transportations
 */
export const TransportationsTable: React.FC<TransportationsTableProps> = ({
    transportations,
    onEdit,
    onDelete,
    deletingTransportationId,
}) => {
    return (
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
                        <TransportationRow
                            key={transportation.id}
                            transportation={transportation}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            isDeleting={deletingTransportationId === transportation.id}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TransportationsTable;

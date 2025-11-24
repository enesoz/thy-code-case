import React from 'react';
import type { Location } from '../../types';
import LocationRow from './LocationRow';

interface LocationsTableProps {
    locations: Location[];
    onEdit: (location: Location) => void;
    onDelete: (id: string) => void;
    deletingLocationId: string | null;
}

/**
 * Table component for displaying locations
 */
export const LocationsTable: React.FC<LocationsTableProps> = ({
    locations,
    onEdit,
    onDelete,
    deletingLocationId,
}) => {
    return (
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
                        <LocationRow
                            key={location.id}
                            location={location}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            isDeleting={deletingLocationId === location.id}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default LocationsTable;

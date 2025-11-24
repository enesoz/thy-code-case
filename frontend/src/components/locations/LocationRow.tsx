import React from 'react';
import type { Location } from '../../types';
import TableActions from '../common/TableActions';

interface LocationRowProps {
    location: Location;
    onEdit: (location: Location) => void;
    onDelete: (id: string) => void;
    isDeleting: boolean;
}

/**
 * Single location table row component
 */
export const LocationRow: React.FC<LocationRowProps> = ({
    location,
    onEdit,
    onDelete,
    isDeleting,
}) => {
    return (
        <tr>
            <td className="table-cell">
                <span className="font-mono font-semibold text-primary-600">
                    {location.locationCode}
                </span>
            </td>
            <td className="table-cell font-medium">{location.name || '-'}</td>
            <td className="table-cell">{location.city}</td>
            <td className="table-cell">{location.country}</td>
            <td className="table-cell">{location.displayOrder || '-'}</td>
            <td className="table-cell">
                <TableActions
                    onEdit={() => onEdit(location)}
                    onDelete={() => onDelete(location.id!)}
                    isDeleting={isDeleting}
                    itemName={location.name || 'location'}
                />
            </td>
        </tr>
    );
};

export default LocationRow;

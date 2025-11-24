import React from 'react';
import type { Transportation } from '../../types';
import { formatOperatingDays, getTransportationTypeColor, getTransportationTypeIcon } from '../../utils';
import TableActions from '../common/TableActions';

interface TransportationRowProps {
    transportation: Transportation;
    onEdit: (transportation: Transportation) => void;
    onDelete: (id: string) => void;
    isDeleting: boolean;
}

/**
 * Single transportation table row component
 */
export const TransportationRow: React.FC<TransportationRowProps> = ({
    transportation,
    onEdit,
    onDelete,
    isDeleting,
}) => {
    return (
        <tr>
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
                <TableActions
                    onEdit={() => onEdit(transportation)}
                    onDelete={() => onDelete(transportation.id)}
                    isDeleting={isDeleting}
                    itemName={`transportation from ${transportation.originLocation.name}`}
                />
            </td>
        </tr>
    );
};

export default TransportationRow;

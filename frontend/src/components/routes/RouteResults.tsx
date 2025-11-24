import React from 'react';
import type { RouteResponse } from '../../types';
import RouteCard from './RouteCard';
import EmptyState from '../common/EmptyState';

interface RouteResultsProps {
    results: RouteResponse[] | null;
}

/**
 * Component to display the list of found routes
 */
export const RouteResults: React.FC<RouteResultsProps> = ({ results }) => {
    if (!results) return null;

    if (results.length === 0) {
        return (
            <div className="card">
                <EmptyState
                    icon="🔍"
                    title="No Routes Found"
                    description="Try adjusting your search criteria or selecting a different date."
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                    Available Routes ({results.length})
                </h2>
            </div>

            {results.map((route, index) => (
                <RouteCard key={index} route={route} index={index} />
            ))}
        </div>
    );
};

export default RouteResults;

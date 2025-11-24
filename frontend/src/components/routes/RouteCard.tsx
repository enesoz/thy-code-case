import React from 'react';
import type { RouteResponse } from '../../types';
import RouteSegment from './RouteSegment';

interface RouteCardProps {
    route: RouteResponse;
    index: number;
}

/**
 * Component to display a complete route with all its segments
 */
export const RouteCard: React.FC<RouteCardProps> = ({ route, index }) => {
    const totalSegments = route.totalSegments ?? 0;
    const segments = route.segments ?? [];

    return (
        <div className="card hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                    Route Option {index + 1}
                </h3>
                <span className="badge badge-info">
                    {totalSegments} segment{totalSegments > 1 ? 's' : ''}
                </span>
            </div>

            {/* Route Segments */}
            <div className="space-y-4">
                {segments.map((segment, segmentIndex) => (
                    <RouteSegment
                        key={segmentIndex}
                        segment={segment}
                        segmentOrder={segment.segmentOrder ?? segmentIndex + 1}
                        isLast={segmentIndex === segments.length - 1}
                    />
                ))}
            </div>
        </div>
    );
};

export default RouteCard;

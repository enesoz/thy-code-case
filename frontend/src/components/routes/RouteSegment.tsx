import React from 'react';
import type { RouteSegment as IRouteSegment } from '../../types';
import { getTransportationTypeColor, getTransportationTypeIcon } from '../../utils';

interface RouteSegmentProps {
    segment: IRouteSegment;
    segmentOrder: number;
    isLast: boolean;
}

/**
 * Component to display a single segment of a route
 */
export const RouteSegment: React.FC<RouteSegmentProps> = ({
    segment,
    segmentOrder,
    isLast,
}) => {
    return (
        <div>
            <div className="flex items-center space-x-4">
                {/* Segment Number */}
                <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-700">
                        {segmentOrder}
                    </span>
                </div>

                {/* Transportation Details */}
                <div className="flex-1 bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <span className="text-2xl" aria-hidden="true">
                                {getTransportationTypeIcon(segment.transportationType!)}
                            </span>
                            <div>
                                <div className="flex items-center space-x-2">
                                    <span className="font-semibold text-gray-900">
                                        {segment.originLocation?.name || 'Unknown'}
                                    </span>
                                    <span className="text-gray-500">→</span>
                                    <span className="font-semibold text-gray-900">
                                        {segment.destinationLocation?.name || 'Unknown'}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2 mt-1">
                                    <span
                                        className={`badge ${getTransportationTypeColor(
                                            segment.transportationType!
                                        )}`}
                                    >
                                        {segment.transportationType}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {segment.originLocation?.locationCode || '???'} →{' '}
                                        {segment.destinationLocation?.locationCode || '???'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Arrow between segments */}
            {!isLast && (
                <div className="flex justify-center py-2">
                    <svg
                        className="w-6 h-6 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 14l-7 7m0 0l-7-7m7 7V3"
                        />
                    </svg>
                </div>
            )}
        </div>
    );
};

export default RouteSegment;

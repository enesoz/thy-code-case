import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { RouteSearchFormData, RouteResponse } from '../types';
import { formatErrorMessage, getTodayString } from '../utils';
import { routesApi } from '../services/api';

/**
 * Custom hook for route search functionality
 * Encapsulates form state, validation, and search logic
 */
export function useRouteSearch() {
    const [searchResults, setSearchResults] = useState<RouteResponse[] | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState<string>('');

    const form = useForm<RouteSearchFormData>({
        defaultValues: {
            originId: '',
            destinationId: '',
            date: getTodayString(),
        },
    });

    const originId = form.watch('originId');
    const destinationId = form.watch('destinationId');

    const onSubmit = async (data: RouteSearchFormData) => {
        if (data.originId === data.destinationId) {
            setSearchError('Origin and destination cannot be the same');
            return;
        }

        setIsSearching(true);
        setSearchError('');
        setSearchResults(null);

        try {
            const results = await routesApi.search({
                originId: data.originId,
                destinationId: data.destinationId,
                date: data.date,
            });
            setSearchResults(results);

            if (results.length === 0) {
                setSearchError('No routes found for the selected criteria');
            }
        } catch (error) {
            setSearchError(formatErrorMessage(error));
        } finally {
            setIsSearching(false);
        }
    };

    const clearResults = () => {
        setSearchResults(null);
        setSearchError('');
    };

    return {
        // Form
        form,
        originId,
        destinationId,

        // Search state
        searchResults,
        isSearching,
        searchError,

        // Actions
        onSubmit,
        clearResults,
    };
}

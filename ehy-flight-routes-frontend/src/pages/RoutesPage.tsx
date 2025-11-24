import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { locationsApi } from '../services/api';
import { QUERY_KEYS } from '../types';
import { formatErrorMessage } from '../utils';
import { useRouteSearch } from '../hooks';
import ErrorMessage from '../components/common/ErrorMessage';
import PageHeader from '../components/common/PageHeader';
import RouteSearchForm from '../components/routes/RouteSearchForm';
import RouteResults from '../components/routes/RouteResults';

const RoutesPage: React.FC = () => {
  // Use custom hook for search logic
  const {
    form,
    originId,
    destinationId,
    searchResults,
    isSearching,
    searchError,
    onSubmit,
  } = useRouteSearch();

  // Fetch locations for dropdowns
  const {
    data: locations,
    isLoading: isLoadingLocations,
    error: locationsError,
  } = useQuery({
    queryKey: QUERY_KEYS.LOCATIONS,
    queryFn: locationsApi.getAll,
  });

  if (locationsError) {
    return (
      <div className="max-w-4xl mx-auto">
        <ErrorMessage
          message={formatErrorMessage(locationsError)}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="Search Flight Routes"
        description="Find the best routes combining flights and ground transportation"
      />

      <RouteSearchForm
        form={form}
        locations={locations}
        isLoadingLocations={isLoadingLocations}
        isSearching={isSearching}
        originId={originId}
        destinationId={destinationId}
        onSubmit={onSubmit}
      />

      {/* Search Error */}
      {searchError && <ErrorMessage message={searchError} className="mb-8" />}

      {/* Search Results */}
      <RouteResults results={searchResults} />
    </div>
  );
};

export default RoutesPage;

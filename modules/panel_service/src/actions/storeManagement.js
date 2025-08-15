import useSWR from "swr";
import { useMemo } from "react";

import {
  fetcher,
  storeManagementEndpoints,
} from "src/lib/storeManagement-axios";

// ----------------------------------------------------------------------

const swrOptions = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  revalidateOnMount: true,
};

// ----------------------------------------------------------------------

export function useStoreManagementGetStore(storeId) {
  let url = storeId ? [storeManagementEndpoints.store.getStore] : "";

  url = url && url.map((u) => u.replace(":storeId", storeId));

  const { data, isLoading, error, isValidating } = useSWR(
    url,
    fetcher,
    swrOptions,
  );

  const memoizedValue = useMemo(
    () => ({
      store: data?.store,
      storeLoading: isLoading,
      storeError: error,
      storeValidating: isValidating,
    }),
    [data?.product, error, isLoading, isValidating],
  );

  return memoizedValue;
}

export function useStoreManagementListStores() {
  const url = [storeManagementEndpoints.store.listStores];

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, {
    ...swrOptions,
    keepPreviousData: true,
  });

  const memoizedValue = useMemo(
    () => ({
      searchResults: data?.stores || [],
      searchLoading: isLoading,
      searchError: error,
      searchValidating: isValidating,
      searchEmpty: !isLoading && !isValidating && !data?.stores?.length,
    }),
    [data?.stores, error, isLoading, isValidating],
  );

  return memoizedValue;
}

export function useStoreManagementGetStoreAssignment(storeAssignmentId) {
  let url = storeAssignmentId
    ? [storeManagementEndpoints.storeAssignment.getStoreAssignment]
    : "";

  url =
    url && url.map((u) => u.replace(":storeAssignmentId", storeAssignmentId));

  const { data, isLoading, error, isValidating } = useSWR(
    url,
    fetcher,
    swrOptions,
  );

  const memoizedValue = useMemo(
    () => ({
      storeassignment: data?.storeAssignment,
      storeassignmentLoading: isLoading,
      storeassignmentError: error,
      storeassignmentValidating: isValidating,
    }),
    [data?.product, error, isLoading, isValidating],
  );

  return memoizedValue;
}

export function useStoreManagementListStoreAssignments() {
  const url = [storeManagementEndpoints.storeAssignment.listStoreAssignments];

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, {
    ...swrOptions,
    keepPreviousData: true,
  });

  const memoizedValue = useMemo(
    () => ({
      searchResults: data?.storeassignments || [],
      searchLoading: isLoading,
      searchError: error,
      searchValidating: isValidating,
      searchEmpty:
        !isLoading && !isValidating && !data?.storeassignments?.length,
    }),
    [data?.storeassignments, error, isLoading, isValidating],
  );

  return memoizedValue;
}

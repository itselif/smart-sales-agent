import useSWR from "swr";
import { useMemo } from "react";

import {
  fetcher,
  inventoryManagementEndpoints,
} from "src/lib/inventoryManagement-axios";

// ----------------------------------------------------------------------

const swrOptions = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  revalidateOnMount: true,
};

// ----------------------------------------------------------------------

export function useInventoryManagementGetInventoryItem(inventoryItemId) {
  let url = inventoryItemId
    ? [inventoryManagementEndpoints.inventoryItem.getInventoryItem]
    : "";

  url = url && url.map((u) => u.replace(":inventoryItemId", inventoryItemId));

  const { data, isLoading, error, isValidating } = useSWR(
    url,
    fetcher,
    swrOptions,
  );

  const memoizedValue = useMemo(
    () => ({
      inventoryitem: data?.inventoryItem,
      inventoryitemLoading: isLoading,
      inventoryitemError: error,
      inventoryitemValidating: isValidating,
    }),
    [data?.product, error, isLoading, isValidating],
  );

  return memoizedValue;
}

export function useInventoryManagementListInventoryItems() {
  const url = [inventoryManagementEndpoints.inventoryItem.listInventoryItems];

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, {
    ...swrOptions,
    keepPreviousData: true,
  });

  const memoizedValue = useMemo(
    () => ({
      searchResults: data?.inventoryitems || [],
      searchLoading: isLoading,
      searchError: error,
      searchValidating: isValidating,
      searchEmpty: !isLoading && !isValidating && !data?.inventoryitems?.length,
    }),
    [data?.inventoryitems, error, isLoading, isValidating],
  );

  return memoizedValue;
}

export function useInventoryManagementGetInventoryMovement(
  inventoryMovementId,
) {
  let url = inventoryMovementId
    ? [inventoryManagementEndpoints.inventoryMovement.getInventoryMovement]
    : "";

  url =
    url &&
    url.map((u) => u.replace(":inventoryMovementId", inventoryMovementId));

  const { data, isLoading, error, isValidating } = useSWR(
    url,
    fetcher,
    swrOptions,
  );

  const memoizedValue = useMemo(
    () => ({
      inventorymovement: data?.inventoryMovement,
      inventorymovementLoading: isLoading,
      inventorymovementError: error,
      inventorymovementValidating: isValidating,
    }),
    [data?.product, error, isLoading, isValidating],
  );

  return memoizedValue;
}

export function useInventoryManagementListInventoryMovements() {
  const url = [
    inventoryManagementEndpoints.inventoryMovement.listInventoryMovements,
  ];

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, {
    ...swrOptions,
    keepPreviousData: true,
  });

  const memoizedValue = useMemo(
    () => ({
      searchResults: data?.inventorymovements || [],
      searchLoading: isLoading,
      searchError: error,
      searchValidating: isValidating,
      searchEmpty:
        !isLoading && !isValidating && !data?.inventorymovements?.length,
    }),
    [data?.inventorymovements, error, isLoading, isValidating],
  );

  return memoizedValue;
}

export function useInventoryManagementGetLowStockAlert(lowStockAlertId) {
  let url = lowStockAlertId
    ? [inventoryManagementEndpoints.lowStockAlert.getLowStockAlert]
    : "";

  url = url && url.map((u) => u.replace(":lowStockAlertId", lowStockAlertId));

  const { data, isLoading, error, isValidating } = useSWR(
    url,
    fetcher,
    swrOptions,
  );

  const memoizedValue = useMemo(
    () => ({
      lowstockalert: data?.lowStockAlert,
      lowstockalertLoading: isLoading,
      lowstockalertError: error,
      lowstockalertValidating: isValidating,
    }),
    [data?.product, error, isLoading, isValidating],
  );

  return memoizedValue;
}

export function useInventoryManagementListLowStockAlerts() {
  const url = [inventoryManagementEndpoints.lowStockAlert.listLowStockAlerts];

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, {
    ...swrOptions,
    keepPreviousData: true,
  });

  const memoizedValue = useMemo(
    () => ({
      searchResults: data?.lowstockalerts || [],
      searchLoading: isLoading,
      searchError: error,
      searchValidating: isValidating,
      searchEmpty: !isLoading && !isValidating && !data?.lowstockalerts?.length,
    }),
    [data?.lowstockalerts, error, isLoading, isValidating],
  );

  return memoizedValue;
}

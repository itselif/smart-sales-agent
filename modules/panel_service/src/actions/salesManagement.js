import useSWR from "swr";
import { useMemo } from "react";

import {
  fetcher,
  salesManagementEndpoints,
} from "src/lib/salesManagement-axios";

// ----------------------------------------------------------------------

const swrOptions = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  revalidateOnMount: true,
};

// ----------------------------------------------------------------------

export function useSalesManagementGetSaleTransaction(saleTransactionId) {
  let url = saleTransactionId
    ? [salesManagementEndpoints.saleTransaction.getSaleTransaction]
    : "";

  url =
    url && url.map((u) => u.replace(":saleTransactionId", saleTransactionId));

  const { data, isLoading, error, isValidating } = useSWR(
    url,
    fetcher,
    swrOptions,
  );

  const memoizedValue = useMemo(
    () => ({
      saletransaction: data?.saleTransaction,
      saletransactionLoading: isLoading,
      saletransactionError: error,
      saletransactionValidating: isValidating,
    }),
    [data?.product, error, isLoading, isValidating],
  );

  return memoizedValue;
}

export function useSalesManagementListSaleTransactions() {
  const url = [salesManagementEndpoints.saleTransaction.listSaleTransactions];

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, {
    ...swrOptions,
    keepPreviousData: true,
  });

  const memoizedValue = useMemo(
    () => ({
      searchResults: data?.saletransactions || [],
      searchLoading: isLoading,
      searchError: error,
      searchValidating: isValidating,
      searchEmpty:
        !isLoading && !isValidating && !data?.saletransactions?.length,
    }),
    [data?.saletransactions, error, isLoading, isValidating],
  );

  return memoizedValue;
}

export function useSalesManagementGetSaleTransactionHistory(
  saleTransactionHistoryId,
) {
  let url = saleTransactionHistoryId
    ? [
        salesManagementEndpoints.saleTransactionHistory
          .getSaleTransactionHistory,
      ]
    : "";

  url =
    url &&
    url.map((u) =>
      u.replace(":saleTransactionHistoryId", saleTransactionHistoryId),
    );

  const { data, isLoading, error, isValidating } = useSWR(
    url,
    fetcher,
    swrOptions,
  );

  const memoizedValue = useMemo(
    () => ({
      saletransactionhistory: data?.saleTransactionHistory,
      saletransactionhistoryLoading: isLoading,
      saletransactionhistoryError: error,
      saletransactionhistoryValidating: isValidating,
    }),
    [data?.product, error, isLoading, isValidating],
  );

  return memoizedValue;
}

export function useSalesManagementListSaleTransactionHistories() {
  const url = [
    salesManagementEndpoints.saleTransactionHistory
      .listSaleTransactionHistories,
  ];

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, {
    ...swrOptions,
    keepPreviousData: true,
  });

  const memoizedValue = useMemo(
    () => ({
      searchResults: data?.saletransactionhistories || [],
      searchLoading: isLoading,
      searchError: error,
      searchValidating: isValidating,
      searchEmpty:
        !isLoading && !isValidating && !data?.saletransactionhistories?.length,
    }),
    [data?.saletransactionhistories, error, isLoading, isValidating],
  );

  return memoizedValue;
}

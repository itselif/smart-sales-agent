import useSWR from "swr";
import { useMemo } from "react";

import { fetcher, observabilityEndpoints } from "src/lib/observability-axios";

// ----------------------------------------------------------------------

const swrOptions = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  revalidateOnMount: true,
};

// ----------------------------------------------------------------------

export function useObservabilityGetAuditLog(auditLogId) {
  let url = auditLogId ? [observabilityEndpoints.auditLog.getAuditLog] : "";

  url = url && url.map((u) => u.replace(":auditLogId", auditLogId));

  const { data, isLoading, error, isValidating } = useSWR(
    url,
    fetcher,
    swrOptions,
  );

  const memoizedValue = useMemo(
    () => ({
      auditlog: data?.auditLog,
      auditlogLoading: isLoading,
      auditlogError: error,
      auditlogValidating: isValidating,
    }),
    [data?.product, error, isLoading, isValidating],
  );

  return memoizedValue;
}

export function useObservabilityListAuditLogs() {
  const url = [observabilityEndpoints.auditLog.listAuditLogs];

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, {
    ...swrOptions,
    keepPreviousData: true,
  });

  const memoizedValue = useMemo(
    () => ({
      searchResults: data?.auditlogs || [],
      searchLoading: isLoading,
      searchError: error,
      searchValidating: isValidating,
      searchEmpty: !isLoading && !isValidating && !data?.auditlogs?.length,
    }),
    [data?.auditlogs, error, isLoading, isValidating],
  );

  return memoizedValue;
}

export function useObservabilityGetMetricDatapoint(metricDatapointId) {
  let url = metricDatapointId
    ? [observabilityEndpoints.metricDatapoint.getMetricDatapoint]
    : "";

  url =
    url && url.map((u) => u.replace(":metricDatapointId", metricDatapointId));

  const { data, isLoading, error, isValidating } = useSWR(
    url,
    fetcher,
    swrOptions,
  );

  const memoizedValue = useMemo(
    () => ({
      metricdatapoint: data?.metricDatapoint,
      metricdatapointLoading: isLoading,
      metricdatapointError: error,
      metricdatapointValidating: isValidating,
    }),
    [data?.product, error, isLoading, isValidating],
  );

  return memoizedValue;
}

export function useObservabilityListMetricDatapoints() {
  const url = [observabilityEndpoints.metricDatapoint.listMetricDatapoints];

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, {
    ...swrOptions,
    keepPreviousData: true,
  });

  const memoizedValue = useMemo(
    () => ({
      searchResults: data?.metricdatapoints || [],
      searchLoading: isLoading,
      searchError: error,
      searchValidating: isValidating,
      searchEmpty:
        !isLoading && !isValidating && !data?.metricdatapoints?.length,
    }),
    [data?.metricdatapoints, error, isLoading, isValidating],
  );

  return memoizedValue;
}

export function useObservabilityGetAnomalyEvent(anomalyEventId) {
  let url = anomalyEventId
    ? [observabilityEndpoints.anomalyEvent.getAnomalyEvent]
    : "";

  url = url && url.map((u) => u.replace(":anomalyEventId", anomalyEventId));

  const { data, isLoading, error, isValidating } = useSWR(
    url,
    fetcher,
    swrOptions,
  );

  const memoizedValue = useMemo(
    () => ({
      anomalyevent: data?.anomalyEvent,
      anomalyeventLoading: isLoading,
      anomalyeventError: error,
      anomalyeventValidating: isValidating,
    }),
    [data?.product, error, isLoading, isValidating],
  );

  return memoizedValue;
}

export function useObservabilityListAnomalyEvents() {
  const url = [observabilityEndpoints.anomalyEvent.listAnomalyEvents];

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, {
    ...swrOptions,
    keepPreviousData: true,
  });

  const memoizedValue = useMemo(
    () => ({
      searchResults: data?.anomalyevents || [],
      searchLoading: isLoading,
      searchError: error,
      searchValidating: isValidating,
      searchEmpty: !isLoading && !isValidating && !data?.anomalyevents?.length,
    }),
    [data?.anomalyevents, error, isLoading, isValidating],
  );

  return memoizedValue;
}

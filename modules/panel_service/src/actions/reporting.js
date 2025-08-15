import useSWR from "swr";
import { useMemo } from "react";

import { fetcher, reportingEndpoints } from "src/lib/reporting-axios";

// ----------------------------------------------------------------------

const swrOptions = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  revalidateOnMount: true,
};

// ----------------------------------------------------------------------

export function useReportingGetReportRequest(reportRequestId) {
  let url = reportRequestId
    ? [reportingEndpoints.reportRequest.getReportRequest]
    : "";

  url = url && url.map((u) => u.replace(":reportRequestId", reportRequestId));

  const { data, isLoading, error, isValidating } = useSWR(
    url,
    fetcher,
    swrOptions,
  );

  const memoizedValue = useMemo(
    () => ({
      reportrequest: data?.reportRequest,
      reportrequestLoading: isLoading,
      reportrequestError: error,
      reportrequestValidating: isValidating,
    }),
    [data?.product, error, isLoading, isValidating],
  );

  return memoizedValue;
}

export function useReportingListReportRequests() {
  const url = [reportingEndpoints.reportRequest.listReportRequests];

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, {
    ...swrOptions,
    keepPreviousData: true,
  });

  const memoizedValue = useMemo(
    () => ({
      searchResults: data?.reportrequests || [],
      searchLoading: isLoading,
      searchError: error,
      searchValidating: isValidating,
      searchEmpty: !isLoading && !isValidating && !data?.reportrequests?.length,
    }),
    [data?.reportrequests, error, isLoading, isValidating],
  );

  return memoizedValue;
}

export function useReportingGetReportFile(reportFileId) {
  let url = reportFileId ? [reportingEndpoints.reportFile.getReportFile] : "";

  url = url && url.map((u) => u.replace(":reportFileId", reportFileId));

  const { data, isLoading, error, isValidating } = useSWR(
    url,
    fetcher,
    swrOptions,
  );

  const memoizedValue = useMemo(
    () => ({
      reportfile: data?.reportFile,
      reportfileLoading: isLoading,
      reportfileError: error,
      reportfileValidating: isValidating,
    }),
    [data?.product, error, isLoading, isValidating],
  );

  return memoizedValue;
}

export function useReportingListReportFiles() {
  const url = [reportingEndpoints.reportFile.listReportFiles];

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, {
    ...swrOptions,
    keepPreviousData: true,
  });

  const memoizedValue = useMemo(
    () => ({
      searchResults: data?.reportfiles || [],
      searchLoading: isLoading,
      searchError: error,
      searchValidating: isValidating,
      searchEmpty: !isLoading && !isValidating && !data?.reportfiles?.length,
    }),
    [data?.reportfiles, error, isLoading, isValidating],
  );

  return memoizedValue;
}

export function useReportingGetReportPolicy(reportPolicyId) {
  let url = reportPolicyId
    ? [reportingEndpoints.reportPolicy.getReportPolicy]
    : "";

  url = url && url.map((u) => u.replace(":reportPolicyId", reportPolicyId));

  const { data, isLoading, error, isValidating } = useSWR(
    url,
    fetcher,
    swrOptions,
  );

  const memoizedValue = useMemo(
    () => ({
      reportpolicy: data?.reportPolicy,
      reportpolicyLoading: isLoading,
      reportpolicyError: error,
      reportpolicyValidating: isValidating,
    }),
    [data?.product, error, isLoading, isValidating],
  );

  return memoizedValue;
}

export function useReportingListReportPolicies() {
  const url = [reportingEndpoints.reportPolicy.listReportPolicies];

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, {
    ...swrOptions,
    keepPreviousData: true,
  });

  const memoizedValue = useMemo(
    () => ({
      searchResults: data?.reportpolicies || [],
      searchLoading: isLoading,
      searchError: error,
      searchValidating: isValidating,
      searchEmpty: !isLoading && !isValidating && !data?.reportpolicies?.length,
    }),
    [data?.reportpolicies, error, isLoading, isValidating],
  );

  return memoizedValue;
}

import useSWR from "swr";
import { useMemo } from "react";

import { fetcher, platformAdminEndpoints } from "src/lib/platformAdmin-axios";

// ----------------------------------------------------------------------

const swrOptions = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  revalidateOnMount: true,
};

// ----------------------------------------------------------------------

export function usePlatformAdminGetOpenApiSchema(openApiSchemaId) {
  let url = openApiSchemaId
    ? [platformAdminEndpoints.openApiSchema.getOpenApiSchema]
    : "";

  url = url && url.map((u) => u.replace(":openApiSchemaId", openApiSchemaId));

  const { data, isLoading, error, isValidating } = useSWR(
    url,
    fetcher,
    swrOptions,
  );

  const memoizedValue = useMemo(
    () => ({
      openapischema: data?.openApiSchema,
      openapischemaLoading: isLoading,
      openapischemaError: error,
      openapischemaValidating: isValidating,
    }),
    [data?.product, error, isLoading, isValidating],
  );

  return memoizedValue;
}

export function usePlatformAdminListOpenApiSchemas() {
  const url = [platformAdminEndpoints.openApiSchema.listOpenApiSchemas];

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, {
    ...swrOptions,
    keepPreviousData: true,
  });

  const memoizedValue = useMemo(
    () => ({
      searchResults: data?.openapischemas || [],
      searchLoading: isLoading,
      searchError: error,
      searchValidating: isValidating,
      searchEmpty: !isLoading && !isValidating && !data?.openapischemas?.length,
    }),
    [data?.openapischemas, error, isLoading, isValidating],
  );

  return memoizedValue;
}

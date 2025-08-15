import useSWR from "swr";
import { useMemo } from "react";

import { fetcher, authEndpoints } from "src/lib/auth-axios";

// ----------------------------------------------------------------------

const swrOptions = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  revalidateOnMount: true,
};

// ----------------------------------------------------------------------

export function useAuthGetUser(userId) {
  let url = userId ? [authEndpoints.user.getUser] : "";

  url = url && url.map((u) => u.replace(":userId", userId));

  const { data, isLoading, error, isValidating } = useSWR(
    url,
    fetcher,
    swrOptions,
  );

  const memoizedValue = useMemo(
    () => ({
      user: data?.user,
      userLoading: isLoading,
      userError: error,
      userValidating: isValidating,
    }),
    [data?.product, error, isLoading, isValidating],
  );

  return memoizedValue;
}

export function useAuthListUsers() {
  const url = [authEndpoints.user.listUsers];

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, {
    ...swrOptions,
    keepPreviousData: true,
  });

  const memoizedValue = useMemo(
    () => ({
      searchResults: data?.users || [],
      searchLoading: isLoading,
      searchError: error,
      searchValidating: isValidating,
      searchEmpty: !isLoading && !isValidating && !data?.users?.length,
    }),
    [data?.users, error, isLoading, isValidating],
  );

  return memoizedValue;
}

export function useAuthGetGroup(userGroupId) {
  let url = userGroupId ? [authEndpoints.userGroup.getGroup] : "";

  url = url && url.map((u) => u.replace(":userGroupId", userGroupId));

  const { data, isLoading, error, isValidating } = useSWR(
    url,
    fetcher,
    swrOptions,
  );

  const memoizedValue = useMemo(
    () => ({
      group: data?.userGroup,
      groupLoading: isLoading,
      groupError: error,
      groupValidating: isValidating,
    }),
    [data?.product, error, isLoading, isValidating],
  );

  return memoizedValue;
}

export function useAuthListGroups() {
  const url = [authEndpoints.userGroup.listGroups];

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, {
    ...swrOptions,
    keepPreviousData: true,
  });

  const memoizedValue = useMemo(
    () => ({
      searchResults: data?.usergroups || [],
      searchLoading: isLoading,
      searchError: error,
      searchValidating: isValidating,
      searchEmpty: !isLoading && !isValidating && !data?.usergroups?.length,
    }),
    [data?.usergroups, error, isLoading, isValidating],
  );

  return memoizedValue;
}

export function useAuthGetGroupMember(userGroupMemberId) {
  let url = userGroupMemberId
    ? [authEndpoints.userGroupMember.getGroupMember]
    : "";

  url =
    url && url.map((u) => u.replace(":userGroupMemberId", userGroupMemberId));

  const { data, isLoading, error, isValidating } = useSWR(
    url,
    fetcher,
    swrOptions,
  );

  const memoizedValue = useMemo(
    () => ({
      groupmember: data?.userGroupMember,
      groupmemberLoading: isLoading,
      groupmemberError: error,
      groupmemberValidating: isValidating,
    }),
    [data?.product, error, isLoading, isValidating],
  );

  return memoizedValue;
}

export function useAuthListGroupMembers(query) {
  const url = query
    ? [authEndpoints.userGroupMember.listGroupMembers, { params: { query } }]
    : "";

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, {
    ...swrOptions,
    keepPreviousData: true,
  });

  const memoizedValue = useMemo(
    () => ({
      searchResults: data?.usergroupmembers || [],
      searchLoading: isLoading,
      searchError: error,
      searchValidating: isValidating,
      searchEmpty:
        !isLoading && !isValidating && !data?.usergroupmembers?.length,
    }),
    [data?.usergroupmembers, error, isLoading, isValidating],
  );

  return memoizedValue;
}

export function useAuthGetStore(storeId) {
  let url = storeId ? [authEndpoints.store.getStore] : "";

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

export function useAuthGetStoreByCodename(codename) {
  let url = codename ? [authEndpoints.store.getStoreByCodename] : "";

  url = url && url.map((u) => u.replace(":codename", codename));

  const { data, isLoading, error, isValidating } = useSWR(
    url,
    fetcher,
    swrOptions,
  );

  const memoizedValue = useMemo(
    () => ({
      storebycodename: data?.store,
      storebycodenameLoading: isLoading,
      storebycodenameError: error,
      storebycodenameValidating: isValidating,
    }),
    [data?.product, error, isLoading, isValidating],
  );

  return memoizedValue;
}

export function useAuthListRegisteredStores() {
  const url = [authEndpoints.store.listRegisteredStores];

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

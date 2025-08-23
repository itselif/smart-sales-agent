// src/lib/hooks.ts
import { useQuery, useMutation } from '@tanstack/react-query';
import { getSales, getStock, buildReport, orchestrate } from './api';

// Ortak query ayarları
const commonQueryOpts = {
  staleTime: 60_000,           // 1 dk taze say
  gcTime: 5 * 60_000,          // 5 dk sonra cache'ten at
  refetchOnWindowFocus: false, // odağa gelince yeniden fetch etme
  retry: false as const,       // hatada tekrar deneme
};

export const useSales = (storeId: string) =>
  useQuery({
    queryKey: ['sales', storeId],
    queryFn: () => getSales(storeId),
    enabled: !!storeId,
    ...commonQueryOpts,
    select: (data) => data, // istersen burada shape dönüştür
  });

export const useStock = (storeId: string) =>
  useQuery({
    queryKey: ['stock', storeId],
    queryFn: () => getStock(storeId),
    enabled: !!storeId,
    ...commonQueryOpts,
    select: (data) => data,
  });

export const useBuildReport = () =>
  useMutation({
    mutationFn: ({ storeId, request }: { storeId: string; request?: string }) =>
      buildReport(storeId, request),
    retry: false,
  });

export const useOrchestrate = () =>
  useMutation({
    mutationFn: ({ query, storeId }: { query: string; storeId: string }) =>
      orchestrate(query, storeId),
    retry: false,
  });
 
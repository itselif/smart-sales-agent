import { useQuery, useMutation } from '@tanstack/react-query';
import { getSales, getStock, buildReport, orchestrate } from './api';

export const useSales = (storeId: string) =>
  useQuery({ 
    queryKey: ['sales', storeId], 
    queryFn: () => getSales(storeId), 
    enabled: !!storeId 
  });

export const useStock = (storeId: string) =>
  useQuery({ 
    queryKey: ['stock', storeId], 
    queryFn: () => getStock(storeId), 
    enabled: !!storeId 
  });

export const useBuildReport = () =>
  useMutation({
    mutationFn: ({ storeId, request }: { storeId: string; request?: string }) =>
      buildReport(storeId, request),
  });

export const useOrchestrate = () =>
  useMutation({
    mutationFn: ({ query, storeId }: { query: string; storeId: string }) =>
      orchestrate(query, storeId),
  });
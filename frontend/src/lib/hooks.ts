import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  getSales, 
  getStock, 
  buildReport, 
  orchestrate,
  getStores,
  listItems,
  createItem,
  updateItem,
  deleteItem,
  getAvailability,
  createRequest,
  listRequests,
  updateRequest,
  transferStock,
  listAlerts,
  getMovements,
  createMovement,
  type InventoryItem,
  type StockRequest,
  type StockMovement,
} from './api';

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

// Stores hooks
export const useStores = () =>
  useQuery({
    queryKey: ['stores'],
    queryFn: getStores,
    ...commonQueryOpts,
  });

// Enhanced Inventory hooks
export const useItems = (params: {
  storeId: string;
  q?: string;
  page?: number;
  size?: number;
  category?: string;
  isActive?: boolean;
  sort?: string;
}) => {
  return useQuery({
    queryKey: ['items', params.storeId, params],
    queryFn: () => listItems(params),
    enabled: !!params.storeId,
    ...commonQueryOpts,
  });
};

export const useCreateItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: createItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast({
        title: 'Başarılı',
        description: 'Ürün başarıyla oluşturuldu.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'Ürün oluşturulamadı.',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InventoryItem> }) =>
      updateItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast({
        title: 'Başarılı',
        description: 'Ürün başarıyla güncellendi.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'Ürün güncellenemedi.',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: deleteItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast({
        title: 'Başarılı',
        description: 'Ürün başarıyla silindi.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'Ürün silinemedi.',
        variant: 'destructive',
      });
    },
  });
};

// Availability hook
export const useAvailability = (sku: string) => {
  return useQuery({
    queryKey: ['availability', sku],
    queryFn: () => getAvailability(sku),
    enabled: !!sku,
    ...commonQueryOpts,
  });
};

// Request hooks
export const useCreateRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: createRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      toast({
        title: 'Başarılı',
        description: 'Talep başarıyla oluşturuldu.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'Talep oluşturulamadı.',
        variant: 'destructive',
      });
    },
  });
};

export const useListRequests = (params: { storeId: string; role: "requester" | "target" | "all" }) => {
  return useQuery({
    queryKey: ['requests', params.storeId, params.role],
    queryFn: () => listRequests(params),
    enabled: !!params.storeId,
    ...commonQueryOpts,
  });
};

export const useUpdateRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status: "approved" | "rejected" | "fulfilled"; decisionNote?: string } }) =>
      updateRequest(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      toast({
        title: 'Başarılı',
        description: 'Talep durumu güncellendi.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'Talep güncellenemedi.',
        variant: 'destructive',
      });
    },
  });
};

// Transfer hook
export const useTransferStock = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: transferStock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast({
        title: 'Başarılı',
        description: 'Transfer başarıyla tamamlandı.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'Transfer başarısız.',
        variant: 'destructive',
      });
    },
  });
};

// Alerts hook
export const useAlerts = (params: { storeId: string; onlyOpen?: boolean }) => {
  return useQuery({
    queryKey: ['alerts', params.storeId, params.onlyOpen],
    queryFn: () => listAlerts(params),
    enabled: !!params.storeId,
    ...commonQueryOpts,
  });
};

// Movements hooks
export const useMovements = (params: {
  storeId: string;
  itemId?: string;
  type?: "IN" | "OUT";
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  size?: number;
  sort?: string;
}) => {
  return useQuery({
    queryKey: ['movements', params.storeId, params],
    queryFn: () => getMovements(params),
    enabled: !!params.storeId,
    ...commonQueryOpts,
  });
};

export const useCreateMovement = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: createMovement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast({
        title: 'Başarılı',
        description: 'Stok hareketi başarıyla oluşturuldu.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'Stok hareketi oluşturulamadı.',
        variant: 'destructive',
      });
    },
  });
};
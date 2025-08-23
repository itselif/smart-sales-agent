import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  listItems, 
  createItem, 
  updateItem, 
  deleteItem,
  listMovements,
  createMovement,
  listAlerts,
  getMe,
  type ListParams,
  type MoveParams,
  type CreateItemData,
  type CreateMovementData,
  type InventoryItem
} from '@/services/inventory';

// Items Queries
export const useItems = (params: ListParams) => {
  return useQuery({
    queryKey: ['items', params.storeId, params],
    queryFn: () => listItems(params),
    enabled: !!params.storeId,
  });
};

export const useCreateItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: createItem,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
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

// Movements Queries
export const useMovements = (params: MoveParams) => {
  return useQuery({
    queryKey: ['movements', params.storeId, params],
    queryFn: () => listMovements(params),
    enabled: !!params.storeId,
  });
};

export const useCreateMovement = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: createMovement,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast({
        title: 'Başarılı',
        description: 'Stok hareketi başarıyla oluşturuldu.',
      });
    },
    onError: (error: any) => {
      let message = 'Stok hareketi oluşturulamadı.';
      if (error.status === 409) {
        message = 'Yetersiz stok.';
      }
      toast({
        title: 'Hata',
        description: error.message || message,
        variant: 'destructive',
      });
    },
  });
};

// Alerts Query
export const useAlerts = (params: { storeId: string; onlyOpen?: boolean }) => {
  return useQuery({
    queryKey: ['alerts', params.storeId, params],
    queryFn: () => listAlerts(params),
    enabled: !!params.storeId,
  });
};

// Auth Query
export const useMe = () => {
  return useQuery({
    queryKey: ['me'],
    queryFn: getMe,
  });
};
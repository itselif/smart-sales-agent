import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StoreSelector } from '@/components/StoreSelector';
import { AvailabilityPanel } from './AvailabilityPanel';
import { useCreateRequest, useAvailability } from '@/lib/hooks';
import { useUserStore } from '@/lib/stores';
import type { InventoryItem } from '@/lib/api';

const requestSchema = z.object({
  quantity: z.coerce.number().int().min(1, 'Miktar en az 1 olmalıdır'),
  targetStoreId: z.string().optional(),
  note: z.string().optional(),
});

type RequestFormData = z.infer<typeof requestSchema>;

interface RequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItem;
}

export function RequestModal({ open, onOpenChange, item }: RequestModalProps) {
  const { currentStoreId } = useUserStore();
  const createRequestMutation = useCreateRequest();
  const [showAvailability, setShowAvailability] = useState(false);
  
  // Ürünün stok durumunu al
  const { data: availability = [], isLoading: isLoadingAvailability } = useAvailability(item.sku);
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      quantity: 1,
      targetStoreId: '',
      note: '',
    },
  });

  const targetStoreId = watch('targetStoreId');

  // Sadece stoku olan mağazaları filtrele
  const availableStoreIds = useMemo(() => {
    return availability
      .filter(store => store.stock > 0)
      .map(store => store.storeId);
  }, [availability]);

  const onSubmit = async (data: RequestFormData) => {
    if (!currentStoreId) return;

    try {
      await createRequestMutation.mutateAsync({
        requesterStoreId: currentStoreId,
        targetStoreId: data.targetStoreId || undefined,
        itemId: item.id,
        quantity: data.quantity,
        note: data.note || undefined,
      });
      onOpenChange(false);
      reset();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    reset();
    setShowAvailability(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ürün Talep Et</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-3 bg-muted rounded-lg">
            <p className="font-medium">{item.name}</p>
            <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
            <p className="text-sm text-muted-foreground">Mevcut Stok: {item.stock}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Talep Miktarı *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                {...register('quantity')}
                placeholder="1"
              />
              {errors.quantity && (
                <p className="text-sm text-destructive">{errors.quantity.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Talep Edilecek Mağaza (Opsiyonel)</Label>
              <StoreSelector
                value={targetStoreId}
                onChange={(value) => setValue('targetStoreId', value)}
                excludeStoreId={currentStoreId}
                allowedStoreIds={availableStoreIds}
              />
              <p className="text-xs text-muted-foreground">
                {isLoadingAvailability 
                  ? "Stok durumu kontrol ediliyor..." 
                  : availableStoreIds.length > 0 
                    ? "Sadece stoku olan mağazalar gösteriliyor." 
                    : "Bu ürün hiçbir mağazada stokta bulunmuyor."
                }
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Not</Label>
              <Textarea
                id="note"
                {...register('note')}
                placeholder="Talep hakkında not ekleyin..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAvailability(!showAvailability)}
                className="w-full"
              >
                {showAvailability ? 'Mağaza Stoklarını Gizle' : 'Hangi Mağazada Var?'}
              </Button>
              
              {showAvailability && (
                <AvailabilityPanel sku={item.sku} />
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
              >
                İptal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || createRequestMutation.isPending}
              >
                Talep Gönder
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
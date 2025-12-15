import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateMovement, useItems } from "@/hooks/useInventoryQueries";
import { useAppStore } from "@/lib/stores";
import { useToast } from "@/hooks/use-toast";
import type { InventoryItem } from "@/services/inventory";

const transferSchema = z.object({
  itemId: z.string().min(1, "Ürün seçimi zorunludur"),
  targetStoreId: z.string().min(1, "Talep edilecek mağaza seçimi zorunludur"),
  quantity: z.coerce.number().int().positive("Miktar pozitif bir sayı olmalıdır"),
  note: z.string().max(200, "Not 200 karakterden fazla olamaz").optional(),
});

type TransferFormData = z.infer<typeof transferSchema>;

interface StoreTransferFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preSelectedItem?: InventoryItem | null;
}

export function StoreTransferForm({ open, onOpenChange, preSelectedItem }: StoreTransferFormProps) {
  const { currentStoreId, stores } = useAppStore();
  const createMutation = useCreateMovement();
  const { toast } = useToast();

  const { data: itemsData } = useItems({
    storeId: currentStoreId || "",
    isActive: true,
    size: 1000,
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
  });

  const selectedItem = watch("itemId");
  const selectedTarget = watch("targetStoreId");

  const currentItem = useMemo(
    () => itemsData?.items.find((item) => item.id === selectedItem),
    [itemsData?.items, selectedItem]
  );

  const targetStores = useMemo(
    () => (stores || []).filter((s) => s.id !== currentStoreId),
    [stores, currentStoreId]
  );

  const onSubmit = async (data: TransferFormData) => {
    if (!currentStoreId) return;

    try {
      // 1) Çıkış: mevcut mağazadan
      await createMutation.mutateAsync({
        storeId: currentStoreId,
        itemId: data.itemId,
        type: "OUT",
        quantity: data.quantity,
        reason: "STORE_TRANSFER_OUT",
        note: `${targetStores.find((s) => s.id === data.targetStoreId)?.name || "Talep edilecek mağaza"} mağazasına transfer. ${data.note || ""}`.trim(),
        targetStoreId: data.targetStoreId,
      });

      // 2) Giriş: hedef mağazaya
      await createMutation.mutateAsync({
        storeId: data.targetStoreId,
        itemId: data.itemId,
        type: "IN",
        quantity: data.quantity,
        reason: "STORE_TRANSFER_IN",
        note: `${stores?.find((s) => s.id === currentStoreId)?.name || "Kaynak mağaza"} mağazasından transfer. ${data.note || ""}`.trim(),
        targetStoreId: currentStoreId,
      });

      toast({ title: "Başarılı", description: "Mağaza transferi başarıyla oluşturuldu." });
      onOpenChange(false);
      reset();
    } catch {
      // hata toast’ı hook tarafından yönetiliyor
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mağazalar Arası Transfer</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Ürün */}
          <div className="space-y-2">
            <Label htmlFor="itemId">Ürün *</Label>
            <Select
              value={selectedItem || ""}
              onValueChange={(value) => setValue("itemId", value, { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Ürün seçin" />
              </SelectTrigger>
              <SelectContent>
                {(itemsData?.items ?? []).map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name} ({item.sku}) - Stok: {item.stock}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.itemId && <p className="text-sm text-destructive">{errors.itemId.message}</p>}
          </div>

          {/* Talep edilecek mağaza */}
          <div className="space-y-2">
            <Label htmlFor="targetStoreId">Talep Edilecek Mağaza *</Label>
            <Select
              value={selectedTarget || ""}
              onValueChange={(value) => setValue("targetStoreId", value, { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Talep edilecek mağaza seçin" />
              </SelectTrigger>
              <SelectContent>
                {targetStores.map((store) => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.name} - {store.city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.targetStoreId && (
              <p className="text-sm text-destructive">{errors.targetStoreId.message}</p>
            )}
          </div>

          {/* Miktar */}
          <div className="space-y-2">
            <Label htmlFor="quantity">Miktar *</Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              max={currentItem?.stock || undefined}
              placeholder="0"
              {...register("quantity")}
            />
            {currentItem && (
              <p className="text-xs text-muted-foreground">Mevcut stok: {currentItem.stock}</p>
            )}
            {errors.quantity && <p className="text-sm text-destructive">{errors.quantity.message}</p>}
          </div>

          {/* Not */}
          <div className="space-y-2">
            <Label htmlFor="note">Transfer Notu</Label>
            <Textarea id="note" rows={3} placeholder="Transfer nedeni veya açıklama..." {...register("note")} />
            {errors.note && <p className="text-sm text-destructive">{errors.note.message}</p>}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              İptal
            </Button>
            <Button type="submit" disabled={isSubmitting || createMutation.isPending}>
              Transfer Et
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

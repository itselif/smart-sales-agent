import { useEffect, useMemo } from "react";
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
import type { InventoryItem } from "@/services/inventory";

const movementSchema = z.object({
  itemId: z.string().min(1, "Ürün seçimi zorunludur"),
  type: z.enum(["IN", "OUT"], { required_error: "Hareket tipi seçimi zorunludur" }),
  quantity: z.coerce.number().int().positive("Miktar pozitif bir sayı olmalıdır"),
  reason: z.enum(
    [
      "PURCHASE_RETURN",
      "DAMAGED",
      "MANUAL_ADJUSTMENT",
      "SALE_CORRECTION",
      "STORE_TRANSFER_IN",
      "STORE_TRANSFER_OUT",
      "INITIAL_STOCK",
      "INVENTORY_COUNT",
      "OTHER",
    ],
    { required_error: "Sebep seçimi zorunludur" }
  ),
  targetStoreId: z.string().optional(), // transfer için opsiyonel
  note: z.string().max(200, "Not 200 karakterden fazla olamaz").optional(),
});

type MovementFormData = z.infer<typeof movementSchema>;

interface MovementFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preSelectedItem?: InventoryItem | null;
}

export function MovementForm({ open, onOpenChange, preSelectedItem }: MovementFormProps) {
  const { currentStoreId, stores } = useAppStore();
  const createMutation = useCreateMovement();

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
  } = useForm<MovementFormData>({
    resolver: zodResolver(movementSchema),
    defaultValues: {
      type: undefined,
      reason: undefined,
    } as any,
  });

  const selectedType = watch("type");
  const selectedReason = watch("reason");
  const selectedItemId = watch("itemId");

  const selectableStores = useMemo(
    () => (stores || []).filter((s) => s.id && s.id !== currentStoreId),
    [stores, currentStoreId]
  );

  const currentItem = useMemo(
    () => itemsData?.items?.find((i) => i.id === selectedItemId),
    [itemsData?.items, selectedItemId]
  );

  useEffect(() => {
    if (preSelectedItem && open) {
      setValue("itemId", preSelectedItem.id);
    }
  }, [preSelectedItem, open, setValue]);

  const onSubmit = async (data: MovementFormData) => {
    if (!currentStoreId) return;

    // Transfer sebeplerinde hedef mağaza zorunlu olsun:
    const isTransfer = data.reason === "STORE_TRANSFER_IN" || data.reason === "STORE_TRANSFER_OUT";
    if (isTransfer && !data.targetStoreId) {
      return; // zod ile de doğrulayabilirdik, burada sessizce engelliyoruz
    }

    try {
      await createMutation.mutateAsync({
        storeId: currentStoreId,
        itemId: data.itemId,
        type: data.type,
        quantity: data.quantity,
        reason: data.reason,
        note: data.note,
        targetStoreId: data.targetStoreId, // backend bunu bekliyorsa geçiyoruz
      });
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

  const reasonOptions = [
    { value: "PURCHASE_RETURN", label: "Satın Alma İadesi" },
    { value: "DAMAGED", label: "Hasarlı" },
    { value: "MANUAL_ADJUSTMENT", label: "Manuel Düzeltme" },
    { value: "SALE_CORRECTION", label: "Satış Düzeltmesi" },
    { value: "STORE_TRANSFER_IN", label: "Mağazadan Transfer (Gelen)" },
    { value: "STORE_TRANSFER_OUT", label: "Mağazaya Transfer (Giden)" },
    { value: "INITIAL_STOCK", label: "İlk Stok Girişi" },
    { value: "INVENTORY_COUNT", label: "Sayım Düzeltmesi" },
    { value: "OTHER", label: "Diğer" },
  ] as const;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Stok Hareketi Ekle</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Ürün */}
          <div className="space-y-2">
            <Label htmlFor="itemId">Ürün *</Label>
            <Select
              value={selectedItemId || ""}
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

          {/* Hareket tipi */}
          <div className="space-y-2">
            <Label htmlFor="type">Hareket Tipi *</Label>
            <Select
              value={selectedType || ""}
              onValueChange={(value: "IN" | "OUT") => setValue("type", value, { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Hareket tipi seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IN">Giriş (+)</SelectItem>
                <SelectItem value="OUT">Çıkış (-)</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
          </div>

          {/* Miktar */}
          <div className="space-y-2">
            <Label htmlFor="quantity">Miktar *</Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              // OUT ise eldeki stoğu aşmayı engellemek için max ver
              max={selectedType === "OUT" ? currentItem?.stock || undefined : undefined}
              placeholder="0"
              {...register("quantity")}
            />
            {selectedType === "OUT" && currentItem && (
              <p className="text-xs text-muted-foreground">Mevcut stok: {currentItem.stock}</p>
            )}
            {errors.quantity && <p className="text-sm text-destructive">{errors.quantity.message}</p>}
          </div>

          {/* Sebep */}
          <div className="space-y-2">
            <Label htmlFor="reason">Sebep *</Label>
            <Select
              value={selectedReason || ""}
              onValueChange={(value) => setValue("reason", value as any, { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sebep seçin" />
              </SelectTrigger>
              <SelectContent>
                {reasonOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.reason && <p className="text-sm text-destructive">{errors.reason.message}</p>}
          </div>

          {/* Transfer ise hedef/kaynak mağaza */}
          {(selectedReason === "STORE_TRANSFER_IN" || selectedReason === "STORE_TRANSFER_OUT") && (
            <div className="space-y-2">
              <Label htmlFor="targetStoreId">
                {selectedReason === "STORE_TRANSFER_OUT" ? "Hedef Mağaza *" : "Kaynak Mağaza *"}
              </Label>
              <Select
                value={watch("targetStoreId") || ""}
                onValueChange={(value) => setValue("targetStoreId", value, { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Mağaza seçin" />
                </SelectTrigger>
                <SelectContent>
                  {selectableStores.map((store) => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.name} - {store.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Not */}
          <div className="space-y-2">
            <Label htmlFor="note">Not</Label>
            <Textarea id="note" rows={3} placeholder="Opsiyonel not..." {...register("note")} />
            {errors.note && <p className="text-sm text-destructive">{errors.note.message}</p>}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              İptal
            </Button>
            <Button type="submit" disabled={isSubmitting || createMutation.isPending}>
              Ekle
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

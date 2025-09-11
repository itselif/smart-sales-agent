import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCreateItem, useUpdateItem } from '@/lib/hooks';
import { useUserStore } from '@/lib/stores';
import type { InventoryItem } from '@/lib/api';

const productSchema = z.object({
  name: z.string().min(2, 'Ürün adı en az 2 karakter olmalıdır'),
  sku: z.string().min(1, 'SKU zorunludur'),
  category: z.string().optional(),
  price: z.coerce.number().nonnegative('Fiyat negatif olamaz'),
  stock: z.coerce.number().int().min(0, 'Stok negatif olamaz').default(0),
  reorderLevel: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: InventoryItem | null;
}

// Kategori seçenekleri
const CATEGORY_OPTIONS = [
  'Teknoloji',
  'Gıda',
  'Ev',
  'Giyim',
  'Spor',
  'Kitap',
  'Oyuncak',
  'Kozmetik',
  'Sağlık',
  'Bahçe',
  'Otomotiv',
  'Ofis',
  'Müzik',
  'Sanat',
  'Diğer'
];

export function ProductForm({ open, onOpenChange, item }: ProductFormProps) {
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const { currentStoreId } = useUserStore();
  const createMutation = useCreateItem();
  const updateMutation = useUpdateItem();
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: item?.name || '',
      sku: item?.sku || '',
      category: item?.category || '',
      price: item?.price || 0,
      stock: item?.stock || 0,
      reorderLevel: item?.reorderLevel || 0,
      isActive: item?.isActive ?? true,
    },
  });

  const isActive = watch('isActive');
  const selectedCategory = watch('category');

  const onSubmit = async (data: ProductFormData) => {
    if (!currentStoreId) return;

    try {
      if (item) {
        await updateMutation.mutateAsync({
          id: item.id,
          data: { ...data, storeId: currentStoreId },
        });
      } else {
        await createMutation.mutateAsync({
          storeId: currentStoreId,
          name: data.name,
          sku: data.sku,
          category: data.category,
          price: data.price,
          stock: data.stock,
          reorderLevel: data.reorderLevel || 0,
          isActive: data.isActive,
        });
      }
      onOpenChange(false);
      reset();
    } catch (error) {
      // Error handled by mutation
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
          <DialogTitle>
            {item ? 'Ürün Düzenle' : 'Yeni Ürün'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Ürün Adı *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Ürün adı"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sku">SKU *</Label>
            <Input
              id="sku"
              {...register('sku')}
              placeholder="Stok Kodu"
            />
            {errors.sku && (
              <p className="text-sm text-destructive">{errors.sku.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Kategori</Label>
            <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={comboboxOpen}
                  className="w-full justify-between"
                >
                  {selectedCategory || "Kategori seçin..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Kategori ara..." />
                  <CommandList>
                    <CommandEmpty>Kategori bulunamadı.</CommandEmpty>
                    <CommandGroup>
                      {CATEGORY_OPTIONS.map((category) => (
                        <CommandItem
                          key={category}
                          value={category}
                          onSelect={(currentValue) => {
                            setValue('category', currentValue === selectedCategory ? "" : currentValue);
                            setComboboxOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedCategory === category ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {category}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Fiyat (₺) *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              {...register('price')}
              placeholder="0.00"
            />
            {errors.price && (
              <p className="text-sm text-destructive">{errors.price.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock">Başlangıç Stok *</Label>
            <Input
              id="stock"
              type="number"
              {...register('stock')}
              placeholder="0"
            />
            {errors.stock && (
              <p className="text-sm text-destructive">{errors.stock.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reorderLevel">Kritik Eşik</Label>
            <Input
              id="reorderLevel"
              type="number"
              {...register('reorderLevel')}
              placeholder="0"
            />
            {errors.reorderLevel && (
              <p className="text-sm text-destructive">{errors.reorderLevel.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={(checked) => setValue('isActive', checked)}
            />
            <Label htmlFor="isActive">Aktif</Label>
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
              disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
            >
              {item ? 'Güncelle' : 'Oluştur'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
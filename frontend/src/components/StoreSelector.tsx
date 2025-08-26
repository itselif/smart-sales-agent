// src/components/StoreSelector.tsx
import { Building2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Store } from "@/lib/api";
import { useAppStore } from "@/lib/stores";

interface StoreSelectorProps {
  value?: string;
  onChange: (value: string) => void;

  // İstersen doğrudan mağaza listesi verebilirsin.
  // Vermezsen global store’daki mağazalar kullanılır.
  stores?: Store[];

  // Sadece belirli mağazalara izin ver (opsiyonel)
  allowedStoreIds?: string[];

  // Belirtilen mağazayı listeden çıkar (opsiyonel)
  excludeStoreId?: string;

  placeholder?: string;
}

export function StoreSelector({
  value,
  onChange,
  stores,
  allowedStoreIds,
  excludeStoreId,
  placeholder = "Mağaza seçin...",
}: StoreSelectorProps) {
  const { stores: globalStores } = useAppStore();

  // Kaynak mağaza listesi
  const base = stores ?? globalStores;

  // Filtreler
  let filteredStores = base;
  if (allowedStoreIds && allowedStoreIds.length > 0) {
    filteredStores = filteredStores.filter((s) => allowedStoreIds.includes(s.id));
  }
  if (excludeStoreId) {
    filteredStores = filteredStores.filter((s) => s.id !== excludeStoreId);
  }

  return (
    <Select value={value || ""} onValueChange={onChange}>
      <SelectTrigger className="w-64">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          <SelectValue placeholder={placeholder} />
        </div>
      </SelectTrigger>
      <SelectContent>
        {filteredStores.map((store) => (
          <SelectItem key={store.id} value={store.id}>
            <div className="flex flex-col">
              <span className="font-medium">{store.name}</span>
              {store.city && <span className="text-sm text-muted-foreground">{store.city}</span>}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

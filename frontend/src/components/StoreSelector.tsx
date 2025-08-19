import { Store } from "@/lib/stores";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2 } from "lucide-react";

interface StoreSelectorProps {
  value?: string;
  onChange: (value: string) => void;
  stores: Store[];
  allowedStoreIds?: string[]; // Kullanıcının erişebildiği mağaza ID'leri
}

export function StoreSelector({ value, onChange, stores, allowedStoreIds }: StoreSelectorProps) {
  const filteredStores = allowedStoreIds 
    ? stores.filter(store => allowedStoreIds.includes(store.id))
    : stores;
  return (
    <Select value={value || ""} onValueChange={onChange}>
      <SelectTrigger className="w-64">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          <SelectValue placeholder="Mağaza seçin..." />
        </div>
      </SelectTrigger>
      <SelectContent>
        {filteredStores.map((store) => (
          <SelectItem key={store.id} value={store.id}>
            <div className="flex flex-col">
              <span className="font-medium">{store.name}</span>
              <span className="text-sm text-muted-foreground">{store.city}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
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
}

export function StoreSelector({ value, onChange, stores }: StoreSelectorProps) {
  return (
    <Select value={value || ""} onValueChange={onChange}>
      <SelectTrigger className="w-64">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          <SelectValue placeholder="Mağaza seçin..." />
        </div>
      </SelectTrigger>
      <SelectContent>
        {stores.map((store) => (
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
// src/components/MultiStoreSelector.tsx
import { Building2, Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useAppStore } from '@/lib/stores';

export function MultiStoreSelector() {
  const { user, stores, selectedStores, toggleStoreSelection, setSelectedStores } = useAppStore();

  const allowedStores = user?.assignedStores?.length
    ? stores.filter((s) => user.assignedStores.includes(s.id))
    : stores;

  const handleSelectAll = () => setSelectedStores(allowedStores.map(s => s.id));
  const handleClearAll = () => setSelectedStores([]);

  const selectedStoreNames = stores
    .filter((s) => selectedStores.includes(s.id))
    .map((s) => s.name);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="min-w-64 justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="text-sm">
              {selectedStores.length === 0
                ? 'Mağaza seçin...'
                : selectedStores.length === 1
                ? selectedStoreNames[0]
                : `${selectedStores.length} mağaza seçili`}
            </span>
          </div>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="start">
        <div className="p-2 space-y-2">
          <div className="flex justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
              disabled={selectedStores.length === allowedStores.length}
            >
              Tümünü Seç
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              disabled={selectedStores.length === 0}
            >
              Temizle
            </Button>
          </div>

          <DropdownMenuSeparator />

          {allowedStores.length === 0 ? (
            <div className="p-2 text-sm text-muted-foreground text-center">
              Erişilebilir mağaza bulunamadı
            </div>
          ) : (
            <div className="space-y-1">
              {allowedStores.map((store) => (
                <DropdownMenuItem
                  key={store.id}
                  className="flex items-center justify-between cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    toggleStoreSelection(store.id);
                  }}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{store.name}</span>
                    <span className="text-xs text-muted-foreground">{store.city}</span>
                  </div>
                  {selectedStores.includes(store.id) && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </DropdownMenuItem>
              ))}
            </div>
          )}

          {selectedStoreNames.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <div className="p-2">
                <p className="text-xs text-muted-foreground mb-2">Seçili mağazalar:</p>
                <div className="flex flex-wrap gap-1">
                  {selectedStoreNames.map((name) => (
                    <Badge key={name} variant="secondary" className="text-xs">
                      {name}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

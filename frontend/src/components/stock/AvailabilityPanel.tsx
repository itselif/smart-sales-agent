import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Package } from 'lucide-react';
import { useAvailability } from '@/lib/hooks';

interface AvailabilityPanelProps {
  sku: string;
}

export function AvailabilityPanel({ sku }: AvailabilityPanelProps) {
  const { data: availability = [], isLoading, error } = useAvailability(sku);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Stok durumu kontrol ediliyor...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <p className="text-sm text-destructive">Stok durumu alınamadı.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (availability.length === 0) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Bu ürün hiçbir mağazada bulunmuyor.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Package className="h-4 w-4" />
          Mağaza Stok Durumu
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {availability
          .filter((store) => store.stock > 0) // Sadece stoku olan mağazaları göster
          .map((store) => (
            <div key={store.storeId} className="flex items-center justify-between p-2 rounded-lg border">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">{store.storeName}</span>
              </div>
              <Badge 
                variant="default"
                className="text-xs"
              >
                {store.stock} adet
              </Badge>
            </div>
          ))}
      </CardContent>
    </Card>
  );
}
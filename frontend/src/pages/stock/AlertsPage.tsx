import { AlertTriangle, Package, TrendingDown, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAlerts } from '@/hooks/useInventoryQueries';
import { useUserStore } from '@/lib/stores';
import { formatNumber } from '@/lib/format';
import { useNavigate } from 'react-router-dom';

export default function AlertsPage() {
  const { currentStoreId } = useUserStore();
  const navigate = useNavigate();

  const { data: alertsData, isLoading } = useAlerts({
    storeId: currentStoreId || '',
    onlyOpen: true,
  });

  const getSuggestedOrder = (stock: number, reorderLevel: number) => {
    return Math.max(0, reorderLevel - stock);
  };

  const getSeverityColor = (stock: number, reorderLevel: number) => {
    const ratio = stock / reorderLevel;
    if (ratio === 0) return 'destructive';
    if (ratio <= 0.5) return 'destructive';
    return 'secondary';
  };

  if (!currentStoreId) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            onClick={() => navigate('/dashboard')}
            variant="ghost"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Anasayfaya Dön
          </Button>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Stok uyarılarını görüntülemek için önce anasayfadan bir mağaza seçin.</p>
            <Button 
              onClick={() => navigate('/dashboard')}
              className="mt-4"
            >
              Anasayfaya Git
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          onClick={() => navigate('/dashboard')}
          variant="ghost"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Anasayfaya Dön
        </Button>
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <AlertTriangle className="mr-2 h-6 w-6 text-orange-500" />
            Düşük Stok Uyarıları
          </h1>
          <p className="text-muted-foreground">
            {alertsData?.items.length || 0} kritik ürün tespit edildi
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      ) : !alertsData?.items.length ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Tüm ürünler stokta!</h3>
              <p className="text-muted-foreground">
                Şu anda kritik stok seviyesine ulaşan ürün bulunmuyor.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {alertsData.items.map((alert) => (
            <Card key={alert.itemId} className="border-l-4 border-l-orange-500">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{alert.name}</h3>
                      <Badge variant="outline">
                        SKU: {alert.sku}
                      </Badge>
                      <Badge variant={getSeverityColor(alert.stock, alert.reorderLevel)}>
                        {alert.stock === 0 ? 'Tükendi' : 'Kritik Seviye'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-destructive">
                          {formatNumber(alert.stock)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Mevcut Stok
                        </div>
                      </div>
                      
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold">
                          {formatNumber(alert.reorderLevel)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Kritik Eşik
                        </div>
                      </div>
                      
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {formatNumber(getSuggestedOrder(alert.stock, alert.reorderLevel))}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Önerilen Sipariş
                        </div>
                      </div>
                      
                      {alert.daysToDeplete && (
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600 flex items-center justify-center">
                            {alert.daysToDeplete}
                            <TrendingDown className="ml-1 h-4 w-4" />
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Tahmini Gün
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Navigate to movements page filtered by this item
                        window.location.href = `/stock/movements?itemId=${alert.itemId}`;
                      }}
                    >
                      Hareketleri Gör
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {alertsData?.items.length && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-blue-900">Sipariş Önerisi</h4>
                <p className="text-blue-700 text-sm mt-1">
                  Toplam {formatNumber(
                    alertsData.items.reduce((sum, alert) => 
                      sum + getSuggestedOrder(alert.stock, alert.reorderLevel), 0
                    )
                  )} adet ürün siparişi öneriliyor.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
// src/pages/Dashboard.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StoreSelector } from "@/components/StoreSelector";
import { MultiStoreSelector } from "@/components/MultiStoreSelector";
import { KpiCard } from "@/components/KpiCard";
import { WeeklyPatternChart } from "@/components/WeeklyPatternChart";
import { SalesTable } from "@/components/SalesTable";
import { StockTable } from "@/components/StockTable";
import { ChatBox } from "@/components/ChatBox";
import { useAppStore } from "@/lib/stores";
import { useSales, useStock, useBuildReport } from "@/lib/hooks";
import { useItems, useAlerts } from "@/hooks/useInventoryQueries";
import { useToast } from "@/hooks/use-toast";
import {
  Building2,
  FileText,
  MessageSquare,
  TrendingUp,
  Package,
  AlertTriangle,
  DollarSign,
  BarChart3,
  Target,
  LogOut,
  User,
  Plus,
  ArrowUpDown,
  Bell,
} from "lucide-react";
import { UserProfile } from "@/components/UserProfile";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("sales");
  const [showUserProfile, setShowUserProfile] = useState(false);

  const {
    user,
    stores,
    currentStoreId,
    setCurrentStoreId,
    setUser,
    selectedStores,
    setSelectedStores,
    loadStores,
    loadUserPrefs,       // <-- kullanıcı tercihlerini BE’den yükler
  } = useAppStore();

  const navigate = useNavigate();
  const { toast } = useToast();

  // Giriş kontrolü + mağazaları ve kullanıcı tercihlerini yükle
  useEffect(() => {
    if (!user) {
      navigate("/auth/login");
      return;
    }
    // mağazaları çek
    if (stores.length === 0) {
      loadStores().catch(() => {});
    }
    // kullanıcıya ait current/selected store’ları getir
    loadUserPrefs().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Mağazalar geldikten sonra hâlâ seçim yoksa makul varsayılanları doldur
  useEffect(() => {
    if (!user) return;
    if (!currentStoreId && stores[0]?.id) {
      setCurrentStoreId(stores[0].id);
    }
    if (selectedStores.length === 0 && stores[0]?.id) {
      setSelectedStores([stores[0].id]);
    }
  }, [user, stores, currentStoreId, selectedStores.length, setCurrentStoreId, setSelectedStores]);

  // API hooks (aktif mağazaya göre)
  const { data: salesData, isLoading: salesLoading, error: salesError } =
    useSales(currentStoreId || "");
  const { data: stockData, isLoading: stockLoading, error: stockError } =
    useStock(currentStoreId || "");
  const { mutate: buildReport, isPending: reportPending } = useBuildReport();

  // Inventory hooks
  const { data: itemsData, isLoading: itemsLoading } = useItems({
    storeId: currentStoreId || "",
    page: 1,
    size: 10,
  });
  const { data: alertsData, isLoading: alertsLoading } = useAlerts({
    storeId: currentStoreId || "",
    onlyOpen: true,
  });

  const handleStoreChange = (newStoreId: string) => {
    setCurrentStoreId(newStoreId); // persist otomatik (stores.ts’de)
  };

  const handleBuildReport = () => {
    if (!currentStoreId) {
      toast({
        title: "Hata",
        description: "Rapor oluşturmak için mağaza seçin",
        variant: "destructive",
      });
      return;
    }

    buildReport(
      { storeId: currentStoreId, request: "haftalık satış ve stok raporu" },
      {
        onSuccess: (response) => {
          const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
          window.open(baseUrl + response.public_url, "_blank");
          toast({
            title: "Rapor oluşturuldu",
            description: "Rapor yeni sekmede açılıyor...",
          });
        },
        onError: (error) => {
          toast({
            title: "Hata",
            description: "Rapor oluşturulamadı: " + error.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentStoreId(null);
    navigate("/auth/login");
  };

  const getSalesKpis = () => {
    if (!salesData?.products || salesData.products.length === 0) {
      return { totalProducts: 0, totalRevenue: 0, avgConfidence: 0 };
    }
    const totalProducts = salesData.products.length;
    const totalRevenue = salesData.products.reduce((sum, p) => sum + p.total_revenue, 0);
    const avgConfidence =
      salesData.products.reduce((sum, p) => sum + p.sales_forecast.confidence, 0) / totalProducts;

    return { totalProducts, totalRevenue, avgConfidence };
  };

  const getStockKpis = () => {
    if (!stockData) return { totalValue: 0, criticalCount: 0 };

    return {
      totalValue: stockData.total_value,
      criticalCount: stockData.critical_products.length,
    };
  };

  const getInventoryKpis = () => {
    if (!itemsData?.items) return { totalItems: 0, totalValue: 0, lowStockCount: 0 };

    const totalItems = itemsData.total;
    const totalValue = itemsData.items.reduce((sum, item) => sum + item.price * item.stock, 0);
    const lowStockCount = itemsData.items.filter(
      (item) => item.reorderLevel && item.stock <= item.reorderLevel
    ).length;

    return { totalItems, totalValue, lowStockCount };
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(amount);

  if (!user) return null;

  const salesKpis = getSalesKpis();
  const stockKpis = getStockKpis();
  const inventoryKpis = getInventoryKpis();

  // Kullanıcının eriştiği mağazalar (yoksa tüm mağazalar)
  const allowedStoreIds = user.assignedStores?.length
    ? user.assignedStores
    : stores.map((s) => s.id);

  const allowedStores = stores.filter((s) => allowedStoreIds.includes(s.id));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold">StorePilot</h1>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Aktif Mağaza:</span>
                  <StoreSelector
                    value={currentStoreId || ""}
                    onChange={handleStoreChange}
                    stores={allowedStores}
                    allowedStoreIds={allowedStoreIds}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Görüntülenen Mağazalar:</span>
                  <MultiStoreSelector />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Dialog open={showUserProfile} onOpenChange={setShowUserProfile}>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="text-sm">Hoş geldin, {user.name}</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="p-0">
                  <UserProfile onClose={() => setShowUserProfile(false)} />
                </DialogContent>
              </Dialog>

              <Button
                onClick={handleBuildReport}
                disabled={reportPending || !currentStoreId}
                variant="outline"
              >
                <FileText className="h-4 w-4 mr-2" />
                {reportPending ? "Oluşturuluyor..." : "Rapor Oluştur"}
              </Button>
              <Button onClick={() => setActiveTab("chat")} variant="outline">
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat
              </Button>
              <Button onClick={handleLogout} variant="ghost" className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Çıkış
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-6">
        {!currentStoreId && (
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Lütfen detaylı analiz için yukarıdan bir aktif mağaza seçin.
            </AlertDescription>
          </Alert>
        )}

        {selectedStores.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Seçili Mağazalar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {stores
                  .filter((s) => selectedStores.includes(s.id))
                  .map((s) => (
                    <Badge key={s.id} variant="outline" className="px-3 py-1">
                      {s.name} - {s.city}
                      {s.id === currentStoreId && (
                        <span className="ml-2 text-xs bg-primary text-primary-foreground px-1 rounded">
                          Aktif
                        </span>
                      )}
                    </Badge>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="sales" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Satışlar
            </TabsTrigger>
            <TabsTrigger value="stock" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Stok
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Ürün Yönetimi
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Chat
            </TabsTrigger>
          </TabsList>

          {/* Sales Tab */}
          <TabsContent value="sales" className="space-y-6">
            {salesError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Satış verileri yüklenirken hata oluştu: {salesError.message}
                </AlertDescription>
              </Alert>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <KpiCard
                title="Toplam Ürün"
                value={salesLoading ? "..." : salesKpis.totalProducts}
                icon={BarChart3}
                subtitle="Analiz edilen ürün sayısı"
              />
              <KpiCard
                title="Toplam Ciro"
                value={salesLoading ? "..." : formatCurrency(salesKpis.totalRevenue)}
                icon={DollarSign}
                subtitle="Analiz dönemindeki toplam satış"
              />
              <KpiCard
                title="Ortalama Güven"
                value={salesLoading ? "..." : `%${(salesKpis.avgConfidence * 100).toFixed(0)}`}
                icon={Target}
                subtitle="Tahmin güvenilirlik oranı"
              />
            </div>

            {/* Weekly Pattern Chart */}
            <WeeklyPatternChart data={salesData?.trend_analysis?.weekly_pattern} />

            {/* Sales Table */}
            {salesData?.products && <SalesTable products={salesData.products} />}
          </TabsContent>

          {/* Stock Tab */}
          <TabsContent value="stock" className="space-y-6">
            {stockError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Stok verileri yüklenirken hata oluştu: {stockError.message}
                </AlertDescription>
              </Alert>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <KpiCard
                title="Toplam Stok Değeri"
                value={stockLoading ? "..." : formatCurrency(stockKpis.totalValue)}
                icon={DollarSign}
                subtitle="Mevcut stok toplam değeri"
              />
              <KpiCard
                title="Kritik Ürün"
                value={stockLoading ? "..." : stockKpis.criticalCount}
                icon={AlertTriangle}
                subtitle="Acil sipariş gerektiren ürünler"
                trend={stockKpis.criticalCount > 0 ? "down" : "neutral"}
              />
            </div>

            {/* Critical Stock Table */}
            {stockData?.critical_products && stockData.critical_products.length > 0 && (
              <StockTable
                products={stockData.critical_products}
                title="Kritik Stok Durumu"
                variant="critical"
              />
            )}

            {/* All Stock Table */}
            {stockData?.products && (
              <StockTable products={stockData.products} title="Tüm Stok Durumu" variant="all" />
            )}
          </TabsContent>

          {/* Inventory Management Tab */}
          <TabsContent value="inventory" className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Stok Yönetimi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    onClick={() => navigate("/stock/products")}
                    className="flex items-center gap-2 h-20"
                    variant="outline"
                  >
                    <Plus className="h-6 w-6" />
                    <div className="text-left">
                      <div className="font-medium">Ürün Yönetimi</div>
                      <div className="text-sm text-muted-foreground">Ürün ekle, düzenle</div>
                    </div>
                  </Button>

                  <Button
                    onClick={() => navigate("/stock/movements")}
                    className="flex items-center gap-2 h-20"
                    variant="outline"
                  >
                    <ArrowUpDown className="h-6 w-6" />
                    <div className="text-left">
                      <div className="font-medium">Stok Hareketleri</div>
                      <div className="text-sm text-muted-foreground">Giriş, çıkış kayıtları</div>
                    </div>
                  </Button>

                  <Button
                    onClick={() => navigate("/stock/alerts")}
                    className="flex items-center gap-2 h-20"
                    variant="outline"
                  >
                    <Bell className="h-6 w-6" />
                    <div className="text-left">
                      <div className="font-medium">Stok Uyarıları</div>
                      <div className="text-sm text-muted-foreground">Kritik stok seviyesi</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <KpiCard
                title="Toplam Ürün"
                value={itemsLoading ? "..." : inventoryKpis.totalItems}
                icon={Package}
                subtitle="Mağazada kayıtlı ürün sayısı"
              />
              <KpiCard
                title="Toplam Stok Değeri"
                value={itemsLoading ? "..." : formatCurrency(inventoryKpis.totalValue)}
                icon={DollarSign}
                subtitle="Mevcut stok toplam değeri"
              />
              <KpiCard
                title="Düşük Stok Uyarısı"
                value={alertsLoading ? "..." : alertsData?.items?.length || 0}
                icon={AlertTriangle}
                subtitle="Kritik stok seviyesindeki ürünler"
                trend={inventoryKpis.lowStockCount > 0 ? "down" : "neutral"}
              />
            </div>

            {/* Recent Items */}
            {itemsData?.items && itemsData.items.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Son Eklenen Ürünler</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {itemsData.items.slice(0, 5).map((item: any) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{item.name}</span>
                          <span className="text-sm text-muted-foreground">SKU: {item.sku}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(item.price)}</div>
                          <div
                            className={`text-sm ${
                              item.reorderLevel && item.stock <= item.reorderLevel
                                ? "text-destructive"
                                : "text-muted-foreground"
                            }`}
                          >
                            Stok: {item.stock}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Low Stock Alerts */}
            {alertsData?.items && alertsData.items.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Kritik Stok Uyarıları
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {alertsData.items.slice(0, 5).map((alert: any) => (
                      <div
                        key={alert.itemId}
                        className="flex items-center justify-between p-3 border border-destructive/20 rounded-lg bg-destructive/5"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{alert.name}</span>
                          <span className="text-sm text-muted-foreground">SKU: {alert.sku}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-destructive font-medium">Mevcut: {alert.stock}</div>
                          <div className="text-sm text-muted-foreground">
                            Kritik: {alert.reorderLevel}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat">
            <ChatBox />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

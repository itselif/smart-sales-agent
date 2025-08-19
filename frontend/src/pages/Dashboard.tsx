import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { StoreSelector } from "@/components/StoreSelector";
import { KpiCard } from "@/components/KpiCard";
import { WeeklyPatternChart } from "@/components/WeeklyPatternChart";
import { SalesTable } from "@/components/SalesTable";
import { StockTable } from "@/components/StockTable";
import { ChatBox } from "@/components/ChatBox";
import { useAppStore, mockStores } from "@/lib/stores";
import { useSales, useStock, useBuildReport } from "@/lib/hooks";
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
  User
} from "lucide-react";
import { UserProfile } from "@/components/UserProfile";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("sales");
  const [showUserProfile, setShowUserProfile] = useState(false);
  const { user, storeId, setStoreId, setUser } = useAppStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  // API hooks
  const { data: salesData, isLoading: salesLoading, error: salesError } = useSales(storeId || "");
  const { data: stockData, isLoading: stockLoading, error: stockError } = useStock(storeId || "");
  const { mutate: buildReport, isPending: reportPending } = useBuildReport();

  useEffect(() => {
    if (!user) {
      navigate("/auth/login");
    }
  }, [user, navigate]);

  const handleStoreChange = (newStoreId: string) => {
    setStoreId(newStoreId);
  };

  const handleBuildReport = () => {
    if (!storeId) {
      toast({
        title: "Hata",
        description: "Rapor oluşturmak için mağaza seçin",
        variant: "destructive",
      });
      return;
    }

    buildReport(
      { storeId, request: "haftalık satış ve stok raporu" },
      {
        onSuccess: (response) => {
          const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
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
    setStoreId(null);
    navigate("/auth/login");
  };

  const getSalesKpis = () => {
    if (!salesData?.products) return { totalProducts: 0, totalRevenue: 0, avgConfidence: 0 };
    
    const totalProducts = salesData.products.length;
    const totalRevenue = salesData.products.reduce((sum, p) => sum + p.total_revenue, 0);
    const avgConfidence = salesData.products.reduce((sum, p) => sum + p.sales_forecast.confidence, 0) / totalProducts;
    
    return { totalProducts, totalRevenue, avgConfidence };
  };

  const getStockKpis = () => {
    if (!stockData) return { totalValue: 0, criticalCount: 0 };
    
    return {
      totalValue: stockData.total_value,
      criticalCount: stockData.critical_products.length,
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  if (!user) return null;

  const salesKpis = getSalesKpis();
  const stockKpis = getStockKpis();

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
              <StoreSelector
                value={storeId || ""}
                onChange={handleStoreChange}
                stores={mockStores}
                allowedStoreIds={user?.assignedStores}
              />
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
                disabled={reportPending || !storeId}
                variant="outline"
              >
                <FileText className="h-4 w-4 mr-2" />
                {reportPending ? "Oluşturuluyor..." : "Rapor Oluştur"}
              </Button>
              <Button
                onClick={() => setActiveTab("chat")}
                variant="outline"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat
              </Button>
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Çıkış
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-6">
        {!storeId && (
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Lütfen analitiği görüntülemek için yukarıdan bir mağaza seçin.
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sales" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Satışlar
            </TabsTrigger>
            <TabsTrigger value="stock" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Stok
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
            {salesData?.products && (
              <SalesTable products={salesData.products} />
            )}
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
              <StockTable
                products={stockData.products}
                title="Tüm Stok Durumu"
                variant="all"
              />
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
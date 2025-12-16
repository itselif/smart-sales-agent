import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { KPICard } from "@/components/dashboard/KPICard";
import { StockTable } from "@/components/dashboard/StockTable";
import { SalesOverview } from "@/components/dashboard/SalesOverview";
import { ReportViewer } from "@/components/dashboard/ReportViewer";
import { ChatBot } from "@/components/dashboard/ChatBot";
import { useStore } from "@/context/StoreContext";
import { StockResponse, SalesResponse, ReportData } from "@/types/inventory";
import { Package, AlertTriangle, TrendingUp, Boxes } from "lucide-react";

const Index = () => {
  const { currentStoreId } = useStore();
  const [stockData, setStockData] = useState<StockResponse | null>(null);
  const [salesData, setSalesData] = useState<SalesResponse | null>(null);
  const [reports, setReports] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Gerçek backend'e bağlandığında burada API çağrısı yapılacak.
    setLoading(false);
  }, [currentStoreId]);

  const handleReportData = (data: any) => {
    if (data?.publicUrl) {
      setReports((prev) => [
        {
          title: "AI Generated Report",
          type: "inventory",
          publicUrl: data.publicUrl,
          downloadUrl: data.publicUrl,
          generatedAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    }
  };

  const criticalCount = stockData?.products.filter((p) => p.is_critical).length || 0;
  const totalProducts = stockData?.products.length || 0;
  const lowStockCount =
    stockData?.products.filter(
      (p) => p.estimated_days_left && p.estimated_days_left <= 30
    ).length || 0;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        {/* KPI Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Products"
            value={totalProducts}
            icon={Boxes}
            variant="default"
          />
          <KPICard
            title="Critical Stock"
            value={criticalCount}
            subtitle="Needs immediate action"
            icon={AlertTriangle}
            variant="destructive"
          />
          <KPICard
            title="Low Stock Items"
            value={lowStockCount}
            subtitle="Under 30 days supply"
            icon={Package}
            variant="warning"
          />
          <KPICard
            title="Total Revenue"
            value={`$${((salesData?.summary?.total_revenue || 0) / 1000).toFixed(1)}K`}
            icon={TrendingUp}
            trend={{ value: 12.5, label: "vs last period" }}
            variant="success"
          />
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stock Table - Takes 2 columns */}
          <div className="lg:col-span-2">
            <StockTable
              products={stockData?.products || []}
              loading={loading}
            />
          </div>

          {/* Reports Panel */}
          <div className="lg:col-span-1">
            <ReportViewer reports={reports} loading={false} />
          </div>
        </div>

        {/* Sales Overview */}
        <section>
          <SalesOverview data={salesData} loading={loading} />
        </section>
      </main>

      {/* Floating ChatBot */}
      <ChatBot
        onStockData={() => {}}
        onSalesData={() => {}}
        onReportData={handleReportData}
      />
    </div>
  );
};

export default Index;

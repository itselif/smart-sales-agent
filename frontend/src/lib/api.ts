const BASE = import.meta.env.VITE_API_BASE_URL;

export interface SalesForecast {
  next_7days: number;
  confidence: number;
  interval: [number, number];
  seasonal_factor?: number;
}

export interface SalesProduct {
  product_id: string;
  product_name?: string;
  category?: string;
  total_sold: number;
  total_revenue: number;
  avg_daily_sales: number;
  weekly_trend: number;
  sales_consistency: number;
  sales_forecast: SalesForecast;
}

export interface SalesResponse {
  status: "success";
  store_id: string;
  analysis_period: number;
  products: SalesProduct[];
  trend_analysis?: { 
    weekly_pattern?: Record<string, number>;
  };
  ai_insights?: string;
}

export interface StockProduct {
  product_id: string;
  name?: string;
  current_stock: number;
  price?: number;
  avg_daily_sales: number;
  sales_trend: "increasing" | "decreasing" | "stable";
  estimated_days_left?: number | null;
  estimated_days_left_ci?: [number, number] | [null, null];
  is_critical: boolean;
  reorder_qty_suggestion: number;
  safety_stock: number;
  lead_time_days?: number;
}

export interface StockResponse {
  store_id: string;
  analysis_date: string;
  products: StockProduct[];
  critical_products: StockProduct[];
  total_value: number;
}

export interface ReportBuildResponse {
  format: "html" | "pdf";
  path: string;
  html_path?: string | null;
  pdf_path?: string | null;
  spec: any;
  public_url: string;
  download_url: string;
}

export type OrchestrateIntent = "sales" | "stock" | "report";

export interface OrchestrateResponse {
  intent: OrchestrateIntent;
  data?: SalesResponse | StockResponse;
  artifacts?: { 
    report_path?: string; 
    format?: string; 
  };
  public_url?: string;
  download_url?: string;
}

export async function getSales(storeId: string): Promise<SalesResponse> {
  const r = await fetch(`${BASE}/sales/analyze?store_id=${encodeURIComponent(storeId)}`);
  if (!r.ok) throw new Error('Sales analysis failed');
  return r.json();
}

export async function getStock(storeId: string): Promise<StockResponse> {
  const r = await fetch(`${BASE}/stock/analysis?store_id=${encodeURIComponent(storeId)}`);
  if (!r.ok) throw new Error('Stock analysis failed');
  return r.json();
}

export async function buildReport(storeId: string, request = 'standart rapor'): Promise<ReportBuildResponse> {
  const r = await fetch(`${BASE}/report/build?store_id=${encodeURIComponent(storeId)}&request=${encodeURIComponent(request)}`);
  if (!r.ok) throw new Error('Report build failed');
  return r.json();
}

export async function orchestrate(q: string, storeId: string): Promise<OrchestrateResponse> {
  const r = await fetch(`${BASE}/orchestrate-llm?q=${encodeURIComponent(q)}&store_id=${encodeURIComponent(storeId)}`);
  if (!r.ok) throw new Error('Orchestrate failed');
  return r.json();
}
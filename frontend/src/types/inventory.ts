export interface Store {
  id: string;
  name: string;
  location?: string;
}

export interface StockProduct {
  product_id: string;
  name?: string;
  current_stock: number;
  price?: number;
  avg_daily_sales: number;
  sales_trend: "increasing" | "decreasing" | "stable";
  estimated_days_left?: number | null;
  is_critical: boolean;
  reorder_qty_suggestion: number;
  safety_stock: number;
  lead_time_days?: number;
}

export interface StockResponse {
  store_id: string;
  products: StockProduct[];
  summary?: {
    total_products: number;
    critical_count: number;
    low_stock_count: number;
  };
}

export interface SalesProduct {
  product_id: string;
  product_name?: string;
  total_sold: number;
  total_revenue: number;
  avg_daily_sales: number;
  weekly_trend: number;
  sales_consistency: number;
  sales_forecast: any;
}

export interface SalesResponse {
  store_id: string;
  products: SalesProduct[];
  summary?: {
    total_revenue: number;
    avg_daily_sales: number;
    top_product?: SalesProduct;
  };
}

export interface ReportData {
  title: string;
  type: "sales" | "inventory" | "forecast";
  publicUrl?: string;
  downloadUrl?: string;
  generatedAt: string;
  data?: any;
}

export type ChatIntent = "report" | "sales" | "stock" | "general";

export interface ChatMessage {
  id: string;
  type: "user" | "bot";
  content: string;
  intent?: ChatIntent;
  data?: SalesResponse | StockResponse | ReportData;
  publicUrl?: string;
  downloadUrl?: string;
  meta?: {
    planner?: string;
    summarizer?: string;
    cached?: boolean;
  };
  timestamp: Date;
}

export interface AIQueryResponse {
  agent: string;
  response: string;
  output?: string;
  data?: any;
  publicUrl?: string;
  downloadUrl?: string;
  meta?: {
    planner?: string;
    summarizer?: string;
    cached?: boolean;
  };
}

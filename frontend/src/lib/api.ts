// src/lib/api.ts
const BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_BASE ||
  "http://localhost:8000";
// Mock'ları aktif et - test için
const USE_MOCKS = true; // String(import.meta.env.VITE_USE_MOCKS || "").toLowerCase() === "true";
// For chat only: allow overriding mock behavior
const RAW_MOCK_CHAT = (import.meta.env.VITE_USE_MOCKS_CHAT ?? "") as string;
const USE_MOCKS_CHAT_DISABLED = true; // String(RAW_MOCK_CHAT).toLowerCase() === "false";

const MB_STORES_URL = import.meta.env.VITE_STORES_URL as string | undefined;

/* =========================
 * Store types & API
 * =======================*/
export interface Store {
  id: string;
  name: string;
  fullname?: string; 
  city?: string;
  avatar?: string;
  active?: boolean;
}

export async function getStores(): Promise<Store[]> {
  console.log("🔍 getStores called, USE_MOCKS:", USE_MOCKS);
  
  if (USE_MOCKS) {
    const m = await import("./mocks");
    return m.mockGetStores();
  }
  // 1) (Opsiyonel) Mindbricks URL'i doğrudan dene (CORS açıksa)
  if (MB_STORES_URL) {
    try {
      const r = await fetch(MB_STORES_URL, { headers: { Accept: "application/json" } });
      if (r.ok) {
        const data = await r.json();
        const list = Array.isArray(data) ? data : (data.stores ?? data.items ?? []);
        return (list as any[])
          .map((x) => ({
            id: x.id ?? x._id,
            name: x.name,
            fullname: x.fullname ?? x.name,
            city: x.city ?? "",
            avatar: x.avatar ?? "",
            active: (x.active ?? x.isActive ?? true) as boolean,
          }))
          .filter((s) => s.id && s.name);
      }
    } catch {
      // CORS/Network hatası—backend proxy'ye düş
    }
  }

  // 2) Backend proxy (önerilen ve stabil yol)
  try {
    console.log("🌐 Fetching stores from:", `${BASE}/stores/list`);
    const r = await fetch(`${BASE}/stores/list`, { headers: { Accept: "application/json" } });
    console.log("📡 Response status:", r.status, r.ok);
    if (!r.ok) {
      console.error("❌ Response not OK:", r.status, r.statusText);
      return [];
    }
    const data = await r.json();
    console.log("📦 Response data:", data);
    const stores = Array.isArray(data) ? data : (data.stores ?? []);
    console.log("🏪 Parsed stores:", stores);
    return stores;
  } catch (error) {
    console.error("❌ Fetch error:", error);
    return [];
  }
}

/* =========================
 * Inventory types & API
 * =======================*/
export interface InventoryItem {
  id: string;
  storeId: string;
  sku: string;
  name: string;
  price: number;
  stock: number;
  reorderLevel?: number | null;
  category?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryAvailability {
  storeId: string;
  storeName: string;
  stock: number;
}

export interface StockRequest {
  id: string;
  itemId: string;
  sku: string;
  name: string;
  requesterStoreId: string;
  targetStoreId?: string | null;
  quantity: number;
  status: "pending" | "approved" | "rejected" | "fulfilled";
  createdAt: string;
  updatedAt: string;
  note?: string;
  decisionNote?: string;
}

export interface LowStockAlert {
  itemId: string;
  sku: string;
  name: string;
  stock: number;
  reorderLevel: number;
  daysToDeplete?: number;
  isAcknowledged: boolean;
}

export async function listItems(params: {
  storeId: string;
  q?: string;
  page?: number;
  size?: number;
  category?: string;
  isActive?: boolean;
  sort?: string;
}): Promise<{ items: InventoryItem[]; total: number }> {
  if (USE_MOCKS) {
    const m = await import("./mocks");
    return m.mockListItems(params as any);
  }
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") search.append(k, String(v));
  });

  const r = await fetch(`${BASE}/inventory/items?${search.toString()}`);
  if (!r.ok) throw new Error("Failed to fetch items");
  return r.json();
}

export async function createItem(
  payload: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">
): Promise<InventoryItem> {
  if (USE_MOCKS) {
    const m = await import("./mocks");
    return m.mockCreateItem(payload as any) as unknown as InventoryItem;
  }
  const r = await fetch(`${BASE}/inventory/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error("Failed to create item");
  return r.json();
}

export async function updateItem(id: string, patch: Partial<InventoryItem>): Promise<InventoryItem> {
  if (USE_MOCKS) {
    const m = await import("./mocks");
    return m.mockUpdateItem(id, patch as any) as unknown as InventoryItem;
  }
  const r = await fetch(`${BASE}/inventory/items/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!r.ok) throw new Error("Failed to update item");
  return r.json();
}

export async function deleteItem(id: string): Promise<{ ok: boolean }> {
  if (USE_MOCKS) {
    const m = await import("./mocks");
    return m.mockDeleteItem(id);
  }
  const r = await fetch(`${BASE}/inventory/items/${id}`, { method: "DELETE" });
  if (!r.ok) throw new Error("Failed to delete item");
  return { ok: true };
}

/* Availability */
export async function getAvailability(sku: string): Promise<InventoryAvailability[]> {
  if (USE_MOCKS) {
    const m = await import("./mocks");
    return m.mockGetAvailability(sku) as any;
  }
  const r = await fetch(`${BASE}/inventory/availability?sku=${encodeURIComponent(sku)}`);
  if (!r.ok) throw new Error("Failed to fetch availability");
  return r.json();
}

/* Requests */
export async function createRequest(body: {
  requesterStoreId: string;
  targetStoreId?: string;
  itemId: string;
  quantity: number;
  note?: string;
}): Promise<StockRequest> {
  if (USE_MOCKS) {
    const m = await import("./mocks");
    return m.mockCreateRequest(body as any) as unknown as StockRequest;
  }
  const r = await fetch(`${BASE}/inventory/requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error("Failed to create request");
  return r.json();
}

export async function listRequests(params: {
  storeId: string;
  role: "requester" | "target" | "all";
}): Promise<StockRequest[]> {
  if (USE_MOCKS) {
    const m = await import("./mocks");
    return m.mockListRequests(params as any) as unknown as StockRequest[];
  }
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) search.append(k, String(v));
  });

  const r = await fetch(`${BASE}/inventory/requests?${search.toString()}`);
  if (!r.ok) throw new Error("Failed to fetch requests");
  return r.json();
}

export async function updateRequest(
  id: string,
  patch: { status: "approved" | "rejected" | "fulfilled"; decisionNote?: string }
): Promise<StockRequest> {
  if (USE_MOCKS) {
    const m = await import("./mocks");
    return m.mockUpdateRequest(id, patch) as unknown as StockRequest;
  }
  const r = await fetch(`${BASE}/inventory/requests/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!r.ok) throw new Error("Failed to update request");
  return r.json();
}

/* Transfer */
export async function transferStock(body: {
  itemId: string;
  quantity: number;
  fromStoreId: string;
  toStoreId: string;
  note?: string;
}): Promise<{ ok: boolean }> {
  if (USE_MOCKS) {
    const m = await import("./mocks");
    return m.mockTransferStock(body);
  }
  const r = await fetch(`${BASE}/inventory/transfer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error("Failed to transfer stock");
  return { ok: true };
}

/* Alerts */
export async function listAlerts(params: {
  storeId: string;
  onlyOpen?: boolean;
}): Promise<{ items: LowStockAlert[] }> {
  if (USE_MOCKS) {
    const m = await import("./mocks");
    return m.mockListAlerts(params as any) as unknown as { items: LowStockAlert[] };
  }
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) search.append(k, String(v));
  });

  const r = await fetch(`${BASE}/inventory/alerts?${search.toString()}`);
  if (!r.ok) throw new Error("Failed to fetch alerts");
  return r.json();
}

/* =========================
 * User Prefs
 * =======================*/
export interface UserPrefs {
  id?: string | null;
  userId: string;
  storeId: string | null;
  selectedStoreIds: string[];
}

export async function getUserPrefs(userId: string): Promise<UserPrefs> {
  if (USE_MOCKS) {
    // local fallback: read from localStorage or defaults
    const raw = localStorage.getItem(`prefs:${userId}`);
    if (raw) return JSON.parse(raw);
    return { userId, id: null, storeId: null, selectedStoreIds: [] };
  }
  const r = await fetch(`${BASE}/user/prefs?user_id=${encodeURIComponent(userId)}`);
  if (!r.ok) throw new Error("Failed to load preferences");
  return r.json();
}

export async function saveUserPrefs(prefs: UserPrefs): Promise<{ ok: boolean; id?: string }> {
  if (USE_MOCKS) {
    localStorage.setItem(`prefs:${prefs.userId}`, JSON.stringify(prefs));
    return { ok: true, id: prefs.id ?? "local" };
  }
  const r = await fetch(`${BASE}/user/prefs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(prefs),
  });
  if (!r.ok) throw new Error("Failed to save preferences");
  return r.json();
}

/* =========================
 * Sales / Stock / Report
 * =======================*/
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
  trend_analysis?: { weekly_pattern?: Record<string, number> };
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
  artifacts?: { report_path?: string; format?: string };
  public_url?: string;
  download_url?: string;
}

export interface StockMovement {
  id: string;
  itemId: string;
  storeId: string;
  type: "IN" | "OUT";
  quantity: number;
  reason: "PURCHASE" | "SALE" | "ADJUSTMENT" | "TRANSFER_IN" | "TRANSFER_OUT" | "RETURN" | "DAMAGE" | "OTHER";
  note?: string;
  createdAt: string;
  createdBy: string;
}

export interface StockMovementsResponse {
  items: StockMovement[];
  total: number;
}

export async function getSales(storeId: string): Promise<SalesResponse> {
  if (USE_MOCKS) {
    const m = await import("./mocks");
    return m.mockGetSales(storeId) as unknown as SalesResponse;
  }
  const r = await fetch(`${BASE}/sales/analyze?store_id=${encodeURIComponent(storeId)}`);
  if (!r.ok) throw new Error("Sales analysis failed");
  return r.json();
}

export async function getStock(storeId: string): Promise<StockResponse> {
  if (USE_MOCKS) {
    const m = await import("./mocks");
    return m.mockGetStock(storeId) as unknown as StockResponse;
  }
  const r = await fetch(`${BASE}/stock/analysis?store_id=${encodeURIComponent(storeId)}`);
  if (!r.ok) throw new Error("Stock analysis failed");
  return r.json();
}

export async function buildReport(
  storeId: string,
  request = "standart rapor"
): Promise<ReportBuildResponse> {
  if (USE_MOCKS) {
    const m = await import("./mocks");
    return m.mockBuildReport(storeId, request) as unknown as ReportBuildResponse;
  }
  const r = await fetch(
    `${BASE}/report/build?store_id=${encodeURIComponent(storeId)}&request=${encodeURIComponent(
      request
    )}`
  );
  if (!r.ok) throw new Error("Report build failed");
  return r.json();
}

export async function orchestrate(q: string, storeId: string): Promise<OrchestrateResponse> {
  if (USE_MOCKS && !USE_MOCKS_CHAT_DISABLED) {
    const m = await import("./mocks");
    return m.mockOrchestrate(q, storeId) as unknown as OrchestrateResponse;
  }
  const r = await fetch(
    `${BASE}/orchestrate-llm?q=${encodeURIComponent(q)}&store_id=${encodeURIComponent(storeId)}`
  );
  if (!r.ok) throw new Error("Orchestrate failed");
  return r.json();
}

export async function getMovements(params: {
  storeId: string;
  itemId?: string;
  type?: "IN" | "OUT";
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  size?: number;
  sort?: string;
}): Promise<StockMovementsResponse> {
  if (USE_MOCKS) {
    const m = await import("./mocks");
    return m.mockListMovements(params) as unknown as StockMovementsResponse;
  }
  
  const searchParams = new URLSearchParams();
  searchParams.set('store_id', params.storeId);
  if (params.itemId) searchParams.set('item_id', params.itemId);
  if (params.type) searchParams.set('type', params.type);
  if (params.dateFrom) searchParams.set('date_from', params.dateFrom);
  if (params.dateTo) searchParams.set('date_to', params.dateTo);
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.size) searchParams.set('size', params.size.toString());
  if (params.sort) searchParams.set('sort', params.sort);
  
  const r = await fetch(`${BASE}/movements?${searchParams.toString()}`);
  if (!r.ok) throw new Error("Movements fetch failed");
  return r.json();
}

export async function createMovement(body: {
  itemId: string;
  storeId: string;
  type: "IN" | "OUT";
  quantity: number;
  reason: "PURCHASE" | "SALE" | "ADJUSTMENT" | "TRANSFER_IN" | "TRANSFER_OUT" | "RETURN" | "DAMAGE" | "OTHER";
  note?: string;
  createdBy: string;
}): Promise<StockMovement> {
  if (USE_MOCKS) {
    const m = await import("./mocks");
    return m.mockCreateMovement(body) as unknown as StockMovement;
  }
  
  const r = await fetch(`${BASE}/movements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error("Movement creation failed");
  return r.json();
}

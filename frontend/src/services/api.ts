import { AIQueryResponse, StockResponse, SalesResponse, Store } from "@/types/inventory";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";


// Convert camelCase to snake_case for API params
function toSnakeCase(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const key in obj) {
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    result[snakeKey] = obj[key];
  }
  return result;
}

// Generic fetch wrapper with snake_case conversion
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  queryParams?: Record<string, any>
): Promise<T> {
  let url = `${API_BASE_URL}${endpoint}`;

  if (queryParams) {
    const snakeParams = toSnakeCase(queryParams);
    const searchParams = new URLSearchParams();
    Object.entries(snakeParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    url += `?${searchParams.toString()}`;
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// AI Orchestrator
export async function orchestrate(message: string, storeId: string): Promise<AIQueryResponse> {
  const context = `Current store: ${storeId}`;
  return apiFetch<AIQueryResponse>("/ai/query", {
    method: "POST",
    body: JSON.stringify({ message, context }),
  });
}


// Normalize backend agent names to frontend intents
export function normalizeIntent(agent: string): "report" | "sales" | "stock" | "general" {
  const mapping: Record<string, "report" | "sales" | "stock" | "general"> = {
    sales_agent: "sales",
    reporting_agent: "report",
    stock_agent: "stock",
  };
  return mapping[agent] || "general";
}

// Inventory/Stock endpoints
export async function getStockAvailability(storeId: string): Promise<StockResponse> {
  return apiFetch<StockResponse>("/inventory/stock", {}, { storeId });
}

export async function getInventoryItems(storeId: string): Promise<StockResponse> {
  return apiFetch<StockResponse>("/inventory/items", {}, { storeId });
}

// Sales endpoints
export async function getSalesOverview(storeId: string): Promise<SalesResponse> {
  return apiFetch<SalesResponse>("/sales/overview", {}, { storeId });
}

// Stores endpoint
export async function getStores(): Promise<Store[]> {
  return apiFetch<Store[]>("/stores");
}


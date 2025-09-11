import { httpFetch, API } from './http';

export type InventoryItem = {
  id: string;
  storeId: string;
  name: string;
  sku: string;
  category?: string;
  price: number;
  stock: number;
  reorderLevel?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type InventoryMovement = {
  id: string;
  storeId: string;
  itemId: string;
  type: "IN" | "OUT";
  quantity: number;
  reason: string;
  note?: string;
  createdAt: string;
  createdBy: string;
};

export type LowStockAlert = {
  itemId: string;
  sku: string;
  name: string;
  stock: number;
  reorderLevel: number;
  daysToDeplete?: number;
  isAcknowledged: boolean;
};

export type ListParams = {
  storeId: string;
  q?: string;
  category?: string;
  isActive?: boolean;
  page?: number;
  size?: number;
  sort?: string;
};

export type MoveParams = {
  storeId: string;
  itemId?: string;
  type?: "IN" | "OUT";
  page?: number;
  size?: number;
  sort?: string;
  dateFrom?: string;
  dateTo?: string;
};

export type CreateItemData = {
  storeId: string;
  name: string;
  sku: string;
  category?: string;
  price: number;
  reorderLevel?: number;
  isActive?: boolean;
};

export type CreateMovementData = {
  storeId: string;
  itemId: string;
  type: "IN" | "OUT";
  quantity: number;
  reason: "PURCHASE_RETURN" | "DAMAGED" | "MANUAL_ADJUSTMENT" | "SALE_CORRECTION" | "STORE_TRANSFER_IN" | "STORE_TRANSFER_OUT" | "INITIAL_STOCK" | "INVENTORY_COUNT" | "OTHER";
  note?: string;
  targetStoreId?: string; // Transfer işlemleri için hedef mağaza
};

// Items API
export const listItems = (params: ListParams): Promise<{ items: InventoryItem[]; total: number }> => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      // Backend store_id bekliyor, storeId'yi çevir
      const paramKey = key === 'storeId' ? 'store_id' : key;
      searchParams.append(paramKey, value.toString());
    }
  });

  return httpFetch(`${API.inventoryItems}?${searchParams.toString()}`);
};

export const createItem = (data: CreateItemData): Promise<InventoryItem> => {
  return httpFetch(API.inventoryItems, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateItem = (id: string, data: Partial<InventoryItem>): Promise<InventoryItem> => {
  return httpFetch(`${API.inventoryItems}/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

export const deleteItem = (id: string): Promise<void> => {
  return httpFetch(`${API.inventoryItems}/${id}`, {
    method: 'DELETE',
  });
};

// Movements API
export const listMovements = (params: MoveParams): Promise<{ items: InventoryMovement[]; total: number }> => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value.toString());
    }
  });

  return httpFetch(`${API.inventoryMovements}?${searchParams.toString()}`);
};

export const createMovement = (data: CreateMovementData): Promise<InventoryMovement> => {
  return httpFetch(API.inventoryMovements, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// Alerts API
export const listAlerts = (params: { storeId: string; onlyOpen?: boolean }): Promise<{ items: LowStockAlert[] }> => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      // Backend store_id bekliyor, storeId'yi çevir
      const paramKey = key === 'storeId' ? 'store_id' : key;
      searchParams.append(paramKey, value.toString());
    }
  });

  return httpFetch(`${API.lowStockAlerts}?${searchParams.toString()}`);
};

// Availability API - ürünün hangi mağazalarda kaç adet olduğunu gösterir
export const getAvailability = (sku: string): Promise<{
  sku: string;
  availability: Array<{
    store_id: string;
    store_name: string;
    stock: number;
    min_required: number;
    price: number;
    category: string;
    is_critical: boolean;
  }>;
  total_stores: number;
  total_stock: number;
}> => {
  return httpFetch(`/inventory/availability/${sku}`);
};

// Auth API
export const getMe = (): Promise<{ id: string; roles: string[] }> => {
  return httpFetch(API.me);
};
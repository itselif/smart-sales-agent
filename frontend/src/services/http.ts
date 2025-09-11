import { useUserStore } from '@/lib/stores';

export const API = {
  baseUrl: import.meta.env.VITE_API_BASE || "http://localhost:8000",
  inventoryItems: "/inventory/items",
  inventoryMovements: "/inventorymovements", 
  lowStockAlerts: "/inventory/alerts",
  me: "/auth/me",
};

class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'HttpError';
  }
}

export async function httpFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const { user, currentStoreId } = useUserStore.getState();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (user?.token) {
    headers['Authorization'] = `Bearer ${user.token}`;
  }
  
  if (currentStoreId) {
    headers['X-Store-Id'] = currentStoreId;
  }

  const response = await fetch(`${API.baseUrl}${url}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    useUserStore.getState().setUser(null);
    window.location.href = '/auth/login';
    throw new HttpError(401, 'Unauthorized');
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new HttpError(response.status, errorText);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
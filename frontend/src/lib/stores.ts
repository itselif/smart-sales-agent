import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Store {
  id: string;
  name: string;
  city: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  storeCode?: string;
  phone?: string;
  assignedStores: string[]; // Kullanıcının erişebildiği mağaza ID'leri
}

interface AppState {
  user: User | null;
  storeId: string | null;
  setUser: (user: User | null) => void;
  setStoreId: (storeId: string | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      storeId: null,
      setUser: (user) => set({ user }),
      setStoreId: (storeId) => set({ storeId }),
    }),
    {
      name: 'app-storage',
    }
  )
);

// Mock store data - will be replaced with API call later
export const mockStores: Store[] = [
  { id: "store_1", name: "Merkez Mağaza", city: "İstanbul" },
  { id: "store_2", name: "Kadıköy Şubesi", city: "İstanbul" },
  { id: "store_3", name: "Ankara Plaza", city: "Ankara" },
  { id: "store_4", name: "İzmir Kordon", city: "İzmir" },
  { id: "store_5", name: "Antalya AVM", city: "Antalya" },
];
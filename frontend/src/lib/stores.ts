// src/lib/stores.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Store } from '@/lib/api';     // <-- TEK KAYNAK (api.ts)
import { getStores } from '@/lib/api';      // <-- API'den mağaza çekiyoruz

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  token?: string;
  storeCode?: string;
  phone?: string;
  assignedStores: string[];
}

interface AppState {
  user: User | null;

  // Mağazalar
  stores: Store[];
  currentStoreId: string | null;
  selectedStores: string[];

  // Actions
  setUser: (user: User | null) => void;
  setStores: (stores: Store[]) => void;
  loadStores: () => Promise<void>;
  setCurrentStoreId: (storeId: string | null) => void;
  setSelectedStores: (storeIds: string[]) => void;
  toggleStoreSelection: (storeId: string) => void;
}

export { useAppStore as useUserStore };

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,

      stores: [],
      currentStoreId: null,
      selectedStores: [],

      setUser: (user) => set({ user }),
      setStores: (stores) => set({ stores }),

      loadStores: async () => {
        const stores = await getStores();
        set({ stores });

        // İlk yüklemede boşsa seçimleri doldur
        if (get().selectedStores.length === 0) {
          set({ selectedStores: stores.map((s) => s.id) });
        }
        // Aktif mağaza yoksa ilkini ata
        if (!get().currentStoreId && stores[0]?.id) {
          set({ currentStoreId: stores[0].id });
        }
      },

      setCurrentStoreId: (storeId) => set({ currentStoreId: storeId }),
      setSelectedStores: (storeIds) => set({ selectedStores: storeIds }),
      toggleStoreSelection: (storeId) =>
        set((state) => ({
          selectedStores: state.selectedStores.includes(storeId)
            ? state.selectedStores.filter((id) => id !== storeId)
            : [...state.selectedStores, storeId],
        })),
    }),
    { name: 'app-storage' }
  )
);

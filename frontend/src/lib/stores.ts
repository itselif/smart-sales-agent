// src/lib/stores.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Store } from "@/lib/api";
import { getStores } from "@/lib/api";

const BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_BASE ||
  "http://localhost:8000";

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

async function apiGetUserPrefs(userId: string): Promise<{
  id?: string | null;
  userId: string;
  storeId: string | null;
  selectedStoreIds: string[];
}> {
  const r = await fetch(`${BASE}/user/prefs?user_id=${encodeURIComponent(userId)}`);
  if (!r.ok) throw new Error("prefs load failed");
  return r.json();
}

async function apiSaveUserPrefs(p: {
  userId: string;
  storeId: string | null;
  selectedStoreIds: string[];
}): Promise<void> {
  const r = await fetch(`${BASE}/user/prefs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(p),
  });
  if (!r.ok) throw new Error("prefs save failed");
}

interface AppState {
  user: User | null;

  // mağazalar
  stores: Store[];
  currentStoreId: string | null;
  selectedStores: string[];

  // actions
  setUser: (user: User | null) => void;
  setStores: (stores: Store[]) => void;
  loadStores: () => Promise<void>;

  loadUserPrefs: () => Promise<void>;
  saveUserPrefsNow: () => Promise<void>;

  setCurrentStoreId: (storeId: string | null, opts?: { persist?: boolean }) => void;
  setSelectedStores: (storeIds: string[], opts?: { persist?: boolean }) => void;
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

        // current yoksa ilk mağazayı ata
        if (!get().currentStoreId && stores[0]?.id) {
          set({ currentStoreId: stores[0].id });
        }
        // seçili boşsa görünüm için en az 1 mağaza doldur
        if (get().selectedStores.length === 0 && stores[0]?.id) {
          set({ selectedStores: [stores[0].id] });
        }
      },

      loadUserPrefs: async () => {
        const u = get().user;
        if (!u) return;
        try {
          const prefs = await apiGetUserPrefs(u.id);
          if (prefs.storeId) set({ currentStoreId: prefs.storeId });
          if (prefs.selectedStoreIds?.length) set({ selectedStores: prefs.selectedStoreIds });
        } catch (_) {
          // yoksa sessiz geç
        }
      },

      saveUserPrefsNow: async () => {
        const u = get().user;
        if (!u) return;
        try {
          await apiSaveUserPrefs({
            userId: u.id,
            storeId: get().currentStoreId,
            selectedStoreIds: get().selectedStores,
          });
        } catch (_) {
          // sessiz
        }
      },

      setCurrentStoreId: (storeId, opts) => {
        set({ currentStoreId: storeId });
        if (opts?.persist !== false) get().saveUserPrefsNow();
      },

      setSelectedStores: (storeIds, opts) => {
        set({ selectedStores: storeIds });
        if (opts?.persist !== false) get().saveUserPrefsNow();
      },

      toggleStoreSelection: (storeId) => {
        const cur = get().selectedStores;
        const next = cur.includes(storeId)
          ? cur.filter((id) => id !== storeId)
          : [...cur, storeId];
        set({ selectedStores: next });
        get().saveUserPrefsNow();
      },
    }),
    { name: "app-storage" }
  )
);

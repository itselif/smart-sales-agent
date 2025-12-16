import React, { createContext, useContext, useState, ReactNode } from "react";
import { Store } from "@/types/inventory";
import { mockStores } from "@/services/api";

interface StoreContextType {
  currentStoreId: string | null;
  setCurrentStoreId: (id: string | null) => void;
  selectedStoreIds: string[];
  setSelectedStoreIds: (ids: string[]) => void;
  stores: Store[];
  currentStore: Store | null;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [currentStoreId, setCurrentStoreId] = useState<string | null>(mockStores[0]?.id || null);
  const [selectedStoreIds, setSelectedStoreIds] = useState<string[]>([]);
  const [stores] = useState<Store[]>(mockStores);

  const currentStore = stores.find((s) => s.id === currentStoreId) || null;

  return (
    <StoreContext.Provider
      value={{
        currentStoreId,
        setCurrentStoreId,
        selectedStoreIds,
        setSelectedStoreIds,
        stores,
        currentStore,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}

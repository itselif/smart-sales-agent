import { isEqual } from "es-toolkit";
import { useLocalStorage } from "minimal-shared/hooks";
import { useMemo, useEffect, useCallback } from "react";
import { getStorage as getStorageValue } from "minimal-shared/utils";

import { DataObjectContext } from "./data-object-context";
import { DATA_OBJECT_STORAGE_KEY } from "../data-object-config";

export function DataObjectProvider({
  children,
  defaultSettings,
  storageKey = DATA_OBJECT_STORAGE_KEY,
}) {
  const { state, setState, resetState, setField } = useLocalStorage(
    storageKey,
    defaultSettings,
  );

  const canReset = !isEqual(state, defaultSettings);

  const onReset = useCallback(() => {
    resetState(defaultSettings);
  }, [defaultSettings, resetState]);

  useEffect(() => {
    const storedValue = getStorageValue(storageKey);

    if (storedValue) {
      try {
        if (
          !storedValue.version ||
          storedValue.version !== defaultSettings.version
        ) {
          onReset();
        }
      } catch {
        onReset();
      }
    }
  }, []);

  const memoizedValue = useMemo(
    () => ({
      canReset,
      onReset,
      state,
      setState,
      setField,
    }),
    [canReset, onReset, state, setField, setState],
  );

  return (
    <DataObjectContext.Provider value={memoizedValue}>
      {children}
    </DataObjectContext.Provider>
  );
}

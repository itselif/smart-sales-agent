import { useContext } from "react";

import { DataObjectContext } from "./data-object-context";

// ----------------------------------------------------------------------

export function useDataObjectContext() {
  const context = useContext(DataObjectContext);

  if (!context)
    throw new Error(
      "useDataObjectContext must be use inside DataObjectProvider",
    );

  return context;
}

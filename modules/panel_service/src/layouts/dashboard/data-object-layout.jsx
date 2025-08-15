import { useEffect } from "react";
import { Outlet } from "react-router";

import { useSettingsContext } from "../../components/settings/index.js";

export function DataObjectLayout() {
  const { setField } = useSettingsContext();

  useEffect(() => {
    setField("navLayout", "dataObject");

    return () => {
      setField("navLayout", "vertical");
    };
  }, [setField]);

  return <Outlet />;
}

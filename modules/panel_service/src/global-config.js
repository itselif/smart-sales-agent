import { paths } from "src/routes/paths";

export const CONFIG = {
  appName: "SalesAI Multi-Store Orchestration Backend",
  assetsDir: import.meta.env.VITE_ASSETS_DIR ?? "",

  salesManagementServiceUrl:
    import.meta.env.VITE_SALESMANAGEMENT_SERVICE_URL ?? "",

  inventoryManagementServiceUrl:
    import.meta.env.VITE_INVENTORYMANAGEMENT_SERVICE_URL ?? "",

  storeManagementServiceUrl:
    import.meta.env.VITE_STOREMANAGEMENT_SERVICE_URL ?? "",

  reportingServiceUrl: import.meta.env.VITE_REPORTING_SERVICE_URL ?? "",

  observabilityServiceUrl: import.meta.env.VITE_OBSERVABILITY_SERVICE_URL ?? "",

  platformAdminServiceUrl: import.meta.env.VITE_PLATFORMADMIN_SERVICE_URL ?? "",

  authServiceUrl: import.meta.env.VITE_AUTH_SERVICE_URL ?? "",

  auth: {
    skip: false,
    redirectPath: paths.dashboard.root,
  },
};

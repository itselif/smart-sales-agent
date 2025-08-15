import { paths } from "src/routes/paths";

import { CONFIG } from "src/global-config";

import { SvgColor } from "src/components/svg-color";

// ----------------------------------------------------------------------

const icon = (name) => (
  <SvgColor src={`${CONFIG.assetsDir}/assets/icons/navbar/${name}.svg`} />
);

const ICONS = {
  folder: icon("ic-folder"),
  dashboard: icon("ic-dashboard"),
};

// ----------------------------------------------------------------------

export const navData = [
  {
    items: [
      {
        title: "Admin Panel",
        path: paths.dashboard.root,
        icon: ICONS.dashboard,
      },
    ],
  },
  {
    subheader: "Modules",
    items: [
      {
        title: "SalesManagement Module",
        path: paths.dashboard.salesManagement.root,
        icon: ICONS.folder,

        children: [
          {
            title: "SaleTransaction Data",
            path: paths.dashboard.salesManagement.saleTransaction,
          },

          {
            title: "SaleTransactionHistory Data",
            path: paths.dashboard.salesManagement.saleTransactionHistory,
          },
        ],
      },

      {
        title: "InventoryManagement Module",
        path: paths.dashboard.inventoryManagement.root,
        icon: ICONS.folder,

        children: [
          {
            title: "InventoryItem Data",
            path: paths.dashboard.inventoryManagement.inventoryItem,
          },

          {
            title: "InventoryMovement Data",
            path: paths.dashboard.inventoryManagement.inventoryMovement,
          },

          {
            title: "LowStockAlert Data",
            path: paths.dashboard.inventoryManagement.lowStockAlert,
          },
        ],
      },

      {
        title: "StoreManagement Module",
        path: paths.dashboard.storeManagement.root,
        icon: ICONS.folder,

        children: [
          {
            title: "Store Data",
            path: paths.dashboard.storeManagement.store,
          },

          {
            title: "StoreAssignment Data",
            path: paths.dashboard.storeManagement.storeAssignment,
          },
        ],
      },

      {
        title: "Reporting Module",
        path: paths.dashboard.reporting.root,
        icon: ICONS.folder,

        children: [
          {
            title: "ReportRequest Data",
            path: paths.dashboard.reporting.reportRequest,
          },

          {
            title: "ReportFile Data",
            path: paths.dashboard.reporting.reportFile,
          },

          {
            title: "ReportPolicy Data",
            path: paths.dashboard.reporting.reportPolicy,
          },
        ],
      },

      {
        title: "Observability Module",
        path: paths.dashboard.observability.root,
        icon: ICONS.folder,

        children: [
          {
            title: "AuditLog Data",
            path: paths.dashboard.observability.auditLog,
          },

          {
            title: "MetricDatapoint Data",
            path: paths.dashboard.observability.metricDatapoint,
          },

          {
            title: "AnomalyEvent Data",
            path: paths.dashboard.observability.anomalyEvent,
          },
        ],
      },

      {
        title: "PlatformAdmin Module",
        path: paths.dashboard.platformAdmin.root,
        icon: ICONS.folder,

        children: [
          {
            title: "OpenApiSchema Data",
            path: paths.dashboard.platformAdmin.openApiSchema,
          },
        ],
      },

      {
        title: "Auth Module",
        path: paths.dashboard.auth.root,
        icon: ICONS.folder,

        children: [
          {
            title: "User Data",
            path: paths.dashboard.auth.user,
          },

          {
            title: "UserGroup Data",
            path: paths.dashboard.auth.userGroup,
          },

          {
            title: "UserGroupMember Data",
            path: paths.dashboard.auth.userGroupMember,
          },

          {
            title: "Store Data",
            path: paths.dashboard.auth.store,
          },
        ],
      },
    ],
  },
];

import { Outlet } from "react-router";
import { lazy, Suspense } from "react";

import { CONFIG } from "src/global-config";
import { DashboardLayout, DataObjectLayout } from "src/layouts/dashboard";

import { LoadingScreen } from "src/components/loading-screen";

import { AuthGuard } from "src/auth/guard";

import { usePathname } from "../hooks";

const IndexPage = lazy(() => import("src/pages/dashboard"));

const SalesManagementSaleTransactionAppPage = lazy(
  () => import("src/pages/dashboard/salesmanagement/saletransaction"),
);

const SalesManagementSaleTransactionHistoryAppPage = lazy(
  () => import("src/pages/dashboard/salesmanagement/saletransactionhistory"),
);

const InventoryManagementInventoryItemAppPage = lazy(
  () => import("src/pages/dashboard/inventorymanagement/inventoryitem"),
);

const InventoryManagementInventoryMovementAppPage = lazy(
  () => import("src/pages/dashboard/inventorymanagement/inventorymovement"),
);

const InventoryManagementLowStockAlertAppPage = lazy(
  () => import("src/pages/dashboard/inventorymanagement/lowstockalert"),
);

const StoreManagementStoreAppPage = lazy(
  () => import("src/pages/dashboard/storemanagement/store"),
);

const StoreManagementStoreAssignmentAppPage = lazy(
  () => import("src/pages/dashboard/storemanagement/storeassignment"),
);

const ReportingReportRequestAppPage = lazy(
  () => import("src/pages/dashboard/reporting/reportrequest"),
);

const ReportingReportFileAppPage = lazy(
  () => import("src/pages/dashboard/reporting/reportfile"),
);

const ReportingReportPolicyAppPage = lazy(
  () => import("src/pages/dashboard/reporting/reportpolicy"),
);

const ObservabilityAuditLogAppPage = lazy(
  () => import("src/pages/dashboard/observability/auditlog"),
);

const ObservabilityMetricDatapointAppPage = lazy(
  () => import("src/pages/dashboard/observability/metricdatapoint"),
);

const ObservabilityAnomalyEventAppPage = lazy(
  () => import("src/pages/dashboard/observability/anomalyevent"),
);

const PlatformAdminOpenApiSchemaAppPage = lazy(
  () => import("src/pages/dashboard/platformadmin/openapischema"),
);

const AuthUserAppPage = lazy(() => import("src/pages/dashboard/auth/user"));

const AuthUserGroupAppPage = lazy(
  () => import("src/pages/dashboard/auth/usergroup"),
);

const AuthUserGroupMemberAppPage = lazy(
  () => import("src/pages/dashboard/auth/usergroupmember"),
);

const AuthStoreAppPage = lazy(() => import("src/pages/dashboard/auth/store"));

function SuspenseOutlet() {
  const pathname = usePathname();
  return (
    <Suspense key={pathname} fallback={<LoadingScreen />}>
      <Outlet />
    </Suspense>
  );
}

const dashboardLayout = () => (
  <DashboardLayout>
    <SuspenseOutlet />
  </DashboardLayout>
);

export const dashboardRoutes = [
  {
    path: "dashboard",
    element: CONFIG.auth.skip ? (
      dashboardLayout()
    ) : (
      <AuthGuard>{dashboardLayout()}</AuthGuard>
    ),
    children: [
      { index: true, element: <IndexPage /> },

      {
        path: "salesManagement",
        element: <DataObjectLayout />,
        children: [
          {
            index: true,
            element: <SalesManagementSaleTransactionAppPage />,
          },

          {
            path: "saleTransaction",
            element: <SalesManagementSaleTransactionAppPage />,
          },

          {
            path: "saleTransactionHistory",
            element: <SalesManagementSaleTransactionHistoryAppPage />,
          },
        ],
      },

      {
        path: "inventoryManagement",
        element: <DataObjectLayout />,
        children: [
          {
            index: true,
            element: <InventoryManagementInventoryItemAppPage />,
          },

          {
            path: "inventoryItem",
            element: <InventoryManagementInventoryItemAppPage />,
          },

          {
            path: "inventoryMovement",
            element: <InventoryManagementInventoryMovementAppPage />,
          },

          {
            path: "lowStockAlert",
            element: <InventoryManagementLowStockAlertAppPage />,
          },
        ],
      },

      {
        path: "storeManagement",
        element: <DataObjectLayout />,
        children: [
          {
            index: true,
            element: <StoreManagementStoreAppPage />,
          },

          {
            path: "store",
            element: <StoreManagementStoreAppPage />,
          },

          {
            path: "storeAssignment",
            element: <StoreManagementStoreAssignmentAppPage />,
          },
        ],
      },

      {
        path: "reporting",
        element: <DataObjectLayout />,
        children: [
          {
            index: true,
            element: <ReportingReportRequestAppPage />,
          },

          {
            path: "reportRequest",
            element: <ReportingReportRequestAppPage />,
          },

          {
            path: "reportFile",
            element: <ReportingReportFileAppPage />,
          },

          {
            path: "reportPolicy",
            element: <ReportingReportPolicyAppPage />,
          },
        ],
      },

      {
        path: "observability",
        element: <DataObjectLayout />,
        children: [
          {
            index: true,
            element: <ObservabilityAuditLogAppPage />,
          },

          {
            path: "auditLog",
            element: <ObservabilityAuditLogAppPage />,
          },

          {
            path: "metricDatapoint",
            element: <ObservabilityMetricDatapointAppPage />,
          },

          {
            path: "anomalyEvent",
            element: <ObservabilityAnomalyEventAppPage />,
          },
        ],
      },

      {
        path: "platformAdmin",
        element: <DataObjectLayout />,
        children: [
          {
            index: true,
            element: <PlatformAdminOpenApiSchemaAppPage />,
          },

          {
            path: "openApiSchema",
            element: <PlatformAdminOpenApiSchemaAppPage />,
          },
        ],
      },

      {
        path: "auth",
        element: <DataObjectLayout />,
        children: [
          {
            index: true,
            element: <AuthUserAppPage />,
          },

          {
            path: "user",
            element: <AuthUserAppPage />,
          },

          {
            path: "userGroup",
            element: <AuthUserGroupAppPage />,
          },

          {
            path: "userGroupMember",
            element: <AuthUserGroupMemberAppPage />,
          },

          {
            path: "store",
            element: <AuthStoreAppPage />,
          },
        ],
      },
    ],
  },
];

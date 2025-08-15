import { lazy } from "react";

import { useDataObjectContext } from "../nav-section/data/context/index.js";

const SalesManagementGetSaleTransactionApiPage = lazy(
  () =>
    import(
      "src/pages/dashboard/salesmanagement/saletransaction/getsaletransaction-api"
    ),
);

const SalesManagementCreateSaleTransactionApiPage = lazy(
  () =>
    import(
      "src/pages/dashboard/salesmanagement/saletransaction/createsaletransaction-api"
    ),
);

const SalesManagementUpdateSaleTransactionApiPage = lazy(
  () =>
    import(
      "src/pages/dashboard/salesmanagement/saletransaction/updatesaletransaction-api"
    ),
);

const SalesManagementDeleteSaleTransactionApiPage = lazy(
  () =>
    import(
      "src/pages/dashboard/salesmanagement/saletransaction/deletesaletransaction-api"
    ),
);

const SalesManagementListSaleTransactionsApiPage = lazy(
  () =>
    import(
      "src/pages/dashboard/salesmanagement/saletransaction/listsaletransactions-api"
    ),
);

const SalesManagementGetSaleTransactionHistoryApiPage = lazy(
  () =>
    import(
      "src/pages/dashboard/salesmanagement/saletransactionhistory/getsaletransactionhistory-api"
    ),
);

const SalesManagementCreateSaleTransactionHistoryApiPage = lazy(
  () =>
    import(
      "src/pages/dashboard/salesmanagement/saletransactionhistory/createsaletransactionhistory-api"
    ),
);

const SalesManagementDeleteSaleTransactionHistoryApiPage = lazy(
  () =>
    import(
      "src/pages/dashboard/salesmanagement/saletransactionhistory/deletesaletransactionhistory-api"
    ),
);

const SalesManagementListSaleTransactionHistoriesApiPage = lazy(
  () =>
    import(
      "src/pages/dashboard/salesmanagement/saletransactionhistory/listsaletransactionhistories-api"
    ),
);

const InventoryManagementGetInventoryItemApiPage = lazy(
  () =>
    import(
      "src/pages/dashboard/inventorymanagement/inventoryitem/getinventoryitem-api"
    ),
);

const InventoryManagementCreateInventoryItemApiPage = lazy(
  () =>
    import(
      "src/pages/dashboard/inventorymanagement/inventoryitem/createinventoryitem-api"
    ),
);

const InventoryManagementUpdateInventoryItemApiPage = lazy(
  () =>
    import(
      "src/pages/dashboard/inventorymanagement/inventoryitem/updateinventoryitem-api"
    ),
);

const InventoryManagementDeleteInventoryItemApiPage = lazy(
  () =>
    import(
      "src/pages/dashboard/inventorymanagement/inventoryitem/deleteinventoryitem-api"
    ),
);

const InventoryManagementListInventoryItemsApiPage = lazy(
  () =>
    import(
      "src/pages/dashboard/inventorymanagement/inventoryitem/listinventoryitems-api"
    ),
);

const InventoryManagementGetInventoryMovementApiPage = lazy(
  () =>
    import(
      "src/pages/dashboard/inventorymanagement/inventorymovement/getinventorymovement-api"
    ),
);

const InventoryManagementCreateInventoryMovementApiPage = lazy(
  () =>
    import(
      "src/pages/dashboard/inventorymanagement/inventorymovement/createinventorymovement-api"
    ),
);

const InventoryManagementDeleteInventoryMovementApiPage = lazy(
  () =>
    import(
      "src/pages/dashboard/inventorymanagement/inventorymovement/deleteinventorymovement-api"
    ),
);

const InventoryManagementListInventoryMovementsApiPage = lazy(
  () =>
    import(
      "src/pages/dashboard/inventorymanagement/inventorymovement/listinventorymovements-api"
    ),
);

const InventoryManagementGetLowStockAlertApiPage = lazy(
  () =>
    import(
      "src/pages/dashboard/inventorymanagement/lowstockalert/getlowstockalert-api"
    ),
);

const InventoryManagementCreateLowStockAlertApiPage = lazy(
  () =>
    import(
      "src/pages/dashboard/inventorymanagement/lowstockalert/createlowstockalert-api"
    ),
);

const InventoryManagementResolveLowStockAlertApiPage = lazy(
  () =>
    import(
      "src/pages/dashboard/inventorymanagement/lowstockalert/resolvelowstockalert-api"
    ),
);

const InventoryManagementDeleteLowStockAlertApiPage = lazy(
  () =>
    import(
      "src/pages/dashboard/inventorymanagement/lowstockalert/deletelowstockalert-api"
    ),
);

const InventoryManagementListLowStockAlertsApiPage = lazy(
  () =>
    import(
      "src/pages/dashboard/inventorymanagement/lowstockalert/listlowstockalerts-api"
    ),
);

const StoreManagementGetStoreApiPage = lazy(
  () => import("src/pages/dashboard/storemanagement/store/getstore-api"),
);

const StoreManagementCreateStoreApiPage = lazy(
  () => import("src/pages/dashboard/storemanagement/store/createstore-api"),
);

const StoreManagementUpdateStoreApiPage = lazy(
  () => import("src/pages/dashboard/storemanagement/store/updatestore-api"),
);

const StoreManagementDeleteStoreApiPage = lazy(
  () => import("src/pages/dashboard/storemanagement/store/deletestore-api"),
);

const StoreManagementListStoresApiPage = lazy(
  () => import("src/pages/dashboard/storemanagement/store/liststores-api"),
);

const StoreManagementGetStoreAssignmentApiPage = lazy(
  () =>
    import(
      "src/pages/dashboard/storemanagement/storeassignment/getstoreassignment-api"
    ),
);

const StoreManagementCreateStoreAssignmentApiPage = lazy(
  () =>
    import(
      "src/pages/dashboard/storemanagement/storeassignment/createstoreassignment-api"
    ),
);

const StoreManagementUpdateStoreAssignmentApiPage = lazy(
  () =>
    import(
      "src/pages/dashboard/storemanagement/storeassignment/updatestoreassignment-api"
    ),
);

const StoreManagementDeleteStoreAssignmentApiPage = lazy(
  () =>
    import(
      "src/pages/dashboard/storemanagement/storeassignment/deletestoreassignment-api"
    ),
);

const StoreManagementListStoreAssignmentsApiPage = lazy(
  () =>
    import(
      "src/pages/dashboard/storemanagement/storeassignment/liststoreassignments-api"
    ),
);

const ReportingGetReportRequestApiPage = lazy(
  () =>
    import("src/pages/dashboard/reporting/reportrequest/getreportrequest-api"),
);

const ReportingCreateReportRequestApiPage = lazy(
  () =>
    import(
      "src/pages/dashboard/reporting/reportrequest/createreportrequest-api"
    ),
);

const ReportingUpdateReportRequestApiPage = lazy(
  () =>
    import(
      "src/pages/dashboard/reporting/reportrequest/updatereportrequest-api"
    ),
);

const ReportingDeleteReportRequestApiPage = lazy(
  () =>
    import(
      "src/pages/dashboard/reporting/reportrequest/deletereportrequest-api"
    ),
);

const ReportingListReportRequestsApiPage = lazy(
  () =>
    import(
      "src/pages/dashboard/reporting/reportrequest/listreportrequests-api"
    ),
);

const ReportingGetReportFileApiPage = lazy(
  () => import("src/pages/dashboard/reporting/reportfile/getreportfile-api"),
);

const ReportingCreateReportFileApiPage = lazy(
  () => import("src/pages/dashboard/reporting/reportfile/createreportfile-api"),
);

const ReportingUpdateReportFileApiPage = lazy(
  () => import("src/pages/dashboard/reporting/reportfile/updatereportfile-api"),
);

const ReportingDeleteReportFileApiPage = lazy(
  () => import("src/pages/dashboard/reporting/reportfile/deletereportfile-api"),
);

const ReportingListReportFilesApiPage = lazy(
  () => import("src/pages/dashboard/reporting/reportfile/listreportfiles-api"),
);

const ReportingGetReportPolicyApiPage = lazy(
  () =>
    import("src/pages/dashboard/reporting/reportpolicy/getreportpolicy-api"),
);

const ReportingCreateReportPolicyApiPage = lazy(
  () =>
    import("src/pages/dashboard/reporting/reportpolicy/createreportpolicy-api"),
);

const ReportingUpdateReportPolicyApiPage = lazy(
  () =>
    import("src/pages/dashboard/reporting/reportpolicy/updatereportpolicy-api"),
);

const ReportingDeleteReportPolicyApiPage = lazy(
  () =>
    import("src/pages/dashboard/reporting/reportpolicy/deletereportpolicy-api"),
);

const ReportingListReportPoliciesApiPage = lazy(
  () =>
    import("src/pages/dashboard/reporting/reportpolicy/listreportpolicies-api"),
);

const ObservabilityGetAuditLogApiPage = lazy(
  () => import("src/pages/dashboard/observability/auditlog/getauditlog-api"),
);

const ObservabilityCreateAuditLogApiPage = lazy(
  () => import("src/pages/dashboard/observability/auditlog/createauditlog-api"),
);

const ObservabilityUpdateAuditLogApiPage = lazy(
  () => import("src/pages/dashboard/observability/auditlog/updateauditlog-api"),
);

const ObservabilityDeleteAuditLogApiPage = lazy(
  () => import("src/pages/dashboard/observability/auditlog/deleteauditlog-api"),
);

const ObservabilityListAuditLogsApiPage = lazy(
  () => import("src/pages/dashboard/observability/auditlog/listauditlogs-api"),
);

const ObservabilityGetMetricDatapointApiPage = lazy(
  () =>
    import(
      "src/pages/dashboard/observability/metricdatapoint/getmetricdatapoint-api"
    ),
);

const ObservabilityCreateMetricDatapointApiPage = lazy(
  () =>
    import(
      "src/pages/dashboard/observability/metricdatapoint/createmetricdatapoint-api"
    ),
);

const ObservabilityUpdateMetricDatapointApiPage = lazy(
  () =>
    import(
      "src/pages/dashboard/observability/metricdatapoint/updatemetricdatapoint-api"
    ),
);

const ObservabilityDeleteMetricDatapointApiPage = lazy(
  () =>
    import(
      "src/pages/dashboard/observability/metricdatapoint/deletemetricdatapoint-api"
    ),
);

const ObservabilityListMetricDatapointsApiPage = lazy(
  () =>
    import(
      "src/pages/dashboard/observability/metricdatapoint/listmetricdatapoints-api"
    ),
);

const ObservabilityGetAnomalyEventApiPage = lazy(
  () =>
    import(
      "src/pages/dashboard/observability/anomalyevent/getanomalyevent-api"
    ),
);

const ObservabilityCreateAnomalyEventApiPage = lazy(
  () =>
    import(
      "src/pages/dashboard/observability/anomalyevent/createanomalyevent-api"
    ),
);

const ObservabilityUpdateAnomalyEventApiPage = lazy(
  () =>
    import(
      "src/pages/dashboard/observability/anomalyevent/updateanomalyevent-api"
    ),
);

const ObservabilityDeleteAnomalyEventApiPage = lazy(
  () =>
    import(
      "src/pages/dashboard/observability/anomalyevent/deleteanomalyevent-api"
    ),
);

const ObservabilityListAnomalyEventsApiPage = lazy(
  () =>
    import(
      "src/pages/dashboard/observability/anomalyevent/listanomalyevents-api"
    ),
);

const PlatformAdminGetOpenApiSchemaApiPage = lazy(
  () =>
    import(
      "src/pages/dashboard/platformadmin/openapischema/getopenapischema-api"
    ),
);

const PlatformAdminCreateOpenApiSchemaApiPage = lazy(
  () =>
    import(
      "src/pages/dashboard/platformadmin/openapischema/createopenapischema-api"
    ),
);

const PlatformAdminUpdateOpenApiSchemaApiPage = lazy(
  () =>
    import(
      "src/pages/dashboard/platformadmin/openapischema/updateopenapischema-api"
    ),
);

const PlatformAdminDeleteOpenApiSchemaApiPage = lazy(
  () =>
    import(
      "src/pages/dashboard/platformadmin/openapischema/deleteopenapischema-api"
    ),
);

const PlatformAdminListOpenApiSchemasApiPage = lazy(
  () =>
    import(
      "src/pages/dashboard/platformadmin/openapischema/listopenapischemas-api"
    ),
);

const AuthCreateUserApiPage = lazy(
  () => import("src/pages/dashboard/auth/user/createuser-api"),
);

const AuthUpdateUserApiPage = lazy(
  () => import("src/pages/dashboard/auth/user/updateuser-api"),
);

const AuthDeleteUserApiPage = lazy(
  () => import("src/pages/dashboard/auth/user/deleteuser-api"),
);

const AuthUpdateUserRoleApiPage = lazy(
  () => import("src/pages/dashboard/auth/user/updateuserrole-api"),
);

const AuthUpdatePasswordApiPage = lazy(
  () => import("src/pages/dashboard/auth/user/updatepassword-api"),
);

const AuthRegisterTenantUserApiPage = lazy(
  () => import("src/pages/dashboard/auth/user/registertenantuser-api"),
);

const AuthRegisterStoreOwnerApiPage = lazy(
  () => import("src/pages/dashboard/auth/user/registerstoreowner-api"),
);

const AuthGetUserApiPage = lazy(
  () => import("src/pages/dashboard/auth/user/getuser-api"),
);

const AuthListUsersApiPage = lazy(
  () => import("src/pages/dashboard/auth/user/listusers-api"),
);

const AuthCreateGroupApiPage = lazy(
  () => import("src/pages/dashboard/auth/usergroup/creategroup-api"),
);

const AuthUpdateGroupApiPage = lazy(
  () => import("src/pages/dashboard/auth/usergroup/updategroup-api"),
);

const AuthGetGroupApiPage = lazy(
  () => import("src/pages/dashboard/auth/usergroup/getgroup-api"),
);

const AuthListGroupsApiPage = lazy(
  () => import("src/pages/dashboard/auth/usergroup/listgroups-api"),
);

const AuthCreateGroupMemberApiPage = lazy(
  () =>
    import("src/pages/dashboard/auth/usergroupmember/creategroupmember-api"),
);

const AuthDeleteGroupMemberApiPage = lazy(
  () =>
    import("src/pages/dashboard/auth/usergroupmember/deletegroupmember-api"),
);

const AuthGetGroupMemberApiPage = lazy(
  () => import("src/pages/dashboard/auth/usergroupmember/getgroupmember-api"),
);

const AuthListGroupMembersApiPage = lazy(
  () => import("src/pages/dashboard/auth/usergroupmember/listgroupmembers-api"),
);

const AuthCreateStoreApiPage = lazy(
  () => import("src/pages/dashboard/auth/store/createstore-api"),
);

const AuthGetStoreApiPage = lazy(
  () => import("src/pages/dashboard/auth/store/getstore-api"),
);

const AuthGetStoreByCodenameApiPage = lazy(
  () => import("src/pages/dashboard/auth/store/getstorebycodename-api"),
);

const AuthListRegisteredStoresApiPage = lazy(
  () => import("src/pages/dashboard/auth/store/listregisteredstores-api"),
);

const APIComponents = {
  SalesManagementGetSaleTransactionApiPage: (
    <SalesManagementGetSaleTransactionApiPage />
  ),

  SalesManagementCreateSaleTransactionApiPage: (
    <SalesManagementCreateSaleTransactionApiPage />
  ),

  SalesManagementUpdateSaleTransactionApiPage: (
    <SalesManagementUpdateSaleTransactionApiPage />
  ),

  SalesManagementDeleteSaleTransactionApiPage: (
    <SalesManagementDeleteSaleTransactionApiPage />
  ),

  SalesManagementListSaleTransactionsApiPage: (
    <SalesManagementListSaleTransactionsApiPage />
  ),

  SalesManagementGetSaleTransactionHistoryApiPage: (
    <SalesManagementGetSaleTransactionHistoryApiPage />
  ),

  SalesManagementCreateSaleTransactionHistoryApiPage: (
    <SalesManagementCreateSaleTransactionHistoryApiPage />
  ),

  SalesManagementDeleteSaleTransactionHistoryApiPage: (
    <SalesManagementDeleteSaleTransactionHistoryApiPage />
  ),

  SalesManagementListSaleTransactionHistoriesApiPage: (
    <SalesManagementListSaleTransactionHistoriesApiPage />
  ),

  InventoryManagementGetInventoryItemApiPage: (
    <InventoryManagementGetInventoryItemApiPage />
  ),

  InventoryManagementCreateInventoryItemApiPage: (
    <InventoryManagementCreateInventoryItemApiPage />
  ),

  InventoryManagementUpdateInventoryItemApiPage: (
    <InventoryManagementUpdateInventoryItemApiPage />
  ),

  InventoryManagementDeleteInventoryItemApiPage: (
    <InventoryManagementDeleteInventoryItemApiPage />
  ),

  InventoryManagementListInventoryItemsApiPage: (
    <InventoryManagementListInventoryItemsApiPage />
  ),

  InventoryManagementGetInventoryMovementApiPage: (
    <InventoryManagementGetInventoryMovementApiPage />
  ),

  InventoryManagementCreateInventoryMovementApiPage: (
    <InventoryManagementCreateInventoryMovementApiPage />
  ),

  InventoryManagementDeleteInventoryMovementApiPage: (
    <InventoryManagementDeleteInventoryMovementApiPage />
  ),

  InventoryManagementListInventoryMovementsApiPage: (
    <InventoryManagementListInventoryMovementsApiPage />
  ),

  InventoryManagementGetLowStockAlertApiPage: (
    <InventoryManagementGetLowStockAlertApiPage />
  ),

  InventoryManagementCreateLowStockAlertApiPage: (
    <InventoryManagementCreateLowStockAlertApiPage />
  ),

  InventoryManagementResolveLowStockAlertApiPage: (
    <InventoryManagementResolveLowStockAlertApiPage />
  ),

  InventoryManagementDeleteLowStockAlertApiPage: (
    <InventoryManagementDeleteLowStockAlertApiPage />
  ),

  InventoryManagementListLowStockAlertsApiPage: (
    <InventoryManagementListLowStockAlertsApiPage />
  ),

  StoreManagementGetStoreApiPage: <StoreManagementGetStoreApiPage />,

  StoreManagementCreateStoreApiPage: <StoreManagementCreateStoreApiPage />,

  StoreManagementUpdateStoreApiPage: <StoreManagementUpdateStoreApiPage />,

  StoreManagementDeleteStoreApiPage: <StoreManagementDeleteStoreApiPage />,

  StoreManagementListStoresApiPage: <StoreManagementListStoresApiPage />,

  StoreManagementGetStoreAssignmentApiPage: (
    <StoreManagementGetStoreAssignmentApiPage />
  ),

  StoreManagementCreateStoreAssignmentApiPage: (
    <StoreManagementCreateStoreAssignmentApiPage />
  ),

  StoreManagementUpdateStoreAssignmentApiPage: (
    <StoreManagementUpdateStoreAssignmentApiPage />
  ),

  StoreManagementDeleteStoreAssignmentApiPage: (
    <StoreManagementDeleteStoreAssignmentApiPage />
  ),

  StoreManagementListStoreAssignmentsApiPage: (
    <StoreManagementListStoreAssignmentsApiPage />
  ),

  ReportingGetReportRequestApiPage: <ReportingGetReportRequestApiPage />,

  ReportingCreateReportRequestApiPage: <ReportingCreateReportRequestApiPage />,

  ReportingUpdateReportRequestApiPage: <ReportingUpdateReportRequestApiPage />,

  ReportingDeleteReportRequestApiPage: <ReportingDeleteReportRequestApiPage />,

  ReportingListReportRequestsApiPage: <ReportingListReportRequestsApiPage />,

  ReportingGetReportFileApiPage: <ReportingGetReportFileApiPage />,

  ReportingCreateReportFileApiPage: <ReportingCreateReportFileApiPage />,

  ReportingUpdateReportFileApiPage: <ReportingUpdateReportFileApiPage />,

  ReportingDeleteReportFileApiPage: <ReportingDeleteReportFileApiPage />,

  ReportingListReportFilesApiPage: <ReportingListReportFilesApiPage />,

  ReportingGetReportPolicyApiPage: <ReportingGetReportPolicyApiPage />,

  ReportingCreateReportPolicyApiPage: <ReportingCreateReportPolicyApiPage />,

  ReportingUpdateReportPolicyApiPage: <ReportingUpdateReportPolicyApiPage />,

  ReportingDeleteReportPolicyApiPage: <ReportingDeleteReportPolicyApiPage />,

  ReportingListReportPoliciesApiPage: <ReportingListReportPoliciesApiPage />,

  ObservabilityGetAuditLogApiPage: <ObservabilityGetAuditLogApiPage />,

  ObservabilityCreateAuditLogApiPage: <ObservabilityCreateAuditLogApiPage />,

  ObservabilityUpdateAuditLogApiPage: <ObservabilityUpdateAuditLogApiPage />,

  ObservabilityDeleteAuditLogApiPage: <ObservabilityDeleteAuditLogApiPage />,

  ObservabilityListAuditLogsApiPage: <ObservabilityListAuditLogsApiPage />,

  ObservabilityGetMetricDatapointApiPage: (
    <ObservabilityGetMetricDatapointApiPage />
  ),

  ObservabilityCreateMetricDatapointApiPage: (
    <ObservabilityCreateMetricDatapointApiPage />
  ),

  ObservabilityUpdateMetricDatapointApiPage: (
    <ObservabilityUpdateMetricDatapointApiPage />
  ),

  ObservabilityDeleteMetricDatapointApiPage: (
    <ObservabilityDeleteMetricDatapointApiPage />
  ),

  ObservabilityListMetricDatapointsApiPage: (
    <ObservabilityListMetricDatapointsApiPage />
  ),

  ObservabilityGetAnomalyEventApiPage: <ObservabilityGetAnomalyEventApiPage />,

  ObservabilityCreateAnomalyEventApiPage: (
    <ObservabilityCreateAnomalyEventApiPage />
  ),

  ObservabilityUpdateAnomalyEventApiPage: (
    <ObservabilityUpdateAnomalyEventApiPage />
  ),

  ObservabilityDeleteAnomalyEventApiPage: (
    <ObservabilityDeleteAnomalyEventApiPage />
  ),

  ObservabilityListAnomalyEventsApiPage: (
    <ObservabilityListAnomalyEventsApiPage />
  ),

  PlatformAdminGetOpenApiSchemaApiPage: (
    <PlatformAdminGetOpenApiSchemaApiPage />
  ),

  PlatformAdminCreateOpenApiSchemaApiPage: (
    <PlatformAdminCreateOpenApiSchemaApiPage />
  ),

  PlatformAdminUpdateOpenApiSchemaApiPage: (
    <PlatformAdminUpdateOpenApiSchemaApiPage />
  ),

  PlatformAdminDeleteOpenApiSchemaApiPage: (
    <PlatformAdminDeleteOpenApiSchemaApiPage />
  ),

  PlatformAdminListOpenApiSchemasApiPage: (
    <PlatformAdminListOpenApiSchemasApiPage />
  ),

  AuthCreateUserApiPage: <AuthCreateUserApiPage />,

  AuthUpdateUserApiPage: <AuthUpdateUserApiPage />,

  AuthDeleteUserApiPage: <AuthDeleteUserApiPage />,

  AuthUpdateUserRoleApiPage: <AuthUpdateUserRoleApiPage />,

  AuthUpdatePasswordApiPage: <AuthUpdatePasswordApiPage />,

  AuthRegisterTenantUserApiPage: <AuthRegisterTenantUserApiPage />,

  AuthRegisterStoreOwnerApiPage: <AuthRegisterStoreOwnerApiPage />,

  AuthGetUserApiPage: <AuthGetUserApiPage />,

  AuthListUsersApiPage: <AuthListUsersApiPage />,

  AuthCreateGroupApiPage: <AuthCreateGroupApiPage />,

  AuthUpdateGroupApiPage: <AuthUpdateGroupApiPage />,

  AuthGetGroupApiPage: <AuthGetGroupApiPage />,

  AuthListGroupsApiPage: <AuthListGroupsApiPage />,

  AuthCreateGroupMemberApiPage: <AuthCreateGroupMemberApiPage />,

  AuthDeleteGroupMemberApiPage: <AuthDeleteGroupMemberApiPage />,

  AuthGetGroupMemberApiPage: <AuthGetGroupMemberApiPage />,

  AuthListGroupMembersApiPage: <AuthListGroupMembersApiPage />,

  AuthCreateStoreApiPage: <AuthCreateStoreApiPage />,

  AuthGetStoreApiPage: <AuthGetStoreApiPage />,

  AuthGetStoreByCodenameApiPage: <AuthGetStoreByCodenameApiPage />,

  AuthListRegisteredStoresApiPage: <AuthListRegisteredStoresApiPage />,
};
export function DataObjectApi() {
  const { state } = useDataObjectContext();

  if (!state.selectedApi) return <h2>{state.name} API</h2>;

  return <>{state.selectedApi && APIComponents[state.selectedApi]}</>;
}

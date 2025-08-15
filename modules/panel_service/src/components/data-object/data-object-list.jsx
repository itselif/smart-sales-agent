import { useState, lazy } from "react";
import { useBoolean } from "minimal-shared/hooks";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import {
  DataGrid,
  gridClasses,
  GridToolbarExport,
  GridToolbarContainer,
  GridToolbarQuickFilter,
  GridToolbarFilterButton,
  GridToolbarColumnsButton,
  GridToolbarDensitySelector,
} from "@mui/x-data-grid";

import { EmptyContent } from "src/components/empty-content";

import { Iconify } from "../iconify/index.js";
import { useDataObjectContext } from "../nav-section/data/context/index.js";

const SalesManagementCreateSaleTransactionModal = lazy(
  () =>
    import(
      "src/components/modals/salesmanagement/saletransaction/createsaletransaction-modal"
    ),
);

const SalesManagementCreateSaleTransactionHistoryModal = lazy(
  () =>
    import(
      "src/components/modals/salesmanagement/saletransactionhistory/createsaletransactionhistory-modal"
    ),
);

const InventoryManagementCreateInventoryItemModal = lazy(
  () =>
    import(
      "src/components/modals/inventorymanagement/inventoryitem/createinventoryitem-modal"
    ),
);

const InventoryManagementCreateInventoryMovementModal = lazy(
  () =>
    import(
      "src/components/modals/inventorymanagement/inventorymovement/createinventorymovement-modal"
    ),
);

const InventoryManagementCreateLowStockAlertModal = lazy(
  () =>
    import(
      "src/components/modals/inventorymanagement/lowstockalert/createlowstockalert-modal"
    ),
);

const StoreManagementCreateStoreModal = lazy(
  () => import("src/components/modals/storemanagement/store/createstore-modal"),
);

const StoreManagementCreateStoreAssignmentModal = lazy(
  () =>
    import(
      "src/components/modals/storemanagement/storeassignment/createstoreassignment-modal"
    ),
);

const ReportingCreateReportRequestModal = lazy(
  () =>
    import(
      "src/components/modals/reporting/reportrequest/createreportrequest-modal"
    ),
);

const ReportingCreateReportFileModal = lazy(
  () =>
    import("src/components/modals/reporting/reportfile/createreportfile-modal"),
);

const ReportingCreateReportPolicyModal = lazy(
  () =>
    import(
      "src/components/modals/reporting/reportpolicy/createreportpolicy-modal"
    ),
);

const ObservabilityCreateAuditLogModal = lazy(
  () =>
    import("src/components/modals/observability/auditlog/createauditlog-modal"),
);

const ObservabilityCreateMetricDatapointModal = lazy(
  () =>
    import(
      "src/components/modals/observability/metricdatapoint/createmetricdatapoint-modal"
    ),
);

const ObservabilityCreateAnomalyEventModal = lazy(
  () =>
    import(
      "src/components/modals/observability/anomalyevent/createanomalyevent-modal"
    ),
);

const PlatformAdminCreateOpenApiSchemaModal = lazy(
  () =>
    import(
      "src/components/modals/platformadmin/openapischema/createopenapischema-modal"
    ),
);

const AuthCreateUserModal = lazy(
  () => import("src/components/modals/auth/user/createuser-modal"),
);

const CreateModals = {
  SalesManagementCreateSaleTransactionModal,

  SalesManagementCreateSaleTransactionHistoryModal,

  InventoryManagementCreateInventoryItemModal,

  InventoryManagementCreateInventoryMovementModal,

  InventoryManagementCreateLowStockAlertModal,

  StoreManagementCreateStoreModal,

  StoreManagementCreateStoreAssignmentModal,

  ReportingCreateReportRequestModal,

  ReportingCreateReportFileModal,

  ReportingCreateReportPolicyModal,

  ObservabilityCreateAuditLogModal,

  ObservabilityCreateMetricDatapointModal,

  ObservabilityCreateAnomalyEventModal,

  PlatformAdminCreateOpenApiSchemaModal,

  AuthCreateUserModal,
};

export function DataObjectList({ columns, rows }) {
  const [filterButtonEl, setFilterButtonEl] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const { state } = useDataObjectContext();
  const openAddDialog = useBoolean();

  const getTogglableColumns = () => columns.map((column) => column.field);

  const CreateModal = CreateModals[state.createModal];
  return (
    <>
      <h2>{state.name} List</h2>

      <Divider />

      <DataGrid
        checkboxSelection
        disableRowSelectionOnClick
        columns={columns}
        rows={rows == null ? [] : rows}
        onRowSelectionModelChange={(newSelectionModel) => {
          setSelectedRows(newSelectionModel);
        }}
        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        pageSizeOptions={[5, 10, 20, 50, { value: -1, label: "All" }]}
        slots={{
          toolbar: CustomToolbar,
          noRowsOverlay: () => <EmptyContent />,
          noResultsOverlay: () => <EmptyContent title="No results found" />,
        }}
        slotProps={{
          panel: { anchorEl: filterButtonEl },
          toolbar: {
            setFilterButtonEl,
            showQuickFilter: true,
            dataObject: state.name,
            onAddClickHandler: openAddDialog.onTrue,
            createModal: CreateModal,
          },
          columnsManagement: { getTogglableColumns },
        }}
        sx={{
          [`& .${gridClasses.cell}`]: {
            alignItems: "center",
            display: "inline-flex",
          },
        }}
      />

      {CreateModal && <CreateModal openDialog={openAddDialog} />}
    </>
  );
}

function CustomToolbar({
  setFilterButtonEl,
  dataObject,
  onAddClickHandler,
  createModal,
}) {
  return (
    <GridToolbarContainer>
      <GridToolbarQuickFilter />
      <Box sx={{ flexGrow: 1 }} />
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton ref={setFilterButtonEl} />
      <GridToolbarDensitySelector />
      <GridToolbarExport />
      {createModal && (
        <Button
          onClick={onAddClickHandler}
          startIcon={<Iconify icon="material-symbols:add" />}
        >
          Add {dataObject}
        </Button>
      )}
      {/* TODO: implement delete multi selected */}
      {/* <Button color="error" startIcon={<Iconify icon="icomoon-free:bin" />}>
                Delete
            </Button> */}
    </GridToolbarContainer>
  );
}

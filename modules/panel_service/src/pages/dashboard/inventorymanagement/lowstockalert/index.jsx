import { lazy, useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";

import { GridActionsCellItem } from "@mui/x-data-grid";

import { CONFIG } from "src/global-config";
import { useInventoryManagementListLowStockAlerts } from "src/actions/inventoryManagement";

import { Iconify } from "src/components/iconify";

import { DashboardContent } from "../../../../layouts/dashboard/index.js";
import { useDataObjectContext } from "../../../../components/nav-section/data/context";
import {
  DataObjectApi,
  DataObjectList,
} from "../../../../components/data-object/index.js";
import { useBoolean } from "minimal-shared/hooks";

// ----------------------------------------------------------------------
// TODO: Add the feature to tell the user what crud route need to be created to use add,update and delete

const metadata = {
  title: `LowStockAlert data - InventoryManagement module - ${CONFIG.appName}`,
};

const InventoryManagementDeleteLowStockAlertModal = lazy(
  () =>
    import(
      "src/components/modals/inventorymanagement/lowstockalert/deletelowstockalert-modal"
    ),
);

export default function InventoryManagementLowStockAlertAppPage() {
  const [selectedLowStockAlert, setSelectedLowStockAlert] = useState(null);

  const openDeleteDialog = useBoolean();

  const { setField, state } = useDataObjectContext();

  const { searchResults: options, searchLoading: loading } =
    useInventoryManagementListLowStockAlerts();

  const OnDeleteClickHandler = (row) => {
    setSelectedLowStockAlert(row);
    openDeleteDialog.onTrue();
  };

  useEffect(() => {
    setField("name", "LowStockAlert");
    setField("selectedApi", null);
    setField("defaultListRouteName", "listlowStockAlerts");

    setField("createModal", "InventoryManagementCreateLowStockAlertModal");

    setField("cruds", [
      {
        name: "GetLowStockAlert",
        method: "GET",
        color: "primary",
        componentName: "InventoryManagementGetLowStockAlertApiPage",
      },

      {
        name: "CreateLowStockAlert",
        method: "CREATE",
        color: "success",
        componentName: "InventoryManagementCreateLowStockAlertApiPage",
      },

      {
        name: "ResolveLowStockAlert",
        method: "UPDATE",
        color: "info",
        componentName: "InventoryManagementResolveLowStockAlertApiPage",
      },

      {
        name: "DeleteLowStockAlert",
        method: "DELETE",
        color: "error",
        componentName: "InventoryManagementDeleteLowStockAlertApiPage",
      },

      {
        name: "ListLowStockAlerts",
        method: "LIST",
        color: "primary",
        componentName: "InventoryManagementListLowStockAlertsApiPage",
      },
    ]);
  }, [setField]);

  const columns = [
    { field: "inventoryItemId", headerName: "inventoryItemId", flex: 1 },

    { field: "alertType", headerName: "alertType", flex: 1 },

    { field: "alertTimestamp", headerName: "alertTimestamp", flex: 1 },

    {
      type: "boolean",
      field: "resolved",
      headerName: "resolved",
      width: 80,
      renderCell: (params) =>
        params.row.resolved ? (
          <Iconify
            icon="eva:checkmark-circle-2-fill"
            sx={{ color: "primary.main" }}
          />
        ) : (
          "-"
        ),
    },

    { field: "resolvedByUserId", headerName: "resolvedByUserId", flex: 1 },

    { field: "resolvedTimestamp", headerName: "resolvedTimestamp", flex: 1 },

    { field: "storeId", headerName: "storeId", flex: 1 },
    {
      type: "actions",
      field: "actions",
      headerName: "Actions",
      width: 80,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      getActions: (params) => [
        <GridActionsCellItem
          showInMenu
          icon={<Iconify icon="solar:trash-bin-trash-bold" />}
          label="Delete"
          onClick={() => OnDeleteClickHandler(params.row)}
          sx={{ color: "error.main" }}
        />,
      ],
    },
  ];

  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <DashboardContent maxWidth="xl">
        {state.display === "List" ? (
          <DataObjectList columns={columns} rows={options} />
        ) : (
          <DataObjectApi />
        )}
      </DashboardContent>

      <InventoryManagementDeleteLowStockAlertModal
        openDialog={openDeleteDialog}
        selectedId={selectedLowStockAlert?.id}
      />
    </>
  );
}

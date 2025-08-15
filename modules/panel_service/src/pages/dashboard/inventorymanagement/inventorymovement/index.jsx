import { lazy, useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";

import { GridActionsCellItem } from "@mui/x-data-grid";

import { CONFIG } from "src/global-config";
import { useInventoryManagementListInventoryMovements } from "src/actions/inventoryManagement";

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
  title: `InventoryMovement data - InventoryManagement module - ${CONFIG.appName}`,
};

const InventoryManagementDeleteInventoryMovementModal = lazy(
  () =>
    import(
      "src/components/modals/inventorymanagement/inventorymovement/deleteinventorymovement-modal"
    ),
);

export default function InventoryManagementInventoryMovementAppPage() {
  const [selectedInventoryMovement, setSelectedInventoryMovement] =
    useState(null);

  const openDeleteDialog = useBoolean();

  const { setField, state } = useDataObjectContext();

  const { searchResults: options, searchLoading: loading } =
    useInventoryManagementListInventoryMovements();

  const OnDeleteClickHandler = (row) => {
    setSelectedInventoryMovement(row);
    openDeleteDialog.onTrue();
  };

  useEffect(() => {
    setField("name", "InventoryMovement");
    setField("selectedApi", null);
    setField("defaultListRouteName", "listinventoryMovements");

    setField("createModal", "InventoryManagementCreateInventoryMovementModal");

    setField("cruds", [
      {
        name: "GetInventoryMovement",
        method: "GET",
        color: "primary",
        componentName: "InventoryManagementGetInventoryMovementApiPage",
      },

      {
        name: "CreateInventoryMovement",
        method: "CREATE",
        color: "success",
        componentName: "InventoryManagementCreateInventoryMovementApiPage",
      },

      {
        name: "DeleteInventoryMovement",
        method: "DELETE",
        color: "error",
        componentName: "InventoryManagementDeleteInventoryMovementApiPage",
      },

      {
        name: "ListInventoryMovements",
        method: "LIST",
        color: "primary",
        componentName: "InventoryManagementListInventoryMovementsApiPage",
      },
    ]);
  }, [setField]);

  const columns = [
    { field: "inventoryItemId", headerName: "inventoryItemId", flex: 1 },

    { field: "quantityDelta", headerName: "quantityDelta", flex: 1 },

    { field: "movementType", headerName: "movementType", flex: 1 },

    { field: "movementTimestamp", headerName: "movementTimestamp", flex: 1 },

    { field: "userId", headerName: "userId", flex: 1 },

    { field: "movementReason", headerName: "movementReason", flex: 1 },

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

      <InventoryManagementDeleteInventoryMovementModal
        openDialog={openDeleteDialog}
        selectedId={selectedInventoryMovement?.id}
      />
    </>
  );
}

import { lazy, useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";

import { GridActionsCellItem } from "@mui/x-data-grid";

import { CONFIG } from "src/global-config";
import { useInventoryManagementListInventoryItems } from "src/actions/inventoryManagement";

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
  title: `InventoryItem data - InventoryManagement module - ${CONFIG.appName}`,
};

const InventoryManagementUpdateInventoryItemModal = lazy(
  () =>
    import(
      "src/components/modals/inventorymanagement/inventoryitem/updateinventoryitem-modal"
    ),
);

const InventoryManagementDeleteInventoryItemModal = lazy(
  () =>
    import(
      "src/components/modals/inventorymanagement/inventoryitem/deleteinventoryitem-modal"
    ),
);

export default function InventoryManagementInventoryItemAppPage() {
  const [selectedInventoryItem, setSelectedInventoryItem] = useState(null);

  const openEditDialog = useBoolean();

  const openDeleteDialog = useBoolean();

  const { setField, state } = useDataObjectContext();

  const { searchResults: options, searchLoading: loading } =
    useInventoryManagementListInventoryItems();

  const OnEditClickHandler = (row) => {
    setSelectedInventoryItem(row);
    openEditDialog.onTrue();
  };

  const OnDeleteClickHandler = (row) => {
    setSelectedInventoryItem(row);
    openDeleteDialog.onTrue();
  };

  useEffect(() => {
    setField("name", "InventoryItem");
    setField("selectedApi", null);
    setField("defaultListRouteName", "listinventoryItems");

    setField("createModal", "InventoryManagementCreateInventoryItemModal");

    setField("cruds", [
      {
        name: "GetInventoryItem",
        method: "GET",
        color: "primary",
        componentName: "InventoryManagementGetInventoryItemApiPage",
      },

      {
        name: "CreateInventoryItem",
        method: "CREATE",
        color: "success",
        componentName: "InventoryManagementCreateInventoryItemApiPage",
      },

      {
        name: "UpdateInventoryItem",
        method: "UPDATE",
        color: "info",
        componentName: "InventoryManagementUpdateInventoryItemApiPage",
      },

      {
        name: "DeleteInventoryItem",
        method: "DELETE",
        color: "error",
        componentName: "InventoryManagementDeleteInventoryItemApiPage",
      },

      {
        name: "ListInventoryItems",
        method: "LIST",
        color: "primary",
        componentName: "InventoryManagementListInventoryItemsApiPage",
      },
    ]);
  }, [setField]);

  const columns = [
    { field: "productId", headerName: "productId", flex: 1 },

    { field: "quantity", headerName: "quantity", flex: 1 },

    { field: "status", headerName: "status", flex: 1 },

    { field: "lowStockThreshold", headerName: "lowStockThreshold", flex: 1 },

    { field: "lastSyncTimestamp", headerName: "lastSyncTimestamp", flex: 1 },

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
          icon={<Iconify icon="solar:pen-bold" />}
          label="Update"
          onClick={() => OnEditClickHandler(params.row)}
        />,

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

      <InventoryManagementUpdateInventoryItemModal
        openDialog={openEditDialog}
        selectedInventoryItem={selectedInventoryItem}
      />

      <InventoryManagementDeleteInventoryItemModal
        openDialog={openDeleteDialog}
        selectedId={selectedInventoryItem?.id}
      />
    </>
  );
}

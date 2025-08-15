import { lazy, useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";

import { GridActionsCellItem } from "@mui/x-data-grid";

import { CONFIG } from "src/global-config";
import { useStoreManagementListStores } from "src/actions/storeManagement";

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
  title: `Store data - StoreManagement module - ${CONFIG.appName}`,
};

const StoreManagementUpdateStoreModal = lazy(
  () => import("src/components/modals/storemanagement/store/updatestore-modal"),
);

const StoreManagementDeleteStoreModal = lazy(
  () => import("src/components/modals/storemanagement/store/deletestore-modal"),
);

export default function StoreManagementStoreAppPage() {
  const [selectedStore, setSelectedStore] = useState(null);

  const openEditDialog = useBoolean();

  const openDeleteDialog = useBoolean();

  const { setField, state } = useDataObjectContext();

  const { searchResults: options, searchLoading: loading } =
    useStoreManagementListStores();

  const OnEditClickHandler = (row) => {
    setSelectedStore(row);
    openEditDialog.onTrue();
  };

  const OnDeleteClickHandler = (row) => {
    setSelectedStore(row);
    openDeleteDialog.onTrue();
  };

  useEffect(() => {
    setField("name", "Store");
    setField("selectedApi", null);
    setField("defaultListRouteName", "liststores");

    setField("createModal", "StoreManagementCreateStoreModal");

    setField("cruds", [
      {
        name: "GetStore",
        method: "GET",
        color: "primary",
        componentName: "StoreManagementGetStoreApiPage",
      },

      {
        name: "CreateStore",
        method: "CREATE",
        color: "success",
        componentName: "StoreManagementCreateStoreApiPage",
      },

      {
        name: "UpdateStore",
        method: "UPDATE",
        color: "info",
        componentName: "StoreManagementUpdateStoreApiPage",
      },

      {
        name: "DeleteStore",
        method: "DELETE",
        color: "error",
        componentName: "StoreManagementDeleteStoreApiPage",
      },

      {
        name: "ListStores",
        method: "LIST",
        color: "primary",
        componentName: "StoreManagementListStoresApiPage",
      },
    ]);
  }, [setField]);

  const columns = [
    { field: "name", headerName: "name", flex: 1 },

    { field: "fullname", headerName: "fullname", flex: 1 },

    { field: "city", headerName: "city", flex: 1 },

    { field: "avatar", headerName: "avatar", flex: 1 },

    {
      type: "boolean",
      field: "active",
      headerName: "active",
      width: 80,
      renderCell: (params) =>
        params.row.active ? (
          <Iconify
            icon="eva:checkmark-circle-2-fill"
            sx={{ color: "primary.main" }}
          />
        ) : (
          "-"
        ),
    },
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

      <StoreManagementUpdateStoreModal
        openDialog={openEditDialog}
        selectedStore={selectedStore}
      />

      <StoreManagementDeleteStoreModal
        openDialog={openDeleteDialog}
        selectedId={selectedStore?.id}
      />
    </>
  );
}

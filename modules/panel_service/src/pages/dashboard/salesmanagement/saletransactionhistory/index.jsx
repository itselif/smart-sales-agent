import { lazy, useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";

import { GridActionsCellItem } from "@mui/x-data-grid";

import { CONFIG } from "src/global-config";
import { useSalesManagementListSaleTransactionHistories } from "src/actions/salesManagement";

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
  title: `SaleTransactionHistory data - SalesManagement module - ${CONFIG.appName}`,
};

const SalesManagementDeleteSaleTransactionHistoryModal = lazy(
  () =>
    import(
      "src/components/modals/salesmanagement/saletransactionhistory/deletesaletransactionhistory-modal"
    ),
);

export default function SalesManagementSaleTransactionHistoryAppPage() {
  const [selectedSaleTransactionHistory, setSelectedSaleTransactionHistory] =
    useState(null);

  const openDeleteDialog = useBoolean();

  const { setField, state } = useDataObjectContext();

  const { searchResults: options, searchLoading: loading } =
    useSalesManagementListSaleTransactionHistories();

  const OnDeleteClickHandler = (row) => {
    setSelectedSaleTransactionHistory(row);
    openDeleteDialog.onTrue();
  };

  useEffect(() => {
    setField("name", "SaleTransactionHistory");
    setField("selectedApi", null);
    setField("defaultListRouteName", "listsaleTransactionHistories");

    setField("createModal", "SalesManagementCreateSaleTransactionHistoryModal");

    setField("cruds", [
      {
        name: "GetSaleTransactionHistory",
        method: "GET",
        color: "primary",
        componentName: "SalesManagementGetSaleTransactionHistoryApiPage",
      },

      {
        name: "CreateSaleTransactionHistory",
        method: "CREATE",
        color: "success",
        componentName: "SalesManagementCreateSaleTransactionHistoryApiPage",
      },

      {
        name: "DeleteSaleTransactionHistory",
        method: "DELETE",
        color: "error",
        componentName: "SalesManagementDeleteSaleTransactionHistoryApiPage",
      },

      {
        name: "ListSaleTransactionHistories",
        method: "LIST",
        color: "primary",
        componentName: "SalesManagementListSaleTransactionHistoriesApiPage",
      },
    ]);
  }, [setField]);

  const columns = [
    { field: "transactionId", headerName: "transactionId", flex: 1 },

    { field: "changeType", headerName: "changeType", flex: 1 },

    { field: "changedByUserId", headerName: "changedByUserId", flex: 1 },

    { field: "changeTimestamp", headerName: "changeTimestamp", flex: 1 },

    {
      field: "correctionJustification",
      headerName: "correctionJustification",
      flex: 1,
    },

    { field: "previousData", headerName: "previousData", flex: 1 },

    { field: "newData", headerName: "newData", flex: 1 },

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

      <SalesManagementDeleteSaleTransactionHistoryModal
        openDialog={openDeleteDialog}
        selectedId={selectedSaleTransactionHistory?.id}
      />
    </>
  );
}

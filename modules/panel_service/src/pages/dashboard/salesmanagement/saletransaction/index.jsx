import { lazy, useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";

import { GridActionsCellItem } from "@mui/x-data-grid";

import { CONFIG } from "src/global-config";
import { useSalesManagementListSaleTransactions } from "src/actions/salesManagement";

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
  title: `SaleTransaction data - SalesManagement module - ${CONFIG.appName}`,
};

const SalesManagementUpdateSaleTransactionModal = lazy(
  () =>
    import(
      "src/components/modals/salesmanagement/saletransaction/updatesaletransaction-modal"
    ),
);

const SalesManagementDeleteSaleTransactionModal = lazy(
  () =>
    import(
      "src/components/modals/salesmanagement/saletransaction/deletesaletransaction-modal"
    ),
);

export default function SalesManagementSaleTransactionAppPage() {
  const [selectedSaleTransaction, setSelectedSaleTransaction] = useState(null);

  const openEditDialog = useBoolean();

  const openDeleteDialog = useBoolean();

  const { setField, state } = useDataObjectContext();

  const { searchResults: options, searchLoading: loading } =
    useSalesManagementListSaleTransactions();

  const OnEditClickHandler = (row) => {
    setSelectedSaleTransaction(row);
    openEditDialog.onTrue();
  };

  const OnDeleteClickHandler = (row) => {
    setSelectedSaleTransaction(row);
    openDeleteDialog.onTrue();
  };

  useEffect(() => {
    setField("name", "SaleTransaction");
    setField("selectedApi", null);
    setField("defaultListRouteName", "listsaleTransactions");

    setField("createModal", "SalesManagementCreateSaleTransactionModal");

    setField("cruds", [
      {
        name: "GetSaleTransaction",
        method: "GET",
        color: "primary",
        componentName: "SalesManagementGetSaleTransactionApiPage",
      },

      {
        name: "CreateSaleTransaction",
        method: "CREATE",
        color: "success",
        componentName: "SalesManagementCreateSaleTransactionApiPage",
      },

      {
        name: "UpdateSaleTransaction",
        method: "UPDATE",
        color: "info",
        componentName: "SalesManagementUpdateSaleTransactionApiPage",
      },

      {
        name: "DeleteSaleTransaction",
        method: "DELETE",
        color: "error",
        componentName: "SalesManagementDeleteSaleTransactionApiPage",
      },

      {
        name: "ListSaleTransactions",
        method: "LIST",
        color: "primary",
        componentName: "SalesManagementListSaleTransactionsApiPage",
      },
    ]);
  }, [setField]);

  const columns = [
    { field: "sellerId", headerName: "sellerId", flex: 1 },

    { field: "amount", headerName: "amount", flex: 1 },

    { field: "currency", headerName: "currency", flex: 1 },

    { field: "transactionDate", headerName: "transactionDate", flex: 1 },

    { field: "status", headerName: "status", flex: 1 },

    {
      field: "correctionJustification",
      headerName: "correctionJustification",
      flex: 1,
    },

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

      <SalesManagementUpdateSaleTransactionModal
        openDialog={openEditDialog}
        selectedSaleTransaction={selectedSaleTransaction}
      />

      <SalesManagementDeleteSaleTransactionModal
        openDialog={openDeleteDialog}
        selectedId={selectedSaleTransaction?.id}
      />
    </>
  );
}

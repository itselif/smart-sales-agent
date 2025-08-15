import { lazy, useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";

import { GridActionsCellItem } from "@mui/x-data-grid";

import { CONFIG } from "src/global-config";
import { useStoreManagementListStoreAssignments } from "src/actions/storeManagement";

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
  title: `StoreAssignment data - StoreManagement module - ${CONFIG.appName}`,
};

const StoreManagementUpdateStoreAssignmentModal = lazy(
  () =>
    import(
      "src/components/modals/storemanagement/storeassignment/updatestoreassignment-modal"
    ),
);

const StoreManagementDeleteStoreAssignmentModal = lazy(
  () =>
    import(
      "src/components/modals/storemanagement/storeassignment/deletestoreassignment-modal"
    ),
);

export default function StoreManagementStoreAssignmentAppPage() {
  const [selectedStoreAssignment, setSelectedStoreAssignment] = useState(null);

  const openEditDialog = useBoolean();

  const openDeleteDialog = useBoolean();

  const { setField, state } = useDataObjectContext();

  const { searchResults: options, searchLoading: loading } =
    useStoreManagementListStoreAssignments();

  const OnEditClickHandler = (row) => {
    setSelectedStoreAssignment(row);
    openEditDialog.onTrue();
  };

  const OnDeleteClickHandler = (row) => {
    setSelectedStoreAssignment(row);
    openDeleteDialog.onTrue();
  };

  useEffect(() => {
    setField("name", "StoreAssignment");
    setField("selectedApi", null);
    setField("defaultListRouteName", "liststoreAssignments");

    setField("createModal", "StoreManagementCreateStoreAssignmentModal");

    setField("cruds", [
      {
        name: "GetStoreAssignment",
        method: "GET",
        color: "primary",
        componentName: "StoreManagementGetStoreAssignmentApiPage",
      },

      {
        name: "CreateStoreAssignment",
        method: "CREATE",
        color: "success",
        componentName: "StoreManagementCreateStoreAssignmentApiPage",
      },

      {
        name: "UpdateStoreAssignment",
        method: "UPDATE",
        color: "info",
        componentName: "StoreManagementUpdateStoreAssignmentApiPage",
      },

      {
        name: "DeleteStoreAssignment",
        method: "DELETE",
        color: "error",
        componentName: "StoreManagementDeleteStoreAssignmentApiPage",
      },

      {
        name: "ListStoreAssignments",
        method: "LIST",
        color: "primary",
        componentName: "StoreManagementListStoreAssignmentsApiPage",
      },
    ]);
  }, [setField]);

  const columns = [
    { field: "userId", headerName: "userId", flex: 1 },

    { field: "storeId", headerName: "storeId", flex: 1 },

    { field: "role", headerName: "role", flex: 1 },

    { field: "assignmentType", headerName: "assignmentType", flex: 1 },

    { field: "status", headerName: "status", flex: 1 },

    {
      field: "overrideJustification",
      headerName: "overrideJustification",
      flex: 1,
    },

    { field: "validFrom", headerName: "validFrom", flex: 1 },

    { field: "validUntil", headerName: "validUntil", flex: 1 },
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

      <StoreManagementUpdateStoreAssignmentModal
        openDialog={openEditDialog}
        selectedStoreAssignment={selectedStoreAssignment}
      />

      <StoreManagementDeleteStoreAssignmentModal
        openDialog={openDeleteDialog}
        selectedId={selectedStoreAssignment?.id}
      />
    </>
  );
}

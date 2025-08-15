import { lazy, useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";

import { GridActionsCellItem } from "@mui/x-data-grid";

import { CONFIG } from "src/global-config";
import { useReportingListReportRequests } from "src/actions/reporting";

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
  title: `ReportRequest data - Reporting module - ${CONFIG.appName}`,
};

const ReportingUpdateReportRequestModal = lazy(
  () =>
    import(
      "src/components/modals/reporting/reportrequest/updatereportrequest-modal"
    ),
);

const ReportingDeleteReportRequestModal = lazy(
  () =>
    import(
      "src/components/modals/reporting/reportrequest/deletereportrequest-modal"
    ),
);

export default function ReportingReportRequestAppPage() {
  const [selectedReportRequest, setSelectedReportRequest] = useState(null);

  const openEditDialog = useBoolean();

  const openDeleteDialog = useBoolean();

  const { setField, state } = useDataObjectContext();

  const { searchResults: options, searchLoading: loading } =
    useReportingListReportRequests();

  const OnEditClickHandler = (row) => {
    setSelectedReportRequest(row);
    openEditDialog.onTrue();
  };

  const OnDeleteClickHandler = (row) => {
    setSelectedReportRequest(row);
    openDeleteDialog.onTrue();
  };

  useEffect(() => {
    setField("name", "ReportRequest");
    setField("selectedApi", null);
    setField("defaultListRouteName", "listreportRequests");

    setField("createModal", "ReportingCreateReportRequestModal");

    setField("cruds", [
      {
        name: "GetReportRequest",
        method: "GET",
        color: "primary",
        componentName: "ReportingGetReportRequestApiPage",
      },

      {
        name: "CreateReportRequest",
        method: "CREATE",
        color: "success",
        componentName: "ReportingCreateReportRequestApiPage",
      },

      {
        name: "UpdateReportRequest",
        method: "UPDATE",
        color: "info",
        componentName: "ReportingUpdateReportRequestApiPage",
      },

      {
        name: "DeleteReportRequest",
        method: "DELETE",
        color: "error",
        componentName: "ReportingDeleteReportRequestApiPage",
      },

      {
        name: "ListReportRequests",
        method: "LIST",
        color: "primary",
        componentName: "ReportingListReportRequestsApiPage",
      },
    ]);
  }, [setField]);

  const columns = [
    { field: "requestedByUserId", headerName: "requestedByUserId", flex: 1 },

    { field: "reportType", headerName: "reportType", flex: 1 },

    { field: "storeIds", headerName: "storeIds", flex: 1 },

    { field: "dateFrom", headerName: "dateFrom", flex: 1 },

    { field: "dateTo", headerName: "dateTo", flex: 1 },

    { field: "productIds", headerName: "productIds", flex: 1 },

    { field: "format", headerName: "format", flex: 1 },

    { field: "status", headerName: "status", flex: 1 },
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

      <ReportingUpdateReportRequestModal
        openDialog={openEditDialog}
        selectedReportRequest={selectedReportRequest}
      />

      <ReportingDeleteReportRequestModal
        openDialog={openDeleteDialog}
        selectedId={selectedReportRequest?.id}
      />
    </>
  );
}

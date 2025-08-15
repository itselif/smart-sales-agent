import { lazy, useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";

import { GridActionsCellItem } from "@mui/x-data-grid";

import { CONFIG } from "src/global-config";
import { useReportingListReportFiles } from "src/actions/reporting";

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
  title: `ReportFile data - Reporting module - ${CONFIG.appName}`,
};

const ReportingUpdateReportFileModal = lazy(
  () =>
    import("src/components/modals/reporting/reportfile/updatereportfile-modal"),
);

const ReportingDeleteReportFileModal = lazy(
  () =>
    import("src/components/modals/reporting/reportfile/deletereportfile-modal"),
);

export default function ReportingReportFileAppPage() {
  const [selectedReportFile, setSelectedReportFile] = useState(null);

  const openEditDialog = useBoolean();

  const openDeleteDialog = useBoolean();

  const { setField, state } = useDataObjectContext();

  const { searchResults: options, searchLoading: loading } =
    useReportingListReportFiles();

  const OnEditClickHandler = (row) => {
    setSelectedReportFile(row);
    openEditDialog.onTrue();
  };

  const OnDeleteClickHandler = (row) => {
    setSelectedReportFile(row);
    openDeleteDialog.onTrue();
  };

  useEffect(() => {
    setField("name", "ReportFile");
    setField("selectedApi", null);
    setField("defaultListRouteName", "listreportFiles");

    setField("createModal", "ReportingCreateReportFileModal");

    setField("cruds", [
      {
        name: "GetReportFile",
        method: "GET",
        color: "primary",
        componentName: "ReportingGetReportFileApiPage",
      },

      {
        name: "CreateReportFile",
        method: "CREATE",
        color: "success",
        componentName: "ReportingCreateReportFileApiPage",
      },

      {
        name: "UpdateReportFile",
        method: "UPDATE",
        color: "info",
        componentName: "ReportingUpdateReportFileApiPage",
      },

      {
        name: "DeleteReportFile",
        method: "DELETE",
        color: "error",
        componentName: "ReportingDeleteReportFileApiPage",
      },

      {
        name: "ListReportFiles",
        method: "LIST",
        color: "primary",
        componentName: "ReportingListReportFilesApiPage",
      },
    ]);
  }, [setField]);

  const columns = [
    { field: "reportRequestId", headerName: "reportRequestId", flex: 1 },

    { field: "fileUrl", headerName: "fileUrl", flex: 1 },

    { field: "format", headerName: "format", flex: 1 },

    { field: "signedUrl", headerName: "signedUrl", flex: 1 },

    { field: "signedUrlExpiry", headerName: "signedUrlExpiry", flex: 1 },

    { field: "downloadCount", headerName: "downloadCount", flex: 1 },
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

      <ReportingUpdateReportFileModal
        openDialog={openEditDialog}
        selectedReportFile={selectedReportFile}
      />

      <ReportingDeleteReportFileModal
        openDialog={openDeleteDialog}
        selectedId={selectedReportFile?.id}
      />
    </>
  );
}

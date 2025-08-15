import { lazy, useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";

import { GridActionsCellItem } from "@mui/x-data-grid";

import { CONFIG } from "src/global-config";
import { useReportingListReportPolicies } from "src/actions/reporting";

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
  title: `ReportPolicy data - Reporting module - ${CONFIG.appName}`,
};

const ReportingUpdateReportPolicyModal = lazy(
  () =>
    import(
      "src/components/modals/reporting/reportpolicy/updatereportpolicy-modal"
    ),
);

const ReportingDeleteReportPolicyModal = lazy(
  () =>
    import(
      "src/components/modals/reporting/reportpolicy/deletereportpolicy-modal"
    ),
);

export default function ReportingReportPolicyAppPage() {
  const [selectedReportPolicy, setSelectedReportPolicy] = useState(null);

  const openEditDialog = useBoolean();

  const openDeleteDialog = useBoolean();

  const { setField, state } = useDataObjectContext();

  const { searchResults: options, searchLoading: loading } =
    useReportingListReportPolicies();

  const OnEditClickHandler = (row) => {
    setSelectedReportPolicy(row);
    openEditDialog.onTrue();
  };

  const OnDeleteClickHandler = (row) => {
    setSelectedReportPolicy(row);
    openDeleteDialog.onTrue();
  };

  useEffect(() => {
    setField("name", "ReportPolicy");
    setField("selectedApi", null);
    setField("defaultListRouteName", "listreportPolicies");

    setField("createModal", "ReportingCreateReportPolicyModal");

    setField("cruds", [
      {
        name: "GetReportPolicy",
        method: "GET",
        color: "primary",
        componentName: "ReportingGetReportPolicyApiPage",
      },

      {
        name: "CreateReportPolicy",
        method: "CREATE",
        color: "success",
        componentName: "ReportingCreateReportPolicyApiPage",
      },

      {
        name: "UpdateReportPolicy",
        method: "UPDATE",
        color: "info",
        componentName: "ReportingUpdateReportPolicyApiPage",
      },

      {
        name: "DeleteReportPolicy",
        method: "DELETE",
        color: "error",
        componentName: "ReportingDeleteReportPolicyApiPage",
      },

      {
        name: "ListReportPolicies",
        method: "LIST",
        color: "primary",
        componentName: "ReportingListReportPoliciesApiPage",
      },
    ]);
  }, [setField]);

  const columns = [
    { field: "reportType", headerName: "reportType", flex: 1 },

    { field: "maxRetentionDays", headerName: "maxRetentionDays", flex: 1 },

    { field: "allowedFormats", headerName: "allowedFormats", flex: 1 },

    { field: "description", headerName: "description", flex: 1 },
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

      <ReportingUpdateReportPolicyModal
        openDialog={openEditDialog}
        selectedReportPolicy={selectedReportPolicy}
      />

      <ReportingDeleteReportPolicyModal
        openDialog={openDeleteDialog}
        selectedId={selectedReportPolicy?.id}
      />
    </>
  );
}

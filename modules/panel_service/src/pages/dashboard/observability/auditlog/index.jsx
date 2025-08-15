import { lazy, useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";

import { GridActionsCellItem } from "@mui/x-data-grid";

import { CONFIG } from "src/global-config";
import { useObservabilityListAuditLogs } from "src/actions/observability";

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
  title: `AuditLog data - Observability module - ${CONFIG.appName}`,
};

const ObservabilityUpdateAuditLogModal = lazy(
  () =>
    import("src/components/modals/observability/auditlog/updateauditlog-modal"),
);

const ObservabilityDeleteAuditLogModal = lazy(
  () =>
    import("src/components/modals/observability/auditlog/deleteauditlog-modal"),
);

export default function ObservabilityAuditLogAppPage() {
  const [selectedAuditLog, setSelectedAuditLog] = useState(null);

  const openEditDialog = useBoolean();

  const openDeleteDialog = useBoolean();

  const { setField, state } = useDataObjectContext();

  const { searchResults: options, searchLoading: loading } =
    useObservabilityListAuditLogs();

  const OnEditClickHandler = (row) => {
    setSelectedAuditLog(row);
    openEditDialog.onTrue();
  };

  const OnDeleteClickHandler = (row) => {
    setSelectedAuditLog(row);
    openDeleteDialog.onTrue();
  };

  useEffect(() => {
    setField("name", "AuditLog");
    setField("selectedApi", null);
    setField("defaultListRouteName", "listauditLogs");

    setField("createModal", "ObservabilityCreateAuditLogModal");

    setField("cruds", [
      {
        name: "GetAuditLog",
        method: "GET",
        color: "primary",
        componentName: "ObservabilityGetAuditLogApiPage",
      },

      {
        name: "CreateAuditLog",
        method: "CREATE",
        color: "success",
        componentName: "ObservabilityCreateAuditLogApiPage",
      },

      {
        name: "UpdateAuditLog",
        method: "UPDATE",
        color: "info",
        componentName: "ObservabilityUpdateAuditLogApiPage",
      },

      {
        name: "DeleteAuditLog",
        method: "DELETE",
        color: "error",
        componentName: "ObservabilityDeleteAuditLogApiPage",
      },

      {
        name: "ListAuditLogs",
        method: "LIST",
        color: "primary",
        componentName: "ObservabilityListAuditLogsApiPage",
      },
    ]);
  }, [setField]);

  const columns = [
    { field: "userId", headerName: "userId", flex: 1 },

    { field: "actionType", headerName: "actionType", flex: 1 },

    { field: "entityType", headerName: "entityType", flex: 1 },

    { field: "entityId", headerName: "entityId", flex: 1 },

    { field: "beforeData", headerName: "beforeData", flex: 1 },

    { field: "afterData", headerName: "afterData", flex: 1 },

    { field: "severity", headerName: "severity", flex: 1 },

    { field: "message", headerName: "message", flex: 1 },

    { field: "traceContext", headerName: "traceContext", flex: 1 },

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

      <ObservabilityUpdateAuditLogModal
        openDialog={openEditDialog}
        selectedAuditLog={selectedAuditLog}
      />

      <ObservabilityDeleteAuditLogModal
        openDialog={openDeleteDialog}
        selectedId={selectedAuditLog?.id}
      />
    </>
  );
}

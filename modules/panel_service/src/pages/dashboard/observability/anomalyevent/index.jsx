import { lazy, useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";

import { GridActionsCellItem } from "@mui/x-data-grid";

import { CONFIG } from "src/global-config";
import { useObservabilityListAnomalyEvents } from "src/actions/observability";

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
  title: `AnomalyEvent data - Observability module - ${CONFIG.appName}`,
};

const ObservabilityUpdateAnomalyEventModal = lazy(
  () =>
    import(
      "src/components/modals/observability/anomalyevent/updateanomalyevent-modal"
    ),
);

const ObservabilityDeleteAnomalyEventModal = lazy(
  () =>
    import(
      "src/components/modals/observability/anomalyevent/deleteanomalyevent-modal"
    ),
);

export default function ObservabilityAnomalyEventAppPage() {
  const [selectedAnomalyEvent, setSelectedAnomalyEvent] = useState(null);

  const openEditDialog = useBoolean();

  const openDeleteDialog = useBoolean();

  const { setField, state } = useDataObjectContext();

  const { searchResults: options, searchLoading: loading } =
    useObservabilityListAnomalyEvents();

  const OnEditClickHandler = (row) => {
    setSelectedAnomalyEvent(row);
    openEditDialog.onTrue();
  };

  const OnDeleteClickHandler = (row) => {
    setSelectedAnomalyEvent(row);
    openDeleteDialog.onTrue();
  };

  useEffect(() => {
    setField("name", "AnomalyEvent");
    setField("selectedApi", null);
    setField("defaultListRouteName", "listanomalyEvents");

    setField("createModal", "ObservabilityCreateAnomalyEventModal");

    setField("cruds", [
      {
        name: "GetAnomalyEvent",
        method: "GET",
        color: "primary",
        componentName: "ObservabilityGetAnomalyEventApiPage",
      },

      {
        name: "CreateAnomalyEvent",
        method: "CREATE",
        color: "success",
        componentName: "ObservabilityCreateAnomalyEventApiPage",
      },

      {
        name: "UpdateAnomalyEvent",
        method: "UPDATE",
        color: "info",
        componentName: "ObservabilityUpdateAnomalyEventApiPage",
      },

      {
        name: "DeleteAnomalyEvent",
        method: "DELETE",
        color: "error",
        componentName: "ObservabilityDeleteAnomalyEventApiPage",
      },

      {
        name: "ListAnomalyEvents",
        method: "LIST",
        color: "primary",
        componentName: "ObservabilityListAnomalyEventsApiPage",
      },
    ]);
  }, [setField]);

  const columns = [
    { field: "anomalyType", headerName: "anomalyType", flex: 1 },

    { field: "triggeredByUserId", headerName: "triggeredByUserId", flex: 1 },

    { field: "affectedUserId", headerName: "affectedUserId", flex: 1 },

    { field: "storeId", headerName: "storeId", flex: 1 },

    { field: "relatedEntityType", headerName: "relatedEntityType", flex: 1 },

    { field: "relatedEntityId", headerName: "relatedEntityId", flex: 1 },

    { field: "description", headerName: "description", flex: 1 },

    { field: "detectedAt", headerName: "detectedAt", flex: 1 },

    { field: "severity", headerName: "severity", flex: 1 },

    { field: "status", headerName: "status", flex: 1 },

    { field: "reviewedByUserId", headerName: "reviewedByUserId", flex: 1 },
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

      <ObservabilityUpdateAnomalyEventModal
        openDialog={openEditDialog}
        selectedAnomalyEvent={selectedAnomalyEvent}
      />

      <ObservabilityDeleteAnomalyEventModal
        openDialog={openDeleteDialog}
        selectedId={selectedAnomalyEvent?.id}
      />
    </>
  );
}

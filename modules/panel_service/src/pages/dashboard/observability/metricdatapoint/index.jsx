import { lazy, useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";

import { GridActionsCellItem } from "@mui/x-data-grid";

import { CONFIG } from "src/global-config";
import { useObservabilityListMetricDatapoints } from "src/actions/observability";

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
  title: `MetricDatapoint data - Observability module - ${CONFIG.appName}`,
};

const ObservabilityUpdateMetricDatapointModal = lazy(
  () =>
    import(
      "src/components/modals/observability/metricdatapoint/updatemetricdatapoint-modal"
    ),
);

const ObservabilityDeleteMetricDatapointModal = lazy(
  () =>
    import(
      "src/components/modals/observability/metricdatapoint/deletemetricdatapoint-modal"
    ),
);

export default function ObservabilityMetricDatapointAppPage() {
  const [selectedMetricDatapoint, setSelectedMetricDatapoint] = useState(null);

  const openEditDialog = useBoolean();

  const openDeleteDialog = useBoolean();

  const { setField, state } = useDataObjectContext();

  const { searchResults: options, searchLoading: loading } =
    useObservabilityListMetricDatapoints();

  const OnEditClickHandler = (row) => {
    setSelectedMetricDatapoint(row);
    openEditDialog.onTrue();
  };

  const OnDeleteClickHandler = (row) => {
    setSelectedMetricDatapoint(row);
    openDeleteDialog.onTrue();
  };

  useEffect(() => {
    setField("name", "MetricDatapoint");
    setField("selectedApi", null);
    setField("defaultListRouteName", "listmetricDatapoints");

    setField("createModal", "ObservabilityCreateMetricDatapointModal");

    setField("cruds", [
      {
        name: "GetMetricDatapoint",
        method: "GET",
        color: "primary",
        componentName: "ObservabilityGetMetricDatapointApiPage",
      },

      {
        name: "CreateMetricDatapoint",
        method: "CREATE",
        color: "success",
        componentName: "ObservabilityCreateMetricDatapointApiPage",
      },

      {
        name: "UpdateMetricDatapoint",
        method: "UPDATE",
        color: "info",
        componentName: "ObservabilityUpdateMetricDatapointApiPage",
      },

      {
        name: "DeleteMetricDatapoint",
        method: "DELETE",
        color: "error",
        componentName: "ObservabilityDeleteMetricDatapointApiPage",
      },

      {
        name: "ListMetricDatapoints",
        method: "LIST",
        color: "primary",
        componentName: "ObservabilityListMetricDatapointsApiPage",
      },
    ]);
  }, [setField]);

  const columns = [
    { field: "metricType", headerName: "metricType", flex: 1 },

    { field: "targetType", headerName: "targetType", flex: 1 },

    { field: "targetId", headerName: "targetId", flex: 1 },

    { field: "periodStart", headerName: "periodStart", flex: 1 },

    { field: "granularity", headerName: "granularity", flex: 1 },

    { field: "value", headerName: "value", flex: 1 },

    {
      type: "boolean",
      field: "flagAnomalous",
      headerName: "flagAnomalous",
      width: 80,
      renderCell: (params) =>
        params.row.flagAnomalous ? (
          <Iconify
            icon="eva:checkmark-circle-2-fill"
            sx={{ color: "primary.main" }}
          />
        ) : (
          "-"
        ),
    },

    { field: "observedByUserId", headerName: "observedByUserId", flex: 1 },

    { field: "context", headerName: "context", flex: 1 },
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

      <ObservabilityUpdateMetricDatapointModal
        openDialog={openEditDialog}
        selectedMetricDatapoint={selectedMetricDatapoint}
      />

      <ObservabilityDeleteMetricDatapointModal
        openDialog={openDeleteDialog}
        selectedId={selectedMetricDatapoint?.id}
      />
    </>
  );
}

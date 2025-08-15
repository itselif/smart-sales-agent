import { lazy, useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";

import { GridActionsCellItem } from "@mui/x-data-grid";

import { CONFIG } from "src/global-config";
import { usePlatformAdminListOpenApiSchemas } from "src/actions/platformAdmin";

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
  title: `OpenApiSchema data - PlatformAdmin module - ${CONFIG.appName}`,
};

const PlatformAdminUpdateOpenApiSchemaModal = lazy(
  () =>
    import(
      "src/components/modals/platformadmin/openapischema/updateopenapischema-modal"
    ),
);

const PlatformAdminDeleteOpenApiSchemaModal = lazy(
  () =>
    import(
      "src/components/modals/platformadmin/openapischema/deleteopenapischema-modal"
    ),
);

export default function PlatformAdminOpenApiSchemaAppPage() {
  const [selectedOpenApiSchema, setSelectedOpenApiSchema] = useState(null);

  const openEditDialog = useBoolean();

  const openDeleteDialog = useBoolean();

  const { setField, state } = useDataObjectContext();

  const { searchResults: options, searchLoading: loading } =
    usePlatformAdminListOpenApiSchemas();

  const OnEditClickHandler = (row) => {
    setSelectedOpenApiSchema(row);
    openEditDialog.onTrue();
  };

  const OnDeleteClickHandler = (row) => {
    setSelectedOpenApiSchema(row);
    openDeleteDialog.onTrue();
  };

  useEffect(() => {
    setField("name", "OpenApiSchema");
    setField("selectedApi", null);
    setField("defaultListRouteName", "listopenApiSchemas");

    setField("createModal", "PlatformAdminCreateOpenApiSchemaModal");

    setField("cruds", [
      {
        name: "GetOpenApiSchema",
        method: "GET",
        color: "primary",
        componentName: "PlatformAdminGetOpenApiSchemaApiPage",
      },

      {
        name: "CreateOpenApiSchema",
        method: "CREATE",
        color: "success",
        componentName: "PlatformAdminCreateOpenApiSchemaApiPage",
      },

      {
        name: "UpdateOpenApiSchema",
        method: "UPDATE",
        color: "info",
        componentName: "PlatformAdminUpdateOpenApiSchemaApiPage",
      },

      {
        name: "DeleteOpenApiSchema",
        method: "DELETE",
        color: "error",
        componentName: "PlatformAdminDeleteOpenApiSchemaApiPage",
      },

      {
        name: "ListOpenApiSchemas",
        method: "LIST",
        color: "primary",
        componentName: "PlatformAdminListOpenApiSchemasApiPage",
      },
    ]);
  }, [setField]);

  const columns = [
    { field: "version", headerName: "version", flex: 1 },

    { field: "description", headerName: "description", flex: 1 },

    { field: "schemaJson", headerName: "schemaJson", flex: 1 },
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

      <PlatformAdminUpdateOpenApiSchemaModal
        openDialog={openEditDialog}
        selectedOpenApiSchema={selectedOpenApiSchema}
      />

      <PlatformAdminDeleteOpenApiSchemaModal
        openDialog={openDeleteDialog}
        selectedId={selectedOpenApiSchema?.id}
      />
    </>
  );
}

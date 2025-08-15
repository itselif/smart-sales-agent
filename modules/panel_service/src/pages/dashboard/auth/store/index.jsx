import { lazy, useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";

import { GridActionsCellItem } from "@mui/x-data-grid";

import { CONFIG } from "src/global-config";

import { Iconify } from "src/components/iconify";

import { DashboardContent } from "../../../../layouts/dashboard/index.js";
import { useDataObjectContext } from "../../../../components/nav-section/data/context";
import {
  DataObjectApi,
  DataObjectListNotProvided,
} from "../../../../components/data-object/index.js";
import { useBoolean } from "minimal-shared/hooks";

// ----------------------------------------------------------------------
// TODO: Add the feature to tell the user what crud route need to be created to use add,update and delete

const metadata = { title: `Store data - Auth module - ${CONFIG.appName}` };

export default function AuthStoreAppPage() {
  const { setField, state } = useDataObjectContext();

  useEffect(() => {
    setField("name", "Store");
    setField("selectedApi", null);
    setField("defaultListRouteName", "liststores");

    setField("createModal", null);

    setField("cruds", [
      {
        name: "CreateStore",
        method: "CREATE",
        color: "success",
        componentName: "AuthCreateStoreApiPage",
      },

      {
        name: "GetStore",
        method: "GET",
        color: "primary",
        componentName: "AuthGetStoreApiPage",
      },

      {
        name: "GetStoreByCodename",
        method: "GET",
        color: "primary",
        componentName: "AuthGetStoreByCodenameApiPage",
      },

      {
        name: "ListRegisteredStores",
        method: "LIST",
        color: "primary",
        componentName: "AuthListRegisteredStoresApiPage",
      },
    ]);
  }, [setField]);

  const columns = [
    { field: "name", headerName: "name", flex: 1 },

    { field: "codename", headerName: "codename", flex: 1 },

    { field: "fullname", headerName: "fullname", flex: 1 },

    { field: "avatar", headerName: "avatar", flex: 1 },

    { field: "ownerId", headerName: "ownerId", flex: 1 },
    {
      type: "actions",
      field: "actions",
      headerName: "Actions",
      width: 80,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      getActions: (params) => [],
    },
  ];

  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <DashboardContent maxWidth="xl">
        {state.display === "List" ? (
          <DataObjectListNotProvided />
        ) : (
          <DataObjectApi />
        )}
      </DashboardContent>
    </>
  );
}

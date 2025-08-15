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

const metadata = { title: `UserGroup data - Auth module - ${CONFIG.appName}` };

export default function AuthUserGroupAppPage() {
  const { setField, state } = useDataObjectContext();

  useEffect(() => {
    setField("name", "UserGroup");
    setField("selectedApi", null);
    setField("defaultListRouteName", "listuserGroups");

    setField("createModal", null);

    setField("cruds", [
      {
        name: "CreateGroup",
        method: "CREATE",
        color: "success",
        componentName: "AuthCreateGroupApiPage",
      },

      {
        name: "UpdateGroup",
        method: "UPDATE",
        color: "info",
        componentName: "AuthUpdateGroupApiPage",
      },

      {
        name: "GetGroup",
        method: "GET",
        color: "primary",
        componentName: "AuthGetGroupApiPage",
      },

      {
        name: "ListGroups",
        method: "LIST",
        color: "primary",
        componentName: "AuthListGroupsApiPage",
      },
    ]);
  }, [setField]);

  const columns = [
    { field: "groupName", headerName: "groupName", flex: 1 },

    { field: "avatar", headerName: "avatar", flex: 1 },
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

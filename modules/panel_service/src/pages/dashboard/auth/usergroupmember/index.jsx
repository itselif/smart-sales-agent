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

const metadata = {
  title: `UserGroupMember data - Auth module - ${CONFIG.appName}`,
};

export default function AuthUserGroupMemberAppPage() {
  const { setField, state } = useDataObjectContext();

  useEffect(() => {
    setField("name", "UserGroupMember");
    setField("selectedApi", null);
    setField("defaultListRouteName", "listuserGroupMembers");

    setField("createModal", null);

    setField("cruds", [
      {
        name: "CreateGroupMember",
        method: "CREATE",
        color: "success",
        componentName: "AuthCreateGroupMemberApiPage",
      },

      {
        name: "DeleteGroupMember",
        method: "DELETE",
        color: "error",
        componentName: "AuthDeleteGroupMemberApiPage",
      },

      {
        name: "GetGroupMember",
        method: "GET",
        color: "primary",
        componentName: "AuthGetGroupMemberApiPage",
      },

      {
        name: "ListGroupMembers",
        method: "LIST",
        color: "primary",
        componentName: "AuthListGroupMembersApiPage",
      },
    ]);
  }, [setField]);

  const columns = [
    { field: "groupId", headerName: "groupId", flex: 1 },

    { field: "userId", headerName: "userId", flex: 1 },

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

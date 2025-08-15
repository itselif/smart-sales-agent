import { lazy, useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";

import { GridActionsCellItem } from "@mui/x-data-grid";

import { CONFIG } from "src/global-config";
import { useAuthListUsers } from "src/actions/auth";

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

const metadata = { title: `User data - Auth module - ${CONFIG.appName}` };

const AuthUpdateUserModal = lazy(
  () => import("src/components/modals/auth/user/updateuser-modal"),
);

const AuthDeleteUserModal = lazy(
  () => import("src/components/modals/auth/user/deleteuser-modal"),
);

export default function AuthUserAppPage() {
  const [selectedUser, setSelectedUser] = useState(null);

  const openEditDialog = useBoolean();

  const openDeleteDialog = useBoolean();

  const { setField, state } = useDataObjectContext();

  const { searchResults: options, searchLoading: loading } = useAuthListUsers();

  const OnEditClickHandler = (row) => {
    setSelectedUser(row);
    openEditDialog.onTrue();
  };

  const OnDeleteClickHandler = (row) => {
    setSelectedUser(row);
    openDeleteDialog.onTrue();
  };

  useEffect(() => {
    setField("name", "User");
    setField("selectedApi", null);
    setField("defaultListRouteName", "listusers");

    setField("createModal", "AuthCreateUserModal");

    setField("cruds", [
      {
        name: "CreateUser",
        method: "CREATE",
        color: "success",
        componentName: "AuthCreateUserApiPage",
      },

      {
        name: "UpdateUser",
        method: "UPDATE",
        color: "info",
        componentName: "AuthUpdateUserApiPage",
      },

      {
        name: "DeleteUser",
        method: "DELETE",
        color: "error",
        componentName: "AuthDeleteUserApiPage",
      },

      {
        name: "UpdateUserRole",
        method: "UPDATE",
        color: "info",
        componentName: "AuthUpdateUserRoleApiPage",
      },

      {
        name: "UpdatePassword",
        method: "UPDATE",
        color: "info",
        componentName: "AuthUpdatePasswordApiPage",
      },

      {
        name: "RegisterTenantUser",
        method: "CREATE",
        color: "success",
        componentName: "AuthRegisterTenantUserApiPage",
      },

      {
        name: "RegisterStoreOwner",
        method: "CREATE",
        color: "success",
        componentName: "AuthRegisterStoreOwnerApiPage",
      },

      {
        name: "GetUser",
        method: "GET",
        color: "primary",
        componentName: "AuthGetUserApiPage",
      },

      {
        name: "ListUsers",
        method: "LIST",
        color: "primary",
        componentName: "AuthListUsersApiPage",
      },
    ]);
  }, [setField]);

  const columns = [
    { field: "email", headerName: "email", flex: 1 },

    { field: "password", headerName: "password", flex: 1 },

    { field: "fullname", headerName: "fullname", flex: 1 },

    { field: "avatar", headerName: "avatar", flex: 1 },

    {
      type: "boolean",
      field: "emailVerified",
      headerName: "emailVerified",
      width: 80,
      renderCell: (params) =>
        params.row.emailVerified ? (
          <Iconify
            icon="eva:checkmark-circle-2-fill"
            sx={{ color: "primary.main" }}
          />
        ) : (
          "-"
        ),
    },

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

      <AuthUpdateUserModal
        openDialog={openEditDialog}
        selectedUser={selectedUser}
      />

      <AuthDeleteUserModal
        openDialog={openDeleteDialog}
        selectedId={selectedUser?.id}
      />
    </>
  );
}

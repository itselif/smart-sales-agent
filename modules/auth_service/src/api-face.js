const { inject } = require("mindbricks-api-face");

module.exports = (app) => {
  const authUrl = (process.env.SERVICE_URL ?? "mindbricks.com").replace(
    process.env.SERVICE_SHORT_NAME,
    "auth",
  );

  const config = {
    name: "salesai - auth",
    brand: {
      name: "salesai",
      image: "https://mindbricks.com/favicon.ico",
      moduleName: "auth",
      version: process.env.SERVICE_VERSION || "1.0.0",
    },
    auth: {
      url: authUrl,
      loginPath: "/login",
      logoutPath: "/logout",
      currentUserPath: "/currentuser",
      authStrategy: "external",
      initialAuth: true,
    },
    dataObjects: [
      {
        name: "User",
        description:
          "A data object that stores the user information and handles login settings.",
        reference: {
          tableName: "user",
          properties: [
            {
              name: "email",
              type: "String",
            },

            {
              name: "password",
              type: "String",
            },

            {
              name: "fullname",
              type: "String",
            },

            {
              name: "avatar",
              type: "String",
            },

            {
              name: "emailVerified",
              type: "Boolean",
            },

            {
              name: "storeId",
              type: "ID",
            },
          ],
        },
        endpoints: [
          {
            isAuth: true,
            method: "POST",
            url: "/users",
            title: "createUser",
            query: [],

            body: {
              type: "json",
              content: {
                avatar: "String",
                email: "String",
                password: "String",
                fullname: "String",
              },
            },

            parameters: [],
            headers: [],
          },

          {
            isAuth: true,
            method: "PATCH",
            url: "/users/{userId}",
            title: "updateUser",
            query: [],

            body: {
              type: "json",
              content: {
                fullname: "String",
                avatar: "String",
              },
            },

            parameters: [
              {
                key: "userId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "DELETE",
            url: "/users/{userId}",
            title: "deleteUser",
            query: [],

            body: {
              type: "json",
              content: {},
            },

            parameters: [
              {
                key: "userId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "PATCH",
            url: "/userrole/{userId}",
            title: "updateUserRole",
            query: [],

            body: {
              type: "json",
              content: {
                roleId: "String",
              },
            },

            parameters: [
              {
                key: "userId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "PATCH",
            url: "/password/{userId}",
            title: "updatePassword",
            query: [],

            body: {
              type: "json",
              content: {
                oldPassword: "String",
                newPassword: "String",
              },
            },

            parameters: [
              {
                key: "userId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: false,
            method: "POST",
            url: "/registertenantuser",
            title: "registerTenantUser",
            query: [],

            body: {
              type: "json",
              content: {
                socialCode: "String",
                password: "String",
                fullname: "String",
                email: "String",
                avatar: "String",
              },
            },

            parameters: [],
            headers: [],
          },

          {
            isAuth: false,
            method: "POST",
            url: "/registerstoreowner",
            title: "registerStoreOwner",
            query: [],

            body: {
              type: "json",
              content: {
                avatar: "String",
                socialCode: "String",
                password: "String",
                fullname: "String",
                email: "String",
              },
            },

            parameters: [],
            headers: [],
          },

          {
            isAuth: true,
            method: "GET",
            url: "/users/{userId}",
            title: "getUser",
            query: [],

            parameters: [
              {
                key: "userId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "GET",
            url: "/users",
            title: "listUsers",
            query: [],

            parameters: [],
            headers: [],
          },
        ],
      },

      {
        name: "UserGroup",
        description: "A data object that stores the user group information.",
        reference: {
          tableName: "userGroup",
          properties: [
            {
              name: "groupName",
              type: "String",
            },

            {
              name: "avatar",
              type: "String",
            },
          ],
        },
        endpoints: [
          {
            isAuth: true,
            method: "POST",
            url: "/group",
            title: "createGroup",
            query: [],

            body: {
              type: "json",
              content: {
                avatar: "String",
                groupName: "String",
              },
            },

            parameters: [],
            headers: [],
          },

          {
            isAuth: true,
            method: "PATCH",
            url: "/group/{userGroupId}",
            title: "updateGroup",
            query: [],

            body: {
              type: "json",
              content: {
                groupName: "String",
                avatar: "String",
              },
            },

            parameters: [
              {
                key: "userGroupId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "GET",
            url: "/group/{userGroupId}",
            title: "getGroup",
            query: [],

            parameters: [
              {
                key: "userGroupId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "GET",
            url: "/groups",
            title: "listGroups",
            query: [],

            parameters: [],
            headers: [],
          },
        ],
      },

      {
        name: "UserGroupMember",
        description: "A data object that stores the members of the user group.",
        reference: {
          tableName: "userGroupMember",
          properties: [
            {
              name: "groupId",
              type: "ID",
            },

            {
              name: "userId",
              type: "ID",
            },

            {
              name: "ownerId",
              type: "ID",
            },
          ],
        },
        endpoints: [
          {
            isAuth: true,
            method: "POST",
            url: "/groupmember",
            title: "createGroupMember",
            query: [],

            body: {
              type: "json",
              content: {
                groupId: "ID",
                userId: "ID",
              },
            },

            parameters: [],
            headers: [],
          },

          {
            isAuth: true,
            method: "DELETE",
            url: "/groupmember/{userGroupMemberId}",
            title: "deleteGroupMember",
            query: [],

            body: {
              type: "json",
              content: {},
            },

            parameters: [
              {
                key: "userGroupMemberId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "GET",
            url: "/groupmember/{userGroupMemberId}",
            title: "getGroupMember",
            query: [],

            parameters: [
              {
                key: "userGroupMemberId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "GET",
            url: "/groupmembers",
            title: "listGroupMembers",
            query: [
              {
                key: "groupId",
                value: "",
                description:
                  " An ID value to represent the group that the user is asssigned as a memeber to.. The parameter is used to query data.",
                active: true,
              },
            ],

            parameters: [],
            headers: [],
          },
        ],
      },

      {
        name: "Store",
        description: "A data object that stores the information for store",
        reference: {
          tableName: "store",
          properties: [
            {
              name: "name",
              type: "String",
            },

            {
              name: "codename",
              type: "String",
            },

            {
              name: "fullname",
              type: "String",
            },

            {
              name: "avatar",
              type: "String",
            },

            {
              name: "ownerId",
              type: "ID",
            },
          ],
        },
        endpoints: [
          {
            isAuth: true,
            method: "POST",
            url: "/stores",
            title: "createStore",
            query: [],

            body: {
              type: "json",
              content: {
                avatar: "String",
                name: "String",
                fullname: "String",
              },
            },

            parameters: [],
            headers: [],
          },

          {
            isAuth: false,
            method: "GET",
            url: "/stores/{storeId}",
            title: "getStore",
            query: [],

            parameters: [
              {
                key: "storeId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: false,
            method: "GET",
            url: "/storebycodename/{codename}",
            title: "getStoreByCodename",
            query: [],

            parameters: [
              {
                key: "codename",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "GET",
            url: "/registeredstores",
            title: "listRegisteredStores",
            query: [],

            parameters: [],
            headers: [],
          },
        ],
      },
    ],
  };

  inject(app, config);
};

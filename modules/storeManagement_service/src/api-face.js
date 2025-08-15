const { inject } = require("mindbricks-api-face");

module.exports = (app) => {
  const authUrl = (process.env.SERVICE_URL ?? "mindbricks.com").replace(
    process.env.SERVICE_SHORT_NAME,
    "auth",
  );

  const config = {
    name: "salesai - storeManagement",
    brand: {
      name: "salesai",
      image: "https://mindbricks.com/favicon.ico",
      moduleName: "storeManagement",
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
        name: "Store",
        description:
          "Represents a retail store location and its properties. Includes lifecycle metadata such as activation status and store-level policy configuration fields.",
        reference: {
          tableName: "store",
          properties: [
            {
              name: "name",
              type: "String",
            },

            {
              name: "fullname",
              type: "String",
            },

            {
              name: "city",
              type: "String",
            },

            {
              name: "avatar",
              type: "String",
            },

            {
              name: "active",
              type: "Boolean",
            },
          ],
        },
        endpoints: [
          {
            isAuth: true,
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
            isAuth: true,
            method: "POST",
            url: "/stores",
            title: "createStore",
            query: [],

            body: {
              type: "json",
              content: {
                name: "String",
                fullname: "String",
                city: "String",
                avatar: "String",
                active: "Boolean",
              },
            },

            parameters: [],
            headers: [],
          },

          {
            isAuth: true,
            method: "PATCH",
            url: "/stores/{storeId}",
            title: "updateStore",
            query: [],

            body: {
              type: "json",
              content: {
                name: "String",
                fullname: "String",
                city: "String",
                avatar: "String",
                active: "Boolean",
              },
            },

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
            isAuth: true,
            method: "DELETE",
            url: "/stores/{storeId}",
            title: "deleteStore",
            query: [],

            body: {
              type: "json",
              content: {},
            },

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
            isAuth: true,
            method: "GET",
            url: "/stores",
            title: "listStores",
            query: [],

            parameters: [],
            headers: [],
          },
        ],
      },

      {
        name: "StoreAssignment",
        description:
          "Represents the assignment of a user (seller, manager) to one or more stores. Supports override/temporary assignments, status, and assignment type fields for audit and dynamic access enforcement.",
        reference: {
          tableName: "storeAssignment",
          properties: [
            {
              name: "userId",
              type: "ID",
            },

            {
              name: "storeId",
              type: "ID",
            },

            {
              name: "role",
              type: "Enum",
            },

            {
              name: "assignmentType",
              type: "Enum",
            },

            {
              name: "status",
              type: "Enum",
            },

            {
              name: "overrideJustification",
              type: "Text",
            },

            {
              name: "validFrom",
              type: "Date",
            },

            {
              name: "validUntil",
              type: "Date",
            },
          ],
        },
        endpoints: [
          {
            isAuth: true,
            method: "GET",
            url: "/storeassignments/{storeAssignmentId}",
            title: "getStoreAssignment",
            query: [],

            parameters: [
              {
                key: "storeAssignmentId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "POST",
            url: "/storeassignments",
            title: "createStoreAssignment",
            query: [],

            body: {
              type: "json",
              content: {
                userId: "ID",
                storeId: "ID",
                role: "Enum",
                assignmentType: "Enum",
                status: "Enum",
                overrideJustification: "Text",
                validFrom: "Date",
                validUntil: "Date",
              },
            },

            parameters: [],
            headers: [],
          },

          {
            isAuth: true,
            method: "PATCH",
            url: "/storeassignments/{storeAssignmentId}",
            title: "updateStoreAssignment",
            query: [],

            body: {
              type: "json",
              content: {
                assignmentType: "Enum",
                status: "Enum",
                overrideJustification: "Text",
                validFrom: "Date",
                validUntil: "Date",
              },
            },

            parameters: [
              {
                key: "storeAssignmentId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "DELETE",
            url: "/storeassignments/{storeAssignmentId}",
            title: "deleteStoreAssignment",
            query: [],

            body: {
              type: "json",
              content: {},
            },

            parameters: [
              {
                key: "storeAssignmentId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "GET",
            url: "/storeassignments",
            title: "listStoreAssignments",
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

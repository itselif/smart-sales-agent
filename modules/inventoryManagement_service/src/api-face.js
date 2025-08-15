const { inject } = require("mindbricks-api-face");

module.exports = (app) => {
  const authUrl = (process.env.SERVICE_URL ?? "mindbricks.com").replace(
    process.env.SERVICE_SHORT_NAME,
    "auth",
  );

  const config = {
    name: "salesai - inventoryManagement",
    brand: {
      name: "salesai",
      image: "https://mindbricks.com/favicon.ico",
      moduleName: "inventoryManagement",
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
        name: "InventoryItem",
        description:
          "Tracks the quantity and status of a specific product in a given store, including thresholds for low-stock alerts and isolation by store.",
        reference: {
          tableName: "inventoryItem",
          properties: [
            {
              name: "productId",
              type: "String",
            },

            {
              name: "quantity",
              type: "Integer",
            },

            {
              name: "status",
              type: "Enum",
            },

            {
              name: "lowStockThreshold",
              type: "Integer",
            },

            {
              name: "lastSyncTimestamp",
              type: "Date",
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
            method: "GET",
            url: "/inventoryitems/{inventoryItemId}",
            title: "getInventoryItem",
            query: [],

            parameters: [
              {
                key: "inventoryItemId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "POST",
            url: "/inventoryitems",
            title: "createInventoryItem",
            query: [],

            body: {
              type: "json",
              content: {
                productId: "String",
                quantity: "Integer",
                status: "Enum",
                lowStockThreshold: "Integer",
                lastSyncTimestamp: "Date",
              },
            },

            parameters: [],
            headers: [],
          },

          {
            isAuth: true,
            method: "PATCH",
            url: "/inventoryitems/{inventoryItemId}",
            title: "updateInventoryItem",
            query: [],

            body: {
              type: "json",
              content: {
                quantity: "Integer",
                status: "Enum",
                lowStockThreshold: "Integer",
                lastSyncTimestamp: "Date",
              },
            },

            parameters: [
              {
                key: "inventoryItemId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "DELETE",
            url: "/inventoryitems/{inventoryItemId}",
            title: "deleteInventoryItem",
            query: [],

            body: {
              type: "json",
              content: {},
            },

            parameters: [
              {
                key: "inventoryItemId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "GET",
            url: "/inventoryitems",
            title: "listInventoryItems",
            query: [],

            parameters: [],
            headers: [],
          },
        ],
      },

      {
        name: "InventoryMovement",
        description:
          "Logs each inventory movement (increase or decrease), recording the change type, value, reason, and related user and inventory item.",
        reference: {
          tableName: "inventoryMovement",
          properties: [
            {
              name: "inventoryItemId",
              type: "ID",
            },

            {
              name: "quantityDelta",
              type: "Integer",
            },

            {
              name: "movementType",
              type: "Enum",
            },

            {
              name: "movementTimestamp",
              type: "Date",
            },

            {
              name: "userId",
              type: "ID",
            },

            {
              name: "movementReason",
              type: "Text",
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
            method: "GET",
            url: "/inventorymovements/{inventoryMovementId}",
            title: "getInventoryMovement",
            query: [],

            parameters: [
              {
                key: "inventoryMovementId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "POST",
            url: "/inventorymovements",
            title: "createInventoryMovement",
            query: [],

            body: {
              type: "json",
              content: {
                inventoryItemId: "ID",
                quantityDelta: "Integer",
                movementType: "Enum",
                movementTimestamp: "Date",
                userId: "ID",
                movementReason: "Text",
              },
            },

            parameters: [],
            headers: [],
          },

          {
            isAuth: true,
            method: "DELETE",
            url: "/inventorymovements/{inventoryMovementId}",
            title: "deleteInventoryMovement",
            query: [],

            body: {
              type: "json",
              content: {},
            },

            parameters: [
              {
                key: "inventoryMovementId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "GET",
            url: "/inventorymovements",
            title: "listInventoryMovements",
            query: [],

            parameters: [],
            headers: [],
          },
        ],
      },

      {
        name: "LowStockAlert",
        description:
          "Represents a low-stock or high-risk inventory item event; alerts sellers/managers of the condition and supports audit/resolution.",
        reference: {
          tableName: "lowStockAlert",
          properties: [
            {
              name: "inventoryItemId",
              type: "ID",
            },

            {
              name: "alertType",
              type: "Enum",
            },

            {
              name: "alertTimestamp",
              type: "Date",
            },

            {
              name: "resolved",
              type: "Boolean",
            },

            {
              name: "resolvedByUserId",
              type: "ID",
            },

            {
              name: "resolvedTimestamp",
              type: "Date",
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
            method: "GET",
            url: "/lowstockalerts/{lowStockAlertId}",
            title: "getLowStockAlert",
            query: [],

            parameters: [
              {
                key: "lowStockAlertId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "POST",
            url: "/lowstockalerts",
            title: "createLowStockAlert",
            query: [],

            body: {
              type: "json",
              content: {
                inventoryItemId: "ID",
                alertType: "Enum",
                alertTimestamp: "Date",
                resolved: "Boolean",
                resolvedByUserId: "ID",
                resolvedTimestamp: "Date",
              },
            },

            parameters: [],
            headers: [],
          },

          {
            isAuth: true,
            method: "PATCH",
            url: "/resolvelowstockalert/{lowStockAlertId}",
            title: "resolveLowStockAlert",
            query: [],

            body: {
              type: "json",
              content: {
                resolved: "Boolean",
                resolvedByUserId: "ID",
                resolvedTimestamp: "Date",
              },
            },

            parameters: [
              {
                key: "lowStockAlertId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "DELETE",
            url: "/lowstockalerts/{lowStockAlertId}",
            title: "deleteLowStockAlert",
            query: [],

            body: {
              type: "json",
              content: {},
            },

            parameters: [
              {
                key: "lowStockAlertId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "GET",
            url: "/lowstockalerts",
            title: "listLowStockAlerts",
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

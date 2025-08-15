const { inject } = require("mindbricks-api-face");

module.exports = (app) => {
  const authUrl = (process.env.SERVICE_URL ?? "mindbricks.com").replace(
    process.env.SERVICE_SHORT_NAME,
    "auth",
  );

  const config = {
    name: "salesai - salesManagement",
    brand: {
      name: "salesai",
      image: "https://mindbricks.com/favicon.ico",
      moduleName: "salesManagement",
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
        name: "SaleTransaction",
        description:
          "Represents a retail sale transaction. Contains all information about a sale: store, seller, amounts, date, status (normal, corrected, canceled), and optional justification for corrections. Manages core sales lifecycle.",
        reference: {
          tableName: "saleTransaction",
          properties: [
            {
              name: "sellerId",
              type: "ID",
            },

            {
              name: "amount",
              type: "Double",
            },

            {
              name: "currency",
              type: "String",
            },

            {
              name: "transactionDate",
              type: "Date",
            },

            {
              name: "status",
              type: "Enum",
            },

            {
              name: "correctionJustification",
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
            url: "/saletransactions/{saleTransactionId}",
            title: "getSaleTransaction",
            query: [],

            parameters: [
              {
                key: "saleTransactionId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "POST",
            url: "/saletransactions",
            title: "createSaleTransaction",
            query: [],

            body: {
              type: "json",
              content: {
                amount: "Double",
                currency: "String",
                transactionDate: "Date",
                status: "Enum",
                correctionJustification: "Text",
              },
            },

            parameters: [],
            headers: [],
          },

          {
            isAuth: true,
            method: "PATCH",
            url: "/saletransactions/{saleTransactionId}",
            title: "updateSaleTransaction",
            query: [],

            body: {
              type: "json",
              content: {
                amount: "Double",
                currency: "String",
                status: "Enum",
                correctionJustification: "Text",
              },
            },

            parameters: [
              {
                key: "saleTransactionId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "DELETE",
            url: "/saletransactions/{saleTransactionId}",
            title: "deleteSaleTransaction",
            query: [],

            body: {
              type: "json",
              content: {},
            },

            parameters: [
              {
                key: "saleTransactionId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "GET",
            url: "/saletransactions",
            title: "listSaleTransactions",
            query: [],

            parameters: [],
            headers: [],
          },
        ],
      },

      {
        name: "SaleTransactionHistory",
        description:
          "Audit log for sale transaction changes and corrections. Records every update or delete to a saleTransaction, including before/after snapshots, user who made the change, change type, timestamp, and provided justifications.",
        reference: {
          tableName: "saleTransactionHistory",
          properties: [
            {
              name: "transactionId",
              type: "ID",
            },

            {
              name: "changeType",
              type: "Enum",
            },

            {
              name: "changedByUserId",
              type: "ID",
            },

            {
              name: "changeTimestamp",
              type: "Date",
            },

            {
              name: "correctionJustification",
              type: "Text",
            },

            {
              name: "previousData",
              type: "Object",
            },

            {
              name: "newData",
              type: "Object",
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
            url: "/saletransactionhistories/{saleTransactionHistoryId}",
            title: "getSaleTransactionHistory",
            query: [],

            parameters: [
              {
                key: "saleTransactionHistoryId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "POST",
            url: "/saletransactionhistories",
            title: "createSaleTransactionHistory",
            query: [],

            body: {
              type: "json",
              content: {
                transactionId: "ID",
                changeType: "Enum",
                changedByUserId: "ID",
                changeTimestamp: "Date",
                correctionJustification: "Text",
                previousData: "Object",
                newData: "Object",
              },
            },

            parameters: [],
            headers: [],
          },

          {
            isAuth: true,
            method: "DELETE",
            url: "/saletransactionhistories/{saleTransactionHistoryId}",
            title: "deleteSaleTransactionHistory",
            query: [],

            body: {
              type: "json",
              content: {},
            },

            parameters: [
              {
                key: "saleTransactionHistoryId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "GET",
            url: "/saletransactionhistories",
            title: "listSaleTransactionHistories",
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

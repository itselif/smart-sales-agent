const { inject } = require("mindbricks-api-face");

module.exports = (app) => {
  const authUrl = (process.env.SERVICE_URL ?? "mindbricks.com").replace(
    process.env.SERVICE_SHORT_NAME,
    "auth",
  );

  const config = {
    name: "salesai - reporting",
    brand: {
      name: "salesai",
      image: "https://mindbricks.com/favicon.ico",
      moduleName: "reporting",
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
        name: "ReportRequest",
        description:
          "Captures a user&#39;s request to generate a report, including all parameters such as report type, date range, store(s), and output format. Tracks status for audit and process management.",
        reference: {
          tableName: "reportRequest",
          properties: [
            {
              name: "requestedByUserId",
              type: "ID",
            },

            {
              name: "reportType",
              type: "Enum",
            },

            {
              name: "storeIds",
              type: "[ID]",
            },

            {
              name: "dateFrom",
              type: "Date",
            },

            {
              name: "dateTo",
              type: "Date",
            },

            {
              name: "productIds",
              type: "[String]",
            },

            {
              name: "format",
              type: "Enum",
            },

            {
              name: "status",
              type: "Enum",
            },
          ],
        },
        endpoints: [
          {
            isAuth: true,
            method: "GET",
            url: "/reportrequests/{reportRequestId}",
            title: "getReportRequest",
            query: [],

            parameters: [
              {
                key: "reportRequestId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "POST",
            url: "/reportrequests",
            title: "createReportRequest",
            query: [],

            body: {
              type: "json",
              content: {
                reportType: "Enum",
                storeIds: "ID",
                dateFrom: "Date",
                dateTo: "Date",
                productIds: "String",
                format: "Enum",
                status: "Enum",
              },
            },

            parameters: [],
            headers: [],
          },

          {
            isAuth: true,
            method: "PATCH",
            url: "/reportrequests/{reportRequestId}",
            title: "updateReportRequest",
            query: [],

            body: {
              type: "json",
              content: {
                status: "Enum",
              },
            },

            parameters: [
              {
                key: "reportRequestId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "DELETE",
            url: "/reportrequests/{reportRequestId}",
            title: "deleteReportRequest",
            query: [],

            body: {
              type: "json",
              content: {},
            },

            parameters: [
              {
                key: "reportRequestId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "GET",
            url: "/reportrequests",
            title: "listReportRequests",
            query: [],

            parameters: [],
            headers: [],
          },
        ],
      },

      {
        name: "ReportFile",
        description:
          "Represents a generated report file, its secure access URL, format, expiry, and download/audit metadata. Links to reportRequest for traceability.",
        reference: {
          tableName: "reportFile",
          properties: [
            {
              name: "reportRequestId",
              type: "ID",
            },

            {
              name: "fileUrl",
              type: "String",
            },

            {
              name: "format",
              type: "Enum",
            },

            {
              name: "signedUrl",
              type: "String",
            },

            {
              name: "signedUrlExpiry",
              type: "Date",
            },

            {
              name: "downloadCount",
              type: "Integer",
            },
          ],
        },
        endpoints: [
          {
            isAuth: true,
            method: "GET",
            url: "/reportfiles/{reportFileId}",
            title: "getReportFile",
            query: [],

            parameters: [
              {
                key: "reportFileId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "POST",
            url: "/reportfiles",
            title: "createReportFile",
            query: [],

            body: {
              type: "json",
              content: {
                reportRequestId: "ID",
                fileUrl: "String",
                format: "Enum",
                signedUrl: "String",
                signedUrlExpiry: "Date",
                downloadCount: "Integer",
              },
            },

            parameters: [],
            headers: [],
          },

          {
            isAuth: true,
            method: "PATCH",
            url: "/reportfiles/{reportFileId}",
            title: "updateReportFile",
            query: [],

            body: {
              type: "json",
              content: {
                signedUrl: "String",
                signedUrlExpiry: "Date",
                downloadCount: "Integer",
              },
            },

            parameters: [
              {
                key: "reportFileId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "DELETE",
            url: "/reportfiles/{reportFileId}",
            title: "deleteReportFile",
            query: [],

            body: {
              type: "json",
              content: {},
            },

            parameters: [
              {
                key: "reportFileId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "GET",
            url: "/reportfiles",
            title: "listReportFiles",
            query: [],

            parameters: [],
            headers: [],
          },
        ],
      },

      {
        name: "ReportPolicy",
        description:
          "Admin-configurable reporting policy and metadata. Specifies allowed report types, retention, and generation params.",
        reference: {
          tableName: "reportPolicy",
          properties: [
            {
              name: "reportType",
              type: "Enum",
            },

            {
              name: "maxRetentionDays",
              type: "Integer",
            },

            {
              name: "allowedFormats",
              type: "[Enum]",
            },

            {
              name: "description",
              type: "Text",
            },
          ],
        },
        endpoints: [
          {
            isAuth: true,
            method: "GET",
            url: "/reportpolicies/{reportPolicyId}",
            title: "getReportPolicy",
            query: [],

            parameters: [
              {
                key: "reportPolicyId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "POST",
            url: "/reportpolicies",
            title: "createReportPolicy",
            query: [],

            body: {
              type: "json",
              content: {
                reportType: "Enum",
                maxRetentionDays: "Integer",
                allowedFormats: "Enum",
                description: "Text",
              },
            },

            parameters: [],
            headers: [],
          },

          {
            isAuth: true,
            method: "PATCH",
            url: "/reportpolicies/{reportPolicyId}",
            title: "updateReportPolicy",
            query: [],

            body: {
              type: "json",
              content: {
                maxRetentionDays: "Integer",
                allowedFormats: "Enum",
                description: "Text",
              },
            },

            parameters: [
              {
                key: "reportPolicyId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "DELETE",
            url: "/reportpolicies/{reportPolicyId}",
            title: "deleteReportPolicy",
            query: [],

            body: {
              type: "json",
              content: {},
            },

            parameters: [
              {
                key: "reportPolicyId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "GET",
            url: "/reportpolicies",
            title: "listReportPolicies",
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

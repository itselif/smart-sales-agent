const { inject } = require("mindbricks-api-face");

module.exports = (app) => {
  const authUrl = (process.env.SERVICE_URL ?? "mindbricks.com").replace(
    process.env.SERVICE_SHORT_NAME,
    "auth",
  );

  const config = {
    name: "salesai - bff",
    brand: {
      name: "salesai",
      image: "https://mindbricks.com/favicon.ico",
      moduleName: "bff",
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
        name: "Dynamic All Index",
        description: "Dynamic All Index for all elasticsearch index",
        reference: {
          tableName: "Dynamic All Index",
          properties: [],
        },
        endpoints: [
          {
            isAuth: false,
            method: "GET",
            url: "/allIndices",
            title: "All Indices",
            query: [],
            body: {},
            parameters: [],
            headers: [],
          },
          {
            isAuth: false,
            method: "POST",
            url: "/{indexName}/list",
            title: "List",
            query: [
              {
                key: "page",
                value: "1",
                description: "Page number",
                active: true,
              },
              {
                key: "limit",
                value: "10",
                description: "Limit number",
                active: true,
              },
              {
                key: "sortBy",
                value: "createdAt",
                description: "Sort by",
                active: true,
              },
              {
                key: "sortOrder",
                value: "desc",
                description: "Sort order",
                active: true,
              },
              {
                key: "q",
                value: "",
                description: "Search",
                active: false,
              },
            ],
            body: {
              type: "json",
              content: {
                field: {
                  //operator types: match, eq, noteq, range, exists, missing, prefix, wildcard, regexp, match_phrase, match_phrase_prefix
                  operator: "eq",
                  value: "string",
                  //if operator is range, values: [min, max]
                },
              },
            },
            parameters: [
              {
                key: "indexName",
                value: "string",
                description: "Index Name",
              },
            ],
            headers: [],
          },
          {
            isAuth: false,
            method: "GET",
            url: "/{indexName}/list",
            title: "List",
            query: [
              {
                key: "page",
                value: "1",
                description: "Page number",
                active: true,
              },
              {
                key: "limit",
                value: "10",
                description: "Limit number",
                active: true,
              },
              {
                key: "sortBy",
                value: "createdAt",
                description: "Sort by",
                active: true,
              },
              {
                key: "sortOrder",
                value: "desc",
                description: "Sort order",
                active: true,
              },
              {
                key: "q",
                value: "",
                description: "Search",
                active: false,
              },
            ],
            body: {},
            parameters: [
              {
                key: "indexName",
                value: "string",
                description: "Index Name",
              },
            ],
            headers: [],
          },
          {
            isAuth: false,
            method: "POST",
            url: "/{indexName}/count",
            title: "Count",
            query: [
              {
                key: "q",
                value: "",
                description: "Search",
                active: false,
              },
            ],
            body: {
              type: "json",
              content: {
                field: {
                  //operator types: match, eq, noteq, range, exists, missing, prefix, wildcard, regexp, match_phrase, match_phrase_prefix
                  operator: "eq",
                  value: "string",
                  //if operator is range, values: [min, max]
                },
              },
            },
            parameters: [
              {
                key: "indexName",
                value: "string",
                description: "Index Name",
              },
            ],
            headers: [],
          },
          {
            isAuth: false,
            method: "GET",
            url: "/{indexName}/count",
            title: "Count",
            query: [
              {
                key: "q",
                value: "",
                description: "Search",
                active: false,
              },
            ],
            body: {},
            parameters: [
              {
                key: "indexName",
                value: "string",
                description: "Index Name",
              },
            ],
            headers: [],
          },
          {
            isAuth: false,
            method: "GET",
            url: "/{indexName}/schema",
            title: "Schema",
            query: [],
            body: {},
            parameters: [
              {
                key: "indexName",
                value: "string",
                description: "Index Name",
              },
            ],
            headers: [],
          },
          {
            isAuth: false,
            method: "GET",
            url: "/{indexName}/{id}",
            title: "Get",
            query: [],
            body: {},
            parameters: [
              {
                key: "indexName",
                value: "string",
                description: "Index Name",
              },
              {
                key: "id",
                value: "string",
                description: "Id",
              },
            ],
            headers: [],
          },
        ],
      },
    ],
  };

  config.dataObjects.push({
    name: "userRegistrationConfirmationView",
    description: "",
    reference: {
      tableName: "userRegistrationConfirmationView",
      properties: [],
    },
    endpoints: [
      {
        isAuth: false,
        method: "GET",
        url: "/userRegistrationConfirmationView",
        title: "List",
        query: [],
        body: {},
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: "/userRegistrationConfirmationView/{id}",
        title: "Get",
        query: [],
        body: {},
        parameters: [
          {
            key: "id",
            value: "string",
            description: "Id",
          },
        ],
        headers: [],
      },
    ],
  });

  config.dataObjects.push({
    name: "reportReadyForDownloadView",
    description: "",
    reference: {
      tableName: "reportReadyForDownloadView",
      properties: [],
    },
    endpoints: [
      {
        isAuth: false,
        method: "GET",
        url: "/reportReadyForDownloadView",
        title: "List",
        query: [],
        body: {},
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: "/reportReadyForDownloadView/{id}",
        title: "Get",
        query: [],
        body: {},
        parameters: [
          {
            key: "id",
            value: "string",
            description: "Id",
          },
        ],
        headers: [],
      },
    ],
  });

  config.dataObjects.push({
    name: "lowStockAlertView",
    description: "",
    reference: {
      tableName: "lowStockAlertView",
      properties: [],
    },
    endpoints: [
      {
        isAuth: false,
        method: "GET",
        url: "/lowStockAlertView",
        title: "List",
        query: [],
        body: {},
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: "/lowStockAlertView/{id}",
        title: "Get",
        query: [],
        body: {},
        parameters: [
          {
            key: "id",
            value: "string",
            description: "Id",
          },
        ],
        headers: [],
      },
    ],
  });

  config.dataObjects.push({
    name: "saleTransactionCorrectionAuditView",
    description: "",
    reference: {
      tableName: "saleTransactionCorrectionAuditView",
      properties: [],
    },
    endpoints: [
      {
        isAuth: false,
        method: "GET",
        url: "/saleTransactionCorrectionAuditView",
        title: "List",
        query: [],
        body: {},
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: "/saleTransactionCorrectionAuditView/{id}",
        title: "Get",
        query: [],
        body: {},
        parameters: [
          {
            key: "id",
            value: "string",
            description: "Id",
          },
        ],
        headers: [],
      },
    ],
  });

  config.dataObjects.push({
    name: "systemHealthIncidentView",
    description: "",
    reference: {
      tableName: "systemHealthIncidentView",
      properties: [],
    },
    endpoints: [
      {
        isAuth: false,
        method: "GET",
        url: "/systemHealthIncidentView",
        title: "List",
        query: [],
        body: {},
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: "/systemHealthIncidentView/{id}",
        title: "Get",
        query: [],
        body: {},
        parameters: [
          {
            key: "id",
            value: "string",
            description: "Id",
          },
        ],
        headers: [],
      },
    ],
  });

  config.dataObjects.push({
    name: "storeOverrideGrantedView",
    description: "",
    reference: {
      tableName: "storeOverrideGrantedView",
      properties: [],
    },
    endpoints: [
      {
        isAuth: false,
        method: "GET",
        url: "/storeOverrideGrantedView",
        title: "List",
        query: [],
        body: {},
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: "/storeOverrideGrantedView/{id}",
        title: "Get",
        query: [],
        body: {},
        parameters: [
          {
            key: "id",
            value: "string",
            description: "Id",
          },
        ],
        headers: [],
      },
    ],
  });

  config.dataObjects.push({
    name: "salesDashboardView",
    description: "",
    reference: {
      tableName: "salesDashboardView",
      properties: [],
    },
    endpoints: [
      {
        isAuth: false,
        method: "POST",
        url: "/salesDashboardView/list",
        title: "List",
        query: [
          {
            key: "page",
            value: "1",
            description: "Page number",
            active: true,
          },
          {
            key: "limit",
            value: "10",
            description: "Limit number",
            active: true,
          },
          {
            key: "sortBy",
            value: "createdAt",
            description: "Sort by",
            active: true,
          },
          {
            key: "sortOrder",
            value: "desc",
            description: "Sort order",
            active: true,
          },
          {
            key: "q",
            value: "",
            description: "Search",
            active: false,
          },
        ],
        body: {
          type: "json",
          content: {
            field: {
              //operator types: match, eq, noteq, range, exists, missing, prefix, wildcard, regexp, match_phrase, match_phrase_prefix
              operator: "eq",
              value: "string",
              //if operator is range, values: [min, max]
            },
          },
        },
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: "/salesDashboardView/list",
        title: "List",
        query: [
          {
            key: "page",
            value: "1",
            description: "Page number",
            active: true,
          },
          {
            key: "limit",
            value: "10",
            description: "Limit number",
            active: true,
          },
          {
            key: "sortBy",
            value: "createdAt",
            description: "Sort by",
            active: true,
          },
          {
            key: "sortOrder",
            value: "desc",
            description: "Sort order",
            active: true,
          },
          {
            key: "q",
            value: "",
            description: "Search",
            active: false,
          },
        ],
        body: {},
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "POST",
        url: "/salesDashboardView/count",
        title: "Count",
        query: [
          {
            key: "q",
            value: "",
            description: "Search",
            active: false,
          },
        ],
        body: {
          type: "json",
          content: {
            field: {
              //operator types: match, eq, noteq, range, exists, missing, prefix, wildcard, regexp, match_phrase, match_phrase_prefix
              operator: "eq",
              value: "string",
              //if operator is range, values: [min, max]
            },
          },
        },
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: "/salesDashboardView/count",
        title: "Count",
        query: [
          {
            key: "q",
            value: "",
            description: "Search",
            active: false,
          },
        ],
        body: {},
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: "/salesDashboardView/schema",
        title: "Schema",
        query: [],
        body: {},
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: "/salesDashboardView/{id}",
        title: "Get",
        query: [],
        body: {},
        parameters: [
          {
            key: "id",
            value: "string",
            description: "Id",
          },
        ],
        headers: [],
      },
    ],
  });

  config.dataObjects.push({
    name: "inventoryDashboardView",
    description: "",
    reference: {
      tableName: "inventoryDashboardView",
      properties: [],
    },
    endpoints: [
      {
        isAuth: false,
        method: "POST",
        url: "/inventoryDashboardView/list",
        title: "List",
        query: [
          {
            key: "page",
            value: "1",
            description: "Page number",
            active: true,
          },
          {
            key: "limit",
            value: "10",
            description: "Limit number",
            active: true,
          },
          {
            key: "sortBy",
            value: "createdAt",
            description: "Sort by",
            active: true,
          },
          {
            key: "sortOrder",
            value: "desc",
            description: "Sort order",
            active: true,
          },
          {
            key: "q",
            value: "",
            description: "Search",
            active: false,
          },
        ],
        body: {
          type: "json",
          content: {
            field: {
              //operator types: match, eq, noteq, range, exists, missing, prefix, wildcard, regexp, match_phrase, match_phrase_prefix
              operator: "eq",
              value: "string",
              //if operator is range, values: [min, max]
            },
          },
        },
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: "/inventoryDashboardView/list",
        title: "List",
        query: [
          {
            key: "page",
            value: "1",
            description: "Page number",
            active: true,
          },
          {
            key: "limit",
            value: "10",
            description: "Limit number",
            active: true,
          },
          {
            key: "sortBy",
            value: "createdAt",
            description: "Sort by",
            active: true,
          },
          {
            key: "sortOrder",
            value: "desc",
            description: "Sort order",
            active: true,
          },
          {
            key: "q",
            value: "",
            description: "Search",
            active: false,
          },
        ],
        body: {},
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "POST",
        url: "/inventoryDashboardView/count",
        title: "Count",
        query: [
          {
            key: "q",
            value: "",
            description: "Search",
            active: false,
          },
        ],
        body: {
          type: "json",
          content: {
            field: {
              //operator types: match, eq, noteq, range, exists, missing, prefix, wildcard, regexp, match_phrase, match_phrase_prefix
              operator: "eq",
              value: "string",
              //if operator is range, values: [min, max]
            },
          },
        },
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: "/inventoryDashboardView/count",
        title: "Count",
        query: [
          {
            key: "q",
            value: "",
            description: "Search",
            active: false,
          },
        ],
        body: {},
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: "/inventoryDashboardView/schema",
        title: "Schema",
        query: [],
        body: {},
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: "/inventoryDashboardView/{id}",
        title: "Get",
        query: [],
        body: {},
        parameters: [
          {
            key: "id",
            value: "string",
            description: "Id",
          },
        ],
        headers: [],
      },
    ],
  });

  config.dataObjects.push({
    name: "auditLogView",
    description: "",
    reference: {
      tableName: "auditLogView",
      properties: [],
    },
    endpoints: [
      {
        isAuth: false,
        method: "POST",
        url: "/auditLogView/list",
        title: "List",
        query: [
          {
            key: "page",
            value: "1",
            description: "Page number",
            active: true,
          },
          {
            key: "limit",
            value: "10",
            description: "Limit number",
            active: true,
          },
          {
            key: "sortBy",
            value: "createdAt",
            description: "Sort by",
            active: true,
          },
          {
            key: "sortOrder",
            value: "desc",
            description: "Sort order",
            active: true,
          },
          {
            key: "q",
            value: "",
            description: "Search",
            active: false,
          },
        ],
        body: {
          type: "json",
          content: {
            field: {
              //operator types: match, eq, noteq, range, exists, missing, prefix, wildcard, regexp, match_phrase, match_phrase_prefix
              operator: "eq",
              value: "string",
              //if operator is range, values: [min, max]
            },
          },
        },
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: "/auditLogView/list",
        title: "List",
        query: [
          {
            key: "page",
            value: "1",
            description: "Page number",
            active: true,
          },
          {
            key: "limit",
            value: "10",
            description: "Limit number",
            active: true,
          },
          {
            key: "sortBy",
            value: "createdAt",
            description: "Sort by",
            active: true,
          },
          {
            key: "sortOrder",
            value: "desc",
            description: "Sort order",
            active: true,
          },
          {
            key: "q",
            value: "",
            description: "Search",
            active: false,
          },
        ],
        body: {},
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "POST",
        url: "/auditLogView/count",
        title: "Count",
        query: [
          {
            key: "q",
            value: "",
            description: "Search",
            active: false,
          },
        ],
        body: {
          type: "json",
          content: {
            field: {
              //operator types: match, eq, noteq, range, exists, missing, prefix, wildcard, regexp, match_phrase, match_phrase_prefix
              operator: "eq",
              value: "string",
              //if operator is range, values: [min, max]
            },
          },
        },
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: "/auditLogView/count",
        title: "Count",
        query: [
          {
            key: "q",
            value: "",
            description: "Search",
            active: false,
          },
        ],
        body: {},
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: "/auditLogView/schema",
        title: "Schema",
        query: [],
        body: {},
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: "/auditLogView/{id}",
        title: "Get",
        query: [],
        body: {},
        parameters: [
          {
            key: "id",
            value: "string",
            description: "Id",
          },
        ],
        headers: [],
      },
    ],
  });

  config.dataObjects.push({
    name: "crossStoreComparisonView",
    description: "",
    reference: {
      tableName: "crossStoreComparisonView",
      properties: [],
    },
    endpoints: [
      {
        isAuth: false,
        method: "POST",
        url: "/crossStoreComparisonView/list",
        title: "List",
        query: [
          {
            key: "page",
            value: "1",
            description: "Page number",
            active: true,
          },
          {
            key: "limit",
            value: "10",
            description: "Limit number",
            active: true,
          },
          {
            key: "sortBy",
            value: "createdAt",
            description: "Sort by",
            active: true,
          },
          {
            key: "sortOrder",
            value: "desc",
            description: "Sort order",
            active: true,
          },
          {
            key: "q",
            value: "",
            description: "Search",
            active: false,
          },
        ],
        body: {
          type: "json",
          content: {
            field: {
              //operator types: match, eq, noteq, range, exists, missing, prefix, wildcard, regexp, match_phrase, match_phrase_prefix
              operator: "eq",
              value: "string",
              //if operator is range, values: [min, max]
            },
          },
        },
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: "/crossStoreComparisonView/list",
        title: "List",
        query: [
          {
            key: "page",
            value: "1",
            description: "Page number",
            active: true,
          },
          {
            key: "limit",
            value: "10",
            description: "Limit number",
            active: true,
          },
          {
            key: "sortBy",
            value: "createdAt",
            description: "Sort by",
            active: true,
          },
          {
            key: "sortOrder",
            value: "desc",
            description: "Sort order",
            active: true,
          },
          {
            key: "q",
            value: "",
            description: "Search",
            active: false,
          },
        ],
        body: {},
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "POST",
        url: "/crossStoreComparisonView/count",
        title: "Count",
        query: [
          {
            key: "q",
            value: "",
            description: "Search",
            active: false,
          },
        ],
        body: {
          type: "json",
          content: {
            field: {
              //operator types: match, eq, noteq, range, exists, missing, prefix, wildcard, regexp, match_phrase, match_phrase_prefix
              operator: "eq",
              value: "string",
              //if operator is range, values: [min, max]
            },
          },
        },
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: "/crossStoreComparisonView/count",
        title: "Count",
        query: [
          {
            key: "q",
            value: "",
            description: "Search",
            active: false,
          },
        ],
        body: {},
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: "/crossStoreComparisonView/schema",
        title: "Schema",
        query: [],
        body: {},
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: "/crossStoreComparisonView/{id}",
        title: "Get",
        query: [],
        body: {},
        parameters: [
          {
            key: "id",
            value: "string",
            description: "Id",
          },
        ],
        headers: [],
      },
    ],
  });

  config.dataObjects.push({
    name: "ciCdJobStatusNotificationView",
    description: "",
    reference: {
      tableName: "ciCdJobStatusNotificationView",
      properties: [],
    },
    endpoints: [
      {
        isAuth: false,
        method: "GET",
        url: "/ciCdJobStatusNotificationView",
        title: "List",
        query: [],
        body: {},
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: "/ciCdJobStatusNotificationView/{id}",
        title: "Get",
        query: [],
        body: {},
        parameters: [
          {
            key: "id",
            value: "string",
            description: "Id",
          },
        ],
        headers: [],
      },
    ],
  });

  config.dataObjects.push({
    name: "accountRegistrationConfirmationView",
    description: "",
    reference: {
      tableName: "accountRegistrationConfirmationView",
      properties: [],
    },
    endpoints: [
      {
        isAuth: false,
        method: "GET",
        url: "/accountRegistrationConfirmationView",
        title: "List",
        query: [],
        body: {},
        parameters: [],
        headers: [],
      },
      {
        isAuth: false,
        method: "GET",
        url: "/accountRegistrationConfirmationView/{id}",
        title: "Get",
        query: [],
        body: {},
        parameters: [
          {
            key: "id",
            value: "string",
            description: "Id",
          },
        ],
        headers: [],
      },
    ],
  });

  inject(app, config);
};

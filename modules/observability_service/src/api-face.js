const { inject } = require("mindbricks-api-face");

module.exports = (app) => {
  const authUrl = (process.env.SERVICE_URL ?? "mindbricks.com").replace(
    process.env.SERVICE_SHORT_NAME,
    "auth",
  );

  const config = {
    name: "salesai - observability",
    brand: {
      name: "salesai",
      image: "https://mindbricks.com/favicon.ico",
      moduleName: "observability",
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
        name: "AuditLog",
        description:
          "Tracks every sensitive or critical action on the platform for audit/compliance. Includes what happened, who, when, entity, before/after data, store and user context, and extra trace fields.",
        reference: {
          tableName: "auditLog",
          properties: [
            {
              name: "userId",
              type: "ID",
            },

            {
              name: "actionType",
              type: "String",
            },

            {
              name: "entityType",
              type: "String",
            },

            {
              name: "entityId",
              type: "String",
            },

            {
              name: "beforeData",
              type: "Object",
            },

            {
              name: "afterData",
              type: "Object",
            },

            {
              name: "severity",
              type: "Enum",
            },

            {
              name: "message",
              type: "Text",
            },

            {
              name: "traceContext",
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
            url: "/auditlogs/{auditLogId}",
            title: "getAuditLog",
            query: [],

            parameters: [
              {
                key: "auditLogId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "POST",
            url: "/auditlogs",
            title: "createAuditLog",
            query: [],

            body: {
              type: "json",
              content: {
                userId: "ID",
                actionType: "String",
                entityType: "String",
                entityId: "String",
                beforeData: "Object",
                afterData: "Object",
                severity: "Enum",
                message: "Text",
                traceContext: "Object",
              },
            },

            parameters: [],
            headers: [],
          },

          {
            isAuth: true,
            method: "PATCH",
            url: "/auditlogs/{auditLogId}",
            title: "updateAuditLog",
            query: [],

            body: {
              type: "json",
              content: {
                message: "Text",
              },
            },

            parameters: [
              {
                key: "auditLogId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "DELETE",
            url: "/auditlogs/{auditLogId}",
            title: "deleteAuditLog",
            query: [],

            body: {
              type: "json",
              content: {},
            },

            parameters: [
              {
                key: "auditLogId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "GET",
            url: "/auditlogs",
            title: "listAuditLogs",
            query: [],

            parameters: [],
            headers: [],
          },
        ],
      },

      {
        name: "MetricDatapoint",
        description:
          "Stores a single time-series business/system/platform metric (e.g., salesCount, errorRate, latency), with target entity, granularity, observed value, and anomaly flags.",
        reference: {
          tableName: "metricDatapoint",
          properties: [
            {
              name: "metricType",
              type: "String",
            },

            {
              name: "targetType",
              type: "String",
            },

            {
              name: "targetId",
              type: "String",
            },

            {
              name: "periodStart",
              type: "Date",
            },

            {
              name: "granularity",
              type: "String",
            },

            {
              name: "value",
              type: "Double",
            },

            {
              name: "flagAnomalous",
              type: "Boolean",
            },

            {
              name: "observedByUserId",
              type: "ID",
            },

            {
              name: "context",
              type: "Object",
            },
          ],
        },
        endpoints: [
          {
            isAuth: true,
            method: "GET",
            url: "/metricdatapoints/{metricDatapointId}",
            title: "getMetricDatapoint",
            query: [],

            parameters: [
              {
                key: "metricDatapointId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "POST",
            url: "/metricdatapoints",
            title: "createMetricDatapoint",
            query: [],

            body: {
              type: "json",
              content: {
                metricType: "String",
                targetType: "String",
                targetId: "String",
                periodStart: "Date",
                granularity: "String",
                value: "Double",
                flagAnomalous: "Boolean",
                observedByUserId: "ID",
                context: "Object",
              },
            },

            parameters: [],
            headers: [],
          },

          {
            isAuth: true,
            method: "PATCH",
            url: "/metricdatapoints/{metricDatapointId}",
            title: "updateMetricDatapoint",
            query: [],

            body: {
              type: "json",
              content: {
                value: "Double",
                flagAnomalous: "Boolean",
                context: "Object",
              },
            },

            parameters: [
              {
                key: "metricDatapointId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "DELETE",
            url: "/metricdatapoints/{metricDatapointId}",
            title: "deleteMetricDatapoint",
            query: [],

            body: {
              type: "json",
              content: {},
            },

            parameters: [
              {
                key: "metricDatapointId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "GET",
            url: "/metricdatapoints",
            title: "listMetricDatapoints",
            query: [],

            parameters: [],
            headers: [],
          },
        ],
      },

      {
        name: "AnomalyEvent",
        description:
          "Represents a detected or reported anomaly (e.g., suspicious, failed or policy-violating activity) for compliance/investigation. Tracks type, source, severity, and review status.",
        reference: {
          tableName: "anomalyEvent",
          properties: [
            {
              name: "anomalyType",
              type: "String",
            },

            {
              name: "triggeredByUserId",
              type: "ID",
            },

            {
              name: "affectedUserId",
              type: "ID",
            },

            {
              name: "storeId",
              type: "ID",
            },

            {
              name: "relatedEntityType",
              type: "String",
            },

            {
              name: "relatedEntityId",
              type: "String",
            },

            {
              name: "description",
              type: "Text",
            },

            {
              name: "detectedAt",
              type: "Date",
            },

            {
              name: "severity",
              type: "Enum",
            },

            {
              name: "status",
              type: "Enum",
            },

            {
              name: "reviewedByUserId",
              type: "ID",
            },
          ],
        },
        endpoints: [
          {
            isAuth: true,
            method: "GET",
            url: "/anomalyevents/{anomalyEventId}",
            title: "getAnomalyEvent",
            query: [],

            parameters: [
              {
                key: "anomalyEventId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "POST",
            url: "/anomalyevents",
            title: "createAnomalyEvent",
            query: [],

            body: {
              type: "json",
              content: {
                anomalyType: "String",
                triggeredByUserId: "ID",
                affectedUserId: "ID",
                storeId: "ID",
                relatedEntityType: "String",
                relatedEntityId: "String",
                description: "Text",
                detectedAt: "Date",
                severity: "Enum",
                status: "Enum",
                reviewedByUserId: "ID",
              },
            },

            parameters: [],
            headers: [],
          },

          {
            isAuth: true,
            method: "PATCH",
            url: "/anomalyevents/{anomalyEventId}",
            title: "updateAnomalyEvent",
            query: [],

            body: {
              type: "json",
              content: {
                description: "Text",
                status: "Enum",
                reviewedByUserId: "ID",
              },
            },

            parameters: [
              {
                key: "anomalyEventId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "DELETE",
            url: "/anomalyevents/{anomalyEventId}",
            title: "deleteAnomalyEvent",
            query: [],

            body: {
              type: "json",
              content: {},
            },

            parameters: [
              {
                key: "anomalyEventId",
                value: "",
                description: "",
              },
            ],
            headers: [],
          },

          {
            isAuth: true,
            method: "GET",
            url: "/anomalyevents",
            title: "listAnomalyEvents",
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

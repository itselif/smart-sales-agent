const { CreateMetricDatapointManager } = require("managers");
const { z } = require("zod");

const ObservabilityMcpController = require("../../ObservabilityServiceMcpController");

class CreateMetricDatapointMcpController extends ObservabilityMcpController {
  constructor(params) {
    super("createMetricDatapoint", "createmetricdatapoint", params);
    this.dataName = "metricDatapoint";
    this.crudType = "create";
  }

  createApiManager() {
    return new CreateMetricDatapointManager(this.request, "mcp");
  }

  static getOutputSchema() {
    return z
      .object({
        status: z.string(),
        metricDatapoint: z
          .object({
            id: z
              .string()
              .uuid()
              .describe("The unique primary key of the data object as UUID"),
            metricType: z
              .string()
              .max(255)
              .describe(
                "Type of metric (e.g., salesCount, inventoryLow, systemLatency, apiError, healthCheck, loginCount)",
              ),
            targetType: z
              .string()
              .max(255)
              .describe("Type of target: system, service, store, user, etc."),
            targetId: z
              .string()
              .max(255)
              .optional()
              .nullable()
              .describe(
                "ID of the target (storeId, service name, userId, etc.) as appropriate.",
              ),
            periodStart: z
              .string()
              .describe(
                "Start timestamp for the metric period (e.g. day, hour, minute, etc.).",
              ),
            granularity: z
              .string()
              .max(255)
              .describe(
                "Granularity/resolution of the datapoint (minute/hour/day/etc).",
              ),
            value: z.number().describe("Value of the metric datapoint."),
            flagAnomalous: z
              .boolean()
              .optional()
              .nullable()
              .describe(
                "Indicates the datapoint is an anomaly (detected or flagged).",
              ),
            observedByUserId: z
              .string()
              .uuid()
              .optional()
              .nullable()
              .describe(
                "User who reported/flagged/created this metric data, if manually added or updated (optional).",
              ),
            context: z
              .object()
              .optional()
              .nullable()
              .describe(
                "Free-form context for the metric (cause, dimension, tags, error codes, etc.)",
              ),
            isActive: z
              .boolean()
              .describe(
                "The active status of the data object to manage soft delete. False when deleted.",
              ),
          })
          .describe(
            "Stores a single time-series business/system/platform metric (e.g., salesCount, errorRate, latency), with target entity, granularity, observed value, and anomaly flags.",
          ),
      })
      .describe("The response object of the crud route");
  }

  static getInputScheme() {
    return {
      storeCodename: z
        .string()
        .optional()
        .describe(
          "Write the unique codename of the store so that your request will be autheticated and handled in your tenant scope.",
        ),

      accessToken: z
        .string()
        .optional()
        .describe(
          "The access token which is returned from a login request or given by user. This access token will override if there is any bearer or OAuth token in the mcp client. If not given the request will be made with the system (bearer or OAuth) token. For public routes you dont need to deifne any access token.",
        ),
      metricType: z
        .string()
        .max(255)
        .describe(
          "Type of metric (e.g., salesCount, inventoryLow, systemLatency, apiError, healthCheck, loginCount)",
        ),

      targetType: z
        .string()
        .max(255)
        .describe("Type of target: system, service, store, user, etc."),

      targetId: z
        .string()
        .max(255)
        .optional()
        .describe(
          "ID of the target (storeId, service name, userId, etc.) as appropriate.",
        ),

      periodStart: z
        .string()
        .describe(
          "Start timestamp for the metric period (e.g. day, hour, minute, etc.).",
        ),

      granularity: z
        .string()
        .max(255)
        .describe(
          "Granularity/resolution of the datapoint (minute/hour/day/etc).",
        ),

      value: z.number().describe("Value of the metric datapoint."),

      flagAnomalous: z
        .boolean()
        .optional()
        .describe(
          "Indicates the datapoint is an anomaly (detected or flagged).",
        ),

      observedByUserId: z
        .string()
        .uuid()
        .optional()
        .describe(
          "User who reported/flagged/created this metric data, if manually added or updated (optional).",
        ),

      context: z
        .object({})
        .optional()
        .describe(
          "Free-form context for the metric (cause, dimension, tags, error codes, etc.)",
        ),
    };
  }
}

module.exports = (headers) => {
  return {
    name: "createMetricDatapoint",
    description: "Record a new system/business metric datapoint.",
    parameters: CreateMetricDatapointMcpController.getInputScheme(),
    controller: async (mcpParams) => {
      mcpParams.headers = headers;
      const createMetricDatapointMcpController =
        new CreateMetricDatapointMcpController(mcpParams);
      try {
        const result =
          await createMetricDatapointMcpController.processRequest();
        //return CreateMetricDatapointMcpController.getOutputSchema().parse(result);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result),
            },
          ],
        };
      } catch (err) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error: ${err.message}`,
            },
          ],
        };
      }
    },
  };
};

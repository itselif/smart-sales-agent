const { GetAuditLogManager } = require("managers");
const { z } = require("zod");

const ObservabilityMcpController = require("../../ObservabilityServiceMcpController");

class GetAuditLogMcpController extends ObservabilityMcpController {
  constructor(params) {
    super("getAuditLog", "getauditlog", params);
    this.dataName = "auditLog";
    this.crudType = "get";
  }

  createApiManager() {
    return new GetAuditLogManager(this.request, "mcp");
  }

  static getOutputSchema() {
    return z
      .object({
        status: z.string(),
        auditLog: z
          .object({
            id: z
              .string()
              .uuid()
              .describe("The unique primary key of the data object as UUID"),
            userId: z
              .string()
              .uuid()
              .describe("User who triggered the event/action being logged."),
            actionType: z
              .string()
              .max(255)
              .describe(
                "Categorical action descriptor (e.g., saleEdit, overrideGrant, reportDownload, adminOp, login, healthCheck, seedInject, repoSwitch, etc.).",
              ),
            entityType: z
              .string()
              .max(255)
              .optional()
              .nullable()
              .describe(
                "Type of primary entity affected (e.g., saleTransaction, inventoryItem, reportFile, storeAssignment, seedData, metric, etc.).",
              ),
            entityId: z
              .string()
              .max(255)
              .optional()
              .nullable()
              .describe("ID of the primary entity affected."),
            beforeData: z
              .object()
              .optional()
              .nullable()
              .describe(
                "Snapshot of relevant data before the action/change. (deep copy/structure as needed).",
              ),
            afterData: z
              .object()
              .optional()
              .nullable()
              .describe(
                "Snapshot of data as it was after this action/change, if applicable.",
              ),
            severity: z
              .enum(["info", "warning", "critical"])
              .describe(
                "Severity/level of action event: 0=info, 1=warning, 2=critical.",
              ),
            message: z
              .string()
              .optional()
              .nullable()
              .describe(
                "Human-readable text or trace providing context/description of the action.",
              ),
            traceContext: z
              .object()
              .optional()
              .nullable()
              .describe(
                "Flexible object: request IDs, IPs, client/user-agent, trace IDs, or extra structured context for compliance and troubleshooting.",
              ),
            storeId: z
              .string()
              .uuid()
              .describe("An ID value to represent the tenant id of the store"),
            isActive: z
              .boolean()
              .describe(
                "The active status of the data object to manage soft delete. False when deleted.",
              ),
          })
          .describe(
            "Tracks every sensitive or critical action on the platform for audit/compliance. Includes what happened, who, when, entity, before/after data, store and user context, and extra trace fields.",
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
      auditLogId: z
        .string()
        .uuid()
        .describe(
          "This id paremeter is used to select the required data object that is queried",
        ),
    };
  }
}

module.exports = (headers) => {
  return {
    name: "getAuditLog",
    description: "Get a single audit log entry by ID.",
    parameters: GetAuditLogMcpController.getInputScheme(),
    controller: async (mcpParams) => {
      mcpParams.headers = headers;
      const getAuditLogMcpController = new GetAuditLogMcpController(mcpParams);
      try {
        const result = await getAuditLogMcpController.processRequest();
        //return GetAuditLogMcpController.getOutputSchema().parse(result);
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

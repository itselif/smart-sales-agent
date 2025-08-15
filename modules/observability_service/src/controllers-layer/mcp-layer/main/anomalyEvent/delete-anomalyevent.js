const { DeleteAnomalyEventManager } = require("managers");
const { z } = require("zod");

const ObservabilityMcpController = require("../../ObservabilityServiceMcpController");

class DeleteAnomalyEventMcpController extends ObservabilityMcpController {
  constructor(params) {
    super("deleteAnomalyEvent", "deleteanomalyevent", params);
    this.dataName = "anomalyEvent";
    this.crudType = "delete";
  }

  createApiManager() {
    return new DeleteAnomalyEventManager(this.request, "mcp");
  }

  static getOutputSchema() {
    return z
      .object({
        status: z.string(),
        anomalyEvent: z
          .object({
            id: z
              .string()
              .uuid()
              .describe("The unique primary key of the data object as UUID"),
            anomalyType: z
              .string()
              .max(255)
              .describe(
                "Type of anomaly (e.g., dataTamper, suspiciousEdit, fraud, systemFailure, policyBreach, invalidLogin, reportAbuse, etc.)",
              ),
            triggeredByUserId: z
              .string()
              .uuid()
              .optional()
              .nullable()
              .describe("User who reported or triggered the anomaly, if any."),
            affectedUserId: z
              .string()
              .uuid()
              .optional()
              .nullable()
              .describe(
                "User affected by anomaly (if different from trigger).",
              ),
            storeId: z
              .string()
              .uuid()
              .optional()
              .nullable()
              .describe("Store linked to the anomaly, if relevant."),
            relatedEntityType: z
              .string()
              .max(255)
              .optional()
              .nullable()
              .describe(
                "Type of related entity (metric, auditLog, saleTransaction, etc.), if anomaly links to another record.",
              ),
            relatedEntityId: z
              .string()
              .max(255)
              .optional()
              .nullable()
              .describe("ID of related entity record."),
            description: z
              .string()
              .optional()
              .nullable()
              .describe(
                "Description/details regarding the anomaly for compliance, notification, and investigation.",
              ),
            detectedAt: z
              .string()
              .describe("Date/time anomaly was detected/flagged."),
            severity: z
              .enum(["low", "medium", "high", "critical"])
              .describe(
                "Severity of anomaly: 0=low, 1=medium, 2=high, 3=critical.",
              ),
            status: z
              .enum(["open", "investigating", "resolved", "closed"])
              .describe(
                "Status of event: 0=open, 1=investigating, 2=resolved, 3=closed.",
              ),
            reviewedByUserId: z
              .string()
              .uuid()
              .optional()
              .nullable()
              .describe(
                "User who performed/closed/reviewed the anomaly (e.g., admin or investigator).",
              ),
            isActive: z
              .boolean()
              .describe(
                "The active status of the data object to manage soft delete. False when deleted.",
              ),
          })
          .describe(
            "Represents a detected or reported anomaly (e.g., suspicious, failed or policy-violating activity) for compliance/investigation. Tracks type, source, severity, and review status.",
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
      anomalyEventId: z
        .string()
        .uuid()
        .describe(
          "This id paremeter is used to select the required data object that will be deleted",
        ),
    };
  }
}

module.exports = (headers) => {
  return {
    name: "deleteAnomalyEvent",
    description:
      "Soft-delete anomaly investigation record upon admin/policy closure.",
    parameters: DeleteAnomalyEventMcpController.getInputScheme(),
    controller: async (mcpParams) => {
      mcpParams.headers = headers;
      const deleteAnomalyEventMcpController =
        new DeleteAnomalyEventMcpController(mcpParams);
      try {
        const result = await deleteAnomalyEventMcpController.processRequest();
        //return DeleteAnomalyEventMcpController.getOutputSchema().parse(result);
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

const { UpdateReportPolicyManager } = require("managers");
const { z } = require("zod");

const ReportingMcpController = require("../../ReportingServiceMcpController");

class UpdateReportPolicyMcpController extends ReportingMcpController {
  constructor(params) {
    super("updateReportPolicy", "updatereportpolicy", params);
    this.dataName = "reportPolicy";
    this.crudType = "update";
  }

  createApiManager() {
    return new UpdateReportPolicyManager(this.request, "mcp");
  }

  static getOutputSchema() {
    return z
      .object({
        status: z.string(),
        reportPolicy: z
          .object({
            id: z
              .string()
              .uuid()
              .describe("The unique primary key of the data object as UUID"),
            reportType: z
              .enum([
                "dailySales",
                "inventory",
                "analytics",
                "crossStoreSummary",
                "userActionAudit",
              ])
              .describe(
                "Which type of report this policy applies to: 0=dailySales, 1=inventory, 2=analytics, 3=crossStoreSummary, 4=userActionAudit",
              ),
            maxRetentionDays: z
              .number()
              .int()
              .describe("Maximum retention of report files (in days)."),
            allowedFormats: z.array(
              z
                .enum(["pdf", "csv", "xlsx"])
                .describe(
                  "Which file formats are allowed for this report type. (Enum: 0=pdf, 1=csv, 2=xlsx)",
                ),
            ),
            description: z
              .string()
              .optional()
              .nullable()
              .describe(
                "Policy description, admin notes, or compliance notes.",
              ),
            isActive: z
              .boolean()
              .describe(
                "The active status of the data object to manage soft delete. False when deleted.",
              ),
          })
          .describe(
            "Admin-configurable reporting policy and metadata. Specifies allowed report types, retention, and generation params.",
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
      reportPolicyId: z
        .string()
        .uuid()
        .describe(
          "This id paremeter is used to select the required data object that will be updated",
        ),

      maxRetentionDays: z
        .number()
        .int()
        .optional()
        .describe("Maximum retention of report files (in days)."),

      allowedFormats: z
        .enum([])
        .optional()
        .describe(
          "Which file formats are allowed for this report type. (Enum: 0=pdf, 1=csv, 2=xlsx)",
        ),

      description: z
        .string()
        .optional()
        .describe("Policy description, admin notes, or compliance notes."),
    };
  }
}

module.exports = (headers) => {
  return {
    name: "updateReportPolicy",
    description: "Update an existing reporting policy/config (admin only).",
    parameters: UpdateReportPolicyMcpController.getInputScheme(),
    controller: async (mcpParams) => {
      mcpParams.headers = headers;
      const updateReportPolicyMcpController =
        new UpdateReportPolicyMcpController(mcpParams);
      try {
        const result = await updateReportPolicyMcpController.processRequest();
        //return UpdateReportPolicyMcpController.getOutputSchema().parse(result);
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

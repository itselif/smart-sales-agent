const { UpdateReportRequestManager } = require("managers");
const { z } = require("zod");

const ReportingMcpController = require("../../ReportingServiceMcpController");

class UpdateReportRequestMcpController extends ReportingMcpController {
  constructor(params) {
    super("updateReportRequest", "updatereportrequest", params);
    this.dataName = "reportRequest";
    this.crudType = "update";
  }

  createApiManager() {
    return new UpdateReportRequestManager(this.request, "mcp");
  }

  static getOutputSchema() {
    return z
      .object({
        status: z.string(),
        reportRequest: z
          .object({
            id: z
              .string()
              .uuid()
              .describe("The unique primary key of the data object as UUID"),
            requestedByUserId: z
              .string()
              .uuid()
              .describe("ID of the user who requests the report."),
            reportType: z
              .enum([
                "dailySales",
                "inventory",
                "analytics",
                "crossStoreSummary",
                "userActionAudit",
              ])
              .describe(
                "Type of report requested: 0=dailySales, 1=inventory, 2=analytics, 3=crossStoreSummary, 4=userActionAudit",
              ),
            storeIds: z.array(
              z
                .string()
                .uuid()
                .describe(
                  "IDs of stores covered by the report request (can be one or multiple, depending on permission).",
                ),
            ),
            dateFrom: z
              .string()
              .describe("Report start date or single day for daily reports."),
            dateTo: z
              .string()
              .describe(
                "Report end date (can be same as dateFrom for one day reports).",
              ),
            productIds: z.array(
              z
                .string()
                .max(255)
                .optional()
                .nullable()
                .describe(
                  "SKUs or IDs of products relevant to the report, optional.",
                ),
            ),
            format: z
              .enum(["pdf", "csv", "xlsx"])
              .describe("Format for output file(s): 0=pdf, 1=csv, 2=xlsx"),
            status: z
              .enum(["pending", "processing", "complete", "failed"])
              .describe(
                "Status of the report request. 0=pending, 1=processing, 2=complete, 3=failed",
              ),
            isActive: z
              .boolean()
              .describe(
                "The active status of the data object to manage soft delete. False when deleted.",
              ),
          })
          .describe(
            "Captures a user's request to generate a report, including all parameters such as report type, date range, store(s), and output format. Tracks status for audit and process management.",
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
      reportRequestId: z
        .string()
        .uuid()
        .describe(
          "This id paremeter is used to select the required data object that will be updated",
        ),

      status: z
        .enum([])
        .optional()
        .describe(
          "Status of the report request. 0=pending, 1=processing, 2=complete, 3=failed",
        ),
    };
  }
}

module.exports = (headers) => {
  return {
    name: "updateReportRequest",
    description:
      "Update report request status or parameters (admin/system only).",
    parameters: UpdateReportRequestMcpController.getInputScheme(),
    controller: async (mcpParams) => {
      mcpParams.headers = headers;
      const updateReportRequestMcpController =
        new UpdateReportRequestMcpController(mcpParams);
      try {
        const result = await updateReportRequestMcpController.processRequest();
        //return UpdateReportRequestMcpController.getOutputSchema().parse(result);
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

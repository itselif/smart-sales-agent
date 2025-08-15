const { DeleteReportFileManager } = require("managers");
const { z } = require("zod");

const ReportingMcpController = require("../../ReportingServiceMcpController");

class DeleteReportFileMcpController extends ReportingMcpController {
  constructor(params) {
    super("deleteReportFile", "deletereportfile", params);
    this.dataName = "reportFile";
    this.crudType = "delete";
  }

  createApiManager() {
    return new DeleteReportFileManager(this.request, "mcp");
  }

  static getOutputSchema() {
    return z
      .object({
        status: z.string(),
        reportFile: z
          .object({
            id: z
              .string()
              .uuid()
              .describe("The unique primary key of the data object as UUID"),
            reportRequestId: z
              .string()
              .uuid()
              .describe(
                "Reference to the reportRequest for which this file was generated.",
              ),
            fileUrl: z
              .string()
              .max(255)
              .describe("Storage URL (internal/public) of the report file."),
            format: z
              .enum(["pdf", "csv", "xlsx"])
              .describe("Report file format: 0=pdf, 1=csv, 2=xlsx"),
            signedUrl: z
              .string()
              .max(255)
              .optional()
              .nullable()
              .describe(
                "Time-limited, signed download URL for the file, generated per access policy.",
              ),
            signedUrlExpiry: z
              .string()
              .optional()
              .nullable()
              .describe("The expiration time for the signed download URL."),
            downloadCount: z
              .number()
              .int()
              .describe(
                "How many times this report was downloaded (incremented for auditing).",
              ),
            isActive: z
              .boolean()
              .describe(
                "The active status of the data object to manage soft delete. False when deleted.",
              ),
          })
          .describe(
            "Represents a generated report file, its secure access URL, format, expiry, and download/audit metadata. Links to reportRequest for traceability.",
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
      reportFileId: z
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
    name: "deleteReportFile",
    description: "Delete (soft) a generated report file entry.",
    parameters: DeleteReportFileMcpController.getInputScheme(),
    controller: async (mcpParams) => {
      mcpParams.headers = headers;
      const deleteReportFileMcpController = new DeleteReportFileMcpController(
        mcpParams,
      );
      try {
        const result = await deleteReportFileMcpController.processRequest();
        //return DeleteReportFileMcpController.getOutputSchema().parse(result);
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

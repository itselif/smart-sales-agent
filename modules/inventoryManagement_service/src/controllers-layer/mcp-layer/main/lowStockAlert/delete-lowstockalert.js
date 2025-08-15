const { DeleteLowStockAlertManager } = require("managers");
const { z } = require("zod");

const InventoryManagementMcpController = require("../../InventoryManagementServiceMcpController");

class DeleteLowStockAlertMcpController extends InventoryManagementMcpController {
  constructor(params) {
    super("deleteLowStockAlert", "deletelowstockalert", params);
    this.dataName = "lowStockAlert";
    this.crudType = "delete";
  }

  createApiManager() {
    return new DeleteLowStockAlertManager(this.request, "mcp");
  }

  static getOutputSchema() {
    return z
      .object({
        status: z.string(),
        lowStockAlert: z
          .object({
            id: z
              .string()
              .uuid()
              .describe("The unique primary key of the data object as UUID"),
            inventoryItemId: z
              .string()
              .uuid()
              .describe("Inventory item triggering this low-stock alert."),
            alertType: z
              .enum(["lowStock", "outOfStock", "highRisk"])
              .describe(
                "Type of inventory alert: 0=lowStock, 1=outOfStock, 2=highRisk",
              ),
            alertTimestamp: z
              .string()
              .describe("Timestamp when alert was triggered."),
            resolved: z
              .boolean()
              .optional()
              .nullable()
              .describe(
                "Flag for whether this alert has been acknowledged or resolved.",
              ),
            resolvedByUserId: z
              .string()
              .uuid()
              .optional()
              .nullable()
              .describe(
                "User who resolved or acknowledged the alert (optional).",
              ),
            resolvedTimestamp: z
              .string()
              .optional()
              .nullable()
              .describe("Timestamp when alert was resolved or acknowledged."),
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
            "Represents a low-stock or high-risk inventory item event; alerts sellers/managers of the condition and supports audit/resolution.",
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
      lowStockAlertId: z
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
    name: "deleteLowStockAlert",
    description: "Delete (soft delete) a lowStockAlert record.",
    parameters: DeleteLowStockAlertMcpController.getInputScheme(),
    controller: async (mcpParams) => {
      mcpParams.headers = headers;
      const deleteLowStockAlertMcpController =
        new DeleteLowStockAlertMcpController(mcpParams);
      try {
        const result = await deleteLowStockAlertMcpController.processRequest();
        //return DeleteLowStockAlertMcpController.getOutputSchema().parse(result);
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

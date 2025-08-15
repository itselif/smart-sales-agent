const { UpdateInventoryItemManager } = require("managers");
const { z } = require("zod");

const InventoryManagementMcpController = require("../../InventoryManagementServiceMcpController");

class UpdateInventoryItemMcpController extends InventoryManagementMcpController {
  constructor(params) {
    super("updateInventoryItem", "updateinventoryitem", params);
    this.dataName = "inventoryItem";
    this.crudType = "update";
  }

  createApiManager() {
    return new UpdateInventoryItemManager(this.request, "mcp");
  }

  static getOutputSchema() {
    return z
      .object({
        status: z.string(),
        inventoryItem: z
          .object({
            id: z
              .string()
              .uuid()
              .describe("The unique primary key of the data object as UUID"),
            productId: z
              .string()
              .max(255)
              .describe(
                "Unique product SKU or identifier (string, as no central product object is currently defined).",
              ),
            quantity: z
              .number()
              .int()
              .describe(
                "The current quantity of this product in the store's inventory.",
              ),
            status: z
              .enum([
                "inStock",
                "outOfStock",
                "lowStock",
                "damaged",
                "reserved",
              ])
              .describe(
                "Status of inventory item: 0=in-stock, 1=out-of-stock, 2=low-stock, 3=damaged, 4=reserved",
              ),
            lowStockThreshold: z
              .number()
              .int()
              .describe(
                "Threshold quantity; if quantity <= this value, the item is considered low-stock and triggers alerts.",
              ),
            lastSyncTimestamp: z
              .string()
              .optional()
              .nullable()
              .describe(
                "Timestamp when the inventoryItem was last synchronized with remote/manual updates.",
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
            "Tracks the quantity and status of a specific product in a given store, including thresholds for low-stock alerts and isolation by store.",
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
      inventoryItemId: z
        .string()
        .uuid()
        .describe(
          "This id paremeter is used to select the required data object that will be updated",
        ),

      quantity: z
        .number()
        .int()
        .optional()
        .describe(
          "The current quantity of this product in the store's inventory.",
        ),

      status: z
        .enum([])
        .optional()
        .describe(
          "Status of inventory item: 0=in-stock, 1=out-of-stock, 2=low-stock, 3=damaged, 4=reserved",
        ),

      lowStockThreshold: z
        .number()
        .int()
        .optional()
        .describe(
          "Threshold quantity; if quantity <= this value, the item is considered low-stock and triggers alerts.",
        ),

      lastSyncTimestamp: z
        .string()
        .optional()
        .describe(
          "Timestamp when the inventoryItem was last synchronized with remote/manual updates.",
        ),
    };
  }
}

module.exports = (headers) => {
  return {
    name: "updateInventoryItem",
    description:
      "Update an inventory item’s quantity/status/thresholds as allowed.",
    parameters: UpdateInventoryItemMcpController.getInputScheme(),
    controller: async (mcpParams) => {
      mcpParams.headers = headers;
      const updateInventoryItemMcpController =
        new UpdateInventoryItemMcpController(mcpParams);
      try {
        const result = await updateInventoryItemMcpController.processRequest();
        //return UpdateInventoryItemMcpController.getOutputSchema().parse(result);
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

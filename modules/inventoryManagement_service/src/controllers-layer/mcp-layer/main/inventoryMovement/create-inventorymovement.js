const { CreateInventoryMovementManager } = require("managers");
const { z } = require("zod");

const InventoryManagementMcpController = require("../../InventoryManagementServiceMcpController");

class CreateInventoryMovementMcpController extends InventoryManagementMcpController {
  constructor(params) {
    super("createInventoryMovement", "createinventorymovement", params);
    this.dataName = "inventoryMovement";
    this.crudType = "create";
  }

  createApiManager() {
    return new CreateInventoryMovementManager(this.request, "mcp");
  }

  static getOutputSchema() {
    return z
      .object({
        status: z.string(),
        inventoryMovement: z
          .object({
            id: z
              .string()
              .uuid()
              .describe("The unique primary key of the data object as UUID"),
            inventoryItemId: z
              .string()
              .uuid()
              .describe(
                "Reference to the inventoryItem this movement relates to.",
              ),
            quantityDelta: z
              .number()
              .int()
              .describe(
                "Amount of increase (+) or decrease (-) in inventory for this movement.",
              ),
            movementType: z
              .enum([
                "sale",
                "restock",
                "manualAdjustment",
                "correction",
                "damage",
                "transfer",
              ])
              .describe(
                "Type of inventory movement: 0=sale, 1=restock, 2=manualAdjustment, 3=correction, 4=dump/damage, 5=transfer.",
              ),
            movementTimestamp: z
              .string()
              .describe("Timestamp when the movement occurred."),
            userId: z
              .string()
              .uuid()
              .describe("User who performed the movement or adjustment."),
            movementReason: z
              .string()
              .optional()
              .nullable()
              .describe(
                "Freeform reason comment for this movement (optional unless manual/correction).",
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
            "Logs each inventory movement (increase or decrease), recording the change type, value, reason, and related user and inventory item.",
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
        .describe("Reference to the inventoryItem this movement relates to."),

      quantityDelta: z
        .number()
        .int()
        .describe(
          "Amount of increase (+) or decrease (-) in inventory for this movement.",
        ),

      movementType: z
        .enum([])
        .describe(
          "Type of inventory movement: 0=sale, 1=restock, 2=manualAdjustment, 3=correction, 4=dump/damage, 5=transfer.",
        ),

      movementTimestamp: z
        .string()
        .describe("Timestamp when the movement occurred."),

      userId: z
        .string()
        .uuid()
        .describe("User who performed the movement or adjustment."),

      movementReason: z
        .string()
        .optional()
        .describe(
          "Freeform reason comment for this movement (optional unless manual/correction).",
        ),
    };
  }
}

module.exports = (headers) => {
  return {
    name: "createInventoryMovement",
    description:
      "Record a new inventory movement (i.e., adjustment, sale, restock, etc).",
    parameters: CreateInventoryMovementMcpController.getInputScheme(),
    controller: async (mcpParams) => {
      mcpParams.headers = headers;
      const createInventoryMovementMcpController =
        new CreateInventoryMovementMcpController(mcpParams);
      try {
        const result =
          await createInventoryMovementMcpController.processRequest();
        //return CreateInventoryMovementMcpController.getOutputSchema().parse(result);
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

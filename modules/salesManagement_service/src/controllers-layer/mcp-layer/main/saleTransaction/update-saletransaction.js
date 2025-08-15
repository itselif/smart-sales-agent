const { UpdateSaleTransactionManager } = require("managers");
const { z } = require("zod");

const SalesManagementMcpController = require("../../SalesManagementServiceMcpController");

class UpdateSaleTransactionMcpController extends SalesManagementMcpController {
  constructor(params) {
    super("updateSaleTransaction", "updatesaletransaction", params);
    this.dataName = "saleTransaction";
    this.crudType = "update";
  }

  createApiManager() {
    return new UpdateSaleTransactionManager(this.request, "mcp");
  }

  static getOutputSchema() {
    return z
      .object({
        status: z.string(),
        saleTransaction: z
          .object({
            id: z
              .string()
              .uuid()
              .describe("The unique primary key of the data object as UUID"),
            sellerId: z
              .string()
              .uuid()
              .describe(
                "User ID of the seller who created this sale transaction.",
              ),
            amount: z.number().describe("Total sum of the sale transaction."),
            currency: z
              .string()
              .max(255)
              .describe("ISO currency code for the transaction."),
            transactionDate: z
              .string()
              .describe("Date and time when the sale transaction occurred."),
            status: z
              .enum(["normal", "corrected", "canceled"])
              .describe(
                "Status of the sale transaction: 0=normal, 1=corrected, 2=canceled.",
              ),
            correctionJustification: z
              .string()
              .optional()
              .nullable()
              .describe(
                "Reason for correction, if the transaction was updated after initial entry. Required when status is 'corrected' or 'canceled'.",
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
            "Represents a retail sale transaction. Contains all information about a sale: store, seller, amounts, date, status (normal, corrected, canceled), and optional justification for corrections. Manages core sales lifecycle.",
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
      saleTransactionId: z
        .string()
        .uuid()
        .describe(
          "This id paremeter is used to select the required data object that will be updated",
        ),

      amount: z
        .number()
        .optional()
        .describe("Total sum of the sale transaction."),

      currency: z
        .string()
        .max(255)
        .optional()
        .describe("ISO currency code for the transaction."),

      status: z
        .enum([])
        .optional()
        .describe(
          "Status of the sale transaction: 0=normal, 1=corrected, 2=canceled.",
        ),

      correctionJustification: z
        .string()
        .optional()
        .describe(
          "Reason for correction, if the transaction was updated after initial entry. Required when status is 'corrected' or 'canceled'.",
        ),
    };
  }
}

module.exports = (headers) => {
  return {
    name: "updateSaleTransaction",
    description:
      "Updates a sale transaction (correction allowed with justification). Adds an entry to saleTransactionHistory for auditing all changes.",
    parameters: UpdateSaleTransactionMcpController.getInputScheme(),
    controller: async (mcpParams) => {
      mcpParams.headers = headers;
      const updateSaleTransactionMcpController =
        new UpdateSaleTransactionMcpController(mcpParams);
      try {
        const result =
          await updateSaleTransactionMcpController.processRequest();
        //return UpdateSaleTransactionMcpController.getOutputSchema().parse(result);
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

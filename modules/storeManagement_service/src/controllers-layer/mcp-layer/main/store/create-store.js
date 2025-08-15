const { CreateStoreManager } = require("managers");
const { z } = require("zod");

const StoreManagementMcpController = require("../../StoreManagementServiceMcpController");

class CreateStoreMcpController extends StoreManagementMcpController {
  constructor(params) {
    super("createStore", "createstore", params);
    this.dataName = "store";
    this.crudType = "create";
  }

  createApiManager() {
    return new CreateStoreManager(this.request, "mcp");
  }

  static getOutputSchema() {
    return z
      .object({
        status: z.string(),
        store: z
          .object({
            id: z
              .string()
              .uuid()
              .describe("The unique primary key of the data object as UUID"),
            name: z
              .string()
              .max(255)
              .describe("Short, human-readable store name (display)."),
            fullname: z
              .string()
              .max(255)
              .optional()
              .nullable()
              .describe(
                "Full/store legal name (used for reporting, invoices, etc).",
              ),
            city: z
              .string()
              .max(255)
              .optional()
              .nullable()
              .describe("The city/location in which this store operates."),
            avatar: z
              .string()
              .max(255)
              .optional()
              .nullable()
              .describe("Public avatar image URL for the store (branding)."),
            active: z
              .boolean()
              .describe(
                "Flag marking this store as currently operational/active.",
              ),
            isActive: z
              .boolean()
              .describe(
                "The active status of the data object to manage soft delete. False when deleted.",
              ),
          })
          .describe(
            "Represents a retail store location and its properties. Includes lifecycle metadata such as activation status and store-level policy configuration fields.",
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
      name: z
        .string()
        .max(255)
        .describe("Short, human-readable store name (display)."),

      fullname: z
        .string()
        .max(255)
        .optional()
        .describe("Full/store legal name (used for reporting, invoices, etc)."),

      city: z
        .string()
        .max(255)
        .optional()
        .describe("The city/location in which this store operates."),

      avatar: z
        .string()
        .max(255)
        .optional()
        .describe("Public avatar image URL for the store (branding)."),

      active: z
        .boolean()
        .describe("Flag marking this store as currently operational/active."),
    };
  }
}

module.exports = (headers) => {
  return {
    name: "createStore",
    description: "Create a new store.",
    parameters: CreateStoreMcpController.getInputScheme(),
    controller: async (mcpParams) => {
      mcpParams.headers = headers;
      const createStoreMcpController = new CreateStoreMcpController(mcpParams);
      try {
        const result = await createStoreMcpController.processRequest();
        //return CreateStoreMcpController.getOutputSchema().parse(result);
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

const { GetStoreManager } = require("managers");
const { z } = require("zod");

const AuthMcpController = require("../../AuthServiceMcpController");

class GetStoreMcpController extends AuthMcpController {
  constructor(params) {
    super("getStore", "getstore", params);
    this.dataName = "store";
    this.crudType = "get";
  }

  createApiManager() {
    return new GetStoreManager(this.request, "mcp");
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
              .describe(
                "A string value to represent one word name of the store",
              ),
            codename: z
              .string()
              .max(255)
              .describe(
                "A string value to represent a unique code name for the store which is generated automatically using name",
              ),
            fullname: z
              .string()
              .max(255)
              .describe(
                "A string value to represent the fullname of the store",
              ),
            avatar: z
              .string()
              .max(255)
              .optional()
              .nullable()
              .describe(
                "A string value represent the url of the store avatar. Keep null for random avatar.",
              ),
            ownerId: z
              .string()
              .uuid()
              .describe(
                "An ID value to represent the user id of store owner who created the tenant",
              ),
            isActive: z
              .boolean()
              .describe(
                "The active status of the data object to manage soft delete. False when deleted.",
              ),
          })
          .describe("A data object that stores the information for store"),
      })
      .describe("The response object of the crud route");
  }

  static getInputScheme() {
    return {
      storeId: z
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
    name: "getStore",
    description:
      "Get a store by id. A public route which can be called without login",
    parameters: GetStoreMcpController.getInputScheme(),
    controller: async (mcpParams) => {
      mcpParams.headers = headers;
      const getStoreMcpController = new GetStoreMcpController(mcpParams);
      try {
        const result = await getStoreMcpController.processRequest();
        //return GetStoreMcpController.getOutputSchema().parse(result);
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

const { GetStoreByCodenameManager } = require("managers");
const { z } = require("zod");

const AuthMcpController = require("../../AuthServiceMcpController");

class GetStoreByCodenameMcpController extends AuthMcpController {
  constructor(params) {
    super("getStoreByCodename", "getstorebycodename", params);
    this.dataName = "store";
    this.crudType = "get";
  }

  createApiManager() {
    return new GetStoreByCodenameManager(this.request, "mcp");
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
      codename: z
        .string()
        .max(255)
        .describe(
          "A string value to represent a unique code name for the store which is generated automatically using name. The parameter is used to query data.",
        ),
    };
  }
}

module.exports = (headers) => {
  return {
    name: "getStoreByCodename",
    description:
      "Get store by codename to use the i in the header to make tenant specific calls. A public route which can be called without login",
    parameters: GetStoreByCodenameMcpController.getInputScheme(),
    controller: async (mcpParams) => {
      mcpParams.headers = headers;
      const getStoreByCodenameMcpController =
        new GetStoreByCodenameMcpController(mcpParams);
      try {
        const result = await getStoreByCodenameMcpController.processRequest();
        //return GetStoreByCodenameMcpController.getOutputSchema().parse(result);
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

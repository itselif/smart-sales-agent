const { ListRegisteredStoresManager } = require("managers");
const { z } = require("zod");

const AuthMcpController = require("../../AuthServiceMcpController");

class ListRegisteredStoresMcpController extends AuthMcpController {
  constructor(params) {
    super("listRegisteredStores", "listregisteredstores", params);
    this.dataName = "stores";
    this.crudType = "getList";
  }

  createApiManager() {
    return new ListRegisteredStoresManager(this.request, "mcp");
  }

  static getOutputSchema() {
    return z
      .object({
        status: z.string(),
        stores: z
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
          .describe("A data object that stores the information for store")
          .array(),
      })
      .describe("The response object of the crud route");
  }

  static getInputScheme() {
    return {
      accessToken: z
        .string()
        .optional()
        .describe(
          "The access token which is returned from a login request or given by user. This access token will override if there is any bearer or OAuth token in the mcp client. If not given the request will be made with the system (bearer or OAuth) token. For public routes you dont need to deifne any access token.",
        ),
    };
  }
}

module.exports = (headers) => {
  return {
    name: "listRegisteredStores",
    description:
      "Get a list of stores, this route can be called by saas user and closed in tenant level",
    parameters: ListRegisteredStoresMcpController.getInputScheme(),
    controller: async (mcpParams) => {
      mcpParams.headers = headers;
      const listRegisteredStoresMcpController =
        new ListRegisteredStoresMcpController(mcpParams);
      try {
        const result = await listRegisteredStoresMcpController.processRequest();
        //return ListRegisteredStoresMcpController.getOutputSchema().parse(result);
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

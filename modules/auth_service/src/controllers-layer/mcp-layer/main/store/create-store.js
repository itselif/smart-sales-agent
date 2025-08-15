const { CreateStoreManager } = require("managers");
const { z } = require("zod");

const AuthMcpController = require("../../AuthServiceMcpController");

class CreateStoreMcpController extends AuthMcpController {
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
      accessToken: z
        .string()
        .optional()
        .describe(
          "The access token which is returned from a login request or given by user. This access token will override if there is any bearer or OAuth token in the mcp client. If not given the request will be made with the system (bearer or OAuth) token. For public routes you dont need to deifne any access token.",
        ),
      avatar: z
        .string()
        .max(255)
        .optional()
        .describe(
          "A string value represent the url of the Store avatar. Keep null for random avatar.",
        ),

      name: z
        .string()
        .max(255)
        .describe("A string value to represent one word name of the store"),

      fullname: z
        .string()
        .max(255)
        .describe("A string value to represent the fullname of the store"),
    };
  }
}

module.exports = (headers) => {
  return {
    name: "createStore",
    description:
      "This route is used by Saas Admin to create a tenant (Store) manually without public registration. After creating the tenant, a user should be updated to be owner of this tenant.",
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

const { CreateUserManager } = require("managers");
const { z } = require("zod");

const AuthMcpController = require("../../AuthServiceMcpController");

class CreateUserMcpController extends AuthMcpController {
  constructor(params) {
    super("createUser", "createuser", params);
    this.dataName = "user";
    this.crudType = "create";
  }

  createApiManager() {
    return new CreateUserManager(this.request, "mcp");
  }

  static getOutputSchema() {
    return z
      .object({
        status: z.string(),
        user: z
          .object({
            id: z
              .string()
              .uuid()
              .describe("The unique primary key of the data object as UUID"),
            email: z
              .string()
              .max(255)
              .describe(" A string value to represent the user's email."),
            password: z
              .string()
              .max(255)
              .describe(
                " A string value to represent the user's password. It will be stored as hashed.",
              ),
            fullname: z
              .string()
              .max(255)
              .describe("A string value to represent the fullname of the user"),
            avatar: z
              .string()
              .max(255)
              .optional()
              .nullable()
              .describe(
                "The avatar url of the user. A random avatar will be generated if not provided",
              ),
            emailVerified: z
              .boolean()
              .describe(
                "A boolean value to represent the email verification status of the user.",
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
            "A data object that stores the user information and handles login settings.",
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
      avatar: z
        .string()
        .max(255)
        .optional()
        .describe(
          "The avatar url of the user. If not sent, a default random one will be generated.",
        ),

      email: z
        .string()
        .max(255)
        .describe(" A string value to represent the user's email."),

      password: z
        .string()
        .max(255)
        .describe(
          " A string value to represent the user's password. It will be stored as hashed.",
        ),

      fullname: z
        .string()
        .max(255)
        .describe("A string value to represent the fullname of the user"),
    };
  }
}

module.exports = (headers) => {
  return {
    name: "createUser",
    description:
      "This route is used by admin roles to create a new user manually from admin panels",
    parameters: CreateUserMcpController.getInputScheme(),
    controller: async (mcpParams) => {
      mcpParams.headers = headers;
      const createUserMcpController = new CreateUserMcpController(mcpParams);
      try {
        const result = await createUserMcpController.processRequest();
        //return CreateUserMcpController.getOutputSchema().parse(result);
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

const { RegisterStoreOwnerManager } = require("managers");
const { z } = require("zod");

const AuthMcpController = require("../../AuthServiceMcpController");

class RegisterStoreOwnerMcpController extends AuthMcpController {
  constructor(params) {
    super("registerStoreOwner", "registerstoreowner", params);
    this.dataName = "user";
    this.crudType = "create";
  }

  createApiManager() {
    return new RegisterStoreOwnerManager(this.request, "mcp");
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
      avatar: z
        .string()
        .max(255)
        .optional()
        .describe(
          "The avatar url of the user. If not sent, a default random one will be generated.",
        ),

      socialCode: z
        .string()
        .max(255)
        .optional()
        .describe(
          "Send this social code if it is sent to you after a social login authetication of an unregistred user. The users profile data will be complemented from the autheticated social profile using this code. If you provide the social code there is no need to give full profile data of the user, just give the ones that are not included in social profiles.",
        ),

      password: z
        .string()
        .max(255)
        .describe(
          "The password defined by the the user that is being registered.",
        ),

      fullname: z
        .string()
        .max(255)
        .describe(
          "The full name defined by the the user that is being registered.",
        ),

      email: z
        .string()
        .max(255)
        .describe(
          "The email defined by the the user that is being registered.",
        ),
    };
  }
}

module.exports = (headers) => {
  return {
    name: "registerStoreOwner",
    description:
      "This route is used by public users to register themselves as tenant owners to create both a user account and a store account they own.",
    parameters: RegisterStoreOwnerMcpController.getInputScheme(),
    controller: async (mcpParams) => {
      mcpParams.headers = headers;
      const registerStoreOwnerMcpController =
        new RegisterStoreOwnerMcpController(mcpParams);
      try {
        const result = await registerStoreOwnerMcpController.processRequest();
        //return RegisterStoreOwnerMcpController.getOutputSchema().parse(result);
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

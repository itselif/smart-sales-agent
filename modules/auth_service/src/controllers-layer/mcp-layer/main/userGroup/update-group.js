const { UpdateGroupManager } = require("managers");
const { z } = require("zod");

const AuthMcpController = require("../../AuthServiceMcpController");

class UpdateGroupMcpController extends AuthMcpController {
  constructor(params) {
    super("updateGroup", "updategroup", params);
    this.dataName = "userGroup";
    this.crudType = "update";
  }

  createApiManager() {
    return new UpdateGroupManager(this.request, "mcp");
  }

  static getOutputSchema() {
    return z
      .object({
        status: z.string(),
        userGroup: z
          .object({
            id: z
              .string()
              .uuid()
              .describe("The unique primary key of the data object as UUID"),
            groupName: z
              .string()
              .max(255)
              .describe(" A string value to represent the group name."),
            avatar: z
              .string()
              .max(255)
              .optional()
              .nullable()
              .describe(" A string value to represent the groups icon."),
            isActive: z
              .boolean()
              .describe(
                "The active status of the data object to manage soft delete. False when deleted.",
              ),
          })
          .describe("A data object that stores the user group information."),
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
      userGroupId: z
        .string()
        .uuid()
        .describe(
          "This id paremeter is used to select the required data object that will be updated",
        ),

      groupName: z
        .string()
        .max(255)
        .optional()
        .describe(" A string value to represent the group name."),

      avatar: z
        .string()
        .max(255)
        .optional()
        .describe(" A string value to represent the groups icon."),
    };
  }
}

module.exports = (headers) => {
  return {
    name: "updateGroup",
    description: "This route is used by admin to update user groups.",
    parameters: UpdateGroupMcpController.getInputScheme(),
    controller: async (mcpParams) => {
      mcpParams.headers = headers;
      const updateGroupMcpController = new UpdateGroupMcpController(mcpParams);
      try {
        const result = await updateGroupMcpController.processRequest();
        //return UpdateGroupMcpController.getOutputSchema().parse(result);
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

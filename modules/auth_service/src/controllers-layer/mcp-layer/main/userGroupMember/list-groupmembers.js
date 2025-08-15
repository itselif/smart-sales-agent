const { ListGroupMembersManager } = require("managers");
const { z } = require("zod");

const AuthMcpController = require("../../AuthServiceMcpController");

class ListGroupMembersMcpController extends AuthMcpController {
  constructor(params) {
    super("listGroupMembers", "listgroupmembers", params);
    this.dataName = "userGroupMembers";
    this.crudType = "getList";
  }

  createApiManager() {
    return new ListGroupMembersManager(this.request, "mcp");
  }

  static getOutputSchema() {
    return z
      .object({
        status: z.string(),
        userGroupMembers: z
          .object({
            id: z
              .string()
              .uuid()
              .describe("The unique primary key of the data object as UUID"),
            groupId: z
              .string()
              .uuid()
              .describe(
                " An ID value to represent the group that the user is asssigned as a memeber to.",
              ),
            userId: z
              .string()
              .uuid()
              .describe(
                " An ID value to represent the user that is assgined as a member to the group.",
              ),
            ownerId: z
              .string()
              .uuid()
              .describe(
                "An ID value to represent the admin user who assgined the member.",
              ),
            isActive: z
              .boolean()
              .describe(
                "The active status of the data object to manage soft delete. False when deleted.",
              ),
          })
          .describe("A data object that stores the members of the user group.")
          .array(),
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
      groupId: z
        .string()
        .uuid()
        .describe(
          " An ID value to represent the group that the user is asssigned as a memeber to.. The parameter is used to query data.",
        ),
    };
  }
}

module.exports = (headers) => {
  return {
    name: "listGroupMembers",
    description:
      "This route is used by admin or user roles to get the list of group members of a group.",
    parameters: ListGroupMembersMcpController.getInputScheme(),
    controller: async (mcpParams) => {
      mcpParams.headers = headers;
      const listGroupMembersMcpController = new ListGroupMembersMcpController(
        mcpParams,
      );
      try {
        const result = await listGroupMembersMcpController.processRequest();
        //return ListGroupMembersMcpController.getOutputSchema().parse(result);
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

const { UpdateStoreAssignmentManager } = require("managers");
const { z } = require("zod");

const StoreManagementMcpController = require("../../StoreManagementServiceMcpController");

class UpdateStoreAssignmentMcpController extends StoreManagementMcpController {
  constructor(params) {
    super("updateStoreAssignment", "updatestoreassignment", params);
    this.dataName = "storeAssignment";
    this.crudType = "update";
  }

  createApiManager() {
    return new UpdateStoreAssignmentManager(this.request, "mcp");
  }

  static getOutputSchema() {
    return z
      .object({
        status: z.string(),
        storeAssignment: z
          .object({
            id: z
              .string()
              .uuid()
              .describe("The unique primary key of the data object as UUID"),
            userId: z
              .string()
              .uuid()
              .describe("ID of the assigned user (references auth.user)."),
            storeId: z
              .string()
              .uuid()
              .describe("ID of the store this assignment represents."),
            role: z
              .enum(["seller", "manager", "admin"])
              .describe(
                "User's functional role in this store assignment: 0=seller, 1=manager, 2=admin.",
              ),
            assignmentType: z
              .enum(["normal", "override"])
              .describe(
                "Assignment type: 0=normal, 1=override (for temporary/exception access).",
              ),
            status: z
              .enum(["active", "revoked", "pending"])
              .describe("Assignment status: 0=active, 1=revoked, 2=pending."),
            overrideJustification: z
              .string()
              .optional()
              .nullable()
              .describe(
                "If assignmentType is override, field storing justification for override (if required by policy).",
              ),
            validFrom: z
              .string()
              .optional()
              .nullable()
              .describe(
                "The date/time this assignment/override becomes valid.",
              ),
            validUntil: z
              .string()
              .optional()
              .nullable()
              .describe(
                "If override, optional date/time until which assignment/override is valid (expiry).",
              ),
            isActive: z
              .boolean()
              .describe(
                "The active status of the data object to manage soft delete. False when deleted.",
              ),
          })
          .describe(
            "Represents the assignment of a user (seller, manager) to one or more stores. Supports override/temporary assignments, status, and assignment type fields for audit and dynamic access enforcement.",
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
      storeAssignmentId: z
        .string()
        .uuid()
        .describe(
          "This id paremeter is used to select the required data object that will be updated",
        ),

      assignmentType: z
        .enum([])
        .optional()
        .describe(
          "Assignment type: 0=normal, 1=override (for temporary/exception access).",
        ),

      status: z
        .enum([])
        .optional()
        .describe("Assignment status: 0=active, 1=revoked, 2=pending."),

      overrideJustification: z
        .string()
        .optional()
        .describe(
          "If assignmentType is override, field storing justification for override (if required by policy).",
        ),

      validFrom: z
        .string()
        .optional()
        .describe("The date/time this assignment/override becomes valid."),

      validUntil: z
        .string()
        .optional()
        .describe(
          "If override, optional date/time until which assignment/override is valid (expiry).",
        ),
    };
  }
}

module.exports = (headers) => {
  return {
    name: "updateStoreAssignment",
    description:
      "Update assignment details (status, override justification, validity).",
    parameters: UpdateStoreAssignmentMcpController.getInputScheme(),
    controller: async (mcpParams) => {
      mcpParams.headers = headers;
      const updateStoreAssignmentMcpController =
        new UpdateStoreAssignmentMcpController(mcpParams);
      try {
        const result =
          await updateStoreAssignmentMcpController.processRequest();
        //return UpdateStoreAssignmentMcpController.getOutputSchema().parse(result);
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

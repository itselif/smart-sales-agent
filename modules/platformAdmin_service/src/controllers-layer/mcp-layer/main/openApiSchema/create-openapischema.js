const { CreateOpenApiSchemaManager } = require("managers");
const { z } = require("zod");

const PlatformAdminMcpController = require("../../PlatformAdminServiceMcpController");

class CreateOpenApiSchemaMcpController extends PlatformAdminMcpController {
  constructor(params) {
    super("createOpenApiSchema", "createopenapischema", params);
    this.dataName = "openApiSchema";
    this.crudType = "create";
  }

  createApiManager() {
    return new CreateOpenApiSchemaManager(this.request, "mcp");
  }

  static getOutputSchema() {
    return z
      .object({
        status: z.string(),
        openApiSchema: z
          .object({
            id: z
              .string()
              .uuid()
              .describe("The unique primary key of the data object as UUID"),
            version: z
              .string()
              .max(255)
              .describe("Schema version (e.g., 'v1.0.3')."),
            description: z
              .string()
              .optional()
              .nullable()
              .describe("Description/notes about this schema version."),
            schemaJson: z
              .string()
              .describe("Raw OpenAPI schema JSON (stringified)."),
            isActive: z
              .boolean()
              .describe(
                "The active status of the data object to manage soft delete. False when deleted.",
              ),
          })
          .describe(
            "Stores current and historical OpenAPI schema definitions for all APIs, including versioning and description metadata.",
          ),
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
      version: z.string().max(255).describe("Schema version (e.g., 'v1.0.3')."),

      description: z
        .string()
        .optional()
        .describe("Description/notes about this schema version."),

      schemaJson: z.string().describe("Raw OpenAPI schema JSON (stringified)."),
    };
  }
}

module.exports = (headers) => {
  return {
    name: "createOpenApiSchema",
    description: "Create new OpenAPI schema entry.",
    parameters: CreateOpenApiSchemaMcpController.getInputScheme(),
    controller: async (mcpParams) => {
      mcpParams.headers = headers;
      const createOpenApiSchemaMcpController =
        new CreateOpenApiSchemaMcpController(mcpParams);
      try {
        const result = await createOpenApiSchemaMcpController.processRequest();
        //return CreateOpenApiSchemaMcpController.getOutputSchema().parse(result);
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

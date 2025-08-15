const { GetOpenApiSchemaManager } = require("managers");
const { z } = require("zod");

const PlatformAdminMcpController = require("../../PlatformAdminServiceMcpController");

class GetOpenApiSchemaMcpController extends PlatformAdminMcpController {
  constructor(params) {
    super("getOpenApiSchema", "getopenapischema", params);
    this.dataName = "openApiSchema";
    this.crudType = "get";
  }

  createApiManager() {
    return new GetOpenApiSchemaManager(this.request, "mcp");
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
      openApiSchemaId: z
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
    name: "getOpenApiSchema",
    description: "Get a specific OpenAPI schema by id",
    parameters: GetOpenApiSchemaMcpController.getInputScheme(),
    controller: async (mcpParams) => {
      mcpParams.headers = headers;
      const getOpenApiSchemaMcpController = new GetOpenApiSchemaMcpController(
        mcpParams,
      );
      try {
        const result = await getOpenApiSchemaMcpController.processRequest();
        //return GetOpenApiSchemaMcpController.getOutputSchema().parse(result);
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

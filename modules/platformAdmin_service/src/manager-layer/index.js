module.exports = {
  PlatformAdminServiceManager: require("./service-manager/PlatformAdminServiceManager"),
  // main Database Crud Object Routes Manager Layer Classes
  // OpenApiSchema Db Object
  GetOpenApiSchemaManager: require("./main/openApiSchema/get-openapischema"),
  CreateOpenApiSchemaManager: require("./main/openApiSchema/create-openapischema"),
  UpdateOpenApiSchemaManager: require("./main/openApiSchema/update-openapischema"),
  DeleteOpenApiSchemaManager: require("./main/openApiSchema/delete-openapischema"),
  ListOpenApiSchemasManager: require("./main/openApiSchema/list-openapischemas"),
};

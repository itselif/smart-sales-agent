module.exports = {
  // main Database Crud Object Routes Manager Layer Classes
  // OpenApiSchema Db Object
  GetOpenApiSchemaManager: require("./openApiSchema/get-openapischema"),
  CreateOpenApiSchemaManager: require("./openApiSchema/create-openapischema"),
  UpdateOpenApiSchemaManager: require("./openApiSchema/update-openapischema"),
  DeleteOpenApiSchemaManager: require("./openApiSchema/delete-openapischema"),
  ListOpenApiSchemasManager: require("./openApiSchema/list-openapischemas"),
};

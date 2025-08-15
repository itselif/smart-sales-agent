const openApiSchemaFunctions = require("./openApiSchema");

module.exports = {
  // main Database
  // OpenApiSchema Db Object
  dbGetOpenapischema: openApiSchemaFunctions.dbGetOpenapischema,
  dbCreateOpenapischema: openApiSchemaFunctions.dbCreateOpenapischema,
  dbUpdateOpenapischema: openApiSchemaFunctions.dbUpdateOpenapischema,
  dbDeleteOpenapischema: openApiSchemaFunctions.dbDeleteOpenapischema,
  dbListOpenapischemas: openApiSchemaFunctions.dbListOpenapischemas,
  createOpenApiSchema: openApiSchemaFunctions.createOpenApiSchema,
  getIdListOfOpenApiSchemaByField:
    openApiSchemaFunctions.getIdListOfOpenApiSchemaByField,
  getOpenApiSchemaById: openApiSchemaFunctions.getOpenApiSchemaById,
  getOpenApiSchemaAggById: openApiSchemaFunctions.getOpenApiSchemaAggById,
  getOpenApiSchemaListByQuery:
    openApiSchemaFunctions.getOpenApiSchemaListByQuery,
  getOpenApiSchemaStatsByQuery:
    openApiSchemaFunctions.getOpenApiSchemaStatsByQuery,
  getOpenApiSchemaByQuery: openApiSchemaFunctions.getOpenApiSchemaByQuery,
  updateOpenApiSchemaById: openApiSchemaFunctions.updateOpenApiSchemaById,
  updateOpenApiSchemaByIdList:
    openApiSchemaFunctions.updateOpenApiSchemaByIdList,
  updateOpenApiSchemaByQuery: openApiSchemaFunctions.updateOpenApiSchemaByQuery,
  deleteOpenApiSchemaById: openApiSchemaFunctions.deleteOpenApiSchemaById,
  deleteOpenApiSchemaByQuery: openApiSchemaFunctions.deleteOpenApiSchemaByQuery,
};

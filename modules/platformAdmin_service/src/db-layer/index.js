const mainFunctions = require("./main");

module.exports = {
  // main Database
  // OpenApiSchema Db Object
  dbGetOpenapischema: mainFunctions.dbGetOpenapischema,
  dbCreateOpenapischema: mainFunctions.dbCreateOpenapischema,
  dbUpdateOpenapischema: mainFunctions.dbUpdateOpenapischema,
  dbDeleteOpenapischema: mainFunctions.dbDeleteOpenapischema,
  dbListOpenapischemas: mainFunctions.dbListOpenapischemas,
  createOpenApiSchema: mainFunctions.createOpenApiSchema,
  getIdListOfOpenApiSchemaByField:
    mainFunctions.getIdListOfOpenApiSchemaByField,
  getOpenApiSchemaById: mainFunctions.getOpenApiSchemaById,
  getOpenApiSchemaAggById: mainFunctions.getOpenApiSchemaAggById,
  getOpenApiSchemaListByQuery: mainFunctions.getOpenApiSchemaListByQuery,
  getOpenApiSchemaStatsByQuery: mainFunctions.getOpenApiSchemaStatsByQuery,
  getOpenApiSchemaByQuery: mainFunctions.getOpenApiSchemaByQuery,
  updateOpenApiSchemaById: mainFunctions.updateOpenApiSchemaById,
  updateOpenApiSchemaByIdList: mainFunctions.updateOpenApiSchemaByIdList,
  updateOpenApiSchemaByQuery: mainFunctions.updateOpenApiSchemaByQuery,
  deleteOpenApiSchemaById: mainFunctions.deleteOpenApiSchemaById,
  deleteOpenApiSchemaByQuery: mainFunctions.deleteOpenApiSchemaByQuery,
};

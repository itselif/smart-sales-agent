const utils = require("./utils");
const dbApiScripts = require("./dbApiScripts");

module.exports = {
  dbGetOpenapischema: require("./dbGetOpenapischema"),
  dbCreateOpenapischema: require("./dbCreateOpenapischema"),
  dbUpdateOpenapischema: require("./dbUpdateOpenapischema"),
  dbDeleteOpenapischema: require("./dbDeleteOpenapischema"),
  dbListOpenapischemas: require("./dbListOpenapischemas"),
  createOpenApiSchema: utils.createOpenApiSchema,
  getIdListOfOpenApiSchemaByField: utils.getIdListOfOpenApiSchemaByField,
  getOpenApiSchemaById: utils.getOpenApiSchemaById,
  getOpenApiSchemaAggById: utils.getOpenApiSchemaAggById,
  getOpenApiSchemaListByQuery: utils.getOpenApiSchemaListByQuery,
  getOpenApiSchemaStatsByQuery: utils.getOpenApiSchemaStatsByQuery,
  getOpenApiSchemaByQuery: utils.getOpenApiSchemaByQuery,
  updateOpenApiSchemaById: utils.updateOpenApiSchemaById,
  updateOpenApiSchemaByIdList: utils.updateOpenApiSchemaByIdList,
  updateOpenApiSchemaByQuery: utils.updateOpenApiSchemaByQuery,
  deleteOpenApiSchemaById: utils.deleteOpenApiSchemaById,
  deleteOpenApiSchemaByQuery: utils.deleteOpenApiSchemaByQuery,
};

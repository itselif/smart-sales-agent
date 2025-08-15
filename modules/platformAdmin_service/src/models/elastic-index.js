const { ElasticIndexer } = require("serviceCommon");
const { hexaLogger } = require("common");

const openApiSchemaMapping = {
  id: { type: "keyword" },
  _owner: { type: "keyword" },
  version: { type: "keyword", index: true },
  description: { type: "text", index: true },
  schemaJson: { type: "text", index: false },
  isActive: { type: "boolean" },
  recordVersion: { type: "integer" },
  createdAt: { type: "date" },
  updatedAt: { type: "date" },
};

const updateElasticIndexMappings = async () => {
  try {
    ElasticIndexer.addMapping("openApiSchema", openApiSchemaMapping);
    await new ElasticIndexer("openApiSchema").updateMapping(
      openApiSchemaMapping,
    );
  } catch (err) {
    hexaLogger.insertError(
      "UpdateElasticIndexMappingsError",
      { function: "updateElasticIndexMappings" },
      "elastic-index.js->updateElasticIndexMappings",
      err,
    );
  }
};

module.exports = updateElasticIndexMappings;

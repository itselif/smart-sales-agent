const { ElasticIndexer } = require("serviceCommon");
const { hexaLogger } = require("common");

const storeMapping = {
  id: { type: "keyword" },
  _owner: { type: "keyword" },
  name: { type: "keyword", index: true },
  fullname: { type: "keyword", index: true },
  city: { type: "keyword", index: true },
  avatar: { type: "keyword", index: false },
  active: { type: "boolean", null_value: false },
  isActive: { type: "boolean" },
  recordVersion: { type: "integer" },
  createdAt: { type: "date" },
  updatedAt: { type: "date" },
};
const storeAssignmentMapping = {
  id: { type: "keyword" },
  _owner: { type: "keyword" },
  userId: { type: "keyword", index: true },
  storeId: { type: "keyword", index: true },
  role: { type: "keyword", index: true },
  role_: { type: "keyword" },
  assignmentType: { type: "keyword", index: true },
  assignmentType_: { type: "keyword" },
  status: { type: "keyword", index: true },
  status_: { type: "keyword" },
  overrideJustification: { type: "text", index: false },
  validFrom: { type: "date", index: false },
  validUntil: { type: "date", index: false },
  isActive: { type: "boolean" },
  recordVersion: { type: "integer" },
  createdAt: { type: "date" },
  updatedAt: { type: "date" },
};

const updateElasticIndexMappings = async () => {
  try {
    ElasticIndexer.addMapping("store", storeMapping);
    await new ElasticIndexer("store").updateMapping(storeMapping);
    ElasticIndexer.addMapping("storeAssignment", storeAssignmentMapping);
    await new ElasticIndexer("storeAssignment").updateMapping(
      storeAssignmentMapping,
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

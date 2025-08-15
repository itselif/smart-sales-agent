const { ElasticIndexer } = require("serviceCommon");
const { hexaLogger } = require("common");

const auditLogMapping = {
  id: { type: "keyword" },
  _owner: { type: "keyword" },
  userId: { type: "keyword", index: true },
  actionType: { type: "keyword", index: true },
  entityType: { type: "keyword", index: true },
  entityId: { type: "keyword", index: true },
  beforeData: { type: "object", enabled: false },
  afterData: { type: "object", enabled: false },
  severity: { type: "keyword", index: true },
  severity_: { type: "keyword" },
  message: { type: "text", index: true },
  traceContext: { type: "object", enabled: false },
  storeId: { type: "keyword", index: true },
  isActive: { type: "boolean" },
  recordVersion: { type: "integer" },
  createdAt: { type: "date" },
  updatedAt: { type: "date" },
};
const metricDatapointMapping = {
  id: { type: "keyword" },
  _owner: { type: "keyword" },
  metricType: { type: "keyword", index: true },
  targetType: { type: "keyword", index: true },
  targetId: { type: "keyword", index: true },
  periodStart: { type: "date", index: true },
  granularity: { type: "keyword", index: true },
  value: { type: "double", index: false },
  flagAnomalous: { type: "boolean", null_value: false },
  observedByUserId: { type: "keyword", index: false },
  context: { type: "object", enabled: false },
  isActive: { type: "boolean" },
  recordVersion: { type: "integer" },
  createdAt: { type: "date" },
  updatedAt: { type: "date" },
};
const anomalyEventMapping = {
  id: { type: "keyword" },
  _owner: { type: "keyword" },
  anomalyType: { type: "keyword", index: true },
  triggeredByUserId: { type: "keyword", index: true },
  affectedUserId: { type: "keyword", index: false },
  storeId: { type: "keyword", index: true },
  relatedEntityType: { type: "keyword", index: false },
  relatedEntityId: { type: "keyword", index: false },
  description: { type: "text", index: true },
  detectedAt: { type: "date", index: true },
  severity: { type: "keyword", index: true },
  severity_: { type: "keyword" },
  status: { type: "keyword", index: true },
  status_: { type: "keyword" },
  reviewedByUserId: { type: "keyword", index: false },
  isActive: { type: "boolean" },
  recordVersion: { type: "integer" },
  createdAt: { type: "date" },
  updatedAt: { type: "date" },
};

const updateElasticIndexMappings = async () => {
  try {
    ElasticIndexer.addMapping("auditLog", auditLogMapping);
    await new ElasticIndexer("auditLog").updateMapping(auditLogMapping);
    ElasticIndexer.addMapping("metricDatapoint", metricDatapointMapping);
    await new ElasticIndexer("metricDatapoint").updateMapping(
      metricDatapointMapping,
    );
    ElasticIndexer.addMapping("anomalyEvent", anomalyEventMapping);
    await new ElasticIndexer("anomalyEvent").updateMapping(anomalyEventMapping);
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

const { ElasticIndexer } = require("serviceCommon");
const { hexaLogger } = require("common");

const reportRequestMapping = {
  id: { type: "keyword" },
  _owner: { type: "keyword" },
  requestedByUserId: { type: "keyword", index: true },
  reportType: { type: "keyword", index: true },
  reportType_: { type: "keyword" },
  storeIds: { type: "keyword", index: true },
  dateFrom: { type: "date", index: true },
  dateTo: { type: "date", index: true },
  productIds: { type: "keyword", index: false },
  format: { type: "keyword", index: false },
  format_: { type: "keyword" },
  status: { type: "keyword", index: true },
  status_: { type: "keyword" },
  isActive: { type: "boolean" },
  recordVersion: { type: "integer" },
  createdAt: { type: "date" },
  updatedAt: { type: "date" },
};
const reportFileMapping = {
  id: { type: "keyword" },
  _owner: { type: "keyword" },
  reportRequestId: { type: "keyword", index: true },
  fileUrl: { type: "keyword", index: false },
  format: { type: "keyword", index: false },
  format_: { type: "keyword" },
  signedUrl: { type: "keyword", index: false },
  signedUrlExpiry: { type: "date", index: false },
  downloadCount: { type: "integer", index: false },
  isActive: { type: "boolean" },
  recordVersion: { type: "integer" },
  createdAt: { type: "date" },
  updatedAt: { type: "date" },
};
const reportPolicyMapping = {
  id: { type: "keyword" },
  _owner: { type: "keyword" },
  reportType: { type: "keyword", index: true },
  reportType_: { type: "keyword" },
  maxRetentionDays: { type: "integer", index: false },
  allowedFormats: { type: "keyword", index: false },
  allowedFormats_: { type: "keyword" },
  description: { type: "text", index: false },
  isActive: { type: "boolean" },
  recordVersion: { type: "integer" },
  createdAt: { type: "date" },
  updatedAt: { type: "date" },
};

const updateElasticIndexMappings = async () => {
  try {
    ElasticIndexer.addMapping("reportRequest", reportRequestMapping);
    await new ElasticIndexer("reportRequest").updateMapping(
      reportRequestMapping,
    );
    ElasticIndexer.addMapping("reportFile", reportFileMapping);
    await new ElasticIndexer("reportFile").updateMapping(reportFileMapping);
    ElasticIndexer.addMapping("reportPolicy", reportPolicyMapping);
    await new ElasticIndexer("reportPolicy").updateMapping(reportPolicyMapping);
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

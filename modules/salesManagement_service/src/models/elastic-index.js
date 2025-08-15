const { ElasticIndexer } = require("serviceCommon");
const { hexaLogger } = require("common");

const saleTransactionMapping = {
  id: { type: "keyword" },
  _owner: { type: "keyword" },
  sellerId: { type: "keyword", index: true },
  amount: { type: "double", index: true },
  currency: { type: "keyword", index: true },
  transactionDate: { type: "date", index: true },
  status: { type: "keyword", index: true },
  status_: { type: "keyword" },
  correctionJustification: { type: "text", index: false },
  storeId: { type: "keyword", index: true },
  isActive: { type: "boolean" },
  recordVersion: { type: "integer" },
  createdAt: { type: "date" },
  updatedAt: { type: "date" },
};
const saleTransactionHistoryMapping = {
  id: { type: "keyword" },
  _owner: { type: "keyword" },
  transactionId: { type: "keyword", index: true },
  changeType: { type: "keyword", index: true },
  changeType_: { type: "keyword" },
  changedByUserId: { type: "keyword", index: false },
  changeTimestamp: { type: "date", index: true },
  correctionJustification: { type: "text", index: false },
  previousData: { type: "object", enabled: false },
  newData: { type: "object", enabled: false },
  storeId: { type: "keyword", index: true },
  isActive: { type: "boolean" },
  recordVersion: { type: "integer" },
  createdAt: { type: "date" },
  updatedAt: { type: "date" },
};

const updateElasticIndexMappings = async () => {
  try {
    ElasticIndexer.addMapping("saleTransaction", saleTransactionMapping);
    await new ElasticIndexer("saleTransaction").updateMapping(
      saleTransactionMapping,
    );
    ElasticIndexer.addMapping(
      "saleTransactionHistory",
      saleTransactionHistoryMapping,
    );
    await new ElasticIndexer("saleTransactionHistory").updateMapping(
      saleTransactionHistoryMapping,
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

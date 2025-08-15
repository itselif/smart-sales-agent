const { ElasticIndexer } = require("serviceCommon");
const { hexaLogger } = require("common");

const inventoryItemMapping = {
  id: { type: "keyword" },
  _owner: { type: "keyword" },
  productId: { type: "keyword", index: true },
  quantity: { type: "integer", index: true },
  status: { type: "keyword", index: true },
  status_: { type: "keyword" },
  lowStockThreshold: { type: "integer", index: false },
  lastSyncTimestamp: { type: "date", index: false },
  storeId: { type: "keyword", index: true },
  isActive: { type: "boolean" },
  recordVersion: { type: "integer" },
  createdAt: { type: "date" },
  updatedAt: { type: "date" },
};
const inventoryMovementMapping = {
  id: { type: "keyword" },
  _owner: { type: "keyword" },
  inventoryItemId: { type: "keyword", index: true },
  quantityDelta: { type: "integer", index: false },
  movementType: { type: "keyword", index: true },
  movementType_: { type: "keyword" },
  movementTimestamp: { type: "date", index: true },
  userId: { type: "keyword", index: false },
  movementReason: { type: "text", index: false },
  storeId: { type: "keyword", index: true },
  isActive: { type: "boolean" },
  recordVersion: { type: "integer" },
  createdAt: { type: "date" },
  updatedAt: { type: "date" },
};
const lowStockAlertMapping = {
  id: { type: "keyword" },
  _owner: { type: "keyword" },
  inventoryItemId: { type: "keyword", index: true },
  alertType: { type: "keyword", index: true },
  alertType_: { type: "keyword" },
  alertTimestamp: { type: "date", index: false },
  resolved: { type: "boolean", null_value: false },
  resolvedByUserId: { type: "keyword", index: false },
  resolvedTimestamp: { type: "date", index: false },
  storeId: { type: "keyword", index: true },
  isActive: { type: "boolean" },
  recordVersion: { type: "integer" },
  createdAt: { type: "date" },
  updatedAt: { type: "date" },
};

const updateElasticIndexMappings = async () => {
  try {
    ElasticIndexer.addMapping("inventoryItem", inventoryItemMapping);
    await new ElasticIndexer("inventoryItem").updateMapping(
      inventoryItemMapping,
    );
    ElasticIndexer.addMapping("inventoryMovement", inventoryMovementMapping);
    await new ElasticIndexer("inventoryMovement").updateMapping(
      inventoryMovementMapping,
    );
    ElasticIndexer.addMapping("lowStockAlert", lowStockAlertMapping);
    await new ElasticIndexer("lowStockAlert").updateMapping(
      lowStockAlertMapping,
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
